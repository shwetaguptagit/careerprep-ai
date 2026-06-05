import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(request) {
  try {
    const { analysisResult, jobDescription } = await request.json();
 
    if (!analysisResult || !jobDescription) {
      return Response.json({ error: 'Missing required data.' }, { status: 400 });
    }

    const { score, companyName, scoreBreakdown, strengths, gaps, lowFit } = analysisResult;

    const prompt = `You are a senior career coach writing a PM-style Project Charter for a job application.

Here is the candidate's analysis data:

ROLE / COMPANY: ${companyName || 'Unknown company'}
FIT SCORE: ${score}/100
LOW FIT: ${lowFit ? 'Yes — score below 60' : 'No'}

SCORE BREAKDOWN:
- Mandatory Skills: ${scoreBreakdown?.mandatorySkills?.score ?? 'N/A'}/40 — ${scoreBreakdown?.mandatorySkills?.notes ?? ''}
- Experience Level: ${scoreBreakdown?.experienceLevel?.score ?? 'N/A'}/25 — ${scoreBreakdown?.experienceLevel?.notes ?? ''}
- Domain / Industry: ${scoreBreakdown?.domainFit?.score ?? 'N/A'}/20 — ${scoreBreakdown?.domainFit?.notes ?? ''}
- Project Relevance: ${scoreBreakdown?.projectRelevance?.score ?? 'N/A'}/15 — ${scoreBreakdown?.projectRelevance?.notes ?? ''}

STRENGTHS:
${strengths?.map((s, i) => `${i + 1}. ${s}`).join('\n') ?? 'None identified'}

GAPS:
${gaps?.map((g, i) => `${i + 1}. [${g.severity}] ${g.gap}`).join('\n') ?? 'None identified'}

FULL JOB DESCRIPTION:
${jobDescription}

---

Write a Project Charter treating this job application as a project. Return ONLY valid JSON, no markdown, no backticks, no preamble.

The JSON must follow this exact schema:
{
  "title": "string — e.g. 'Project Charter: Senior PM @ Swiggy'",
  "overview": "string — 2-3 sentence summary of the role and the candidate's position relative to it",
  "objective": "string — what success looks like in this application process (1-2 sentences)",
  "fitSummary": "string — honest 2-3 sentence assessment of fit: where the candidate is strong, where the risk is",
  "risks": [
    { "risk": "string", "mitigation": "string" }
  ],
  "interviewScenarios": [
    {
      "type": "behavioural | technical | gap-probe | role-specific",
      "scenario": "string — the exact question or scenario as an interviewer would ask it",
      "guidance": "string — how this candidate should answer it, referencing their specific strengths or named gaps"
    }
  ],
  "companySnapshot": "string — factual, knowledge-based context about this company: business model, recent strategic focus, known product challenges, competitive position. Only include facts you are confident about. Leave empty string if company name is unknown or you have low confidence.",
  "successMetrics": ["string", "string", "string"]
}

Rules:
- risks: 3-4 items. Each risk must name the specific gap it stems from, not generic hiring risks.
- interviewScenarios: exactly 5 scenarios. Must include at least one of each type: behavioural, technical, gap-probe (directly targeting a high or medium gap), role-specific. Write the scenario as a real question, not a category label.
- guidance: must name the candidate's actual strength or gap — never generic interview advice like "use the STAR method."
- companySnapshot: use your training knowledge about this company. If the company is well-known, include real facts. Do not make up facts. If genuinely unknown, return empty string.
- successMetrics: 3 items, each naming a specific gap or action with a timeframe (e.g. "Build a sample SQL query set targeting [gap] within 2 days").
- Do not invent candidate facts. Base everything strictly on the data provided.
- Tone: direct, professional, no fluff.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = response.content[0]?.text ?? '';
    const clean = raw.replace(/```json|```/g, '').trim();
    
    let charter;
    try {
      charter = JSON.parse(clean);
    } catch (parseErr) {
      return Response.json({
        error: 'Response was too long to process. Please try again.'
      }, { status: 422 });
    }
    
    return Response.json({ charter });
  } catch (err) {
    console.error('Charter route error:', err);
    return Response.json({ error: 'Failed to generate Project Charter.' }, { status: 500 });
  }
}