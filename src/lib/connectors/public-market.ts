import type { AppLocale } from "@/lib/i18n";
import type { AppLogger } from "@/lib/logger";
import { fetchYahooAuctionsSnapshot } from "@/lib/public-data/yahoo-auctions";
import type { ConnectorFetchResult, ConnectorSignal, SignalConnector, WatchTarget } from "@/lib/connectors/types";

function getStatusMessage(locale: AppLocale, signalCount: number, degraded: boolean) {
  if (degraded) {
    return locale === "ja"
      ? "公開相場検索の一部が失敗したため、取得できた相場だけを返しています。"
      : "Part of the public resale-market fetch degraded, so only successful market references are shown.";
  }

  return locale === "ja"
    ? `公開相場検索から ${signalCount} 件の参考価格を取得しました。`
    : `Collected ${signalCount} live reference prices from public resale-market search.`;
}

function createSignal(target: WatchTarget, locale: AppLocale, snapshot: NonNullable<Awaited<ReturnType<typeof fetchYahooAuctionsSnapshot>>>): ConnectorSignal {
  return {
    id: `market-${target.candidateSlug}-${snapshot.estimatedSellPrice}`,
    connector: "keepa",
    candidateSlug: target.candidateSlug,
    keyword: target.displayKeyword,
    category: target.category,
    metricLabel: locale === "ja" ? "参考売価中央値" : "Median reference sell price",
    metricValue: snapshot.estimatedSellPrice,
    strength: Math.min(100, 55 + snapshot.evidence.length * 9),
    summary: snapshot.summary,
    observedAt: snapshot.observedAt,
    referenceUrl: snapshot.referenceUrl,
    evidence: snapshot.evidence,
    verification: {
      status: snapshot.evidence.length >= 3 ? "verified" : snapshot.evidence.length >= 1 ? "mixed" : "unverified",
      summary:
        locale === "ja"
          ? `公開相場 ${snapshot.evidence.length} 件を参考にしています。`
          : `Backed by ${snapshot.evidence.length} public market listings.`,
      evidenceCount: snapshot.evidence.length,
    },
    metadata: {
      estimatedSellPrice: snapshot.estimatedSellPrice,
      resaleSearchQuery: target.resaleSearchQuery,
      evidenceCount: snapshot.evidence.length,
    },
  };
}

export function createPublicMarketConnector(args: {
  locale: AppLocale;
  logger: AppLogger;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
  revalidateSeconds?: number;
}): SignalConnector {
  return {
    kind: "keepa",
    mode: "live",
    async fetchSignals(context): Promise<ConnectorFetchResult> {
      let degraded = false;

      const signals = (
        await Promise.all(
          context.targets.map(async (target) => {
            try {
              const snapshot = await fetchYahooAuctionsSnapshot({
                locale: args.locale,
                target,
                timeoutMs: args.timeoutMs,
                fetchImpl: args.fetchImpl,
                revalidateSeconds: args.revalidateSeconds,
              });

              return snapshot ? createSignal(target, args.locale, snapshot) : null;
            } catch (error) {
              degraded = true;
              args.logger.warn("Public resale-market fetch failed for target", {
                connector: "market",
                candidateSlug: target.candidateSlug,
                query: target.resaleSearchQuery,
                error: args.logger.formatError(error),
              });
              return null;
            }
          }),
        )
      ).filter((signal): signal is ConnectorSignal => signal !== null);

      return {
        signals,
        status: {
          kind: "keepa",
          mode: "live",
          state: degraded ? "degraded" : "ready",
          statusMessage: getStatusMessage(args.locale, signals.length, degraded),
        },
      };
    },
  };
}
