import { LinkType, SignalSource } from "@prisma/client";
import { createHash } from "node:crypto";

import type { CandidateRecord } from "@/lib/candidates/types";
import { env } from "@/lib/config/env";
import { watchConfig } from "@/lib/config/watch-config";
import { getPrismaClient, isDatabaseConfigured } from "@/lib/db";
import { defaultLocale, type AppLocale } from "@/lib/i18n";
import { createLogger, type AppLogger } from "@/lib/logger";

const logger = createLogger(env.LOG_LEVEL);
export const defaultWatchProfileId = "watch-profile-default";

interface SnapshotTransactionClient {
  watchProfile: {
    upsert(args: Record<string, unknown>): Promise<unknown>;
  };
  candidate: {
    upsert(args: Record<string, unknown>): Promise<{ id: string }>;
  };
  externalLink: {
    upsert(args: Record<string, unknown>): Promise<unknown>;
  };
  signal: {
    upsert(args: Record<string, unknown>): Promise<unknown>;
  };
}

interface SnapshotPrismaClient {
  $transaction<T>(callback: (tx: SnapshotTransactionClient) => Promise<T>): Promise<T>;
}

interface PersistCandidateSnapshotDependencies {
  databaseConfigured?: boolean;
  getClient?: () => SnapshotPrismaClient;
  logger?: AppLogger;
}

export function createStableId(prefix: string, ...values: string[]) {
  const digest = createHash("sha256")
    .update(values.join("|"))
    .digest("hex")
    .slice(0, 24);

  return `${prefix}-${digest}`;
}

function toSignalSource(source: CandidateRecord["signals"][number]["connector"]) {
  if (source === "x") {
    return SignalSource.X;
  }

  if (source === "amazon") {
    return SignalSource.AMAZON;
  }

  return SignalSource.KEEPA;
}

function toLinkType(type: CandidateRecord["externalLinks"][number]["type"]) {
  if (type === "official") {
    return LinkType.OFFICIAL;
  }

  if (type === "purchase") {
    return LinkType.PURCHASE;
  }

  if (type === "raffle") {
    return LinkType.RAFFLE;
  }

  return LinkType.REFERENCE;
}

export async function persistCandidateSnapshot(args: {
  candidates: CandidateRecord[];
  locale: AppLocale;
}, dependencies: PersistCandidateSnapshotDependencies = {}) {
  const databaseConfigured =
    dependencies.databaseConfigured ??
    (typeof isDatabaseConfigured === "function" ? isDatabaseConfigured() : isDatabaseConfigured);
  const prismaClientFactory = dependencies.getClient ?? getPrismaClient;
  const activeLogger = dependencies.logger ?? logger;

  if (!databaseConfigured || args.locale !== defaultLocale) {
    return false;
  }

  try {
    const prisma = prismaClientFactory();

    await prisma.$transaction(async (tx) => {
      await tx.watchProfile.upsert({
        where: {
          id: defaultWatchProfileId,
        },
        update: {
          name: `${env.APP_NAME} default watch profile`,
          keywords: watchConfig.keywords,
          categories: watchConfig.categories,
          isActive: true,
        },
        create: {
          id: defaultWatchProfileId,
          name: `${env.APP_NAME} default watch profile`,
          keywords: watchConfig.keywords,
          categories: watchConfig.categories,
          isActive: true,
        },
      });

      for (const candidate of args.candidates) {
        const persistedCandidate = await tx.candidate.upsert({
          where: {
            slug: candidate.slug,
          },
          update: {
            title: candidate.title,
            brand: candidate.brand,
            category: candidate.category,
            thumbnailUrl: candidate.thumbnailUrl,
            shortDescription: candidate.shortDescription,
            estimatedBuyPrice: candidate.estimatedBuyPrice,
            estimatedSellPrice: candidate.estimatedSellPrice,
            platformFeeRate: env.DEFAULT_PLATFORM_FEE_RATE,
            shippingCost: candidate.shippingCost,
            otherCost: candidate.otherCost,
            expectedProfit: candidate.profit.netProfit,
            expectedMargin: candidate.profit.marginRate,
            score: candidate.score.total,
            scoreExplanation: candidate.score,
            riskNotes: candidate.riskFlags,
            watchProfileId: defaultWatchProfileId,
          },
          create: {
            id: createStableId("candidate", candidate.slug),
            slug: candidate.slug,
            title: candidate.title,
            brand: candidate.brand,
            category: candidate.category,
            thumbnailUrl: candidate.thumbnailUrl,
            shortDescription: candidate.shortDescription,
            estimatedBuyPrice: candidate.estimatedBuyPrice,
            estimatedSellPrice: candidate.estimatedSellPrice,
            platformFeeRate: env.DEFAULT_PLATFORM_FEE_RATE,
            shippingCost: candidate.shippingCost,
            otherCost: candidate.otherCost,
            expectedProfit: candidate.profit.netProfit,
            expectedMargin: candidate.profit.marginRate,
            score: candidate.score.total,
            scoreExplanation: candidate.score,
            riskNotes: candidate.riskFlags,
            watchProfileId: defaultWatchProfileId,
          },
        });

        for (const link of candidate.externalLinks) {
          await tx.externalLink.upsert({
            where: {
              id: link.id,
            },
            update: {
              candidateId: persistedCandidate.id,
              type: toLinkType(link.type),
              label: link.label,
              url: link.url,
              notes: link.notes,
            },
            create: {
              id: link.id,
              candidateId: persistedCandidate.id,
              type: toLinkType(link.type),
              label: link.label,
              url: link.url,
              notes: link.notes,
            },
          });
        }

        for (const signal of candidate.signals) {
          const signalId = createStableId(
            "signal",
            signal.connector,
            candidate.slug,
            signal.observedAt,
            signal.keyword,
          );

          await tx.signal.upsert({
            where: {
              id: signalId,
            },
            update: {
              candidateId: persistedCandidate.id,
              source: toSignalSource(signal.connector),
              keyword: signal.keyword,
              category: signal.category,
              metricLabel: signal.metricLabel,
              metricValue: signal.metricValue,
              summary: signal.summary,
              observedAt: new Date(signal.observedAt),
              referenceUrl: signal.referenceUrl,
              metadata: signal.metadata,
            },
            create: {
              id: signalId,
              candidateId: persistedCandidate.id,
              source: toSignalSource(signal.connector),
              keyword: signal.keyword,
              category: signal.category,
              metricLabel: signal.metricLabel,
              metricValue: signal.metricValue,
              summary: signal.summary,
              observedAt: new Date(signal.observedAt),
              referenceUrl: signal.referenceUrl,
              metadata: signal.metadata,
            },
          });
        }
      }
    });

    activeLogger.info("Candidate snapshot persisted", {
      candidateCount: args.candidates.length,
      locale: args.locale,
    });

    return true;
  } catch (error) {
    activeLogger.warn("Candidate snapshot persistence skipped after failure", {
      locale: args.locale,
      error: activeLogger.formatError(error),
    });

    return false;
  }
}
