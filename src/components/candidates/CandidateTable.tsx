import Link from "next/link";

import type { CandidateRecord } from "@/lib/candidates/types";
import { formatCurrency, formatDate, formatPercent } from "@/lib/formatters";
import { getConnectorLabel, getDictionary, getLocalePath, type AppLocale } from "@/lib/i18n";

interface CandidateTableProps {
  candidates: CandidateRecord[];
  locale: AppLocale;
}

function renderSignals(candidate: CandidateRecord, locale: AppLocale) {
  return candidate.signals.slice(0, 2).map((signal) => (
    <div key={signal.id} className="rounded-2xl border border-line/70 bg-white/70 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {getConnectorLabel(signal.connector, locale)}
        </span>
        <span className="text-xs text-muted">{formatDate(signal.observedAt, locale)}</span>
      </div>
      <p className="mt-1 text-sm text-ink">{signal.summary}</p>
    </div>
  ));
}

export function CandidateTable({ candidates, locale }: CandidateTableProps) {
  const dictionary = getDictionary(locale);

  return (
    <div className="space-y-4">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              <th className="px-3">{dictionary.table.rank}</th>
              <th className="px-3">{dictionary.table.candidate}</th>
              <th className="px-3">{dictionary.table.sourceEvidence}</th>
              <th className="px-3">{dictionary.table.expectedMargin}</th>
              <th className="px-3">{dictionary.table.expectedProfit}</th>
              <th className="px-3">{dictionary.table.action}</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, index) => (
              <tr key={candidate.id} className="rounded-[24px] bg-white/80 shadow-panel">
                <td className="rounded-l-[24px] px-3 py-4 align-top">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accentSoft text-lg font-semibold text-accent">
                    {index + 1}
                  </div>
                </td>
                <td className="px-3 py-4 align-top">
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                        {candidate.category}
                      </p>
                      <Link
                        className="mt-1 block text-lg font-semibold text-ink hover:text-accent"
                        href={getLocalePath(locale, `/candidates/${candidate.slug}`)}
                      >
                        {candidate.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted">{candidate.brand}</p>
                    </div>
                    <p className="max-w-md text-sm leading-6 text-muted">{candidate.shortDescription}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#f7efe5] px-3 py-1 text-xs font-semibold text-muted">
                        {dictionary.table.scoreBadge(candidate.score.total)}
                      </span>
                      <span className="rounded-full bg-[#eff6ea] px-3 py-1 text-xs font-semibold text-success">
                        {dictionary.table.signalsBadge(candidate.signals.length)}
                      </span>
                      <span className="rounded-full bg-[#f8f4ee] px-3 py-1 text-xs font-semibold text-muted">
                        {dictionary.table.linksBadge(candidate.externalLinks.length)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 align-top">
                  <div className="space-y-2">
                    {renderSignals(candidate, locale)}
                    <p className="text-sm text-muted">{candidate.score.summary}</p>
                  </div>
                </td>
                <td className="px-3 py-4 align-top">
                  <div className="space-y-2">
                    <p className="text-2xl font-semibold text-ink">
                      {formatPercent(candidate.profit.marginRate, locale)}
                    </p>
                    <p className="text-sm text-muted">
                      {dictionary.table.roiSummary(
                        formatPercent(candidate.profit.roiRate, locale),
                        formatCurrency(candidate.profit.costBasis, locale),
                      )}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-4 align-top">
                  <div className="space-y-2">
                    <p className="text-2xl font-semibold text-ink">
                      {formatCurrency(candidate.profit.netProfit, locale)}
                    </p>
                    <p className="text-sm text-muted">
                      {dictionary.table.breakevenSummary(
                        formatCurrency(candidate.profit.breakevenSalePrice, locale),
                      )}
                    </p>
                  </div>
                </td>
                <td className="rounded-r-[24px] px-3 py-4 align-top">
                  <Link
                    className="inline-flex items-center rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                    href={getLocalePath(locale, `/candidates/${candidate.slug}`)}
                  >
                    {dictionary.table.reviewDetail}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {candidates.map((candidate, index) => (
          <article key={candidate.id} className="rounded-[24px] border border-line bg-white/80 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{candidate.category}</p>
                <Link
                  className="mt-2 block text-xl font-semibold text-ink"
                  href={getLocalePath(locale, `/candidates/${candidate.slug}`)}
                >
                  {candidate.title}
                </Link>
                <p className="mt-1 text-sm text-muted">{candidate.brand}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accentSoft text-lg font-semibold text-accent">
                {index + 1}
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-muted">{candidate.shortDescription}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f8f4ee] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {dictionary.table.margin}
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">
                  {formatPercent(candidate.profit.marginRate, locale)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#eff6ea] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {dictionary.table.profit}
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">
                  {formatCurrency(candidate.profit.netProfit, locale)}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">{renderSignals(candidate, locale)}</div>

            <Link
              className="mt-5 inline-flex items-center rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-ink"
              href={getLocalePath(locale, `/candidates/${candidate.slug}`)}
            >
              {dictionary.table.reviewDetail}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
