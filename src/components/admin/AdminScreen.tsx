import Link from "next/link";

import { ConnectorStatusCard } from "@/components/candidates/ConnectorStatusCard";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { formatDate } from "@/lib/formatters";
import { getDictionary, getLocalePath, type AppLocale } from "@/lib/i18n";
import type { JobRunRecord } from "@/lib/jobs/types";

interface AdminScreenProps {
  locale: AppLocale;
  candidateCount: number;
  signalCount: number;
  latestObservedAt: string | null;
  connectorStatuses: Parameters<typeof ConnectorStatusCard>[0]["connectorStatuses"];
  jobRuns: JobRunRecord[];
  scheduler: {
    enabled: boolean;
    cron: string;
    retryLimit: number;
    retryBackoffMs: number;
    endpointPath: string;
    secretConfigured: boolean;
  };
  persistence: {
    enabled: boolean;
  };
}

function formatDuration(durationMs: number, locale: AppLocale) {
  const seconds = Math.max(0, Math.round(durationMs / 1000));
  return locale === "ja" ? `${seconds}秒` : `${seconds}s`;
}

export function AdminScreen({
  locale,
  candidateCount,
  signalCount,
  latestObservedAt,
  connectorStatuses,
  jobRuns,
  scheduler,
  persistence,
}: AdminScreenProps) {
  const dictionary = getDictionary(locale);
  const latestRun = jobRuns[0];

  return (
    <main className="space-y-6">
      <section className="panel-surface overflow-hidden px-6 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">{dictionary.admin.badge}</p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              {dictionary.admin.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted md:text-lg">
              {dictionary.admin.description}
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <LanguageSwitcher enHref="/en/admin" jaHref="/admin" locale={locale} />
            <Link
              className="inline-flex items-center rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
              href={getLocalePath(locale, "/")}
            >
              {dictionary.admin.backToDashboard}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <div className="space-y-6">
          <section className="panel-surface p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  {dictionary.admin.currentSnapshotTitle}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{dictionary.admin.currentSnapshotTitle}</h2>
              </div>
              <span className="pill">{dictionary.admin.badge}</span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="metric-card">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {dictionary.admin.candidateCount}
                </p>
                <p className="mt-3 text-3xl font-semibold text-ink">{candidateCount}</p>
              </article>
              <article className="metric-card">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {dictionary.admin.signalCount}
                </p>
                <p className="mt-3 text-3xl font-semibold text-ink">{signalCount}</p>
              </article>
              <article className="metric-card">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {dictionary.admin.latestObservedAt}
                </p>
                <p className="mt-3 text-sm font-semibold text-ink">
                  {latestObservedAt ? formatDate(latestObservedAt, locale) : dictionary.admin.noLatestObservedAt}
                </p>
              </article>
              <article className="metric-card">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {dictionary.admin.persistenceTitle}
                </p>
                <p className="mt-3 text-sm font-semibold text-ink">
                  {persistence.enabled ? dictionary.admin.persistenceEnabled : dictionary.admin.persistenceDisabled}
                </p>
              </article>
            </div>
          </section>

          <section className="panel-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              {dictionary.admin.recentRunsTitle}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{dictionary.admin.latestRunTitle}</h2>

            {latestRun ? (
              <div className="mt-6 rounded-[22px] border border-line/80 bg-white/75 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                      latestRun.status === "success"
                        ? "bg-[#eff6ea] text-success"
                        : "bg-[#fbede4] text-warning"
                    }`}
                  >
                    {latestRun.status === "success" ? dictionary.admin.runSuccess : dictionary.admin.runFailed}
                  </span>
                  <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    {latestRun.trigger}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {dictionary.admin.latestRunFinished}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-ink">{formatDate(latestRun.finishedAt, locale)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {dictionary.admin.latestRunDuration}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-ink">{formatDuration(latestRun.durationMs, locale)}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-muted">
                  {dictionary.admin.latestRunCounts(latestRun.candidateCount, latestRun.signalCount)}
                </p>
                {latestRun.notes ? <p className="mt-2 text-sm leading-6 text-muted">{latestRun.notes}</p> : null}
                {latestRun.error ? <p className="mt-2 text-sm leading-6 text-warning">{latestRun.error}</p> : null}
              </div>
            ) : (
              <p className="mt-6 text-sm leading-6 text-muted">{dictionary.admin.latestRunEmpty}</p>
            )}

            <div className="mt-6 space-y-3">
              {jobRuns.slice(0, 6).map((jobRun) => (
                <article key={jobRun.id} className="rounded-[20px] border border-line/80 bg-white/75 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{jobRun.jobName}</p>
                      <p className="mt-1 text-sm text-muted">{formatDate(jobRun.finishedAt, locale)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                        {jobRun.trigger}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          jobRun.status === "success"
                            ? "bg-[#eff6ea] text-success"
                            : "bg-[#fbede4] text-warning"
                        }`}
                      >
                        {jobRun.status === "success" ? dictionary.admin.runSuccess : dictionary.admin.runFailed}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {dictionary.admin.latestRunCounts(jobRun.candidateCount, jobRun.signalCount)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="panel-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              {dictionary.admin.schedulerTitle}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{dictionary.admin.schedulerStatus}</h2>

            <div className="mt-5 space-y-3 text-sm text-muted">
              <div className="flex items-center justify-between gap-4">
                <span>{dictionary.admin.schedulerStatus}</span>
                <span className="pill">
                  {scheduler.enabled ? dictionary.admin.schedulerEnabled : dictionary.admin.schedulerDisabled}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{dictionary.admin.cronLabel}</span>
                <span className="font-semibold text-ink">{scheduler.cron}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{dictionary.admin.retryLabel}</span>
                <span className="font-semibold text-ink">
                  {scheduler.retryLimit} x {scheduler.retryBackoffMs}ms
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{dictionary.admin.endpointLabel}</span>
                <span className="font-semibold text-ink">{scheduler.endpointPath}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{dictionary.admin.secretLabel}</span>
                <span className="font-semibold text-ink">
                  {scheduler.secretConfigured ? dictionary.admin.secretConfigured : dictionary.admin.secretMissing}
                </span>
              </div>
            </div>
          </section>

          <section className="panel-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              {dictionary.admin.exportTitle}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{dictionary.admin.exportTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{dictionary.admin.exportDescription}</p>

            <div className="mt-5 grid gap-3">
              <a
                className="inline-flex items-center justify-center rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                href="/api/exports/candidates.csv?locale=ja"
              >
                {dictionary.admin.exportJa}
              </a>
              <a
                className="inline-flex items-center justify-center rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                href="/api/exports/candidates.csv?locale=en"
              >
                {dictionary.admin.exportEn}
              </a>
            </div>
          </section>

          <ConnectorStatusCard connectorStatuses={connectorStatuses} locale={locale} />
        </div>
      </section>
    </main>
  );
}
