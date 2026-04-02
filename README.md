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

Milestone 0, Milestone 1, and Milestone 2 are implemented:
- Next.js 15 + TypeScript + Tailwind app scaffold
- Prisma schema for watch profiles, candidates, signals, and external links
- Docker Compose config for local PostgreSQL
- environment parsing with deployment-safe defaults
- connector registry with `mock`, `live`, and `stub` modes
- live X recent-counts adapter behind feature flag + bearer token
- Amazon and Keepa stub adapters behind feature flags
- dashboard with filtering and sorting
- candidate detail page with explainable scoring
- manual external-link registry UI
- manual profit calculator
- optional snapshot persistence when `DATABASE_URL` is present
- structured connector degradation logging and status reporting
- focused Vitest coverage for profit math, scoring, connector fallback, live X normalization, and optional persistence
- GitHub Actions CI for pull requests and pushes to `main`

The app remains fully runnable in mock mode for local, preview, and production deployments. When X credentials are unavailable, the X connector falls back safely without blocking the UI.

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

To exercise the Milestone 2 live X adapter locally:

```bash
USE_MOCK_PROVIDERS=false
ENABLE_X_CONNECTOR=true
X_BEARER_TOKEN=your_token_here
```

Amazon and Keepa can also be enabled, but in Milestone 2 they surface as explicit `stub` connectors rather than making live requests.

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
  Recommended `true` in Development and Preview. Production can also keep this `true` when you want a safe fixture-backed deployment.
- `DEFAULT_PLATFORM_FEE_RATE`
- `DEFAULT_SHIPPING_COST`
- `DEFAULT_OTHER_COST`
- `HIGH_MARGIN_THRESHOLD`
- `MOCK_WATCH_KEYWORDS`
- `MOCK_WATCH_CATEGORIES`

### Optional for Milestone 2 live X

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

### Present but still deferred for later live adapters

- `ENABLE_AMAZON_CONNECTOR`
- `AMAZON_ACCESS_KEY_ID`
- `AMAZON_SECRET_ACCESS_KEY`
- `KEEPA_API_KEY`

In Milestone 2, Amazon and Keepa can be turned on to show explicit `stub` connector states, but they do not make live API calls yet.

### Recommended Vercel environment posture

- Development:
  `USE_MOCK_PROVIDERS=true`
- Preview:
  `USE_MOCK_PROVIDERS=true`
- Production:
  `USE_MOCK_PROVIDERS=true` for the safest public deployment, or disable it only when you intentionally want live X

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
- Production can also remain in mock mode indefinitely.
- Missing X keys in Preview should not block deployments; the app will continue using fixture-backed connectors.
- Missing database credentials should not block deployments because snapshot persistence is optional in Milestone 2.
- Enabling Amazon or Keepa without later-milestone implementations will show a `stub` status instead of making live requests.

## Prisma and database notes

- Prisma is configured and generated during install so Vercel builds remain predictable.
- `docker-compose.yml` only helps local development.
- Vercel does not provide PostgreSQL by itself. For Milestone 2 snapshot persistence, use an external managed Postgres service and set `DATABASE_URL` and `DIRECT_URL` in Vercel.
- The UI does not read back from Prisma yet, so Preview and Production can remain database-free while the app runs in mock mode or live-X-without-persistence mode.

## Troubleshooting

- Build fails with env parsing errors:
  Check that booleans are exactly `true` or `false`, numeric values are valid numbers, and `APP_URL` is a full URL when set.
- Local lint or typecheck behaves differently from GitHub Actions:
  This repo is pinned to Node 20 or 22 LTS for GitHub and Vercel compatibility. Node 25 is outside the supported range.
- Vercel preview deploys but no live data appears:
  Check `USE_MOCK_PROVIDERS=false`, `ENABLE_X_CONNECTOR=true`, and `X_BEARER_TOKEN`. If any are missing, X will stay in mock fallback mode.
- Amazon or Keepa shows `stub` instead of live data:
  Expected in Milestone 2. Those adapters are intentionally feature-flagged stubs right now.
- Prisma-related deploy failures:
  Snapshot persistence is optional. Remove or fix `DATABASE_URL` / `DIRECT_URL`, or leave them unset if you do not need persistence yet.
- Snapshot persistence does not seem to run:
  Ensure `DATABASE_URL` is set and test the default Japanese route first. Milestone 2 intentionally skips duplicate writes from the secondary locale route.
- GitHub Actions or Vercel uses a different Node version:
  Use Node 20 or 22 LTS locally and keep Vercel on a supported LTS release.
- Docker commands do not work in deployment:
  Expected. Docker Compose is local-only and is not part of the Vercel runtime.

## Routes

- `/` — Japanese dashboard with watchlists, connector status, filtering, sorting, and ranked candidates
- `/en` — English dashboard
- `/candidates/[slug]` — Japanese candidate detail page with source signals, score breakdown, reference links, and profit calculator
- `/en/candidates/[slug]` — English candidate detail page

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
│  └─ schema.prisma
├─ src/
│  ├─ app/
│  ├─ components/
│  └─ lib/
└─ tests/
```

## Architecture notes

- `src/lib/connectors` contains connector interfaces plus mock, live, and stub adapter implementations.
- `src/lib/candidates` assembles dashboard-ready records from fixtures, signals, scoring, and profit math.
- `src/lib/candidates/persistence.ts` optionally snapshots assembled records into Prisma without making the database mandatory.
- `src/lib/scoring` and `src/lib/profit` hold pure logic suitable for focused tests.
- `src/lib/config/env.ts` centralizes deployment-safe environment parsing and defaulting.
- Prisma remains optional at runtime so mock mode stays reliable in local, preview, and production deployments.

## Next milestone

Milestone 3 focuses on scoring improvements on top of the current adapter layer:
- richer scoring inputs
- clearer explanation payloads
- more explicit risk deductions
- additional score-oriented test coverage
