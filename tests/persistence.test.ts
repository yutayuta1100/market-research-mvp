import { describe, expect, it } from "vitest";

import { persistCandidateSnapshot } from "@/lib/candidates/persistence";
import type { CandidateRecord } from "@/lib/candidates/types";
import { getCandidateCatalog, getMockSignalFixtures } from "@/lib/mock/fixtures";
import { calculateProfit } from "@/lib/profit/calculate-profit";
import { scoreCandidate } from "@/lib/scoring/score-candidate";

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

function buildCandidateRecord(): CandidateRecord {
  const candidate = getCandidateCatalog("ja")[0];
  if (!candidate) {
    throw new Error("Expected a seeded candidate fixture.");
  }
  const signals = [
    getMockSignalFixtures("ja").x.find((signal) => signal.candidateSlug === candidate.slug),
    getMockSignalFixtures("ja").amazon.find((signal) => signal.candidateSlug === candidate.slug),
  ].filter((signal): signal is NonNullable<typeof signal> => Boolean(signal));
  const profit = calculateProfit({
    buyPrice: candidate.estimatedBuyPrice,
    sellPrice: candidate.estimatedSellPrice,
    platformFeeRate: 0.1,
    shippingCost: candidate.shippingCost,
    otherCost: candidate.otherCost,
  });
  const score = scoreCandidate({
    profit,
    signals,
    riskFlags: candidate.riskFlags,
    highMarginThreshold: 0.2,
    locale: "ja",
  });

  return {
    ...candidate,
    lastObservedAt: signals[0]?.observedAt ?? null,
    signals,
    profit,
    score,
  };
}

describe("persistCandidateSnapshot", () => {
  it("skips safely when the database is not configured", async () => {
    const persisted = await persistCandidateSnapshot(
      {
        candidates: [buildCandidateRecord()],
        locale: "ja",
      },
      {
        databaseConfigured: false,
        logger: createSilentLogger(),
      },
    );

    expect(persisted).toBe(false);
  });

  it("upserts the watch profile, candidates, links, and signals when the database is configured", async () => {
    const calls = {
      watchProfiles: [] as Record<string, unknown>[],
      candidates: [] as Record<string, unknown>[],
      links: [] as Record<string, unknown>[],
      signals: [] as Record<string, unknown>[],
    };

    const prisma = {
      async $transaction<T>(callback: (tx: any) => Promise<T>) {
        const tx = {
          watchProfile: {
            upsert: async (args: Record<string, unknown>) => {
              calls.watchProfiles.push(args);
              return args;
            },
          },
          candidate: {
            upsert: async (args: Record<string, unknown>) => {
              calls.candidates.push(args);
              return { id: "candidate-db-id" };
            },
          },
          externalLink: {
            upsert: async (args: Record<string, unknown>) => {
              calls.links.push(args);
              return args;
            },
          },
          signal: {
            upsert: async (args: Record<string, unknown>) => {
              calls.signals.push(args);
              return args;
            },
          },
        };

        return callback(tx);
      },
    };

    const candidate = buildCandidateRecord();

    const persisted = await persistCandidateSnapshot(
      {
        candidates: [candidate],
        locale: "ja",
      },
      {
        databaseConfigured: true,
        getClient: () => prisma,
        logger: createSilentLogger(),
      },
    );

    expect(persisted).toBe(true);
    expect(calls.watchProfiles).toHaveLength(1);
    expect(calls.candidates).toHaveLength(1);
    expect(calls.links).toHaveLength(candidate.externalLinks.length);
    expect(calls.signals).toHaveLength(candidate.signals.length);
  });

  it("reuses deterministic signal ids across repeated persistence runs", async () => {
    const signalIds: string[] = [];

    const prisma = {
      async $transaction<T>(callback: (tx: any) => Promise<T>) {
        const tx = {
          watchProfile: {
            upsert: async () => ({}),
          },
          candidate: {
            upsert: async () => ({ id: "candidate-db-id" }),
          },
          externalLink: {
            upsert: async () => ({}),
          },
          signal: {
            upsert: async (args: { where: { id: string } }) => {
              signalIds.push(args.where.id);
              return args;
            },
          },
        };

        return callback(tx);
      },
    };

    const candidate = buildCandidateRecord();

    await persistCandidateSnapshot(
      {
        candidates: [candidate],
        locale: "ja",
      },
      {
        databaseConfigured: true,
        getClient: () => prisma,
        logger: createSilentLogger(),
      },
    );

    await persistCandidateSnapshot(
      {
        candidates: [candidate],
        locale: "ja",
      },
      {
        databaseConfigured: true,
        getClient: () => prisma,
        logger: createSilentLogger(),
      },
    );

    const firstRunIds = signalIds.slice(0, candidate.signals.length);
    const secondRunIds = signalIds.slice(candidate.signals.length);

    expect(firstRunIds).toEqual(secondRunIds);
  });
});
