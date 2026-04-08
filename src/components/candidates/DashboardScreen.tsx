import Link from "next/link";

import { CandidateTable } from "@/components/candidates/CandidateTable";
import { ConnectorStatusCard } from "@/components/candidates/ConnectorStatusCard";
import { DashboardFilters } from "@/components/candidates/DashboardFilters";
import { EmptyState } from "@/components/common/EmptyState";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { loadDashboardData } from "@/lib/candidates/service";
import type { CandidateFilters } from "@/lib/candidates/types";
import { getDictionary, getLocalePath, type AppLocale } from "@/lib/i18n";

type SearchParams = Record<string, string | string[] | undefined>;

function pickFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function DashboardScreen({
  locale,
  searchParams,
}: {
  locale: AppLocale;
  searchParams?: Promise<SearchParams>;
}) {
  const dictionary = getDictionary(locale);
  const resolvedSearchParams: SearchParams = searchParams ? await searchParams : {};
  const filters: CandidateFilters = {
    search: pickFirst(resolvedSearchParams.search),
    category: pickFirst(resolvedSearchParams.category),
    source: (pickFirst(resolvedSearchParams.source) as CandidateFilters["source"]) ?? "all",
    sort: (pickFirst(resolvedSearchParams.sort) as CandidateFilters["sort"]) ?? "score",
  };
  const dashboardData = await loadDashboardData(filters, locale);

  return (
    <main className="space-y-6">
      <section className="panel-surface overflow-hidden px-6 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              {dictionary.dashboard.heroBadge}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              {dictionary.dashboard.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted md:text-lg">
              {dictionary.dashboard.heroDescription}
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <LanguageSwitcher enHref="/en" jaHref="/" locale={locale} />
            <Link
              className="inline-flex items-center rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              href={getLocalePath(locale, "/admin")}
            >
              {dictionary.dashboard.adminLink}
            </Link>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="metric-card min-w-[160px]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {dictionary.dashboard.metricCandidates}
                </p>
                <p className="mt-3 text-3xl font-semibold text-ink">{dashboardData.candidates.length}</p>
              </div>
              <div className="metric-card min-w-[160px]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {dictionary.dashboard.metricWatchKeywords}
                </p>
                <p className="mt-3 text-3xl font-semibold text-ink">{dashboardData.watchKeywords.length}</p>
              </div>
              <div className="metric-card min-w-[160px]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {dictionary.dashboard.metricConnectors}
                </p>
                <p className="mt-3 text-3xl font-semibold text-ink">{dashboardData.connectorStatuses.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <section className="panel-surface p-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  {dictionary.dashboard.workspaceEyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{dictionary.dashboard.workspaceTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{dictionary.dashboard.workspaceDescription}</p>
              </div>
              <DashboardFilters categories={dashboardData.categories} locale={locale} selectedFilters={filters} />
            </div>

            <div className="mt-6">
              {dashboardData.candidates.length === 0 ? (
                <EmptyState
                  description={dictionary.dashboard.emptyDescription}
                  title={dictionary.dashboard.emptyTitle}
                />
              ) : (
                <CandidateTable candidates={dashboardData.candidates} locale={locale} />
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="panel-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              {dictionary.dashboard.watchlistsEyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{dictionary.dashboard.watchlistsTitle}</h2>

            <div className="mt-5">
              <p className="text-sm font-semibold text-ink">{dictionary.dashboard.keywordsLabel}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {dashboardData.watchKeywords.map((keyword) => (
                  <span key={keyword} className="pill">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-ink">{dictionary.dashboard.categoriesLabel}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {dashboardData.watchCategories.map((category) => (
                  <span key={category} className="pill">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <ConnectorStatusCard connectorStatuses={dashboardData.connectorStatuses} locale={locale} />
        </div>
      </section>
    </main>
  );
}
