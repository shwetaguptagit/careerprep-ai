import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(request) {
  try {
    const { analysisResult, jobDescription, cvText } = await request.json();

    if (!analysisResult || !jobDescription || !cvText) {
      return Response.json({ error: 'Missing required data.' }, { status: 400 });
    }

    const { score, companyName, scoreBreakdown, strengths, gaps } = analysisResult;

    const prompt = `You are an expert CV editor. Your job is to rewrite a candidate's CV to better match a specific job description — but ONLY where changes are genuinely needed. Do not rewrite content that already maps well to the role.

CANDIDATE DATA:
Role / Company: ${companyName || 'Unknown company'}
Fit Score: ${score}/100
Strengths: ${strengths?.join('; ') ?? 'None'}
Gaps to address: ${gaps?.map(g => `[${g.severity}] ${g.gap}`).join(';') ?? 'None'}

JOB DESCRIPTION:
${jobDescription}

ORIGINAL CV:
${cvText}

---

RULES:
- Only modify content that directly addresses an identified gap or better maps experience to the JD language.
- Do not invent new experience, skills, or achievements. Only reframe or rephrase what exists.
- Do not change: candidate name, contact details, education facts, company names, job titles, dates, or any content that already maps well to the role.
- Preserve the original section order and structure exactly.
- Match JD keywords and language naturally — do not keyword-stuff.
- If a section has no relevant changes, return it exactly as-is.
- Tone: professional, concise, achievement-focused.

Return ONLY valid JSON. No markdown, no backticks, no explanation.

Schema:
{
  "name": "string — candidate full name",
  "sections": [
    {
      "heading": "string — section heading exactly as in original CV",
      "content": "string — full section content, rewritten only where needed. Use \\n for line breaks. Use • for bullet points."
    }
  ],
  "changes": [
    {
      "section": "string — which section was changed",
      "what": "string — one sentence: what was changed",
      "why": "string — one sentence: which gap it addresses"
    }
  ]
}

Rules for changes:
- Only list sections that were actually modified.
- Max 6 change entries. Be specific — name the gap addressed.
- If no meaningful changes were needed, return an empty changes array and a note in the first section.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.content[0]?.text ?? '';
    const clean = raw.replace(/```json|```/g, '').trim();

    let cvRewrite;
    try {
      cvRewrite = JSON.parse(clean);
    } catch {
      console.error('CV Rewrite JSON parse failed — tail:', raw.slice(-200));
      return Response.json({ error: 'Response was too long to process. Please try again.' }, { status: 422 });
    }

    return Response.json({ cvRewrite });
  } catch (err) {
    console.error('CV Rewrite route error:', err);
    return Response.json({ error: 'Failed to generate CV Rewrite.' }, { status: 500 });
  }
}