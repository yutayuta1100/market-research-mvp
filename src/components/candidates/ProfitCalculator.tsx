"use client";

import { useState } from "react";

import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getDictionary, type AppLocale } from "@/lib/i18n";
import { calculateProfit } from "@/lib/profit/calculate-profit";

interface ProfitCalculatorProps {
  initialInput: {
    buyPrice: number;
    sellPrice: number;
    platformFeeRate: number;
    shippingCost: number;
    otherCost: number;
  };
  locale: AppLocale;
}

export function ProfitCalculator({ initialInput, locale }: ProfitCalculatorProps) {
  const dictionary = getDictionary(locale);
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{dictionary.profit.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{dictionary.profit.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{dictionary.profit.description}</p>
        </div>
        <span className="pill">{dictionary.profit.ruleBasedBadge}</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-muted">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em]">{dictionary.profit.buyPrice}</span>
          <input
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            min={0}
            onChange={(event) => setBuyPrice(Number(event.target.value) || 0)}
            type="number"
            value={buyPrice}
          />
        </label>

        <label className="space-y-2 text-sm text-muted">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em]">{dictionary.profit.sellPrice}</span>
          <input
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            min={0}
            onChange={(event) => setSellPrice(Number(event.target.value) || 0)}
            type="number"
            value={sellPrice}
          />
        </label>

        <label className="space-y-2 text-sm text-muted">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em]">
            {dictionary.profit.platformFee}
          </span>
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
          <span className="block text-xs font-semibold uppercase tracking-[0.18em]">{dictionary.profit.shipping}</span>
          <input
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
            min={0}
            onChange={(event) => setShippingCost(Number(event.target.value) || 0)}
            type="number"
            value={shippingCost}
          />
        </label>

        <label className="space-y-2 text-sm text-muted md:col-span-2">
          <span className="block text-xs font-semibold uppercase tracking-[0.18em]">
            {dictionary.profit.otherCosts}
          </span>
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
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{dictionary.profit.netProfit}</p>
          <p className="mt-3 text-2xl font-semibold text-ink">{formatCurrency(result.netProfit, locale)}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{dictionary.profit.margin}</p>
          <p className="mt-3 text-2xl font-semibold text-ink">{formatPercent(result.marginRate, locale)}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{dictionary.profit.roi}</p>
          <p className="mt-3 text-2xl font-semibold text-ink">{formatPercent(result.roiRate, locale)}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {dictionary.profit.breakevenSale}
          </p>
          <p className="mt-3 text-2xl font-semibold text-ink">
            {formatCurrency(result.breakevenSalePrice, locale)}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[22px] border border-line/80 bg-white/75 p-4 text-sm leading-6 text-muted">
        {dictionary.profit.costBasisSummary(
          formatCurrency(result.costBasis, locale),
          formatCurrency(result.platformFeeAmount, locale),
          formatPercent(result.platformFeeRate, locale),
        )}
      </div>
    </section>
  );
}
