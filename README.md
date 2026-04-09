# Market Research MVP for Product Opportunity Discovery

Production-minded MVP for an operator-facing market research tool that identifies potentially profitable resale opportunities using public information, approved APIs, and explainable profit math.

## Scope and safety boundaries

This project is intentionally limited to:
- market research
- link aggregation
- candidate ranking
- profit estimation
- operator-facing dashboards

This project must not implement:
- automatic purchasing
- raffle auto-entry
- CAPTCHA or login bypass
- rate-limit evasion
- proxy rotation or fingerprint spoofing
- account creation or checkout automation
- any workflow meant to bypass retailer rules

External links in the UI are references only. The app never interacts with purchase, official, or raffle pages automatically.

## Current status

Milestone 0 through Milestone 5 are implemented:
- Next.js 15 + TypeScript + Tailwind app scaffold
- Prisma schema for watch profiles, candidates, signals, and external links
- Docker Compose config for local PostgreSQL
- environment parsing with deployment-safe defaults
- connector registry with mock-first and public-live ingestion paths
- public social verification via Yahoo search over indexed social/community pages
- public Amazon search parsing with Yahoo! Shopping fallback for buy-side reference prices
- public Yahoo! Auctions parsing for resale-side reference prices
- optional official X recent-counts adapter behind feature flag + bearer token
- dashboard with filtering, sorting, and export-ready candidate ranking
- candidate detail page with richer explainable scoring
- manual external-link registry UI
- manual profit calculator
- optional snapshot persistence when `DATABASE_URL` is present
- structured connector degradation logging and status reporting
- scheduled refresh path with retry/backoff and job-run logging
- admin operations page for refresh posture, job history, and CSV export
- seed and manual refresh scripts for local or CI workflows
- focused Vitest coverage for profit math, scoring, connector fallback, public-data parsers, live X normalization, env parsing, CSV export, refresh jobs, and smoke behavior
- GitHub Actions CI for pull requests and pushes to `main`

The app remains fully runnable in mock mode for local, preview, and production deployments. When `USE_MOCK_PROVIDERS=false`, the public deployment path uses public search/index pages for social verification, Amazon pricing, and resale references without attempting any bot-evasion or marketplace bypass.

## UI languages

- Japanese is the default operator experience at `/`
- English remains available at `/en`
- Candidate detail pages follow the same split:
  - Japanese: `/candidates/[slug]`
  - English: `/en/candidates/[slug]`

The bilingual UI remains safe for public deployment in both routes. Language switching changes copy, mock data descriptions, connector status text, and explainable score messaging without altering the market-research-only product scope.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Zod
- Vitest
- Docker Compose for local database work
- GitHub Actions
- Vercel

## Local setup

Use Node.js 20 or 22 LTS.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local env file:

   ```bash
   cp .env.example .env
   ```

3. Optional: start PostgreSQL for local Prisma work:

   ```bash
   docker compose up -d
   ```

4. Optional: generate Prisma Client explicitly:

   ```bash
   npm run db:generate
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

The dashboard boots without live API keys as long as `USE_MOCK_PROVIDERS=true`, which remains the recommended default for local and preview environments.

To exercise the public live-data path locally:

```bash
USE_MOCK_PROVIDERS=false
```

That enables:
- public social verification through Yahoo web search over indexed social/community pages
- public Amazon search parsing with Yahoo! Shopping fallback for buy-side reference prices
- public Yahoo! Auctions parsing for resale reference prices

To upgrade the social connector from indexed public social search to the official X recent-counts adapter:

```bash
ENABLE_X_CONNECTOR=true
X_BEARER_TOKEN=your_token_here
```

The app does not require private Amazon or Keepa credentials for the current public-data path.

Additional local commands:

```bash
npm run db:seed
npm run jobs:refresh
npm run test:smoke
```

- `npm run db:seed` stores safe mock snapshots into Postgres when `DATABASE_URL` is configured.
- `npm run jobs:refresh` runs the same refresh flow used by the scheduled route and records a job log entry.
- `npm run test:smoke` runs a small smoke suite for dashboard loading and refresh orchestration.

## Validation commands

```bash
npm run validate
npm run ci
```

Expanded command list:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run db:format
npm run db:push
npm run db:seed
npm run jobs:refresh
npm run test:smoke
```

- `npm run validate` runs lint, typecheck, and tests.
- `npm run ci` runs the full validation path plus a production build.
- `docker-compose.yml` is for local development only and is not used by Vercel.
- `next build` skips duplicate linting because lint is already handled explicitly in CI.

## Environment variables

The app uses explicit Zod parsing in [src/lib/config/env.ts](/Users/onoe/Desktop/転売ヤー/src/lib/config/env.ts). Empty strings are treated as missing values, booleans must be `true` or `false`, and `APP_URL` falls back to `VERCEL_URL` in Vercel or `http://localhost:3000` locally.

### Always relevant

- `APP_NAME`
  Optional in all environments. Defaults to `market-research-mvp`.
- `APP_URL`
  Recommended in Production. Preview deployments can omit it and let Vercel provide the host via `VERCEL_URL`.
- `LOG_LEVEL`
  Optional. Defaults to `info`.
- `USE_MOCK_PROVIDERS`
  Recommended `true` in Development and Preview. Set this to `false` in Production when you want the live public-data path.
- `SOCIAL_REQUEST_TIMEOUT_MS`
- `AMAZON_REQUEST_TIMEOUT_MS`
- `MARKET_REQUEST_TIMEOUT_MS`
- `LIVE_DATA_REVALIDATE_SECONDS`
- `DEFAULT_PLATFORM_FEE_RATE`
- `DEFAULT_SHIPPING_COST`
- `DEFAULT_OTHER_COST`
- `HIGH_MARGIN_THRESHOLD`
- `MOCK_WATCH_KEYWORDS`
- `MOCK_WATCH_CATEGORIES`

### Live public-data mode

When `USE_MOCK_PROVIDERS=false`, the default connector behavior is:
- social verification: Yahoo search over indexed public social/community pages
- buy-side pricing: Amazon public search parsing with Yahoo! Shopping fallback when Amazon yields no usable match
- resale reference pricing: Yahoo! Auctions public search parsing

This mode does not require private API credentials and keeps the app within market-research-only boundaries.

### Optional for official X recent-counts

- `ENABLE_X_CONNECTOR`
- `X_BEARER_TOKEN`
- `X_REQUEST_TIMEOUT_MS`
- `X_DEFAULT_QUERY_WINDOW_DAYS`
- `X_DEFAULT_LOCALE`

Live X runs only when all of the following are true:
- `USE_MOCK_PROVIDERS=false`
- `ENABLE_X_CONNECTOR=true`
- `X_BEARER_TOKEN` is set

If any of those are missing, the app continues safely in mock mode for X.

### Optional for snapshot persistence

- `DATABASE_URL`
- `DIRECT_URL`

When `DATABASE_URL` is available, the app will upsert a default watch profile plus candidate, external-link, and signal snapshots after runtime assembly. When it is absent, persistence is skipped and the UI still works.

### Optional for scheduled refreshes and job logging

- `ENABLE_SCHEDULED_JOBS`
- `CRON_SECRET`
- `JOB_RETRY_LIMIT`
- `JOB_RETRY_BACKOFF_MS`
- `REFRESH_CRON`

When scheduled jobs are enabled, `/api/jobs/refresh` becomes the shared refresh endpoint for cron-driven updates. In production, set `CRON_SECRET` and pass it as `Authorization: Bearer <secret>` or `x-cron-secret`.

### Present but not required for the current public-data path

- `ENABLE_AMAZON_CONNECTOR`
- `AMAZON_ACCESS_KEY_ID`
- `AMAZON_SECRET_ACCESS_KEY`
- `KEEPA_API_KEY`

These are reserved for future official or partner API integrations. The current deployed app does not need them to fetch public Amazon or resale-market references.

### Recommended Vercel environment posture

- Development:
  `USE_MOCK_PROVIDERS=true`
- Preview:
  `USE_MOCK_PROVIDERS=true`
- Production:
  `USE_MOCK_PROVIDERS=false` when you want the live public-data path, with `APP_URL` set to the canonical site URL

For current deployments, database variables may be left unset if you do not want snapshot persistence.

## GitHub setup

If this folder is not already a Git repository:

```bash
git init
git add .
git commit -m "Initial deployment-ready MVP"
git branch -M main
```

Create an empty GitHub repository, then connect and push:

```bash
git remote add origin git@github.com:YOUR-ORG/YOUR-REPO.git
git push -u origin main
```

If you prefer HTTPS instead of SSH, use the HTTPS remote URL from GitHub.

Once pushed, GitHub becomes the source of truth for:
- pull requests
- branch previews in Vercel
- CI status checks from [.github/workflows/ci.yml](/Users/onoe/Desktop/転売ヤー/.github/workflows/ci.yml)

## GitHub + Vercel deployment

1. Push the repository to GitHub.
2. In Vercel, choose **Add New Project**.
3. Import the GitHub repository.
4. Let Vercel detect the framework as Next.js.
5. Keep the project root at the repository root.
6. Add environment variables from [`.env.example`](/Users/onoe/Desktop/転売ヤー/.env.example).
7. Deploy.

Vercel will automatically create:
- preview deployments for pull requests and non-production branches
- production deployments for pushes to the production branch, usually `main`

No `vercel.json` is included because it is not needed right now. The default Vercel behavior is already correct for this App Router Next.js project, and avoiding extra config keeps the deployment path simpler.

## Preview vs production behavior

- Preview deployments should stay safe and demo-friendly by keeping `USE_MOCK_PROVIDERS=true`.
- Production can also remain in mock mode indefinitely, but the public site can run with `USE_MOCK_PROVIDERS=false` and no private API keys.
- Missing X keys in Preview or Production should not block deployments; the app will continue using indexed public social verification when mock mode is off.
- Missing database credentials should not block deployments because snapshot persistence is optional.
- Scheduled refreshes can stay disabled in Preview. When enabled in Production, protect them with `CRON_SECRET`.

## Prisma and database notes

- Prisma is configured and generated during install so Vercel builds remain predictable.
- `docker-compose.yml` only helps local development.
- Vercel does not provide PostgreSQL by itself. For snapshot persistence, use an external managed Postgres service and set `DATABASE_URL` and `DIRECT_URL` in Vercel.
- The UI does not read back from Prisma yet, so Preview and Production can remain database-free while the app runs in mock mode or live public-data mode.

## Troubleshooting

- Build fails with env parsing errors:
  Check that booleans are exactly `true` or `false`, numeric values are valid numbers, and `APP_URL` is a full URL when set.
- Local lint or typecheck behaves differently from GitHub Actions:
  This repo is pinned to Node 20 or 22 LTS for GitHub and Vercel compatibility. Node 25 is outside the supported range.
- Vercel preview deploys but no live data appears:
  Check `USE_MOCK_PROVIDERS=false`. Public Amazon/social/market connectors do not require private credentials. Only the official X recent-counts path needs `ENABLE_X_CONNECTOR=true` and `X_BEARER_TOKEN`.
- A candidate still shows weak or zero live signals:
  Public search results can vary by region and time. The app now filters harder for exact model/box matches, but some targets will still need manual operator review.
- `/api/jobs/refresh` returns 401 or 503:
  Check `ENABLE_SCHEDULED_JOBS`, set `CRON_SECRET`, and send it as a bearer token or `x-cron-secret` header.
- Prisma-related deploy failures:
  Snapshot persistence is optional. Remove or fix `DATABASE_URL` / `DIRECT_URL`, or leave them unset if you do not need persistence yet.
- Snapshot persistence does not seem to run:
  Ensure `DATABASE_URL` is set and test the default Japanese route first. Milestone 2 intentionally skips duplicate writes from the secondary locale route.
- Alternate metadata points at a temporary Vercel URL:
  Set `APP_URL` in Vercel to the canonical production domain so metadata and language alternates resolve correctly.
- GitHub Actions or Vercel uses a different Node version:
  Use Node 20 or 22 LTS locally and keep Vercel on a supported LTS release.
- Docker commands do not work in deployment:
  Expected. Docker Compose is local-only and is not part of the Vercel runtime.

## Routes

- `/` — Japanese dashboard with watchlists, connector status, filtering, sorting, and ranked candidates
- `/en` — English dashboard
- `/admin` — Japanese admin operations page with refresh posture, job history, and export links
- `/en/admin` — English admin operations page
- `/candidates/[slug]` — Japanese candidate detail page with source signals, score breakdown, reference links, and profit calculator
- `/en/candidates/[slug]` — English candidate detail page
- `/api/jobs/refresh` — protected refresh endpoint for scheduled or manual orchestration
- `/api/exports/candidates.csv` — CSV export route with `?locale=ja|en`

## Project structure

```txt
.
├─ .github/workflows/ci.yml
├─ README.md
├─ AGENTS.md
├─ PLANS.md
├─ .env.example
├─ docker-compose.yml
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ scripts/
│  └─ run-refresh.ts
├─ src/
│  ├─ app/
│  ├─ components/
│  └─ lib/
└─ tests/
```

## Architecture notes

- `src/lib/connectors` contains connector interfaces plus mock adapters, public live adapters, and the optional official X adapter.
- `src/lib/candidates` assembles dashboard-ready records from fixtures, signals, scoring, and profit math.
- `src/lib/candidates/persistence.ts` optionally snapshots assembled records into Prisma without making the database mandatory.
- `src/lib/jobs` contains refresh orchestration, auth checks, job-run logging, and admin data loading.
- `src/lib/export/candidates-csv.ts` handles CSV generation with safe escaping.
- `src/lib/scoring` and `src/lib/profit` hold pure logic suitable for focused tests.
- `src/lib/config/env.ts` centralizes deployment-safe environment parsing and defaulting.
- Prisma remains optional at runtime so mock mode and live public-data mode stay reliable in local, preview, and production deployments.

## Follow-on ideas

The roadmap beyond the completed milestones can now focus on:
- optional official Amazon and price-history adapters behind the existing connector contracts
- richer operator workflows such as notes, approvals, and alerts
- stronger operational analytics once production traffic patterns are known
