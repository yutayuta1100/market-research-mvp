import type { CandidateRecord } from "@/lib/candidates/types";
import type { AppLocale } from "@/lib/i18n";

function escapeCsvValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  const normalizedValue = String(value);

  if (/[",\n]/.test(normalizedValue)) {
    return `"${normalizedValue.replaceAll('"', '""')}"`;
  }

  return normalizedValue;
}

export function buildCandidateCsv(candidates: CandidateRecord[], locale: AppLocale = "ja") {
  const header = [
    "rank",
    "slug",
    locale === "ja" ? "候補名" : "title",
    locale === "ja" ? "ブランド" : "brand",
    locale === "ja" ? "カテゴリ" : "category",
    "score",
    "score_band",
    "expected_margin",
    "expected_profit",
    "roi",
    "signal_count",
    "connectors",
    "latest_observed_at",
    "summary",
  ];

  const rows = candidates.map((candidate, index) => {
    const connectors = [...new Set(candidate.signals.map((signal) => signal.connector))].join("|");

    return [
      index + 1,
      candidate.slug,
      candidate.title,
      candidate.brand,
      candidate.category,
      candidate.score.total,
      candidate.score.band,
      candidate.profit.marginRate.toFixed(4),
      candidate.profit.netProfit.toFixed(2),
      candidate.profit.roiRate.toFixed(4),
      candidate.signals.length,
      connectors,
      candidate.lastObservedAt,
      candidate.score.summary,
    ];
  });

  return [header, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");
}
