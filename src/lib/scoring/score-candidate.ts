import type { ProfitBreakdown, ScoreBreakdown, ScoreComponent } from "@/lib/candidates/types";
import type { ConnectorSignal } from "@/lib/connectors/types";
import type { AppLocale } from "@/lib/i18n";

interface ScoreCandidateInput {
  profit: ProfitBreakdown;
  signals: ConnectorSignal[];
  riskFlags: string[];
  highMarginThreshold: number;
  locale?: AppLocale;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function scoreCandidate(input: ScoreCandidateInput): ScoreBreakdown {
  const locale = input.locale ?? "ja";
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
  const connectorCountLabel =
    locale === "ja"
      ? `${uniqueSources}件のコネクタが現在この仮説を支えています。`
      : `${uniqueSources} connector${uniqueSources === 1 ? "" : "s"} currently support the opportunity thesis.`;

  const components: ScoreComponent[] = [
    {
      key: "trend",
      label: locale === "ja" ? "シグナル強度" : "Signal strength",
      value: trendScore,
      rationale:
        input.signals.length === 0
          ? locale === "ja"
            ? "この候補には有効なソースシグナルがまだ紐付いていません。"
            : "No active source signals were attached to this candidate."
          : locale === "ja"
            ? `取得済みシグナル ${input.signals.length} 件の平均強度は ${Math.round(averageSignalStrength)} です。`
            : `Average source strength is ${Math.round(averageSignalStrength)} across ${input.signals.length} captured signals.`,
    },
    {
      key: "coverage",
      label: locale === "ja" ? "ソースの厚み" : "Source coverage",
      value: coverageScore,
      rationale: connectorCountLabel,
    },
    {
      key: "margin",
      label: locale === "ja" ? "利益率の質" : "Margin quality",
      value: marginScore,
      rationale:
        locale === "ja"
          ? `想定利益率 ${(input.profit.marginRate * 100).toFixed(1)}% は、目標 ${(input.highMarginThreshold * 100).toFixed(1)}% と比較しています。`
          : `Expected margin is ${(input.profit.marginRate * 100).toFixed(1)}% against a ${(
              input.highMarginThreshold * 100
            ).toFixed(1)}% target.`,
    },
    {
      key: "profit",
      label: locale === "ja" ? "利益額" : "Absolute profit",
      value: profitScore,
      rationale:
        locale === "ja"
          ? `想定純利益は ${Math.round(input.profit.netProfit).toLocaleString("ja-JP")} 円です。`
          : `Expected net profit is JPY ${Math.round(input.profit.netProfit).toLocaleString("ja-JP")}.`,
    },
    {
      key: "risk",
      label: locale === "ja" ? "リスク控除" : "Risk deduction",
      value: -riskPenalty,
      rationale:
        input.riskFlags.length === 0
          ? locale === "ja"
            ? "明示的なリスク控除はありません。"
            : "No explicit risk deductions were attached."
          : locale === "ja"
            ? `リスクフラグ ${input.riskFlags.length} 件が最終スコアを押し下げています。`
            : `${input.riskFlags.length} risk flag${input.riskFlags.length === 1 ? "" : "s"} reduce the final score.`,
    },
  ];

  const summary =
    locale === "ja"
      ? total >= 70
        ? "利益スプレッド、ソースの厚み、下振れ管理のバランスが良い有力なモック候補です。"
        : total >= 55
          ? "在庫判断の前に人が確認する価値がある有望な候補です。"
          : "優先度を上げる前に、もう一段厳密な検証が必要です。"
      : total >= 70
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
