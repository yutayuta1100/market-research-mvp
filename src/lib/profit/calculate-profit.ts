import type { ProfitBreakdown } from "@/lib/candidates/types";

export interface ProfitInput {
  sellPrice: number;
  buyPrice: number;
  platformFeeRate: number;
  shippingCost: number;
  otherCost: number;
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function safeDivide(dividend: number, divisor: number) {
  return divisor === 0 ? 0 : dividend / divisor;
}

export function calculateProfit(input: ProfitInput): ProfitBreakdown {
  const platformFeeAmount = roundCurrency(input.sellPrice * input.platformFeeRate);
  const costBasis = roundCurrency(input.buyPrice + input.shippingCost + input.otherCost);
  const netProfit = roundCurrency(input.sellPrice - costBasis - platformFeeAmount);
  const marginRate = safeDivide(netProfit, input.sellPrice);
  const roiRate = safeDivide(netProfit, costBasis);
  const breakevenSalePrice = roundCurrency(costBasis / (1 - input.platformFeeRate));

  return {
    sellPrice: roundCurrency(input.sellPrice),
    buyPrice: roundCurrency(input.buyPrice),
    platformFeeRate: input.platformFeeRate,
    platformFeeAmount,
    shippingCost: roundCurrency(input.shippingCost),
    otherCost: roundCurrency(input.otherCost),
    costBasis,
    netProfit,
    marginRate,
    roiRate,
    breakevenSalePrice,
  };
}

