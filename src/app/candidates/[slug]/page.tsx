import Link from "next/link";
import { notFound } from "next/navigation";

import { ExternalLinkRegistry } from "@/components/candidates/ExternalLinkRegistry";
import { ProfitCalculator } from "@/components/candidates/ProfitCalculator";
import { ScoreBreakdownCard } from "@/components/candidates/ScoreBreakdownCard";
import { getCandidateBySlug } from "@/lib/candidates/service";
import { env } from "@/lib/config/env";
import { formatCurrency, formatDate, formatPercent, titleCase } from "@/lib/formatters";

export default async function CandidatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const candidate = await getCandidateBySlug(resolvedParams.slug);

  if (!candidate) {
    notFound();
  }

  return (
    <main className="space-y-6">
      <section className="panel-surface px-6 py-8 md:px-8 md:py-10">
        <Link className="text-sm font-semibold text-muted hover:text-accent" href="/">
          ← Back to dashboard
        </Link>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{candidate.category}</p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              {candidate.title}
            </h1>
            <p className="mt-3 text-lg text-muted">{candidate.brand}</p>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted">{candidate.shortDescription}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="pill">Reference links only</span>
              <span className="pill">{candidate.signals.length} live mock signals</span>
              <span className="pill">Latest activity {formatDate(candidate.lastObservedAt)}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Expected margin</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{formatPercent(candidate.profit.marginRate)}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Expected profit</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{formatCurrency(candidate.profit.netProfit)}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Base score</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{candidate.score.total}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Fee baseline</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{formatPercent(env.DEFAULT_PLATFORM_FEE_RATE)}</p>
            </div>
          </div>
        </div>
      </section>

      <ScoreBreakdownCard score={candidate.score} />

      <section className="panel-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Source signals</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Why this candidate surfaced</h2>
          </div>
          <span className="pill">Mock feed</span>
        </div>

        <div className="mt-6 grid gap-4">
          {candidate.signals.map((signal) => (
            <article key={signal.id} className="rounded-[22px] border border-line/80 bg-white/75 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f8f4ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {titleCase(signal.connector)}
                    </span>
                    <span className="rounded-full bg-[#eff6ea] px-3 py-1 text-xs font-semibold text-success">
                      {signal.metricLabel}: {signal.metricValue}
                    </span>
                  </div>
                  <p className="mt-3 text-base font-semibold text-ink">{signal.summary}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Keyword <span className="font-semibold text-ink">{signal.keyword}</span> in {signal.category} as
                    of {formatDate(signal.observedAt)}.
                  </p>
                </div>
                {signal.referenceUrl ? (
                  <a
                    className="inline-flex items-center rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                    href={signal.referenceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open reference
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <ExternalLinkRegistry initialLinks={candidate.externalLinks} />
        <ProfitCalculator
          initialInput={{
            buyPrice: candidate.estimatedBuyPrice,
            sellPrice: candidate.estimatedSellPrice,
            platformFeeRate: env.DEFAULT_PLATFORM_FEE_RATE,
            shippingCost: candidate.shippingCost,
            otherCost: candidate.otherCost,
          }}
        />
      </div>
    </main>
  );
}
