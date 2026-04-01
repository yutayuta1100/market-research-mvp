import type { ProfitBreakdown, ScoreBreakdown, ScoreComponent } from "@/lib/candidates/types";
import type { ConnectorSignal } from "@/lib/connectors/types";

interface ScoreCandidateInput {
  profit: ProfitBreakdown;
  signals: ConnectorSignal[];
  riskFlags: string[];
  highMarginThreshold: number;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function scoreCandidate(input: ScoreCandidateInput): ScoreBreakdown {
  const averageSignalStrength =
    input.signals.length === 0
      ? 0
      : input.signals.reduce((total, signal) => total + signal.strength, 0) / input.signals.length;

  const uniqueSources = new Set(input.signals.map((signal) => signal.connector)).size;
  const trendScore = clamp(Math.round((averageSignalStrength / 100) * 34), 0, 34);
  const coverageScore = clamp(uniqueSources * 8, 0, 24);
  const marginScore = clamp(
    Math.round((input.profit.marginRate / Math.max(input.highMarginThreshold, 0.01)) * 22),
    0,
    22,
  );
  const profitScore = clamp(Math.round(input.profit.netProfit / 600), 0, 20);
  const riskPenalty = clamp(input.riskFlags.length * 6, 0, 18);
  const total = clamp(trendScore + coverageScore + marginScore + profitScore - riskPenalty, 0, 100);

  const components: ScoreComponent[] = [
    {
      key: "trend",
      label: "Signal strength",
      value: trendScore,
      rationale:
        input.signals.length === 0
          ? "No active source signals were attached to this candidate."
          : `Average source strength is ${Math.round(averageSignalStrength)} across ${input.signals.length} captured signals.`,
    },
    {
      key: "coverage",
      label: "Source coverage",
      value: coverageScore,
      rationale: `${uniqueSources} connector${uniqueSources === 1 ? "" : "s"} currently support the opportunity thesis.`,
    },
    {
      key: "margin",
      label: "Margin quality",
      value: marginScore,
      rationale: `Expected margin is ${(input.profit.marginRate * 100).toFixed(1)}% against a ${(
        input.highMarginThreshold * 100
      ).toFixed(1)}% target.`,
    },
    {
      key: "profit",
      label: "Absolute profit",
      value: profitScore,
      rationale: `Expected net profit is JPY ${Math.round(input.profit.netProfit).toLocaleString("ja-JP")}.`,
    },
    {
      key: "risk",
      label: "Risk deduction",
      value: -riskPenalty,
      rationale:
        input.riskFlags.length === 0
          ? "No explicit risk deductions were attached."
          : `${input.riskFlags.length} risk flag${input.riskFlags.length === 1 ? "" : "s"} reduce the final score.`,
    },
  ];

  const summary =
    total >= 70
      ? "Strong mock candidate with healthy spread, solid source coverage, and manageable downside."
      : total >= 55
        ? "Promising candidate worth manual review before committing inventory."
        : "Needs tighter verification before prioritizing this lead.";

  return {
    total,
    summary,
    components,
    risks: input.riskFlags,
  };
}

