import Link from "next/link";
import { notFound } from "next/navigation";

import { ExternalLinkRegistry } from "@/components/candidates/ExternalLinkRegistry";
import { ProfitCalculator } from "@/components/candidates/ProfitCalculator";
import { ScoreBreakdownCard } from "@/components/candidates/ScoreBreakdownCard";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { getCandidateBySlug } from "@/lib/candidates/service";
import { env } from "@/lib/config/env";
import { formatCurrency, formatDate, formatPercent } from "@/lib/formatters";
import { getConnectorLabel, getDictionary, getLocalePath, type AppLocale } from "@/lib/i18n";

export async function CandidateDetailScreen({
  locale,
  slug,
}: {
  locale: AppLocale;
  slug: string;
}) {
  const dictionary = getDictionary(locale);
  const candidate = await getCandidateBySlug(slug, locale);

  if (!candidate) {
    notFound();
  }

  const candidatePath = `/candidates/${candidate.slug}`;

  return (
    <main className="space-y-6">
      <section className="panel-surface px-6 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link className="text-sm font-semibold text-muted hover:text-accent" href={getLocalePath(locale, "/")}>
            {dictionary.detail.backToDashboard}
          </Link>
          <LanguageSwitcher
            enHref={getLocalePath("en", candidatePath)}
            jaHref={getLocalePath("ja", candidatePath)}
            locale={locale}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{candidate.category}</p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              {candidate.title}
            </h1>
            <p className="mt-3 text-lg text-muted">{candidate.brand}</p>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted">{candidate.shortDescription}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="pill">{dictionary.detail.referenceLinksOnly}</span>
              <span className="pill">{dictionary.detail.signalCountBadge(candidate.signals.length)}</span>
              <span className="pill">{dictionary.detail.latestActivity(formatDate(candidate.lastObservedAt, locale))}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {dictionary.detail.expectedMargin}
              </p>
              <p className="mt-3 text-3xl font-semibold text-ink">
                {formatPercent(candidate.profit.marginRate, locale)}
              </p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {dictionary.detail.expectedProfit}
              </p>
              <p className="mt-3 text-3xl font-semibold text-ink">
                {formatCurrency(candidate.profit.netProfit, locale)}
              </p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {dictionary.detail.baseScore}
              </p>
              <p className="mt-3 text-3xl font-semibold text-ink">{candidate.score.total}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {dictionary.detail.feeBaseline}
              </p>
              <p className="mt-3 text-3xl font-semibold text-ink">
                {formatPercent(env.DEFAULT_PLATFORM_FEE_RATE, locale)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <ScoreBreakdownCard locale={locale} score={candidate.score} />

      <section className="panel-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              {dictionary.detail.sourceSignalsEyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{dictionary.detail.sourceSignalsTitle}</h2>
          </div>
          <span className="pill">{dictionary.detail.adapterFeedBadge}</span>
        </div>

        <div className="mt-6 grid gap-4">
          {candidate.signals.map((signal) => (
            <article key={signal.id} className="rounded-[22px] border border-line/80 bg-white/75 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f8f4ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {getConnectorLabel(signal.connector, locale)}
                    </span>
                    <span className="rounded-full bg-[#eff6ea] px-3 py-1 text-xs font-semibold text-success">
                      {signal.metricLabel}: {signal.metricValue}
                    </span>
                  </div>
                  <p className="mt-3 text-base font-semibold text-ink">{signal.summary}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {dictionary.detail.signalContext(
                      signal.keyword,
                      signal.category,
                      formatDate(signal.observedAt, locale),
                    )}
                  </p>
                  {signal.verification ? (
                    <p className="mt-2 text-sm leading-6 text-muted">{signal.verification.summary}</p>
                  ) : null}
                  {signal.evidence && signal.evidence.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {signal.evidence.slice(0, 3).map((evidence) => (
                        <a
                          key={evidence.id}
                          className="inline-flex items-center rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
                          href={evidence.url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {evidence.sourceLabel ? `${evidence.sourceLabel}: ` : ""}
                          {evidence.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
                {signal.referenceUrl ? (
                  <a
                    className="inline-flex items-center rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                    href={signal.referenceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {dictionary.detail.openReference}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <ExternalLinkRegistry initialLinks={candidate.externalLinks} locale={locale} />
        <ProfitCalculator
          initialInput={{
            buyPrice: candidate.estimatedBuyPrice,
            sellPrice: candidate.estimatedSellPrice,
            platformFeeRate: env.DEFAULT_PLATFORM_FEE_RATE,
            shippingCost: candidate.shippingCost,
            otherCost: candidate.otherCost,
          }}
          locale={locale}
        />
      </div>
    </main>
  );
}
