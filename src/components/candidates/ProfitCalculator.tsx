"use client";

import { useState } from "react";

import { formatCurrency, formatPercent } from "@/lib/formatters";
import { calculateProfit } from "@/lib/profit/calculate-profit";

interface ProfitCalculatorProps {
  initialInput: {
    buyPrice: number;
    sellPrice: number;
    platformFeeRate: number;
    shippingCost: number;
    otherCost: number;
  };
}

export function ProfitCalculator({ initialInput }: ProfitCalculatorProps) {
  const [buyPrice, setBuyPrice] = useState(initialInput.buyPrice);
  const [sellPrice, setSellPrice] = useState(initialInput.sellPrice);
  const [platformFeePercent, setPlatformFeePercent] = useState(initialInput.platformFeeRate * 100);
  const [shippingCost, setShippingCost] = useState(initialInput.shippingCost);
  const [otherCost, setOtherCost] = useState(initialInput.otherCost);

  const result = calculateProfit({
    buyPrice,
    sellPrice,
    platformFeeRate: platformFeePercent / 100,
    shippingCost,
    otherCost,
  });

  return (
    <section className="panel-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Profit estimator</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Manual spread calculator</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Adjust assumptions to estimate profit, margin, and breakeven without touching any purchase flow.
          </p>
        </div>
        <span className="pill">Rule based</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-muted">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em]">Buy price (JPY)</span>
          <input
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            min={0}
            onChange={(event) => setBuyPrice(Number(event.target.value) || 0)}
            type="number"
            value={buyPrice}
          />
        </label>

        <label className="space-y-2 text-sm text-muted">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em]">Expected sale price (JPY)</span>
          <input
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            min={0}
            onChange={(event) => setSellPrice(Number(event.target.value) || 0)}
            type="number"
            value={sellPrice}
          />
        </label>

        <label className="space-y-2 text-sm text-muted">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em]">Platform fee (%)</span>
          <input
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            min={0}
            onChange={(event) => setPlatformFeePercent(Number(event.target.value) || 0)}
            step="0.1"
            type="number"
            value={platformFeePercent}
          />
        </label>

        <label className="space-y-2 text-sm text-muted">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em]">Shipping (JPY)</span>
          <input
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            min={0}
            onChange={(event) => setShippingCost(Number(event.target.value) || 0)}
            type="number"
            value={shippingCost}
          />
        </label>

        <label className="space-y-2 text-sm text-muted md:col-span-2">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em]">Other costs (JPY)</span>
          <input
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            min={0}
            onChange={(event) => setOtherCost(Number(event.target.value) || 0)}
            type="number"
            value={otherCost}
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="metric-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Net profit</p>
          <p className="mt-3 text-2xl font-semibold text-ink">{formatCurrency(result.netProfit)}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Margin</p>
          <p className="mt-3 text-2xl font-semibold text-ink">{formatPercent(result.marginRate)}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">ROI</p>
          <p className="mt-3 text-2xl font-semibold text-ink">{formatPercent(result.roiRate)}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Breakeven sale</p>
          <p className="mt-3 text-2xl font-semibold text-ink">{formatCurrency(result.breakevenSalePrice)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[22px] border border-line/80 bg-white/75 p-4 text-sm leading-6 text-muted">
        Cost basis {formatCurrency(result.costBasis)} includes buy, shipping, and other costs. Platform fees add{" "}
        {formatCurrency(result.platformFeeAmount)} at the current rate of {formatPercent(result.platformFeeRate)}.
      </div>
    </section>
  );
}
