import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(request) {
  try {
    const { analysisResult, jobDescription } = await request.json();

    if (!analysisResult || !jobDescription) {
      return Response.json({ error: 'Missing required data.' }, { status: 400 });
    }

    const { score, companyName, scoreBreakdown, strengths, gaps, lowFit } = analysisResult;

    const prompt = `You are a career coach writing a concise PM-style Project Charter for a job application.

CANDIDATE DATA:
Role / Company: ${companyName || 'Unknown company'}
Fit Score: ${score}/100
Mandatory Skills: ${scoreBreakdown?.mandatorySkills?.score ?? 'N/A'}/40 — ${scoreBreakdown?.mandatorySkills?.notes ?? ''}
Experience Level: ${scoreBreakdown?.experienceLevel?.score ?? 'N/A'}/25 — ${scoreBreakdown?.experienceLevel?.notes ?? ''}
Domain / Industry: ${scoreBreakdown?.domainFit?.score ?? 'N/A'}/20 — ${scoreBreakdown?.domainFit?.notes ?? ''}
Project Relevance: ${scoreBreakdown?.projectRelevance?.score ?? 'N/A'}/15 — ${scoreBreakdown?.projectRelevance?.notes ?? ''}

Strengths: ${strengths?.join('; ') ?? 'None'}
Gaps: ${gaps?.map(g => `[${g.severity}] ${g.gap}`).join('; ') ?? 'None'}

JOB DESCRIPTION:
${jobDescription}

---

Return ONLY valid JSON. No markdown, no backticks, no explanation.

Schema:
{
  "title": "string — e.g. 'Project Charter: Senior PM @ Swiggy'",
  "overview": "string — 1-2 sentences: what the role is and where the candidate stands",
  "fitSummary": "string — 2 sentences max: one strength, one risk",
  "objective": "string — one sentence: what winning this application looks like",
  "risks": [
    { "risk": "string — name the specific gap, max 10 words", "mitigation": "string — one concrete action, max 15 words" }
  ],
  "interviewScenarios": [
    {
      "type": "behavioural | technical | gap-probe | role-specific",
      "scenario": "string — the question as an interviewer would ask it",
      "guidance": "string — one sentence: what to lead with, referencing a specific strength or gap"
    }
  ],
  "companySnapshot": "string — 1 sentence of factual context. Empty string if company is unknown.",
  "successMetrics": ["string", "string"]
}

Rules:
- risks: 2-3 items only. Each must name a specific gap from the data above.
- interviewScenarios: exactly 3. One behavioural, one gap-probe (targeting the highest severity gap), one role-specific.
- successMetrics: exactly 2 items. Each is one short action with a timeframe. No explanation.
- Do not pad. Do not repeat information across fields. Every sentence must add something new.
- Base all content strictly on the data provided. Do not invent candidate facts.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.content[0]?.text ?? '';
    const clean = raw.replace(/```json|```/g, '').trim();

    let charter;
    try {
      charter = JSON.parse(clean);
    } catch {
      return Response.json({ error: 'Response was too long to process. Please try again.' }, { status: 422 });
    }

    return Response.json({ charter });
  } catch (err) {
    console.error('Charter route error:', err);
    return Response.json({ error: 'Failed to generate Project Charter.' }, { status: 500 });
  }
}