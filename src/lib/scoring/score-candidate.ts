import type {
  ProfitBreakdown,
  ScoreBreakdown,
  ScoreComponent,
  ScoreDeduction,
  ScoreInputMetric,
} from "@/lib/candidates/types";
import type { ConnectorSignal } from "@/lib/connectors/types";
import type { AppLocale } from "@/lib/i18n";

interface ScoreCandidateInput {
  profit: ProfitBreakdown;
  signals: ConnectorSignal[];
  riskFlags: string[];
  highMarginThreshold: number;
  locale?: AppLocale;
  now?: Date;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function scoreCandidate(input: ScoreCandidateInput): ScoreBreakdown {
  const locale = input.locale ?? "ja";
  const now = input.now ?? new Date();
  const averageSignalStrength =
    input.signals.length === 0
      ? 0
      : input.signals.reduce((total, signal) => total + signal.strength, 0) / input.signals.length;

  const uniqueSources = new Set(input.signals.map((signal) => signal.connector)).size;
  const latestObservedAt = input.signals
    .map((signal) => new Date(signal.observedAt))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((left, right) => right.getTime() - left.getTime())[0];
  const latestSignalAgeHours =
    latestObservedAt ? Math.max(0, (now.getTime() - latestObservedAt.getTime()) / (60 * 60 * 1000)) : null;
  const trendScore = clamp(Math.round((averageSignalStrength / 100) * 24), 0, 24);
  const coverageScore = clamp(uniqueSources * 6, 0, 18);
  const freshnessScore =
    latestSignalAgeHours === null
      ? 0
      : latestSignalAgeHours <= 24
        ? 14
        : latestSignalAgeHours <= 72
          ? 10
          : latestSignalAgeHours <= 168
            ? 6
            : 2;
  const marginScore = clamp(
    Math.round((input.profit.marginRate / Math.max(input.highMarginThreshold, 0.01)) * 18),
    0,
    18,
  );
  const profitScore = clamp(Math.round(input.profit.netProfit / 750), 0, 16);
  const riskPenalty = clamp(input.riskFlags.length * 5, 0, 15);
  const evidencePenalty = input.signals.length === 0 ? 10 : uniqueSources < 2 ? 5 : 0;
  const total = clamp(
    trendScore + coverageScore + freshnessScore + marginScore + profitScore - riskPenalty - evidencePenalty,
    0,
    100,
  );
  const band: ScoreBreakdown["band"] = total >= 72 ? "high" : total >= 55 ? "medium" : "low";
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
      key: "freshness",
      label: locale === "ja" ? "鮮度" : "Freshness",
      value: freshnessScore,
      rationale:
        latestSignalAgeHours === null
          ? locale === "ja"
            ? "最新シグナルがないため、鮮度スコアは加算されていません。"
            : "No recent signal timestamp was available, so freshness did not add score."
          : locale === "ja"
            ? `最新シグナルは約 ${Math.round(latestSignalAgeHours)} 時間前です。`
            : `The freshest signal landed about ${Math.round(latestSignalAgeHours)} hour${Math.round(latestSignalAgeHours) === 1 ? "" : "s"} ago.`,
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
  ];

  const inputs: ScoreInputMetric[] = [
    {
      key: "signals",
      label: locale === "ja" ? "観測シグナル" : "Observed signals",
      value:
        locale === "ja"
          ? `${input.signals.length}件 / 平均強度 ${Math.round(averageSignalStrength)}`
          : `${input.signals.length} total / avg strength ${Math.round(averageSignalStrength)}`,
    },
    {
      key: "sources",
      label: locale === "ja" ? "有効ソース" : "Active sources",
      value:
        locale === "ja"
          ? `${uniqueSources}件`
          : `${uniqueSources} source${uniqueSources === 1 ? "" : "s"}`,
    },
    {
      key: "freshness",
      label: locale === "ja" ? "最新観測" : "Latest observation",
      value:
        latestSignalAgeHours === null
          ? locale === "ja"
            ? "未観測"
            : "No signal yet"
          : locale === "ja"
            ? `${Math.round(latestSignalAgeHours)}時間前`
            : `${Math.round(latestSignalAgeHours)} hour${Math.round(latestSignalAgeHours) === 1 ? "" : "s"} ago`,
    },
    {
      key: "margin",
      label: locale === "ja" ? "利益率" : "Margin",
      value: `${(input.profit.marginRate * 100).toFixed(1)}%`,
    },
    {
      key: "profit",
      label: locale === "ja" ? "純利益" : "Net profit",
      value:
        locale === "ja"
          ? `${Math.round(input.profit.netProfit).toLocaleString("ja-JP")}円`
          : `JPY ${Math.round(input.profit.netProfit).toLocaleString("ja-JP")}`,
    },
    {
      key: "roi",
      label: "ROI",
      value: `${(input.profit.roiRate * 100).toFixed(1)}%`,
    },
  ];

  const deductions: ScoreDeduction[] = [
    {
      key: "risk",
      label: locale === "ja" ? "リスク控除" : "Risk deduction",
      value: -riskPenalty,
      rationale:
        input.riskFlags.length === 0
          ? locale === "ja"
            ? "明示的なリスクフラグはなく、ここでの控除は発生していません。"
            : "No explicit risk flags were attached, so this deduction stayed at zero."
          : locale === "ja"
            ? `リスクフラグ ${input.riskFlags.length} 件が最終スコアを押し下げています。`
            : `${input.riskFlags.length} risk flag${input.riskFlags.length === 1 ? "" : "s"} reduce the final score.`,
    },
    {
      key: "evidence",
      label: locale === "ja" ? "根拠不足控除" : "Evidence deduction",
      value: -evidencePenalty,
      rationale:
        evidencePenalty === 0
          ? locale === "ja"
            ? "根拠の分散は最低限確保されています。"
            : "Evidence diversity cleared the minimum bar."
          : input.signals.length === 0
            ? locale === "ja"
              ? "シグナルが未観測のため、大きめの控除を適用しています。"
              : "No signals were observed, so a larger deduction was applied."
            : locale === "ja"
              ? "ソースの分散が薄いため、小さな控除を適用しています。"
              : "Source diversity is still thin, so a smaller deduction was applied.",
    },
  ];

  const summary =
    locale === "ja"
      ? band === "high"
        ? "利益スプレッド、ソース分散、鮮度のバランスが良い有力候補です。"
        : band === "medium"
          ? "人手で深掘りする価値はありますが、追加検証で優先順位が動く余地があります。"
          : "優先度を上げる前に、根拠の厚みか利益条件をもう一段確認したい候補です。"
      : band === "high"
        ? "Strong candidate with a healthy spread, diversified evidence, and fresh market activity."
        : band === "medium"
          ? "Worth manual review, though extra verification could still move its priority."
          : "Needs stronger evidence or better unit economics before moving up the queue.";

  const recommendation =
    locale === "ja"
      ? band === "high"
        ? "公式リンクと直近シグナルを人手で確認し、仕入れ判断候補として保持してください。"
        : band === "medium"
          ? "価格差とリスクフラグを再確認し、必要なら watchlist に残してください。"
          : "この候補は保留寄りです。シグナル追加か利益改善があるまで監視中心に留めてください。"
      : band === "high"
        ? "Manually verify the official links and freshest signals, then keep this near the top of the queue."
        : band === "medium"
          ? "Re-check the spread and flagged risks, then keep it on the watchlist if the thesis still holds."
          : "Keep this in watch mode until stronger signals or better economics appear.";

  return {
    total,
    band,
    summary,
    recommendation,
    components,
    inputs,
    deductions,
    risks: input.riskFlags,
  };
}
