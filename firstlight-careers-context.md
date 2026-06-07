# FirstLight Careers — Project Context

## What this project is
An AI-powered job seeker tool that helps candidates prepare for interviews. The core loop: upload a JD + CV → get a rubric-based fit score and gap analysis → receive personalised preparation resources including a Project Charter, Training Materials, and a CV Rewrite.

Built by a Senior PM with no prior coding experience — primary goals are to learn the tech stack hands-on, build a demonstrable AI product, and strengthen an AI PM profile on LinkedIn and GitHub.

## Current status
- Phase 1 complete — Next.js app scaffolded, Claude API connected and tested ✅
- Git + GitHub setup complete — code pushed to public repo ✅
- Phase 2 complete — input form, extraction, scoring, results page built and tested ✅
- Phase 3 complete ✅:
  - Results page built, wired to sessionStorage, tested end-to-end ✅
  - Session caching implemented and tested ✅
  - Scoring prompt tightened and tested ✅
  - Dark/light theme toggle added to both pages ✅
  - Contrast fixes applied (new dark palette: #05080f base) ✅
  - Project Charter — API route built, prompt tightened, quality approved ✅
  - Training Materials — API route built, tested, quality approved ✅
  - CV Rewrite — API route built, DOCX download, drawer UI, QA'd e2e ✅
  - Accordion UI + drawer pattern — full results page redesign ✅
  - Preparation Plan — removed from MVP scope, retained as "coming soon" teaser ✅
  - PDF export — descoped from MVP ✅
- Phase 4 complete ✅:
  - README — written ✅
  - Vercel deploy — done ✅
  - LinkedIn post — published ✅
- Phase 5 in progress:
  - Web search tool (agentic Training Materials) — built, tested, reverted ⚠️ (cost — see Phase 5 backlog)
  - Training Materials route — resilience improvements applied ✅
  - MCP server — built, deployed, tested, connected to Claude.ai ✅

---

## Product scope (MVP)

### Target user
Individual job seekers who have identified a specific role, have the JD, and want to assess their fit and prepare for a possible interview. Not for recruiters. Users are assumed to have no prior company context.

### Core flow
1. User inputs JD (text area **or** file upload — mutually exclusive) + uploads CV (PDF or DOCX)
2. Claude extracts company name from JD automatically — no user input needed
3. LLM scores fit using structured rubric, identifies gaps and strengths
4. Threshold check:
   - Score ≥ 60: proceed to results
   - Score < 60: low fit warning shown, user chooses to proceed or exit
5. Results page displayed as accordion cards: fit score + breakdown, strengths, gaps, preparation package
6. Three output documents generated on-demand via drawer pattern:
   - Project Charter ✅
   - Training Materials ✅
   - CV Rewrite ✅ (DOCX download)
   - Preparation Plan — "coming soon" teaser card only

### Inputs
| Input | Type | Notes |
|---|---|---|
| Job Description | Text area **or** file upload (PDF/DOCX) | Mutually exclusive |
| CV | File upload (PDF/DOCX) | Text extracted via unpdf (PDF) or mammoth (DOCX) |

- Company name auto-extracted from JD by Claude — no separate input field
- Upload success state: neutral white/light (not green) — design decision

### Output documents
Generated on-demand — one API call per document, triggered individually by the user. Each opens in a slide-over drawer.

1. **Project Charter** ✅ — PM-style doc. Includes: overview, objective, fit assessment, risks & mitigations (2-3 items), interview scenarios (3 scenarios: behavioural, gap-probe, role-specific), company snapshot, success metrics (2 items). max_tokens: 2000.
2. **Training Materials** ✅ — Curated resources per gap. Knowledge-based MVP (no web search). 2 resources max per gap, 8hr total cap. Quick wins (2 items). max_tokens: 3000. Resilience improvements: specific error handling (401/429/403), JSON extraction via regex, empty response guard.
3. **CV Rewrite** ✅ — Rewrites only sections mapped to identified gaps. Returns structured JSON (sections + change log). Client-side DOCX generation via `docx` library. Download filename: `CV_[Name]_[Company].docx`. max_tokens: 4000.
4. **Preparation Plan** — "Coming soon" teaser card. Removed from MVP scope.

### UI pattern — results page
- All sections rendered as `AccordionCard` components (module-level, CSS grid row animation)
- Default open: Fit Score only. Strengths, Gaps, Prep Package collapsed by default
- Preparation package: each doc card has Generate button → loading spinner → done state with ↺ regenerate + View → buttons
- View → opens slide-over drawer (520px, translateX animation)
- Drawer: sticky header with accent dot + title + ✕ close. Escape key closes.
- CV Rewrite drawer: subtitle + Download .docx button + sections preview + change log

### Doc card order
1. Project Charter (available)
2. Training Materials (available)
3. CV Rewrite (available)
4. Preparation Plan (coming soon)

### Scoring rubric
| Dimension | Max Points |
|---|---|
| Mandatory Skills Match | 40 |
| Experience Level Match | 25 |
| Domain / Industry Fit | 20 |
| Project Type Relevance | 15 |
| **Total** | **100** |

Threshold: below 60 = low fit.

### Out of scope for MVP
- Gap selection checkboxes (descoped — post-MVP)
- Experience gap auto-exclusion UI (descoped — post-MVP)
- PDF export (descoped)
- Web search for Training Materials (deferred — cost)
- User accounts, login, saved history (Phase 5+)
- Google Docs export (Phase 5+ — via MCP server Phase 2)
- Evals framework (Phase 5+)
- PostHog analytics (Phase 5+)
- Supabase / DB (Phase 5+)

---

## Tech stack

| Layer | Tool | Notes |
|---|---|---|
| Frontend | Next.js 16.2.7 | App Router, no TypeScript, no src/ directory |
| Hosting | Vercel | Free tier, deployed ✅ |
| Backend | Next.js API routes | Serverless |
| AI | Claude API (claude-sonnet-4-6) | Scoring, charter, training, CV rewrite |
| File parsing | unpdf + mammoth | PDF + DOCX extraction |
| DOCX generation | docx (npm) | Client-side, browser Blob download |
| IDE | Cursor | Free tier |
| Version control | GitHub | github.com/shwetaguptagit/firstlight-careers (public) |
| MCP server | Next.js API route `/api/mcp` | Live — same Vercel deployment, connected to Claude.ai ✅ |

---

## Project setup (completed)

- Node.js installed (v20.x.x)
- Next.js app scaffolded at `/Users/sg/firstlight-careers`
- Setup choices: No TypeScript, ESLint, Tailwind yes, no src/ dir, App Router yes
- Packages installed: `@anthropic-ai/sdk`, `unpdf`, `mammoth`, `docx`
- `.env.local` created with `ANTHROPIC_API_KEY` — confirmed NOT pushed to GitHub
- Model in use: `claude-sonnet-4-6`
- GitHub repo: `firstlight-careers` (public)

---

## Key technical decisions and gotchas

- **Inline styles** — all component styles use inline React styles with explicit hex values. Dark/light mode handled via `window.matchMedia` in useEffect + `themeOverride` state.
- **New dark palette** — `#05080f` page bg, `#0c1220` card bg, `#16223a` borders. Fully replaced old `#0a0a0a` palette.
- **AccordionCard at module level** — critical: defined outside `Results()` to prevent React remounting on parent re-render, which would kill the CSS grid-row transition animation.
- **Drawer state** — `drawer` state holds `'charter' | 'training' | 'cvrewrite' | null`. `drawerMeta` object maps key → title + accent color.
- **docx import** — `import { Document, Packer, ... } from 'docx'` at top of results/page.js. Works client-side with `'use client'`. If SSR errors occur, add `transpilePackages: ['docx']` to next.config.js.
- **CV Rewrite tokens** — max_tokens 4000 because full CV reconstruction in JSON can run 2000–3000 output tokens. Highest cost request in the app due to full cvText + JD in input.
- **Charter prompt tightened** — 3 scenarios (not 5), 2-3 risks (not 4), 2 success metrics (not 3), guidance capped to 1 sentence. max_tokens reduced to 2000.
- **pdf-parse removed** — replaced with unpdf (Turbopack compatible).
- **unpdf returns array** — must join: `Array.isArray(pdfText) ? pdfText.join(' ').trim() : pdfText.trim()`
- **Session caching** — fingerprint from JD + CV filename/size. Skips API call if fingerprint matches.
- **sessionStorage keys** — `analysisResult`, `analysisFingerprint`, `jobDescription`, `cvText`.
- **jdText and cvText** — returned from analyse route alongside scoring result, stored separately in sessionStorage, not inside `analysisResult`.
- **DOCX bullet rule** — use `LevelFormat.BULLET` with numbering config, never unicode `•` characters directly in TextRun.
- **Training Materials resilience** — JSON extraction uses `raw.match(/\{[\s\S]*\}/)` regex, not just backtick strip. Catches Claude narrating prose instead of returning JSON. Empty response guard added before parse. Specific catch blocks for 401/429/403.
- **Web search agentic loop (reverted)** — `web_search_20260209` is an Anthropic server tool; no separate search API needed. Loop pattern: `while(true)` → check `stop_reason` → if `tool_use`, push assistant content + tool_results back into messages array → loop → break on `end_turn`. `max_uses` caps search count. Reverted: cost 3–6x higher than single-call. Implementation correct and understood.
- **MCP server API key protection** — accepts key via `x-api-key` header OR `?key=` query param. Query param required for Claude.ai connector (no custom header field in UI). Reject without valid key before touching Claude API. Store as `MCP_API_KEY` in `.env.local` and Vercel env vars.
- **MCP analyse_fit — txt blob workaround** — MCP passes CV as plain string. Wrapped as `.txt` Blob before posting to `/api/analyse`. Added `.txt` handler to `extractFileText`: `return buffer.toString('utf-8').trim()`.
- **NEXT_PUBLIC_APP_URL** — required in Vercel env vars so MCP server's internal fetch calls resolve correctly in production. Falls back to `http://localhost:3000` locally.

---

## File structure (current + planned)

```
/Users/sg/firstlight-careers/
├── app/
│   ├── api/
│   │   ├── analyse/route.js        ← extraction + scoring + returns jdText + cvText
│   │   ├── charter/route.js        ← Project Charter generation (max_tokens: 2000)
│   │   ├── training/route.js       ← Training Materials (max_tokens: 3000) — resilience improved
│   │   ├── cvrewrite/route.js      ← CV Rewrite — sections JSON + change log (max_tokens: 4000)
│   │   ├── extract/route.js        ← standalone extraction endpoint
│   │   └── mcp/route.js            ← MCP server — live ✅ (analyse_fit, generate_charter, generate_training, generate_cvrewrite)
│   ├── results/page.js             ← accordion UI, drawer pattern, DOCX generation
│   ├── globals.css
│   ├── layout.js
│   └── page.js                     ← input form, upload, session cache, theme toggle
├── lib/config.js                   ← rubric weights + threshold
├── README.md                       ← written, pushed to GitHub
├── .env.local                      ← ANTHROPIC_API_KEY, MCP_API_KEY (not in git)
├── package.json
└── next.config.js
```

---

## Git workflow
```bash
git add .
git commit -m "description"
git push origin main
```

---

## Phase plan

| Phase | What | Status |
|---|---|---|
| 1 | Environment, scaffold, first Claude API call | ✅ Done |
| Git | GitHub repo + version control | ✅ Done |
| 2 | Upload UI, extraction, scoring, gap display | ✅ Done |
| 3 | Results page + Charter + Training + CV Rewrite + UI redesign | ✅ Done |
| 4 | README + Vercel deploy + LinkedIn post | ✅ Done |
| 5 | MCP server + web search (deferred) + evals + Google Docs + analytics + Supabase | 🔄 In progress |

---

## Phase 3 — final status

| Item | Status |
|---|---|
| Results page — sessionStorage, caching, tested | ✅ Done |
| Dark/light theme toggle — both pages | ✅ Done |
| Contrast fixes — new dark palette (#05080f base) | ✅ Done |
| Upload success state — neutral white/light | ✅ Done |
| Accordion UI — AccordionCard module-level component | ✅ Done |
| Drawer pattern — slide-over for all three outputs | ✅ Done |
| Project Charter — route + prompt tightened + drawer | ✅ Done |
| Training Materials — route + drawer | ✅ Done |
| CV Rewrite — route + drawer + DOCX download + QA'd | ✅ Done |
| Gap selection checkboxes | ✅ Descoped |
| Experience gap auto-exclusion | ✅ Descoped |
| PDF export | ✅ Descoped |
| Preparation Plan | ✅ Descoped (teaser only) |

---

## Phase 5 backlog

> **Web search tool (agentic Training Materials) — built and reverted**
> Successfully implemented `web_search_20260209` as an Anthropic server tool on the training route. Built the full agentic loop: Claude plans searches, Anthropic executes them, results feed back into context, Claude synthesises verified URLs. Configured `max_uses: 2` with high-severity-gaps-only search strategy. Reverted due to cost — 3–6x more expensive per generation vs single-call approach. Remains a strong future candidate once monetisation or cost-sharing model is in place. All implementation knowledge retained.

> **MCP server — architecture finalised, build next session**
> Decision arrived at by exploring Google Docs export options. Evaluated: DOCX download (already exists), Google Drive MCP (Claude.ai only — not callable from web app), Service Account (works but skips auth learning), full OAuth (Phase 2). MCP server on Vercel emerged as the right Phase 1 move — portfolio signal, no extra hosting cost, tools already built, sets up Google Docs as Phase 2 tool addition. Key insight confirmed: MCP tools in Claude.ai are not callable from a deployed web app — they are AI assistant features, not application runtime features. Self-hosted MCP is the pattern that enables web app users to benefit.

- MCP server — `app/api/mcp/route.js` — expose all 4 routes as tools, API key protected ✅
- MCP Phase 2 — Google Docs API as fifth tool, user OAuth, persist Doc ID in session ⬜
- Web search tool use — Training Materials resource verification (built, reverted — cost; revisit with monetisation) ⬜
- Evals framework — scoring accuracy validation against test fixtures ⬜
- PostHog analytics — funnel: upload → analyse → generate → download ⬜
- Supabase — persist analysis history, user sessions ⬜
- Gap selection checkboxes + experience gap auto-exclusion ⬜

---

## MCP server — built and live ✅

### What it is
A new API route `/api/mcp` in the existing Next.js app. Hosted on Vercel at no extra cost. Exposes existing FirstLight Careers routes as MCP-protocol tools callable by AI assistants (Claude.ai, Cursor, any MCP-compatible client).

### Tools exposed
| Tool | Reuses | Description |
|---|---|---|
| `analyse_fit` | `api/analyse/route.js` | Score JD + CV fit, return gaps + strengths |
| `generate_charter` | `api/charter/route.js` | Generate Project Charter |
| `generate_training` | `api/training/route.js` | Generate Training Materials |
| `generate_cvrewrite` | `api/cvrewrite/route.js` | Generate CV Rewrite JSON |

### Architecture diagram
```
FirstLight Careers (Vercel)
├── Web App (unchanged — users interact as today)
└── MCP Server /api/mcp
    ├── analyse_fit
    ├── generate_charter
    ├── generate_training
    └── generate_cvrewrite
            ↓
      Claude API (Anthropic)
```

### Security
- `x-api-key` header check on every request to `/api/mcp`
- Also accepts key via `?key=` query param — required for Claude.ai custom connector (UI has no header field)
- Rejected before Claude API is called if key missing/invalid
- Key stored as `MCP_API_KEY` in `.env.local` + Vercel env vars
- `NEXT_PUBLIC_APP_URL` set in Vercel env vars — MCP server uses this to call internal routes correctly in production

### Key technical decisions and gotchas
- **analyse_fit accepts text only via MCP** — MCP communicates in JSON, can't send binary files. CV text passed as plain string, wrapped as `.txt` Blob before posting to `/api/analyse`. One-line `.txt` handler added to `extractFileText` in analyse route.
- **Claude.ai connector uses query param auth** — Claude.ai custom connector UI has no field for custom headers. Key passed as `?key=your-key` in the URL instead of `x-api-key` header. Route accepts both.
- **Internal fetch uses APP_BASE_URL** — MCP server calls its own routes via fetch. Must use full URL, not relative path. Falls back to `http://localhost:3000` for local dev.
- **JSON-RPC protocol** — MCP uses JSON-RPC 2.0. Three methods handled: `initialize` (handshake), `tools/list` (returns tool menu), `tools/call` (executes a tool and returns result).

### Availability
| Consumer | How |
|---|---|
| Owner (you) | Added as custom connector in Claude.ai settings ✅ |
| Anyone you share URL + key with | Add manually as custom connector |
| All Claude.ai users | Requires Anthropic directory listing — future milestone |
| Cursor/Windsurf users | Add URL in editor MCP config |

### Phase 2 addition (Google Docs)
Add `save_to_google_doc` as a fifth tool. Requires Google OAuth in backend. User authenticates once → tool creates native Google Doc from Charter or Training Materials → returns Doc URL → Doc ID persisted in session for future "update" actions.

---

## AI concepts in this project (for LinkedIn/README)

| Feature | AI pattern |
|---|---|
| Fit scoring | LLM-as-judge, rubric-grounded evaluation, structured JSON output |
| Charter / Training / CV Rewrite | Prompt-engineered structured generation |
| Training Materials resources | Knowledge-based generation (not RAG, not tool use) |
| All outputs | Zero-shot with JSON schema constraints — no fine-tuning, no vector DB |
| Web search agent (built, reverted) | Agentic loop — server tool use, multi-turn tool call handling, stop_reason loop, Claude-driven planning |
| MCP server (live) | Tool exposure via MCP protocol, AI orchestration, interoperability |

**In production:** Prompt engineering, structured outputs, LLM-as-judge, MCP server.
**Built and understood:** Agentic tool use loop — reverted on cost, not complexity.
**Not in project:** RAG, fine-tuning, embeddings.

---

## Owner context
- Senior PM, 12 years across consumer revenue, media, e-commerce, AI
- No prior coding experience — built entirely with Cursor + Claude
- Building to learn tech stack hands-on and strengthen AI PM profile
- GitHub: github.com/shwetaguptagit/firstlight-careers

---

## LinkedIn post (published — Phase 4)

Job hunting + zero coding experience + 3 days = somehow a deployed AI product.
Job hunting is hard. So I built an AI tool to make it slightly less hard.
I was staring at a JD, staring at my CV, and thinking — am I a fit? Should I even apply? What do I even prepare for? The gap between "I think I'm good" and "I can prove I'm ready" felt annoyingly wide.
Meet FirstLight Careers — built by me, for me, currently being used by me for my own job hunt. Full circle.
What it does: Upload your CV + JD →
* Fit score with breakdown across skills, experience, domain, and project relevance
* Gap analysis tagged by severity — honest, not reassuring
* Project Charter — PM-style brief with interview scenarios and company snapshot
* Training Materials — curated resources per gap, free and low-cost, with time estimates
* CV Rewrite — tailored to the JD, download as .docx
How it got built: Claude helped write the PRD, generate the code, design the UI, debug the errors. I manually pasted code from Claude chat into Cursor, merged to GitHub, repeated until it worked.
Yes, manually. On purpose.
Not vibe coding — this was GUIDED CODING. Every file understood, every API call intentional, every line deliberate. Slow? Yes. Worth it? Hopefully 🤞
What I actually learned:
* How to think in prompts so an LLM returns structured, predictable output every time
* LLM-as-judge, RAG vs tool use vs knowledge-based generation — not the same thing, turns out
* File structure, API routes, client-side file generation — all new, all now mine
* That "not impossible anymore" is real. Quietly, genuinely real.
What's next: The manual copy-paste era ends here. Next chapter: real agentic workflows — autonomous tool use, web search, multi-step reasoning. Building in public while I job hunt, improving the tool as I use it.
And yes, the love-hate relationship with AI gets more real every day. Wouldn't have it any other way 🙂

👉 github.com/shwetaguptagit/firstlight-careers