import { describe, expect, it } from "vitest";

import { buildCandidateCsv } from "@/lib/export/candidates-csv";
import { getCandidateCatalog, getMockSignalFixtures } from "@/lib/mock/fixtures";
import { calculateProfit } from "@/lib/profit/calculate-profit";
import { scoreCandidate } from "@/lib/scoring/score-candidate";

describe("buildCandidateCsv", () => {
  it("escapes commas and quotes while exporting ranked candidates", () => {
    const candidate = getCandidateCatalog("en")[0];
    if (!candidate) {
      throw new Error("Expected a seeded candidate fixture.");
    }

    const signals = Object.values(getMockSignalFixtures("en"))
      .flat()
      .filter((signal) => signal.candidateSlug === candidate.slug);
    const csv = buildCandidateCsv(
      [
        {
          ...candidate,
          title: 'Aurora, "Studio" Edition',
          shortDescription: "Demo only",
          lastObservedAt: signals[0]?.observedAt ?? null,
          signals,
          profit: calculateProfit({
            buyPrice: candidate.estimatedBuyPrice,
            sellPrice: candidate.estimatedSellPrice,
            platformFeeRate: 0.1,
            shippingCost: candidate.shippingCost,
            otherCost: candidate.otherCost,
          }),
          score: scoreCandidate({
            profit: calculateProfit({
              buyPrice: candidate.estimatedBuyPrice,
              sellPrice: candidate.estimatedSellPrice,
              platformFeeRate: 0.1,
              shippingCost: candidate.shippingCost,
              otherCost: candidate.otherCost,
            }),
            signals,
            riskFlags: candidate.riskFlags,
            highMarginThreshold: 0.2,
            locale: "en",
            now: new Date("2026-03-31T13:00:00+09:00"),
          }),
        },
      ],
      "en",
    );

    expect(csv).toContain('"Aurora, ""Studio"" Edition"');
    expect(csv.split("\n")).toHaveLength(2);
  });
});
