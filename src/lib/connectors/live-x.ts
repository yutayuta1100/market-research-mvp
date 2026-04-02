import type { AppLocale } from "@/lib/i18n";
import type { AppLogger } from "@/lib/logger";
import type {
  ConnectorConfig,
  ConnectorContext,
  ConnectorFetchResult,
  ConnectorSignal,
  SignalConnector,
  WatchTarget,
} from "@/lib/connectors/types";

interface XRecentCountsBucket {
  start: string;
  end: string;
  tweet_count: number;
}

interface XRecentCountsResponse {
  data?: XRecentCountsBucket[];
  meta?: {
    total_tweet_count?: number;
  };
}

interface CreateXLiveConnectorOptions {
  config: Pick<
    ConnectorConfig,
    "xBearerToken" | "xRequestTimeoutMs" | "xDefaultQueryWindowDays" | "xDefaultLocale"
  >;
  locale: AppLocale;
  logger: AppLogger;
  fetchImpl?: typeof fetch;
  now?: () => Date;
}

const xRecentCountsEndpoint = "https://api.x.com/2/tweets/counts/recent";

function sanitizeSignalId(value: string) {
  return value.replace(/[^a-zA-Z0-9-]/g, "-");
}

function getMetricLabel(locale: AppLocale, windowDays: number) {
  return locale === "ja" ? `直近${windowDays}日投稿件数` : `${windowDays}-day post count`;
}

function getSignalSummary(locale: AppLocale, totalCount: number, windowDays: number) {
  return locale === "ja"
    ? `直近${windowDays}日の投稿件数は ${totalCount.toLocaleString("ja-JP")} 件でした。`
    : `${totalCount.toLocaleString("en-US")} posts matched over the last ${windowDays} days.`;
}

function getReadyMessage(locale: AppLocale, signalCount: number) {
  return locale === "ja"
    ? signalCount > 0
      ? `X の recent counts API から ${signalCount} 件の候補シグナルを取得しました。`
      : "X の recent counts API は正常応答しましたが、直近ウィンドウでは一致する投稿がありませんでした。"
    : signalCount > 0
      ? `Live X recent counts returned ${signalCount} candidate signals.`
      : "Live X recent counts responded successfully but found no matching posts in the current window.";
}

function getDegradedMessage(locale: AppLocale) {
  return locale === "ja"
    ? "X の live adapter は劣化状態です。latest counts の取得に失敗したため空の結果を返しました。"
    : "The live X adapter is degraded. Recent post counts failed, so the connector returned no signals.";
}

export function buildXRecentCountsQuery(target: WatchTarget, defaultLocale?: string) {
  const baseQuery = target.xQueryTerms.map((term) => `(${term})`).join(" OR ");
  const queryParts = [baseQuery, "-is:retweet"];

  if (defaultLocale) {
    queryParts.push(`lang:${defaultLocale}`);
  }

  return queryParts.join(" ");
}

export function normalizeXRecentCountsResponse(args: {
  locale: AppLocale;
  target: WatchTarget;
  query: string;
  response: XRecentCountsResponse;
  windowDays: number;
}): ConnectorSignal | null {
  const buckets = args.response.data ?? [];
  const totalCount =
    args.response.meta?.total_tweet_count ?? buckets.reduce((total, bucket) => total + bucket.tweet_count, 0);

  if (totalCount <= 0) {
    return null;
  }

  const latestObservedAt = buckets.at(-1)?.end ?? new Date().toISOString();

  return {
    id: sanitizeSignalId(`x-live-${args.target.candidateSlug}-${latestObservedAt}`),
    connector: "x",
    candidateSlug: args.target.candidateSlug,
    keyword: args.target.displayKeyword,
    category: args.target.category,
    metricLabel: getMetricLabel(args.locale, args.windowDays),
    metricValue: totalCount,
    strength: Math.min(totalCount * 10, 100),
    summary: getSignalSummary(args.locale, totalCount, args.windowDays),
    observedAt: latestObservedAt,
    metadata: {
      query: args.query,
      buckets,
      meta: args.response.meta ?? {},
    },
  };
}

async function fetchRecentCounts(args: {
  token: string;
  query: string;
  startTime: string;
  endTime: string;
  timeoutMs: number;
  fetchImpl: typeof fetch;
}) {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), args.timeoutMs);

  try {
    const url = new URL(xRecentCountsEndpoint);
    url.searchParams.set("query", args.query);
    url.searchParams.set("start_time", args.startTime);
    url.searchParams.set("end_time", args.endTime);
    url.searchParams.set("granularity", "day");

    const response = await args.fetchImpl(url.toString(), {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${args.token}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`X recent counts request failed with ${response.status}: ${errorBody || response.statusText}`);
    }

    return (await response.json()) as XRecentCountsResponse;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

export function createXLiveConnector({
  config,
  locale,
  logger,
  fetchImpl = fetch,
  now = () => new Date(),
}: CreateXLiveConnectorOptions): SignalConnector {
  return {
    kind: "x",
    mode: "live",
    async fetchSignals(context: ConnectorContext): Promise<ConnectorFetchResult> {
      const token = config.xBearerToken;

      if (!token) {
        return {
          signals: [],
          status: {
            kind: "x",
            mode: "live",
            state: "degraded",
            statusMessage: getDegradedMessage(locale),
          },
        };
      }

      const endTime = now();
      const startTime = new Date(endTime.getTime() - config.xDefaultQueryWindowDays * 24 * 60 * 60 * 1000);

      try {
        const signals = (
          await Promise.all(
            context.targets.map(async (target) => {
              const query = buildXRecentCountsQuery(target, config.xDefaultLocale);
              try {
                const response = await fetchRecentCounts({
                  token,
                  query,
                  startTime: startTime.toISOString(),
                  endTime: endTime.toISOString(),
                  timeoutMs: config.xRequestTimeoutMs,
                  fetchImpl,
                });

                logger.debug("X recent counts fetched", {
                  connector: "x",
                  mode: "live",
                  candidateSlug: target.candidateSlug,
                  query,
                });

                return normalizeXRecentCountsResponse({
                  locale,
                  target,
                  query,
                  response,
                  windowDays: config.xDefaultQueryWindowDays,
                });
              } catch (error) {
                logger.warn("X recent counts target fetch failed", {
                  connector: "x",
                  mode: "live",
                  candidateSlug: target.candidateSlug,
                  query,
                  error: logger.formatError(error),
                });

                throw error;
              }
            }),
          )
        ).filter((signal): signal is ConnectorSignal => signal !== null);

        return {
          signals,
          status: {
            kind: "x",
            mode: "live",
            state: "ready",
            statusMessage: getReadyMessage(locale, signals.length),
          },
        };
      } catch (error) {
        logger.warn("X recent counts fetch failed", {
          connector: "x",
          mode: "live",
          error: logger.formatError(error),
        });

        return {
          signals: [],
          status: {
            kind: "x",
            mode: "live",
            state: "degraded",
            statusMessage: getDegradedMessage(locale),
          },
        };
      }
    },
  };
}
