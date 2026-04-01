import { CandidateTable } from "@/components/candidates/CandidateTable";
import { ConnectorStatusCard } from "@/components/candidates/ConnectorStatusCard";
import { DashboardFilters } from "@/components/candidates/DashboardFilters";
import { EmptyState } from "@/components/common/EmptyState";
import { loadDashboardData } from "@/lib/candidates/service";
import type { CandidateFilters } from "@/lib/candidates/types";

type SearchParams = Record<string, string | string[] | undefined>;

function pickFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams: SearchParams = searchParams ? await searchParams : {};
  const filters: CandidateFilters = {
    search: pickFirst(resolvedSearchParams.search),
    category: pickFirst(resolvedSearchParams.category),
    source: (pickFirst(resolvedSearchParams.source) as CandidateFilters["source"]) ?? "all",
    sort: (pickFirst(resolvedSearchParams.sort) as CandidateFilters["sort"]) ?? "score",
  };

  const dashboardData = await loadDashboardData(filters);

  return (
    <main className="space-y-6">
      <section className="panel-surface overflow-hidden px-6 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Milestone 0 + 1 MVP</p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              Mock-first resale research board
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted md:text-lg">
              Operator-facing dashboard for public-signal research, manual link review, and explainable profit
              estimates. Purchase, official, and raffle links are shown strictly as references.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="metric-card min-w-[160px]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Candidates</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{dashboardData.candidates.length}</p>
            </div>
            <div className="metric-card min-w-[160px]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Watch keywords</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{dashboardData.watchKeywords.length}</p>
            </div>
            <div className="metric-card min-w-[160px]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Connectors</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{dashboardData.connectorStatuses.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <section className="panel-surface p-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Candidate workspace</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">Ranked opportunities</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Sort by score, margin, profit, or recency. Filter by category and connector without leaving mock
                  mode.
                </p>
              </div>
              <DashboardFilters categories={dashboardData.categories} selectedFilters={filters} />
            </div>

            <div className="mt-6">
              {dashboardData.candidates.length === 0 ? (
                <EmptyState
                  description="Try widening the search, category, or source filters to bring mock candidates back into view."
                  title="No candidates matched these filters"
                />
              ) : (
                <CandidateTable candidates={dashboardData.candidates} />
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="panel-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Configured watchlists</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Keywords and categories</h2>

            <div className="mt-5">
              <p className="text-sm font-semibold text-ink">Keywords</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {dashboardData.watchKeywords.map((keyword) => (
                  <span key={keyword} className="pill">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-ink">Categories</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {dashboardData.watchCategories.map((category) => (
                  <span key={category} className="pill">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <ConnectorStatusCard connectorStatuses={dashboardData.connectorStatuses} />
        </div>
      </section>
    </main>
  );
}
