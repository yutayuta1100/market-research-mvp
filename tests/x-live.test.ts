import { describe, expect, it, vi } from "vitest";

import {
  buildXRecentCountsQuery,
  createXLiveConnector,
  normalizeXRecentCountsResponse,
} from "@/lib/connectors/live-x";
import { getWatchTargets } from "@/lib/mock/fixtures";

function createSilentLogger() {
  return {
    debug() {},
    info() {},
    warn() {},
    error() {},
    formatError(error: unknown) {
      return error;
    },
  };
}

function getFirstWatchTarget() {
  const target = getWatchTargets("en")[0];
  if (!target) {
    throw new Error("Expected a seeded watch target.");
  }

  return target;
}

describe("X live connector", () => {
  it("builds the official recent-counts query with retweet exclusion and language filter", () => {
    const target = getFirstWatchTarget();

    expect(buildXRecentCountsQuery(target, "ja")).toContain("-is:retweet");
    expect(buildXRecentCountsQuery(target, "ja")).toContain("lang:ja");
    expect(buildXRecentCountsQuery(target, "ja")).toContain(target.xQueryTerms[0] ?? "");
  });

  it("normalizes a recent-counts response into one explainable signal", () => {
    const target = getFirstWatchTarget();
    const signal = normalizeXRecentCountsResponse({
      locale: "en",
      target,
      query: buildXRecentCountsQuery(target, "ja"),
      response: {
        data: [
          {
            start: "2026-03-25T00:00:00.000Z",
            end: "2026-03-26T00:00:00.000Z",
            tweet_count: 4,
          },
          {
            start: "2026-03-26T00:00:00.000Z",
            end: "2026-03-27T00:00:00.000Z",
            tweet_count: 5,
          },
        ],
        meta: {
          total_tweet_count: 9,
        },
      },
      windowDays: 7,
    });

    expect(signal).not.toBeNull();
    expect(signal?.metricLabel).toBe("7-day post count");
    expect(signal?.metricValue).toBe(9);
    expect(signal?.strength).toBe(90);
    expect(signal?.keyword).toBe(target.displayKeyword);
  });

  it("returns a ready live status when the counts API succeeds", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            start: "2026-03-25T00:00:00.000Z",
            end: "2026-03-26T00:00:00.000Z",
            tweet_count: 3,
          },
        ],
        meta: {
          total_tweet_count: 3,
        },
      }),
    });

    const connector = createXLiveConnector({
      config: {
        xBearerToken: "token",
        xRequestTimeoutMs: 15000,
        xDefaultQueryWindowDays: 7,
        xDefaultLocale: "ja",
      },
      locale: "en",
      logger: createSilentLogger(),
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: () => new Date("2026-03-31T12:00:00.000Z"),
    });

    const result = await connector.fetchSignals({
      keywords: [],
      categories: [],
      targets: getWatchTargets("en").slice(0, 1),
    });

    expect(result.status.mode).toBe("live");
    expect(result.status.state).toBe("ready");
    expect(result.signals).toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("degrades safely when the counts API rejects the request", async () => {
    const connector = createXLiveConnector({
      config: {
        xBearerToken: "token",
        xRequestTimeoutMs: 15000,
        xDefaultQueryWindowDays: 7,
        xDefaultLocale: "ja",
      },
      locale: "en",
      logger: createSilentLogger(),
      fetchImpl: vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => "Unauthorized",
      }) as unknown as typeof fetch,
      now: () => new Date("2026-03-31T12:00:00.000Z"),
    });

    const result = await connector.fetchSignals({
      keywords: [],
      categories: [],
      targets: getWatchTargets("en").slice(0, 1),
    });

    expect(result.status.state).toBe("degraded");
    expect(result.signals).toHaveLength(0);
  });
});
