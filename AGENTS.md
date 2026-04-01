# AGENTS.md

This file contains the durable operating rules for Codex and any subagents working in this repository.

Codex reads `AGENTS.md` files before doing work. These instructions are intentionally opinionated so the repo remains stable across long-running sessions.

## 1) Mission

Build and maintain a **market research, link aggregation, and profit-estimation tool** for human-in-the-loop decision support.

The product goal is to identify and rank potentially attractive products based on public or approved data sources.

## 2) Hard safety and scope boundaries

You must **not** implement, scaffold, suggest, or quietly leave TODO hooks for:
- automatic purchase execution
- raffle auto-entry
- CAPTCHA solving or bypass
- login bypass
- anti-bot bypass
- queue bypass
- proxy rotation for evasion
- fingerprint spoofing
- account farming or bulk account support
- rate-limit evasion
- retailer restriction circumvention
- stealth scraping patterns clearly intended to defeat protections

If a requested design choice would move the repository in that direction, refuse that portion and continue with the allowed market-research scope.

## 3) Product boundaries

Allowed core features:
- ingesting public or approved signals
- source adapters and normalization
- candidate ranking
- official/reference/purchase URL registry
- manual operator workflows
- profit and margin estimation
- exports and audit logs
- dashboards and alerts

Allowed future extensions:
- more data sources
- better scoring
- richer search and filtering
- operator notes
- approval queues
- watchlists and notifications

## 4) Execution style

Always follow this order unless the current task explicitly says otherwise:
1. understand the current state
2. make a plan
3. implement the smallest useful slice
4. validate
5. document the result

For non-trivial tasks, use plan mode first.

## 5) Long-running work protocol

When a task is larger than a small bug fix:
- consult `PLANS.md`
- align the requested work to a milestone
- keep changes scoped to that milestone
- update `PLANS.md` checkboxes or notes when meaningful progress is made
- summarize what changed and what remains

## 6) Subagent rules

Subagents are allowed only when work can be split into **non-overlapping** tracks.
Examples of acceptable parallel splits:
- schema vs. UI mockup
- connector A vs. connector B
- tests vs. documentation

Avoid subagents when they would edit the same files or force large merge conflict risk.

When using subagents:
- assign each one a narrow scope
- define expected output files
- consolidate results in the parent agent
- run validation after integration

## 7) Architecture rules

Prefer:
- TypeScript
- clear module boundaries
- adapter interfaces for external sources
- pure functions for scoring/profit logic where possible
- dependency injection or narrow service wrappers around external APIs
- mock providers when credentials are missing

Avoid:
- giant utility files
- hidden side effects
- connector logic mixed into UI components
- direct environment variable reads everywhere
- hardcoded secrets

## 8) Data-source rules

All source integrations must be wrapped behind explicit adapters.
Every adapter should support:
- input parameters
- response normalization
- graceful failure
- retry policy where appropriate
- a mock implementation for local dev if feasible

Do not assume network availability during development.
Design connectors so they can be tested with fixtures.

## 9) Quality bar

Every substantial change should aim to include:
- types
- basic error handling
- logging where operationally relevant
- tests for pure logic or parsers when feasible
- docs update when behavior or setup changes

Before finishing a task, try to run relevant validation such as:
- lint
- typecheck
- unit tests
- targeted smoke tests

If you cannot run a validation step, say exactly why.

## 10) Documentation rules

Keep these files current when relevant:
- `README.md` for setup and product overview
- `PLANS.md` for milestone progress
- `.env.example` for required settings

If you add a new dependency, command, or service, reflect it in the docs.

## 11) Environment rules

- Never commit real secrets.
- Keep `.env.example` current.
- Prefer sensible defaults for local development.
- If a feature requires a key, provide a mock path so the app still boots.

## 12) Schema and migration rules

- Keep Prisma schema readable.
- Name models and columns for domain meaning, not source quirks.
- Add migrations deliberately.
- Seed only safe mock/dev data.

## 13) UI rules

- Optimize for operator clarity over visual novelty.
- Candidate tables must explain rank, expected margin, and source evidence.
- Detail pages should show why a score was assigned.
- Empty states must be useful.
- Mock mode should look complete enough for demo purposes.

## 14) Scoring rules

The initial score should remain rule-based and explainable.
Favor transparent formulas over opaque model-driven scoring in the MVP.
Any scoring function should produce an explanation payload that can be displayed in the UI.

## 15) What to do when requirements are ambiguous

Do not freeze.
Make a reasonable assumption that preserves:
- safety boundaries
- modularity
- mock-first development
- future extensibility

Then document the assumption in code comments, docs, or TODOs.

## 16) First-session behavior

On a fresh prompt in this repo, start by reading:
- `README.md`
- `PLANS.md`
- relevant source files near the requested change

Then propose a scoped plan before editing, unless the user explicitly requests a tiny direct change.
