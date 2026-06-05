# CareerPrep-AI — Project Context

## What this project is
An AI-powered job seeker tool that helps candidates prepare for interviews. The core loop: upload a JD + CV → get a rubric-based fit score and gap analysis → receive a personalised preparation plan, company context, and training resources.

Built by a Senior PM with no prior coding experience — primary goals are to learn the tech stack hands-on, build a demonstrable AI product, and strengthen an AI PM profile on LinkedIn and GitHub.

## Current status
- Phase 1 complete — Next.js app scaffolded, Claude API connected and tested
- Git + GitHub setup complete — code pushed to public repo
- Phase 2 complete — input form, extraction, scoring, results page built and tested
- Phase 3 in progress — results page done and tested; output documents next
  - Results page built, wired to sessionStorage, tested end-to-end ✅
  - Session caching implemented and tested ✅
  - Scoring prompt tightened and tested ✅
  - Project Charter — not started
  - Preparation Plan — not started
  - Training Materials — not started
  - CV Rewrite — not started
  - PDF export — not started

---

## Product scope (MVP)

### Target user
Individual job seekers who have identified a specific role, have the JD, and want to assess their fit and prepare for a possible interview. Not for recruiters. Users are assumed to have no prior company context.

### Core flow
1. User inputs JD (text area **or** file upload — mutually exclusive) + uploads CV (PDF or DOCX)
2. Claude extracts company name from JD automatically — no user input needed
3. LLM scores fit using structured rubric, identifies gaps and strengths
4. Company context pulled via web search using extracted company name
5. Threshold check:
   - Score ≥ 60: proceed to results, standard prep plan (dynamic length, max 7 days)
   - Score < 60: low fit warning shown, user chooses to proceed or exit. If proceed: extended dynamic prep plan, explicit risk messaging
6. Results page displayed: score breakdown + gaps + strengths + company snapshot
7. Four output documents generated on-demand (view in-app, export individually as PDF):
   - Project Charter
   - Preparation Plan
   - Training Materials
   - CV Rewrite

### Inputs
| Input | Type | Notes |
|---|---|---|
| Job Description | Text area **or** file upload (PDF/DOCX) | Mutually exclusive — inline validation error if both provided |
| CV | File upload (PDF/DOCX) | Text extracted via unpdf (PDF) or mammoth (DOCX) |

- Company name auto-extracted from JD by Claude — no separate input field
- If extraction fails or file is unsupported format: specific inline error shown to user
- If company name not detectable in JD: company snapshot section silently omitted

### Output documents
Generated on-demand — one API call per document, triggered individually by the user.

1. **Project Charter** — PM-style doc treating the application as a project. Includes: role summary, fit score, objectives, risks, likely interview scenarios with guidance, company snapshot
2. **Preparation Plan** — Day-by-day schedule. Dynamic length based on gap count/severity. Hard cap of 7 days for score ≥ 60; uncapped for score < 60 with extended duration and harder prep
3. **Training Materials** — Curated resources per gap. Mix of web-searched live links and Claude knowledge-based recommendations. Cost and time noted per resource. Free/low-cost prioritised
4. **CV Rewrite** — Tailored CV rewritten to match JD language and priorities. Includes change log explaining edits. Requires CV text passed via sessionStorage.

### Document generation architecture
- One API route per document: `app/api/charter/route.js`, `app/api/plan/route.js`, `app/api/training/route.js`, `app/api/cvrewrite/route.js`
- Each triggered on-demand when user clicks Generate on that document
- All read from sessionStorage — no re-upload needed
- Training Materials is the only call using Claude's `web_search` tool — build last
- CV Rewrite requires `cvText` stored in sessionStorage alongside `analysisResult` — add before building that doc

### Scoring rubric
Weights stored in `lib/config.js` — configurable without redeploy.

| Dimension | Max Points |
|---|---|
| Mandatory Skills Match | 40 |
| Experience Level Match | 25 |
| Domain / Industry Fit | 20 |
| Project Type Relevance | 15 |
| **Total** | **100** |

Threshold: below 60 = low fit. No score override. User can still proceed with prep plan.

### Scoring prompt constraints (as of phase 3)
- `notes` per dimension: 1 sentence, max 20 words
- `strengths`: 2–4 items, max 25 words each — must cite CV evidence, not generic praise
- `gaps`: max 4 items, max 35 words each — must explain what is missing and why it matters
- `lowFit`: true if score < 60

### Out of scope for MVP
- Job portal integration / job recommendations
- Podcast or mock interview video generation
- User accounts, login, saved history
- Job application tracker
- Financial statement or deep cultural analysis

---

## Tech stack

| Layer | Tool | Notes |
|---|---|---|
| Frontend | Next.js 16.2.7 + Tailwind CSS v4 | App Router, no TypeScript, no src/ directory |
| Hosting | Vercel | Free tier, one-click deploy from GitHub |
| Backend | Next.js API routes | Serverless, no separate server needed |
| Database | Supabase | Free tier, add in Phase 3+ |
| AI | Claude API (claude-sonnet-4-6) | Scoring, gap analysis, plan generation, CV rewrite |
| Web search | Claude web_search tool | Company context + training resource links |
| PDF extraction | unpdf | Replaces pdf-parse — compatible with Next.js + Turbopack |
| DOCX extraction | mammoth | Extract text from DOCX uploads |
| PDF generation | jsPDF | Export output documents |
| IDE | Cursor | Free tier, AI-assisted coding |
| Version control | GitHub | Repo name: careerprep-ai (public) |

---

## Project setup (completed)

- Node.js installed (v20.x.x)
- Next.js app scaffolded at `/Users/sg/careerprep-ai`
- Setup choices: No TypeScript, ESLint, Tailwind yes, no src/ dir, App Router yes, no import alias customisation, AGENTS.md yes, no React Compiler
- Anthropic SDK installed: `npm install @anthropic-ai/sdk`
- unpdf installed: `npm install unpdf` (pdf-parse removed — incompatible with Turbopack)
- mammoth installed: `npm install mammoth`
- `.env.local` created with `ANTHROPIC_API_KEY` — confirmed NOT pushed to GitHub
- Model in use: `claude-sonnet-4-6`
- GitHub repo: `careerprep-ai` (public)
- package.json name updated to `careerprep-ai`

---

## Key technical decisions and gotchas

- **Tailwind v4** — scaffolded with v4, not v3. No `tailwind.config.js` — config is CSS-based via `@import "tailwindcss"` in globals.css. Dark mode via `@media (prefers-color-scheme: dark)` in globals.css.
- **Inline styles used in page.js** — Tailwind v4 JIT issues with hover states led to switching all component styles to inline React styles with explicit hex values. Dark/light mode handled via `window.matchMedia` in useEffect.
- **pdf-parse removed** — incompatible with Next.js App Router + Turbopack due to DOMMatrix and ESM issues. Replaced with `unpdf`.
- **unpdf returns array** — `extractText()` from unpdf returns `{ text: string[] }`. Must join: `Array.isArray(pdfText) ? pdfText.join(' ').trim() : pdfText.trim()`
- **extractText name clash** — unpdf exports a function called `extractText`. Local helper in analyse/route.js renamed to `extractFileText` to avoid conflict.
- **Claude JSON output** — prompt instructs Claude to return only JSON. Strip markdown fences before parsing as a safety measure.
- **Scoring rubric** — hardcoded in analyse/route.js RUBRIC constant. Weights also stored in lib/config.js for reference.
- **Session caching** — `page.js` builds a fingerprint from JD input + CV filename/size before every submission. If fingerprint matches `analysisFingerprint` in sessionStorage, skips the API call and redirects directly to `/results`. Cache is session-scoped — clears on tab close.
- **sessionStorage keys in use** — `analysisResult` (scoring JSON), `analysisFingerprint` (cache key). `cvText` to be added before CV Rewrite is built.
- **Document generation** — on-demand per document. One API route per doc. All four routes read from sessionStorage — no re-upload needed.

---

## File structure (current)

```
/Users/sg/careerprep-ai/
├── app/
│   ├── api/
│   │   ├── analyse/
│   │   │   └── route.js        ← PDF/DOCX extraction + Claude scoring call + RUBRIC prompt
│   │   └── extract/
│   │       └── route.js        ← standalone extraction endpoint
│   ├── results/
│   │   └── page.js             ← results page — score, breakdown, strengths, gaps, doc placeholders
│   ├── globals.css             ← Tailwind v4 import + dark mode CSS vars
│   ├── layout.js
│   └── page.js                 ← input form — JD + CV upload, session cache check, sessionStorage write
├── lib/
│   └── config.js               ← rubric weights + threshold constant
├── .env.local                  ← ANTHROPIC_API_KEY (not in git)
├── package.json
├── postcss.config.mjs
└── next.config.js
```

---

## Git workflow
For every phase completion:
```bash
git add .
git commit -m "description of what changed"
git push
```

---

## Phase plan

| Phase | What gets built | Status |
|---|---|---|
| 1 | Environment setup, Next.js scaffold, first Claude API call | ✅ Done |
| Git | GitHub repo + version control | ✅ Done |
| 2 | JD + CV upload UI, PDF/DOCX extraction, scoring prompt, gap display, threshold logic | ✅ Done |
| 3 | Results page + four output documents: Project Charter, Prep Plan, Training Materials, CV Rewrite — in-app display + PDF export | 🔄 In progress |
| 4 | Deploy to Vercel, README, LinkedIn post | ⬜ Pending |

---

## Phase 3 progress

| Item | Status |
|---|---|
| Results page — sessionStorage wired, tested end-to-end | ✅ Done |
| Session caching — fingerprint-based, tested | ✅ Done |
| Scoring prompt — tightened word caps, tested | ✅ Done |
| Project Charter — API route + in-app display | ⬜ Next |
| Preparation Plan — API route + in-app display | ⬜ Pending |
| Training Materials — API route + web_search + in-app display | ⬜ Pending |
| CV Rewrite — API route + in-app display (needs cvText in sessionStorage) | ⬜ Pending |
| PDF export — jsPDF, one export per document | ⬜ Pending |
| Company context — Claude web_search, added alongside Training Materials | ⬜ Pending |

---

## Owner context
- Senior PM, consumer revenue background (API integrations, partner distribution platforms, subscription and monetisation models)
- No prior coding experience
- Building this to learn the tech stack hands-on and strengthen AI PM profile
- Claude Pro subscriber
- Using Cursor (free tier) as IDE
