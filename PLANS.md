# PLANS.md

This file is the long-horizon execution map for Codex sessions in this repository.

Use it to keep work scoped, reviewable, and resumable. Native plan mode in Codex is useful for this style of execution, and OpenAI's long-horizon guidance recommends breaking larger work into clear, reviewable steps.

---

## Operating rules for plan execution

1. Work one milestone at a time unless explicitly instructed otherwise.
2. Keep mock mode functioning after every milestone.
3. Prefer shipping a thin vertical slice over partially touching everything.
4. Update this file after meaningful progress.
5. When blocked, record the blocker and the smallest next step.

---

## Milestone 0 — Foundations

**Goal:** Create a stable repo and local developer experience.

### Deliverables
- [x] App scaffold created
- [x] TypeScript configured
- [x] Tailwind configured
- [x] Prisma configured
- [x] PostgreSQL via Docker Compose
- [x] `.env.example` aligned with code
- [x] lint/typecheck/test scripts present
- [x] mock data path boots app without external keys
- [x] base docs updated

### Notes
- Keep implementation simple.
- Do not integrate live external sources yet.
- The result should be runnable locally by a human operator.
- 2026-04-01: Implemented Next.js + TypeScript + Tailwind scaffold, Prisma schema skeleton, Docker Compose config, mock connector registry, and validation scripts. Docker runtime was not exercised in this workspace because the `docker` CLI is unavailable here.

---

## Milestone 1 — Mock-first dashboard

**Goal:** Demonstrate the product with no external credentials.

### Deliverables
- [x] dashboard route exists
- [x] candidate table exists
- [x] sorting and filtering works
- [x] product detail page exists
- [x] manual external-link registry UI exists
- [x] manual profit calculator exists
- [x] empty states and loading states handled
- [x] fixture-based tests for key pure logic

### Exit criteria
- A demo user can browse candidates and understand rank, expected margin, and attached links.
- 2026-04-01: Added dashboard filtering/sorting, candidate detail page, explainable score breakdown, reference-link registry UI, and profit estimator against mock X/Amazon/Keepa signals.

---

## Milestone 2 — Source adapters

**Goal:** Add real or semi-real data ingestion behind adapters.

### Deliverables
- [ ] adapter interface defined
- [ ] mock adapter implemented
- [ ] X trend adapter implemented or stubbed behind feature flag
- [ ] Amazon category adapter implemented or stubbed behind feature flag
- [ ] price-history adapter implemented or stubbed behind feature flag
- [ ] snapshot persistence implemented
- [ ] adapter errors logged clearly

### Exit criteria
- At least one live or fixture-backed adapter can populate normalized data without breaking local dev.

---

## Milestone 3 — Scoring engine

**Goal:** Rank candidates with an explainable formula.

### Deliverables
- [ ] scoring inputs defined
- [ ] rule-based score implemented
- [ ] explanation payload implemented
- [ ] risk deductions implemented
- [ ] score shown in dashboard and detail page
- [ ] tests cover score math

### Exit criteria
- Each ranked item can answer: "Why is this near the top?"

---

## Milestone 4 — Operations and jobs

**Goal:** Make the app refreshable and inspectable over time.

### Deliverables
- [ ] scheduled refresh path exists
- [ ] job-run logging exists
- [ ] retry/backoff policy documented
- [ ] admin page or job-status surface exists
- [ ] CSV export works
- [ ] seed/dev commands documented

### Exit criteria
- The system can perform periodic refreshes and leave an audit trail.

---

## Milestone 5 — Hardening

**Goal:** Improve reliability and maintainability.

### Deliverables
- [ ] connector fixture tests
- [ ] parser regression tests
- [ ] smoke tests
- [ ] docs cleanup
- [x] deployment notes
- [x] environment and secrets guidance updated

### Exit criteria
- Another developer can clone the repo, boot mock mode, and understand the roadmap.
- 2026-04-01: Added GitHub Actions CI, deployment-safe env handling, public-repo ignore rules, and GitHub + Vercel deployment documentation without changing the Milestone 0/1 product scope.

---

## Suggested subagent splits

Use only when scopes do not overlap.

### Good splits
- Agent A: Prisma schema + seed data
- Agent B: dashboard UI with fixture data
- Agent C: scoring engine pure functions + tests
- Agent D: docs and setup scripts

### Bad splits
- Multiple agents editing the same dashboard files
- Multiple agents changing the same Prisma schema simultaneously
- One agent refactoring architecture while another adds connectors

---

## Session template for Codex

Use something like this at the start of a work session:

```txt
Read README.md, AGENTS.md, and PLANS.md.
Use plan mode.
Identify the current milestone and propose a scoped implementation plan.
Implement only the smallest useful slice for that milestone.
Keep mock mode working.
Validate after changes and update docs or PLANS.md if needed.
```

---

## Blockers log

Add dated notes here when blocked.

- 2026-04-01: `docker compose config` could not be run in this workspace because the `docker` CLI is not installed.

---

## Decision log

Record important architectural decisions here.

- Initial product boundary excludes automation that executes purchases or enters raffles automatically.
- MVP should remain explainable and mock-first.
- Milestone 0 and 1 runtime uses fixture-backed connectors even when live credentials are present; live adapter wiring remains scoped to Milestone 2.
- No `vercel.json` is checked in because Vercel's default Next.js deployment behavior is sufficient for the current App Router setup.
- Deployment and CI target Node 20 or 22 LTS to stay aligned with Vercel-supported runtimes.
