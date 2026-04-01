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

Milestone 0 and Milestone 1 are implemented in a mock-first form:
- Next.js 15 + TypeScript + Tailwind app scaffold
- Prisma schema skeleton for watch profiles, candidates, signals, and external links
- Docker Compose config for local PostgreSQL
- environment parsing with deployment-safe defaults
- mock connector registry for X, Amazon, and Keepa
- dashboard with filtering and sorting
- candidate detail page with explainable scoring
- manual external-link registry UI
- manual profit calculator
- focused Vitest coverage for profit math, scoring, and connector fallback behavior
- GitHub Actions CI for pull requests and pushes to `main`

Live connector execution is intentionally deferred to Milestone 2. If credentials are unavailable, the app stays fully runnable in mock mode for local, preview, and production deployments.

## UI languages

- Japanese is the default operator experience at `/`
- English remains available at `/en`
- Candidate detail pages follow the same split:
  - Japanese: `/candidates/[slug]`
  - English: `/en/candidates/[slug]`

The bilingual UI remains mock-first in both routes. Language switching changes copy, mock data descriptions, connector status text, and explainable score messaging without altering the market-research-only product scope.

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

The dashboard boots without live API keys as long as `USE_MOCK_PROVIDERS=true`, which is the recommended default for local and preview environments.

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

### Needed now

- `APP_NAME`
  Optional in all environments. Defaults to `market-research-mvp`.
- `APP_URL`
  Recommended in Production. Preview deployments can omit it and let Vercel provide the host via `VERCEL_URL`.
- `USE_MOCK_PROVIDERS`
  Recommended `true` in Development and Preview. Production can also keep this `true` until live adapters are implemented.
- `DEFAULT_PLATFORM_FEE_RATE`
- `DEFAULT_SHIPPING_COST`
- `DEFAULT_OTHER_COST`
- `HIGH_MARGIN_THRESHOLD`
- `MOCK_WATCH_KEYWORDS`
- `MOCK_WATCH_CATEGORIES`

### Optional now, required later for live/runtime expansion

- `DATABASE_URL`
- `DIRECT_URL`
- `X_BEARER_TOKEN`
- `AMAZON_ACCESS_KEY_ID`
- `AMAZON_SECRET_ACCESS_KEY`
- `KEEPA_API_KEY`

These can be stored in Vercel today, but Milestone 0 and Milestone 1 still fall back safely to mock fixtures even if keys are absent or feature flags remain disabled.

### Recommended Vercel environment posture

- Development:
  `USE_MOCK_PROVIDERS=true`
- Preview:
  `USE_MOCK_PROVIDERS=true`
- Production:
  `USE_MOCK_PROVIDERS=true` until you intentionally begin Milestone 2 live-adapter work

For current deployments, database variables may be left unset if you are only using the mock-first UI.

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
- Production can also remain in mock mode until live connectors are intentionally implemented.
- Missing API keys in Preview should not block deployments; the app will continue using fixture-backed connectors.
- Missing database credentials should not block the current mock-first deployment path because the live runtime does not depend on Prisma reads or writes yet.

## Prisma and database notes

- Prisma is configured and generated during install so Vercel builds remain predictable.
- `docker-compose.yml` only helps local development.
- Vercel does not provide PostgreSQL by itself. When database-backed runtime features are introduced, use an external managed Postgres service and set `DATABASE_URL` and `DIRECT_URL` in Vercel.
- Until then, Preview and Production deployments can remain database-free while the app runs in mock mode.

## Troubleshooting

- Build fails with env parsing errors:
  Check that booleans are exactly `true` or `false`, numeric values are valid numbers, and `APP_URL` is a full URL when set.
- Local lint or typecheck behaves differently from GitHub Actions:
  This repo is pinned to Node 20 or 22 LTS for GitHub and Vercel compatibility. Node 25 is outside the supported range.
- Vercel preview deploys but no live data appears:
  Expected for Milestone 0 and 1. Mock connectors remain active until live adapters are implemented in a later milestone.
- Prisma-related deploy failures:
  For current mock-first deployments, leave database runtime features disabled and only set `DATABASE_URL` when you actually need database-backed behavior.
- GitHub Actions or Vercel uses a different Node version:
  Use Node 20 or 22 LTS locally and keep Vercel on a supported LTS release.
- Docker commands do not work in deployment:
  Expected. Docker Compose is local-only and is not part of the Vercel runtime.

## Routes

- `/` — dashboard with watchlists, connector status, filtering, sorting, and ranked candidates
- `/candidates/[slug]` — candidate detail page with source signals, score breakdown, reference links, and profit calculator

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

- `src/lib/connectors` contains connector interfaces and the mock registry.
- `src/lib/candidates` assembles dashboard-ready records from fixtures, signals, scoring, and profit math.
- `src/lib/scoring` and `src/lib/profit` hold pure logic suitable for focused tests.
- `src/lib/config/env.ts` centralizes deployment-safe environment parsing and defaulting.
- Prisma is configured now even though the Milestone 1 runtime still uses fixtures to preserve mock-mode reliability.

## Next milestone

Milestone 2 adds live or fixture-backed source ingestion behind the existing connector boundary:
- X trend adapter
- Amazon category adapter
- Keepa or price-history adapter
- snapshot persistence
- clearer logging around adapter failures
