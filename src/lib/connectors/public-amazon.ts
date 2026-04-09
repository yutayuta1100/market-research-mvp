import type { AppLocale } from "@/lib/i18n";
import type { AppLogger } from "@/lib/logger";
import { fetchAmazonProductSnapshot } from "@/lib/public-data/amazon-search";
import { fetchYahooShoppingProductSnapshot } from "@/lib/public-data/yahoo-shopping";
import type { ConnectorFetchResult, ConnectorSignal, SignalConnector, WatchTarget } from "@/lib/connectors/types";

function getStatusMessage(
  locale: AppLocale,
  args: {
    amazonCount: number;
    yahooShoppingCount: number;
    degraded: boolean;
  },
) {
  const signalCount = args.amazonCount + args.yahooShoppingCount;

  if (args.degraded) {
    return locale === "ja"
      ? "買い側の公開価格取得の一部が失敗したため、取得できた結果だけを返しています。"
      : "Part of the buy-side public price fetch degraded, so only the successfully gathered results are shown.";
  }

  if (args.amazonCount === 0 && args.yahooShoppingCount > 0) {
    return locale === "ja"
      ? `Amazon 公開検索が 0 件だったため、Yahoo!ショッピングから ${args.yahooShoppingCount} 件の価格シグナルを補完しました。`
      : `Amazon public search returned no usable matches, so ${args.yahooShoppingCount} Yahoo Shopping price signal${args.yahooShoppingCount === 1 ? "" : "s"} filled the gap.`;
  }

  if (args.amazonCount > 0 && args.yahooShoppingCount > 0) {
    return locale === "ja"
      ? `Amazon ${args.amazonCount} 件と Yahoo!ショッピング ${args.yahooShoppingCount} 件の公開価格シグナルを取得しました。`
      : `Collected ${args.amazonCount} Amazon and ${args.yahooShoppingCount} Yahoo Shopping public price signals.`;
  }

  return locale === "ja"
    ? `Amazon 公開検索から ${signalCount} 件の価格シグナルを取得しました。`
    : `Collected ${signalCount} live Amazon price signals from public search results.`;
}

function getMetricLabel(locale: AppLocale, source: "amazon" | "yahoo-shopping") {
  if (source === "yahoo-shopping") {
    return locale === "ja" ? "Yahoo!ショッピング現在価格" : "Yahoo Shopping current price";
  }

  return locale === "ja" ? "Amazon 現在価格" : "Amazon current price";
}

function getSummary(locale: AppLocale, title: string, sourceLabel: string) {
  return locale === "ja"
    ? `${sourceLabel} の一致商品「${title}」の現在価格を取得しました。`
    : `Captured the current ${sourceLabel} price for the matched listing "${title}".`;
}

function createSignal(target: WatchTarget, locale: AppLocale, snapshot: NonNullable<Awaited<ReturnType<typeof fetchAmazonProductSnapshot>>>): ConnectorSignal {
  return {
    id: `amazon-${snapshot.asin}`,
    connector: "amazon",
    candidateSlug: target.candidateSlug,
    keyword: target.displayKeyword,
    category: target.category,
    metricLabel: getMetricLabel(locale, snapshot.source),
    metricValue: snapshot.price,
    strength: Math.min(100, Math.max(45, 65 + snapshot.matchedTerms * 8)),
    summary: getSummary(locale, snapshot.title, snapshot.sourceLabel),
    observedAt: new Date().toISOString(),
    referenceUrl: snapshot.productUrl,
    evidence: [
      {
        id: `${snapshot.asin}-listing`,
        label: snapshot.title,
        url: snapshot.productUrl,
        sourceLabel: snapshot.sourceLabel,
        summary:
          locale === "ja"
            ? `検索一致度 ${snapshot.matchedTerms} / 価格 ${snapshot.price.toLocaleString("ja-JP")} 円`
            : `Match score ${snapshot.matchedTerms} / JPY ${snapshot.price.toLocaleString("ja-JP")}`,
      },
    ],
    verification: {
      status: snapshot.matchedTerms >= 2 ? "verified" : "mixed",
      summary:
        locale === "ja"
          ? snapshot.matchedTerms >= 2
            ? `検索一致度の高い ${snapshot.sourceLabel} 商品ページを参照しています。`
            : "一致度はありますが、詳細ページの目視確認が必要です。"
          : snapshot.matchedTerms >= 2
            ? `Using a high-confidence matched ${snapshot.sourceLabel} listing.`
            : `The ${snapshot.sourceLabel} match is usable, but the detail page still merits manual review.`,
      evidenceCount: 1,
    },
    metadata: {
      asin: snapshot.asin,
      buyPrice: snapshot.price,
      productUrl: snapshot.productUrl,
      queryUrl: snapshot.queryUrl,
      imageUrl: snapshot.imageUrl,
      matchedTerms: snapshot.matchedTerms,
      listingTitle: snapshot.title,
      source: snapshot.source,
      sourceLabel: snapshot.sourceLabel,
    },
  };
}

export function createPublicAmazonConnector(args: {
  locale: AppLocale;
  logger: AppLogger;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
  revalidateSeconds?: number;
}): SignalConnector {
  return {
    kind: "amazon",
    mode: "live",
    async fetchSignals(context): Promise<ConnectorFetchResult> {
      let degraded = false;
      let amazonCount = 0;
      let yahooShoppingCount = 0;

      const signals = (
        await Promise.all(
          context.targets.map(async (target) => {
            let snapshot = null;

            try {
              snapshot = await fetchAmazonProductSnapshot({
                target,
                timeoutMs: args.timeoutMs,
                fetchImpl: args.fetchImpl,
                revalidateSeconds: args.revalidateSeconds,
              });
            } catch (error) {
              degraded = true;
              args.logger.warn("Amazon public search failed for target", {
                connector: "amazon",
                candidateSlug: target.candidateSlug,
                query: target.amazonSearchQuery,
                error: args.logger.formatError(error),
              });
            }

            if (snapshot) {
              amazonCount += 1;
              return createSignal(target, args.locale, snapshot);
            }

            try {
              snapshot = await fetchYahooShoppingProductSnapshot({
                target,
                timeoutMs: args.timeoutMs,
                fetchImpl: args.fetchImpl,
                revalidateSeconds: args.revalidateSeconds,
              });
            } catch (error) {
              degraded = true;
              args.logger.warn("Yahoo Shopping fallback failed for target", {
                connector: "amazon",
                candidateSlug: target.candidateSlug,
                query: target.amazonSearchQuery,
                error: args.logger.formatError(error),
              });
            }

            if (snapshot) {
              yahooShoppingCount += 1;
              return createSignal(target, args.locale, snapshot);
            }

            return null;
          }),
        )
      ).filter((signal): signal is ConnectorSignal => signal !== null);

      return {
        signals,
        status: {
          kind: "amazon",
          mode: "live",
          state: degraded ? "degraded" : "ready",
          statusMessage: getStatusMessage(args.locale, {
            amazonCount,
            yahooShoppingCount,
            degraded,
          }),
        },
      };
    },
  };
}
