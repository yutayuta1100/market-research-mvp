import { persistCandidateSnapshot } from "@/lib/candidates/persistence";
import type { CandidateRecord } from "@/lib/candidates/types";
import { env } from "@/lib/config/env";
import { defaultLocale } from "@/lib/i18n";
import { getCandidateCatalog, getMockSignalFixtures } from "@/lib/mock/fixtures";
import { calculateProfit } from "@/lib/profit/calculate-profit";
import { scoreCandidate } from "@/lib/scoring/score-candidate";

async function main() {
  const candidates: CandidateRecord[] = getCandidateCatalog(defaultLocale).map((candidate) => {
    const mockSignals = Object.values(getMockSignalFixtures(defaultLocale))
      .flat()
      .filter((signal) => signal.candidateSlug === candidate.slug)
      .sort((left, right) => new Date(right.observedAt).getTime() - new Date(left.observedAt).getTime());
    const profit = calculateProfit({
      buyPrice: candidate.estimatedBuyPrice,
      sellPrice: candidate.estimatedSellPrice,
      platformFeeRate: env.DEFAULT_PLATFORM_FEE_RATE,
      shippingCost: candidate.shippingCost,
      otherCost: candidate.otherCost,
    });
    const score = scoreCandidate({
      profit,
      signals: mockSignals,
      riskFlags: candidate.riskFlags,
      highMarginThreshold: env.HIGH_MARGIN_THRESHOLD,
      locale: defaultLocale,
    });

    return {
      ...candidate,
      lastObservedAt: mockSignals[0]?.observedAt ?? null,
      signals: mockSignals,
      profit,
      score,
    };
  });

  const persisted = await persistCandidateSnapshot({
    candidates,
    locale: defaultLocale,
  });

  if (!persisted) {
    throw new Error("Mock snapshot seeding requires DATABASE_URL and writes only the default locale snapshot.");
  }

  console.log(
    JSON.stringify(
      {
        ok: persisted,
        candidateCount: candidates.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
