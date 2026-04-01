import { describe, expect, it } from "vitest";

import { calculateProfit } from "@/lib/profit/calculate-profit";

describe("calculateProfit", () => {
  it("derives cost basis, margin, roi, and breakeven from transparent inputs", () => {
    const result = calculateProfit({
      buyPrice: 10000,
      sellPrice: 18000,
      platformFeeRate: 0.1,
      shippingCost: 500,
      otherCost: 250,
    });

    expect(result.costBasis).toBe(10750);
    expect(result.platformFeeAmount).toBe(1800);
    expect(result.netProfit).toBe(5450);
    expect(result.marginRate).toBeCloseTo(0.3027, 3);
    expect(result.roiRate).toBeCloseTo(0.507, 3);
    expect(result.breakevenSalePrice).toBeCloseTo(11944.44, 2);
  });
});

