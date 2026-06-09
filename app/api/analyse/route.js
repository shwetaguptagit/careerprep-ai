import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { extractText } from 'unpdf';
import mammoth from 'mammoth';

const client = new Anthropic();

// --- helpers ---
// Extracts plain text from uploaded CV or JD files (PDF, DOCX, TXT)

async function extractFileText(file) {
  const fileName = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (fileName.endsWith('.pdf')) {
    const { text: pdfText } = await extractText(new Uint8Array(buffer));
    return Array.isArray(pdfText) ? pdfText.join(' ').trim() : pdfText.trim();
  } else if (fileName.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } else if (fileName.endsWith('.txt')) {
    return buffer.toString('utf-8').trim();
  } else {
    throw new Error('Unsupported file format.');
  }
}

// --- JD parser prompt ---
// Builds the extraction prompt sent to Haiku (Pass 1)
// Instructs the LLM to parse the JD and return structured JSON — no scoring, no inference
// Output feeds into deriveWeights() for hallucination-checked weight calculation

function buildJDParsePrompt(jdText) {
  return `You are a precise document parser. Extract ONLY what is explicitly stated in the job description below. Do not infer, interpret, or add anything not present in the text.

Return a JSON object with this exact structure:
{
  "mandatory": [
    {
      "text": "<string>",
      "quote": "<string>",
      "category": "<string>"
    }
  ],
  "preferred": [
    {
      "text": "<string>",
      "quote": "<string>",
      "category": "<string>"
    }
  ],
  "yearsRequired": <number or null>,
  "titleSenioritySignal": "<string or null>"
}

Rules:
- mandatory: only items explicitly marked required, must have, minimum, essential, or listed under a "Requirements" section without qualifier
- preferred: items marked preferred, nice to have, bonus, plus, or listed under "Nice to Have"
- If mandatory/preferred separation is unclear, put items in preferred — not mandatory
- text: write the requirement in your own words, 1 sentence, no jargon
- quote: copy exact words from the JD, 5-15 words, no paraphrasing
- category: assign exactly one of skill, experience, domain, project
- yearsRequired: extract only if a specific number appears — do not estimate or infer
- titleSenioritySignal: copy the exact job title from the JD — do not paraphrase
- Return ONLY the JSON object. No explanation, no markdown, no backticks.

JD:
${jdText}`;
}

// --- weight derivation ---
// Takes the parsed JD output from buildJDParsePrompt and derives scoring weights
// LLM never assigns weights — this is pure JS arithmetic based on signal counts
// yearsRequired is intentionally excluded from weight calc — used only as advisory gap flag

function deriveWeights(parsedJD, rawJDText) {
  // Step 1: Validate quotes (hallucination check)
  const validateQuote = (quote) => {
    if (!quote || quote.length < 5) return false;
    const normJD = rawJDText.toLowerCase().replace(/\s+/g, ' ');
    const normQuote = quote.toLowerCase().replace(/\s+/g, ' ');
    return normJD.includes(normQuote);
  };

  // Step 2: Filter to only validated items
  const validMandatory = parsedJD.mandatory.filter(item => validateQuote(item.quote));
  const validPreferred = parsedJD.preferred.filter(item => validateQuote(item.quote));

  // Step 3: Track confidence
  const totalItems = parsedJD.mandatory.length + parsedJD.preferred.length;
  const validItems = validMandatory.length + validPreferred.length;
  const confidence = totalItems > 0 ? validItems / totalItems : 0;

  // Step 4: Count signals by category (mandatory = 2x, preferred = 1x)
  const counts = { skill: 0, experience: 0, domain: 0, project: 0 };
  validMandatory.forEach(item => { counts[item.category] += 2; });
  validPreferred.forEach(item => { counts[item.category] += 1; });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  // Step 5: Fall back to base weights if low confidence
  const BASE_WEIGHTS = { skill: 40, experience: 25, domain: 20, project: 15 };

  if (total === 0 || confidence < 0.5) {
    return {
      weights: BASE_WEIGHTS,
      confidence: 'low',
      fallback: true,
      validatedCount: validItems,
      totalCount: totalItems
    };
  }

  // Step 6: Convert counts to percentages
  const rawWeights = {
    skill:      Math.round((counts.skill / total) * 100),
    experience: Math.round((counts.experience / total) * 100),
    domain:     Math.round((counts.domain / total) * 100),
    project:    Math.round((counts.project / total) * 100)
  };

  // Step 7: Apply guardrails — no dimension below 10 or above 50
  const MIN_WEIGHT = 10;
  const MAX_WEIGHT = 50;
  const clampedWeights = {};
  Object.entries(rawWeights).forEach(([key, val]) => {
    clampedWeights[key] = Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, val));
  });

  // Step 8: Normalise back to 100 after clamping
  const clampedTotal = Object.values(clampedWeights).reduce((a, b) => a + b, 0);
  const normalisedWeights = {};
  Object.entries(clampedWeights).forEach(([key, val]) => {
    normalisedWeights[key] = Math.round((val / clampedTotal) * 100);
  });

  // Step 9: Fix rounding drift — add remainder to skill
  const weightSum = Object.values(normalisedWeights).reduce((a, b) => a + b, 0);
  normalisedWeights.skill += (100 - weightSum);

  return {
    weights: normalisedWeights,
    confidence: confidence > 0.8 ? 'high' : 'medium',
    fallback: false,
    validatedCount: validItems,
    totalCount: totalItems
  };
}

// --- scoring prompt builder ---
// Replaces the static RUBRIC constant in Pass 2
// Accepts derived weights from deriveWeights() — rubric is now JD-specific, not fixed
// yearsRequired passed separately as advisory signal — not factored into score

function buildScoringPrompt(cvText, jdText, weights, extractedRequirements) {
  const mandatoryList = extractedRequirements.mandatory
    .map(r => `- ${r.text} [${r.category}]`)
    .join('\n');

  const preferredList = extractedRequirements.preferred
    .map(r => `- ${r.text} [${r.category}]`)
    .join('\n');

  const yearsNote = extractedRequirements.yearsRequired
    ? `YEARS ADVISORY: JD states ${extractedRequirements.yearsRequired}+ years required. If CV appears to show fewer years, flag this in advisoryFlags with severity "advisory". Do NOT penalise the score for this — surface it for the candidate to judge.`
    : '';

  return `You are an expert recruiter and career coach. Score the candidate's CV against the job description.

MANDATORY REQUIREMENTS (extracted from JD — treat as gates):
${mandatoryList || '(none explicitly identified)'}

PREFERRED REQUIREMENTS:
${preferredList || '(none explicitly identified)'}

SCORING RUBRIC — use these exact weights, they are derived from this specific JD:
| Dimension         | Max Points |
|-------------------|------------|
| Skills Match      | ${weights.skill} |
| Experience Match  | ${weights.experience} |
| Domain / Industry | ${weights.domain} |
| Project Relevance | ${weights.project} |
| Total             | 100        |

INSTRUCTIONS:
- Be strict and honest. Do not inflate scores.
- Extract the company name from the JD. If not found, return null.
- MANDATORY GAP RULE: if the candidate clearly fails a mandatory requirement, add it to mandatoryGaps with severity "mandatory". Do not let strong scores elsewhere mask a mandatory gap.
- Each "notes" field: 1 sentence, max 20 words. State the key reason for the score.
- "strengths": 2-4 items only. Each max 25 words. Cite specific evidence from CV.
- "gaps": genuine gaps only, max 4. Each max 35 words. Explain what is missing and why it matters.
- Return ONLY valid JSON. No preamble, no markdown fences.

${yearsNote}

JSON format:
{
  "score": <number 0-100>,
  "companyName": "<string or null>",
  "scoreBreakdown": {
    "mandatorySkills": { "score": <0-${weights.skill}>, "notes": "<1 sentence, max 20 words>" },
    "experienceLevel": { "score": <0-${weights.experience}>, "notes": "<1 sentence, max 20 words>" },
    "domainFit":       { "score": <0-${weights.domain}>, "notes": "<1 sentence, max 20 words>" },
    "projectRelevance":{ "score": <0-${weights.project}>, "notes": "<1 sentence, max 20 words>" }
  },
  "strengths": ["<specific strength, max 25 words>"],
  "gaps": [
    { "gap": "<what is missing and why it matters, max 35 words>", "severity": "high|medium|low" }
  ],
  "mandatoryGaps": [
    { "requirement": "<mandatory requirement text>", "gap": "<what is missing>", "severity": "mandatory" }
  ],
  "advisoryFlags": [
    { "area": "<e.g. Years of experience>", "note": "<candidate-friendly explanation>", "severity": "advisory" }
  ],
  "lowFit": <true if score < 60, else false>
}

JD:
${jdText}

CV:
${cvText}`;
}

// --- route ---

export async function POST(request) {
  try {
    const formData = await request.formData();

    const jdMode = formData.get('jdMode');
    const cvFile = formData.get('cvFile');

    if (!cvFile) {
      return NextResponse.json({ error: 'CV file is required.' }, { status: 400 });
    }

    // Get JD text
    let jdText = '';
    if (jdMode === 'text') {
      jdText = formData.get('jdText') || '';
      if (!jdText.trim()) {
        return NextResponse.json({ error: 'Job description text is empty.' }, { status: 400 });
      }
    } else {
      const jdFile = formData.get('jdFile');
      if (!jdFile) {
        return NextResponse.json({ error: 'Job description file is required.' }, { status: 400 });
      }
      try {
        jdText = await extractFileText(jdFile);
      } catch (err) {
        console.error('JD extraction error:', err);
        return NextResponse.json(
          { error: 'Could not extract text from the job description file.' },
          { status: 422 }
        );
      }
    }

    // Get CV text
    let cvText = '';
    try {
      cvText = await extractFileText(cvFile);
    } catch (err) {
      console.error('CV extraction error:', err);
      return NextResponse.json(
        { error: 'Could not extract text from the CV file.', detail: err.message },
        { status: 422 }
      );
    }

    if (cvText.length < 50) {
      return NextResponse.json(
        { error: 'CV appears to be empty or unreadable. Please try a different file.' },
        { status: 422 }
      );
    }

    // --- Pass 1: Parse JD (Haiku — mechanical extraction, not reasoning) ---
    let derivedWeights, extractedRequirements;

    try {
      const parseResponse = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 2500,
        messages: [{ role: 'user', content: buildJDParsePrompt(jdText) }]
      });

      const rawParse = parseResponse.content[0].text
        .replace(/```json|```/g, '')
        .trim();

      const parsedJD = JSON.parse(rawParse);
      const weightResult = deriveWeights(parsedJD, jdText);

      derivedWeights = weightResult.weights;
      extractedRequirements = parsedJD;
      extractedRequirements._meta = {
        confidence: weightResult.confidence,
        fallback: weightResult.fallback,
        validatedCount: weightResult.validatedCount,
        totalCount: weightResult.totalCount
      };

    } catch (err) {
      // Pass 1 failed — fall back to base weights silently, scoring still runs
      console.error('Pass 1 failed, falling back to base weights:', err);
      derivedWeights = { skill: 40, experience: 25, domain: 20, project: 15 };
      extractedRequirements = {
        mandatory: [],
        preferred: [],
        yearsRequired: null,
        _meta: { confidence: 'low', fallback: true }
      };
    }

    // --- Pass 2: Score (Sonnet — LLM-as-judge with derived weights) ---
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: buildScoringPrompt(cvText, jdText, derivedWeights, extractedRequirements)
        }
      ]
    });

    const raw = message.content[0].text.trim();
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      console.error('Pass 2 returned non-JSON:', raw);
      return NextResponse.json(
        { error: 'Analysis returned an unexpected format. Please try again.' },
        { status: 500 }
      );
    }

    // Attach weight provenance to response
    result.weightsMeta = {
      weights: derivedWeights,
      confidence: extractedRequirements._meta.confidence,
      fallback: extractedRequirements._meta.fallback,
      validatedCount: extractedRequirements._meta.validatedCount,
      totalCount: extractedRequirements._meta.totalCount
    };

    return NextResponse.json({ ...result, jdText, cvText });

  } catch (err) {
    console.error('Analyse route error:', err);
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}