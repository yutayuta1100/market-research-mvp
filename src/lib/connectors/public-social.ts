import type { AppLocale } from "@/lib/i18n";
import type { AppLogger } from "@/lib/logger";
import { fetchSocialSignalSnapshot } from "@/lib/public-data/social-search";
import type { ConnectorFetchResult, ConnectorSignal, SignalConnector, WatchTarget } from "@/lib/connectors/types";

function getStatusMessage(locale: AppLocale, signalCount: number, degraded: boolean) {
  if (degraded) {
    return locale === "ja"
      ? "公開 SNS 取得の一部が失敗したため、利用できた結果だけを返しています。"
      : "Part of the public social fetch degraded, so only the successfully gathered results are shown.";
  }

  return locale === "ja"
    ? `公開 SNS から ${signalCount} 件の候補シグナルを取得しました。`
    : `Collected ${signalCount} live social signals from public sources.`;
}

function createSignal(target: WatchTarget, locale: AppLocale, snapshot: NonNullable<Awaited<ReturnType<typeof fetchSocialSignalSnapshot>>>): ConnectorSignal {
  return {
    id: `social-${target.candidateSlug}-${snapshot.observedAt}`,
    connector: "x",
    candidateSlug: target.candidateSlug,
    keyword: target.displayKeyword,
    category: target.category,
    metricLabel: locale === "ja" ? "公開 SNS 一致件数" : "Matched social results",
    metricValue: snapshot.metricValue,
    strength: snapshot.strength,
    summary: snapshot.summary,
    observedAt: snapshot.observedAt,
    referenceUrl: snapshot.referenceUrl,
    evidence: snapshot.evidence,
    verification: snapshot.verification,
    metadata: {
      source: "public-social-search",
      socialQuery: target.socialQuery,
      evidenceCount: snapshot.evidence.length,
    },
  };
}

export function createPublicSocialConnector(args: {
  locale: AppLocale;
  logger: AppLogger;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
  revalidateSeconds?: number;
}): SignalConnector {
  return {
    kind: "x",
    mode: "live",
    async fetchSignals(context): Promise<ConnectorFetchResult> {
      let degraded = false;

      const signals = (
        await Promise.all(
          context.targets.map(async (target) => {
            try {
              const snapshot = await fetchSocialSignalSnapshot({
                locale: args.locale,
                target,
                timeoutMs: args.timeoutMs,
                fetchImpl: args.fetchImpl,
                revalidateSeconds: args.revalidateSeconds,
              });

              return snapshot ? createSignal(target, args.locale, snapshot) : null;
            } catch (error) {
              degraded = true;
              args.logger.warn("Public social fetch failed for target", {
                connector: "social",
                candidateSlug: target.candidateSlug,
                query: target.socialQuery,
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
          kind: "x",
          mode: "live",
          state: degraded ? "degraded" : "ready",
          statusMessage: getStatusMessage(args.locale, signals.length, degraded),
        },
      };
    },
  };
}
