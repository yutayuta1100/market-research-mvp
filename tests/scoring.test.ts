import { describe, expect, it } from "vitest";

import { calculateProfit } from "@/lib/profit/calculate-profit";
import { scoreCandidate } from "@/lib/scoring/score-candidate";

describe("scoreCandidate", () => {
  it("rewards strong signals and healthy spread while keeping the output explainable", () => {
    const score = scoreCandidate({
      profit: calculateProfit({
        buyPrice: 10000,
        sellPrice: 18000,
        platformFeeRate: 0.1,
        shippingCost: 500,
        otherCost: 250,
      }),
      signals: [
        {
          id: "signal-1",
          connector: "x",
          candidateSlug: "demo",
          keyword: "restock",
          category: "Gaming",
          metricLabel: "Mentions",
          metricValue: 78,
          strength: 78,
          summary: "Strong collector chatter.",
          observedAt: "2026-03-31T10:00:00+09:00",
        },
        {
          id: "signal-2",
          connector: "amazon",
          candidateSlug: "demo",
          keyword: "best seller",
          category: "Gaming",
          metricLabel: "Rank",
          metricValue: 9,
          strength: 84,
          summary: "Strong bestseller performance.",
          observedAt: "2026-03-31T11:00:00+09:00",
        },
        {
          id: "signal-3",
          connector: "keepa",
          candidateSlug: "demo",
          keyword: "price spike",
          category: "Gaming",
          metricLabel: "Floor delta",
          metricValue: 14,
          strength: 80,
          summary: "Healthy price floor.",
          observedAt: "2026-03-31T12:00:00+09:00",
        },
      ],
      riskFlags: ["Restock risk remains elevated."],
      highMarginThreshold: 0.2,
      locale: "en",
      now: new Date("2026-03-31T13:00:00+09:00"),
    });

    expect(score.total).toBe(71);
    expect(score.summary).toContain("Strong candidate");
    expect(score.band).toBe("medium");
    expect(score.components).toHaveLength(5);
    expect(score.inputs).toHaveLength(6);
    expect(score.deductions).toHaveLength(2);
    expect(score.components[0]?.label).toBe("Signal strength");
    expect(score.risks).toHaveLength(1);
  });

  it("applies evidence deductions when no active signals are available", () => {
    const score = scoreCandidate({
      profit: calculateProfit({
        buyPrice: 12000,
        sellPrice: 15000,
        platformFeeRate: 0.1,
        shippingCost: 600,
        otherCost: 0,
      }),
      signals: [],
      riskFlags: [],
      highMarginThreshold: 0.2,
      locale: "en",
      now: new Date("2026-03-31T13:00:00+09:00"),
    });

    expect(score.band).toBe("low");
    expect(score.deductions[1]?.value).toBe(-10);
    expect(score.recommendation).toContain("watch mode");
  });
});
