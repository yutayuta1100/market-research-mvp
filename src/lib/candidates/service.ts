import { persistCandidateSnapshot } from "@/lib/candidates/persistence";
import type { CandidateFilters, CandidateRecord, CandidateSortOption, ConnectorStatus } from "@/lib/candidates/types";
import { watchConfig } from "@/lib/config/watch-config";
import { buildSignalConnectors } from "@/lib/connectors/registry";
import type { ConnectorSignal } from "@/lib/connectors/types";
import { getCategoryLabel, getKeywordLabel, type AppLocale } from "@/lib/i18n";
import { createLogger } from "@/lib/logger";
import { getCandidateCatalog, getWatchTargets } from "@/lib/mock/fixtures";
import { calculateProfit } from "@/lib/profit/calculate-profit";
import { scoreCandidate } from "@/lib/scoring/score-candidate";
import { env } from "@/lib/config/env";

export interface DashboardData {
  candidates: CandidateRecord[];
  watchKeywords: string[];
  watchCategories: string[];
  connectorStatuses: ConnectorStatus[];
  categories: string[];
}

const logger = createLogger(env.LOG_LEVEL);

function getLatestObservedAt(signals: ConnectorSignal[]) {
  if (signals.length === 0) {
    return null;
  }

  return [...signals]
    .sort((left, right) => new Date(right.observedAt).getTime() - new Date(left.observedAt).getTime())[0]
    .observedAt;
}

function normalizeQueryValue(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function sortCandidates(candidates: CandidateRecord[], sort: CandidateSortOption) {
  return [...candidates].sort((left, right) => {
    if (sort === "margin") {
      return right.profit.marginRate - left.profit.marginRate;
    }

    if (sort === "profit") {
      return right.profit.netProfit - left.profit.netProfit;
    }

    if (sort === "recent") {
      return new Date(right.lastObservedAt ?? 0).getTime() - new Date(left.lastObservedAt ?? 0).getTime();
    }

    return right.score.total - left.score.total;
  });
}

function filterCandidates(candidates: CandidateRecord[], filters: CandidateFilters) {
  const search = normalizeQueryValue(filters.search);

  return candidates.filter((candidate) => {
    const matchesSearch =
      search.length === 0 ||
      normalizeQueryValue(candidate.title).includes(search) ||
      normalizeQueryValue(candidate.brand).includes(search) ||
      normalizeQueryValue(candidate.shortDescription).includes(search);

    const matchesCategory =
      !filters.category || filters.category === "all" || candidate.category === filters.category;

    const matchesSource =
      !filters.source ||
      filters.source === "all" ||
      candidate.signals.some((signal) => signal.connector === filters.source);

    return matchesSearch && matchesCategory && matchesSource;
  });
}

function buildCandidateRecords(locale: AppLocale) {
  const localizedCatalog = getCandidateCatalog(locale);
  const connectors = buildSignalConnectors(undefined, locale);
  const connectorContext = {
    ...watchConfig,
    targets: getWatchTargets(locale),
  };

  return Promise.allSettled(connectors.map((connector) => connector.fetchSignals(connectorContext))).then(async (batches) => {
    const groupedSignals = new Map<string, ConnectorSignal[]>();
    const connectorStatuses: ConnectorStatus[] = batches.map((result, index) => {
      const connector = connectors[index];

      if (!connector) {
        return {
          kind: "x",
          mode: "mock",
          state: "degraded",
          statusMessage:
            locale === "ja"
              ? "不明なコネクタ状態です。"
              : "Unknown connector state.",
        };
      }

      if (result.status === "rejected") {
        logger.warn("Connector fetch rejected unexpectedly", {
          connector: connector.kind,
          mode: connector.mode,
          error: logger.formatError(result.reason),
        });

        return {
          kind: connector.kind,
          mode: connector.mode,
          state: "degraded",
          statusMessage:
            locale === "ja"
              ? `${connector.kind} コネクタが失敗したため、このソースは空の結果になりました。`
              : `${connector.kind} connector failed unexpectedly, so this source returned no results.`,
        };
      }

      result.value.signals.forEach((signal) => {
        const existingSignals = groupedSignals.get(signal.candidateSlug) ?? [];
        groupedSignals.set(signal.candidateSlug, [...existingSignals, signal]);
      });

      return result.value.status;
    });

    const candidates = localizedCatalog.map((candidate) => {
      const signals = [...(groupedSignals.get(candidate.slug) ?? [])].sort(
        (left, right) => new Date(right.observedAt).getTime() - new Date(left.observedAt).getTime(),
      );
      const profit = calculateProfit({
        buyPrice: candidate.estimatedBuyPrice,
        sellPrice: candidate.estimatedSellPrice,
        platformFeeRate: env.DEFAULT_PLATFORM_FEE_RATE,
        shippingCost: candidate.shippingCost,
        otherCost: candidate.otherCost,
      });
      const score = scoreCandidate({
        profit,
        signals,
        riskFlags: candidate.riskFlags,
        highMarginThreshold: env.HIGH_MARGIN_THRESHOLD,
        locale,
      });

      return {
        ...candidate,
        lastObservedAt: getLatestObservedAt(signals),
        signals,
        profit,
        score,
      };
    });

    await persistCandidateSnapshot({
      candidates,
      locale,
    });

    return {
      candidates,
      connectorStatuses,
    };
  });
}

export async function loadDashboardData(
  filters: CandidateFilters = {},
  locale: AppLocale = "ja",
): Promise<DashboardData> {
  const localizedCatalog = getCandidateCatalog(locale);
  const { candidates, connectorStatuses } = await buildCandidateRecords(locale);
  const categories = [...new Set(localizedCatalog.map((candidate) => candidate.category))].sort();
  const filteredCandidates = filterCandidates(candidates, filters);

  return {
    candidates: sortCandidates(filteredCandidates, filters.sort ?? "score"),
    watchKeywords: watchConfig.keywords.map((keyword) => getKeywordLabel(keyword, locale)),
    watchCategories: watchConfig.categories.map((category) => getCategoryLabel(category, locale)),
    connectorStatuses,
    categories,
  };
}

export async function getCandidateBySlug(slug: string, locale: AppLocale = "ja") {
  const { candidates } = await buildCandidateRecords(locale);
  return candidates.find((candidate) => candidate.slug === slug) ?? null;
}
