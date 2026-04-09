import { persistCandidateSnapshot } from "@/lib/candidates/persistence";
import type {
  CandidateFilters,
  CandidateRecord,
  CandidateSortOption,
  ConnectorStatus,
  ExternalLink,
} from "@/lib/candidates/types";
import { watchConfig } from "@/lib/config/watch-config";
import { buildSignalConnectors } from "@/lib/connectors/registry";
import type { ConnectorSignal, WatchTarget } from "@/lib/connectors/types";
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

function getStringMetadata(signal: ConnectorSignal | undefined, key: string) {
  const value = signal?.metadata?.[key];
  return typeof value === "string" ? value : undefined;
}

function getNumberMetadata(signal: ConnectorSignal | undefined, key: string) {
  const value = signal?.metadata?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function mergeLinks(baseLinks: ExternalLink[], nextLinks: ExternalLink[]) {
  const map = new Map<string, ExternalLink>();

  for (const link of [...baseLinks, ...nextLinks]) {
    map.set(`${link.type}:${link.label}`, link);
  }

  return [...map.values()];
}

function buildRuntimeLinks(args: {
  locale: AppLocale;
  baseLinks: ExternalLink[];
  target: WatchTarget;
  amazonSignal?: ConnectorSignal;
  marketSignal?: ConnectorSignal;
  socialSignal?: ConnectorSignal;
}) {
  const nextLinks: ExternalLink[] = [
    {
      id: `${args.target.candidateSlug}-official-runtime`,
      type: "official",
      label: args.target.officialLabel,
      url: args.target.officialUrl,
      notes:
        args.locale === "ja"
          ? "公式情報の確認用リンクです。"
          : "Official information link for manual verification.",
    },
  ];

  const amazonProductUrl = getStringMetadata(args.amazonSignal, "productUrl");
  const amazonListingTitle = getStringMetadata(args.amazonSignal, "listingTitle");
  const amazonPrice = getNumberMetadata(args.amazonSignal, "buyPrice");
  const amazonSourceLabel = getStringMetadata(args.amazonSignal, "sourceLabel");

  nextLinks.push({
    id: `${args.target.candidateSlug}-purchase-runtime`,
    type: "purchase",
    label: args.locale === "ja" ? "購入参考リンク" : "Purchase reference",
    url: amazonProductUrl ?? args.baseLinks.find((link) => link.type === "purchase")?.url ?? args.target.officialUrl,
    notes:
      amazonPrice && amazonListingTitle
        ? args.locale === "ja"
          ? `${amazonSourceLabel ?? "公開 EC"} 一致商品: ${amazonListingTitle} / 現在価格 ${amazonPrice.toLocaleString("ja-JP")} 円`
          : `${amazonSourceLabel ?? "Public ecommerce"} match: ${amazonListingTitle} / current price JPY ${amazonPrice.toLocaleString("ja-JP")}`
        : args.locale === "ja"
          ? "ライブ購入リンクを取得できなかったため、検索リンクを表示しています。"
          : "Live purchase listing unavailable, so the fallback search link is shown.",
  });

  const marketUrl = args.marketSignal?.referenceUrl ?? args.baseLinks.find((link) => link.type === "reference")?.url;
  const marketPrice = getNumberMetadata(args.marketSignal, "estimatedSellPrice");

  if (marketUrl) {
    nextLinks.push({
      id: `${args.target.candidateSlug}-market-runtime`,
      type: "reference",
      label: args.locale === "ja" ? "相場参考リンク" : "Market reference",
      url: marketUrl,
      notes:
        marketPrice
          ? args.locale === "ja"
            ? `公開相場の参考売価中央値は ${marketPrice.toLocaleString("ja-JP")} 円です。`
            : `Public reference-market median is JPY ${marketPrice.toLocaleString("ja-JP")}.`
          : args.locale === "ja"
            ? "公開相場検索の参考リンクです。"
            : "Reference link for public resale-market checks.",
    });
  }

  if (args.socialSignal?.referenceUrl) {
    nextLinks.push({
      id: `${args.target.candidateSlug}-social-runtime`,
      type: "reference",
      label: args.locale === "ja" ? "SNS 裏取りリンク" : "Social verification link",
      url: args.socialSignal.referenceUrl,
      notes: args.socialSignal.verification?.summary,
    });
  }

  return mergeLinks(args.baseLinks, nextLinks);
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
  const watchTargets = getWatchTargets(locale);
  const targetsBySlug = new Map(watchTargets.map((target) => [target.candidateSlug, target]));
  const connectors = buildSignalConnectors(undefined, locale);
  const connectorContext = {
    ...watchConfig,
    targets: watchTargets,
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
      const target = targetsBySlug.get(candidate.slug);
      const amazonSignal = signals.find((signal) => signal.connector === "amazon");
      const marketSignal = signals.find((signal) => signal.connector === "keepa");
      const socialSignal = signals.find((signal) => signal.connector === "x");
      const estimatedBuyPrice = getNumberMetadata(amazonSignal, "buyPrice") ?? target?.fallbackBuyPrice ?? candidate.estimatedBuyPrice;
      const estimatedSellPrice =
        getNumberMetadata(marketSignal, "estimatedSellPrice") ?? target?.fallbackSellPrice ?? candidate.estimatedSellPrice;
      const thumbnailUrl =
        getStringMetadata(amazonSignal, "imageUrl") ?? target?.fallbackThumbnailUrl ?? candidate.thumbnailUrl;
      const profit = calculateProfit({
        buyPrice: estimatedBuyPrice,
        sellPrice: estimatedSellPrice,
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
        estimatedBuyPrice,
        estimatedSellPrice,
        thumbnailUrl,
        externalLinks:
          target
            ? buildRuntimeLinks({
                locale,
                baseLinks: candidate.externalLinks,
                target,
                amazonSignal,
                marketSignal,
                socialSignal,
              })
            : candidate.externalLinks,
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
