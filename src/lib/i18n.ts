import type { ExternalLinkType, CandidateSortOption } from "@/lib/candidates/types";
import type { ConnectorKind } from "@/lib/connectors/types";

export type AppLocale = "ja" | "en";

export const defaultLocale: AppLocale = "ja";

const categoryLabels = {
  audio: {
    ja: "オーディオ",
    en: "Audio",
  },
  gaming: {
    ja: "ゲーム",
    en: "Gaming",
  },
  power: {
    ja: "電源",
    en: "Power",
  },
  collectibles: {
    ja: "コレクターズ",
    en: "Collectibles",
  },
} as const;

const keywordLabels = {
  "limited release": {
    ja: "限定リリース",
    en: "limited release",
  },
  restock: {
    ja: "再入荷",
    en: "restock",
  },
  "best seller": {
    ja: "ベストセラー",
    en: "best seller",
  },
  "price spike": {
    ja: "価格上昇",
    en: "price spike",
  },
} as const;

const connectorLabels: Record<ConnectorKind, Record<AppLocale, string>> = {
  x: {
    ja: "X",
    en: "X",
  },
  amazon: {
    ja: "Amazon",
    en: "Amazon",
  },
  keepa: {
    ja: "Keepa",
    en: "Keepa",
  },
};

const externalLinkTypeLabels: Record<ExternalLinkType, Record<AppLocale, string>> = {
  official: {
    ja: "公式",
    en: "Official",
  },
  purchase: {
    ja: "購入",
    en: "Purchase",
  },
  reference: {
    ja: "参考",
    en: "Reference",
  },
  raffle: {
    ja: "抽選",
    en: "Raffle",
  },
};

const sortOptionLabels: Record<CandidateSortOption, Record<AppLocale, string>> = {
  score: {
    ja: "スコア順",
    en: "Score",
  },
  margin: {
    ja: "利益率順",
    en: "Margin",
  },
  profit: {
    ja: "利益額順",
    en: "Profit",
  },
  recent: {
    ja: "新しい順",
    en: "Most recent",
  },
};

const dictionaries = {
  ja: {
    metadataDescription:
      "公開シグナルと参考リンクを使って潜在的な利益機会を見つける、モック中心の市場調査ダッシュボード。",
    languageSwitcher: {
      label: "言語",
      ja: "日本語",
      en: "English",
    },
    dashboard: {
      heroBadge: "Milestone 5 MVP",
      heroTitle: "モック中心のリセール調査ボード",
      heroDescription:
        "公開シグナル、公式 API アダプタ、参考リンクを使って候補を比較するオペレーター向けダッシュボードです。購入リンク・公式リンク・抽選リンクは参考表示のみです。",
      adminLink: "運用ステータス",
      metricCandidates: "候補",
      metricWatchKeywords: "監視キーワード",
      metricConnectors: "コネクタ",
      workspaceEyebrow: "候補ワークスペース",
      workspaceTitle: "ランク付けされた候補",
      workspaceDescription:
        "スコア、利益率、利益額、更新時刻で並び替えできます。カテゴリやコネクタで絞り込みながら、mock / live / stub の接続状態を確認できます。",
      emptyTitle: "条件に一致する候補はありません",
      emptyDescription:
        "検索語、カテゴリ、ソースの条件を広げると、候補が再び表示されます。",
      watchlistsEyebrow: "監視設定",
      watchlistsTitle: "キーワードとカテゴリ",
      keywordsLabel: "キーワード",
      categoriesLabel: "カテゴリ",
    },
    filters: {
      search: "検索",
      searchPlaceholder: "ヘッドホン、コレクターズ商品、ブランド名...",
      category: "カテゴリ",
      allCategories: "すべてのカテゴリ",
      source: "ソース",
      allSources: "すべてのソース",
      sort: "並び替え",
      apply: "適用",
      reset: "リセット",
    },
    table: {
      rank: "順位",
      candidate: "候補",
      sourceEvidence: "ソース根拠",
      expectedMargin: "想定利益率",
      expectedProfit: "想定利益",
      action: "操作",
      reviewDetail: "詳細を見る",
      margin: "利益率",
      profit: "利益額",
      scoreBadge: (score: number) => `スコア ${score}`,
      signalsBadge: (count: number) => `シグナル ${count}件`,
      linksBadge: (count: number) => `リンク ${count}件`,
      roiSummary: (roi: string, cost: string) => `ROI ${roi} / 原価 ${cost}`,
      breakevenSummary: (breakeven: string) => `損益分岐 ${breakeven}`,
    },
    connectorStatus: {
      eyebrow: "コネクタ状態",
      title: "ソース接続状態",
      milestoneBadge: "Adapters",
      modeLabels: {
        mock: "モック",
        live: "ライブ",
        stub: "スタブ",
      },
      stateLabels: {
        ready: "正常",
        degraded: "劣化",
      },
    },
    detail: {
      backToDashboard: "← ダッシュボードへ戻る",
      referenceLinksOnly: "リンクは参考表示のみ",
      signalCountBadge: (count: number) => `シグナル ${count}件`,
      latestActivity: (date: string) => `最新更新 ${date}`,
      expectedMargin: "想定利益率",
      expectedProfit: "想定利益",
      baseScore: "基本スコア",
      feeBaseline: "手数料基準",
      sourceSignalsEyebrow: "ソースシグナル",
      sourceSignalsTitle: "この候補が浮上した理由",
      adapterFeedBadge: "アダプタフィード",
      signalContext: (keyword: string, category: string, date: string) =>
        `キーワード「${keyword}」が ${category} で ${date} 時点に観測されました。`,
      openReference: "参考リンクを開く",
    },
    links: {
      eyebrow: "リンク管理",
      title: "参考リンクのみ",
      description:
        "公式・購入・抽選リンクを人が確認するための手動ワークスペースです。外部サイトとは自動でやり取りしません。",
      sessionOnly: "このセッションのみ",
      openReference: "参考リンクを開く",
      linkType: "リンク種別",
      label: "ラベル",
      url: "URL",
      notes: "メモ",
      labelPlaceholder: "正規販売店、公式発売ページなど",
      urlPlaceholder: "https://example.com/reference",
      notesPlaceholder: "手動確認でこのリンクが役立つ理由...",
      addSessionLink: "セッションに追加",
      requiredError: "ラベルと URL は必須です。",
      invalidUrlError: "有効な絶対 URL を入力してください。",
      sessionEntryNote: "このセッションだけのモック登録です。",
    },
    profit: {
      eyebrow: "利益試算",
      title: "手動スプレッド計算",
      description:
        "前提を調整して、購入フローに触れずに利益・利益率・損益分岐を確認できます。",
      ruleBasedBadge: "ルールベース",
      buyPrice: "仕入れ価格 (円)",
      sellPrice: "想定販売価格 (円)",
      platformFee: "プラットフォーム手数料 (%)",
      shipping: "送料 (円)",
      otherCosts: "その他コスト (円)",
      netProfit: "純利益",
      margin: "利益率",
      roi: "ROI",
      breakevenSale: "損益分岐売価",
      costBasisSummary: (costBasis: string, fee: string, feeRate: string) =>
        `原価 ${costBasis} には仕入れ・送料・その他コストを含みます。現在の手数料率 ${feeRate} では手数料が ${fee} 加算されます。`,
    },
    score: {
      eyebrow: "説明可能なスコア",
      title: "この候補がこの順位になる理由",
      scoreLabel: "スコア",
      bandLabels: {
        high: "高優先",
        medium: "要確認",
        low: "保留",
      },
      deductionsTitle: "控除要因",
      riskNotes: "リスクメモ",
      noRisks: "現時点で明示的なリスクメモはありません。",
    },
    admin: {
      badge: "Operations",
      title: "運用ステータス",
      description:
        "定期 refresh、CSV export、ジョブ履歴をまとめて確認するオペレーション面です。外部サイトへの自動操作は行いません。",
      backToDashboard: "← ダッシュボードへ戻る",
      exportTitle: "CSV エクスポート",
      exportDescription: "現在の候補一覧を CSV で出力します。",
      exportJa: "日本語 CSV",
      exportEn: "English CSV",
      schedulerTitle: "Refresh 設定",
      schedulerStatus: "ジョブ状態",
      schedulerEnabled: "有効",
      schedulerDisabled: "無効",
      secretLabel: "Secret",
      secretConfigured: "Secret 設定済み",
      secretMissing: "Secret 未設定",
      cronLabel: "Cron",
      retryLabel: "Retry",
      endpointLabel: "Endpoint",
      latestRunTitle: "最新ジョブ",
      latestRunEmpty: "まだ refresh job は記録されていません。",
      latestRunStatus: "ステータス",
      latestRunDuration: "所要時間",
      latestRunTrigger: "トリガー",
      latestRunFinished: "完了時刻",
      latestRunCounts: (candidates: number, signals: number) => `候補 ${candidates}件 / シグナル ${signals}件`,
      recentRunsTitle: "最近のジョブ履歴",
      runSuccess: "成功",
      runFailed: "失敗",
      currentSnapshotTitle: "現在のスナップショット",
      candidateCount: "候補数",
      persistenceTitle: "永続化",
      persistenceEnabled: "データベース書き込みあり",
      persistenceDisabled: "メモリのみ / 永続化なし",
      signalCount: "シグナル数",
      latestObservedAt: "最新観測",
      noLatestObservedAt: "未観測",
    },
    notFound: {
      eyebrow: "見つかりません",
      title: "この候補は現在のデータセットにありません。",
      description: "ダッシュボードに戻って、現在の候補と参考リンクを確認してください。",
      cta: "ダッシュボードへ戻る",
    },
  },
  en: {
    metadataDescription:
      "Market research dashboard for identifying potentially profitable resale opportunities using public signals, official adapters, and reference links.",
    languageSwitcher: {
      label: "Language",
      ja: "日本語",
      en: "English",
    },
    dashboard: {
      heroBadge: "Milestone 5 MVP",
      heroTitle: "Mock-first resale research board",
      heroDescription:
        "Operator-facing dashboard for public-signal research, official adapter inputs, manual link review, and explainable profit estimates. Purchase, official, and raffle links are shown strictly as references.",
      adminLink: "Ops status",
      metricCandidates: "Candidates",
      metricWatchKeywords: "Watch keywords",
      metricConnectors: "Connectors",
      workspaceEyebrow: "Candidate workspace",
      workspaceTitle: "Ranked opportunities",
      workspaceDescription:
        "Sort by score, margin, profit, or recency. Filter by category and connector while keeping mock, live, and stub connector states visible.",
      emptyTitle: "No candidates matched these filters",
      emptyDescription:
        "Try widening the search, category, or source filters to bring candidates back into view.",
      watchlistsEyebrow: "Configured watchlists",
      watchlistsTitle: "Keywords and categories",
      keywordsLabel: "Keywords",
      categoriesLabel: "Categories",
    },
    filters: {
      search: "Search",
      searchPlaceholder: "Headphones, collectibles, brand...",
      category: "Category",
      allCategories: "All categories",
      source: "Source",
      allSources: "All sources",
      sort: "Sort",
      apply: "Apply",
      reset: "Reset",
    },
    table: {
      rank: "Rank",
      candidate: "Candidate",
      sourceEvidence: "Source evidence",
      expectedMargin: "Expected margin",
      expectedProfit: "Expected profit",
      action: "Action",
      reviewDetail: "Review detail",
      margin: "Margin",
      profit: "Profit",
      scoreBadge: (score: number) => `Score ${score}`,
      signalsBadge: (count: number) => `${count} signals`,
      linksBadge: (count: number) => `${count} links`,
      roiSummary: (roi: string, cost: string) => `ROI ${roi} on ${cost}`,
      breakevenSummary: (breakeven: string) => `Breakeven ${breakeven}`,
    },
    connectorStatus: {
      eyebrow: "Connector posture",
      title: "Source connector health",
      milestoneBadge: "Adapters",
      modeLabels: {
        mock: "Mock",
        live: "Live",
        stub: "Stub",
      },
      stateLabels: {
        ready: "Ready",
        degraded: "Degraded",
      },
    },
    detail: {
      backToDashboard: "← Back to dashboard",
      referenceLinksOnly: "Reference links only",
      signalCountBadge: (count: number) => `${count} signals`,
      latestActivity: (date: string) => `Latest activity ${date}`,
      expectedMargin: "Expected margin",
      expectedProfit: "Expected profit",
      baseScore: "Base score",
      feeBaseline: "Fee baseline",
      sourceSignalsEyebrow: "Source signals",
      sourceSignalsTitle: "Why this candidate surfaced",
      adapterFeedBadge: "Adapter feed",
      signalContext: (keyword: string, category: string, date: string) =>
        `Keyword ${keyword} in ${category} as of ${date}.`,
      openReference: "Open reference",
    },
    links: {
      eyebrow: "Link registry",
      title: "Reference links only",
      description:
        "Manual operator workspace for official, purchase, and raffle references. Nothing here interacts with external sites automatically.",
      sessionOnly: "Session only",
      openReference: "Open reference",
      linkType: "Link type",
      label: "Label",
      url: "URL",
      notes: "Notes",
      labelPlaceholder: "Authorized retailer, official launch page...",
      urlPlaceholder: "https://example.com/reference",
      notesPlaceholder: "Why this link matters for manual review...",
      addSessionLink: "Add session link",
      requiredError: "Label and URL are required.",
      invalidUrlError: "Please enter a valid absolute URL.",
      sessionEntryNote: "Session-only mock entry.",
    },
    profit: {
      eyebrow: "Profit estimator",
      title: "Manual spread calculator",
      description:
        "Adjust assumptions to estimate profit, margin, and breakeven without touching any purchase flow.",
      ruleBasedBadge: "Rule based",
      buyPrice: "Buy price (JPY)",
      sellPrice: "Expected sale price (JPY)",
      platformFee: "Platform fee (%)",
      shipping: "Shipping (JPY)",
      otherCosts: "Other costs (JPY)",
      netProfit: "Net profit",
      margin: "Margin",
      roi: "ROI",
      breakevenSale: "Breakeven sale",
      costBasisSummary: (costBasis: string, fee: string, feeRate: string) =>
        `Cost basis ${costBasis} includes buy, shipping, and other costs. Platform fees add ${fee} at the current rate of ${feeRate}.`,
    },
    score: {
      eyebrow: "Explainable score",
      title: "Why this candidate ranks here",
      scoreLabel: "Score",
      bandLabels: {
        high: "High priority",
        medium: "Review",
        low: "Hold",
      },
      deductionsTitle: "Deductions",
      riskNotes: "Risk notes",
      noRisks: "No explicit risk notes are attached right now.",
    },
    admin: {
      badge: "Operations",
      title: "Operations status",
      description:
        "Operational view for scheduled refreshes, CSV exports, and job history. It never performs automated actions against external sites.",
      backToDashboard: "← Back to dashboard",
      exportTitle: "CSV export",
      exportDescription: "Export the current opportunity list as CSV.",
      exportJa: "Japanese CSV",
      exportEn: "English CSV",
      schedulerTitle: "Refresh configuration",
      schedulerStatus: "Job status",
      schedulerEnabled: "Enabled",
      schedulerDisabled: "Disabled",
      secretLabel: "Secret",
      secretConfigured: "Secret configured",
      secretMissing: "Secret missing",
      cronLabel: "Cron",
      retryLabel: "Retry",
      endpointLabel: "Endpoint",
      latestRunTitle: "Latest job",
      latestRunEmpty: "No refresh job has been recorded yet.",
      latestRunStatus: "Status",
      latestRunDuration: "Duration",
      latestRunTrigger: "Trigger",
      latestRunFinished: "Finished",
      latestRunCounts: (candidates: number, signals: number) => `${candidates} candidates / ${signals} signals`,
      recentRunsTitle: "Recent jobs",
      runSuccess: "Success",
      runFailed: "Failed",
      currentSnapshotTitle: "Current snapshot",
      candidateCount: "Candidates",
      persistenceTitle: "Persistence",
      persistenceEnabled: "Database writes enabled",
      persistenceDisabled: "Memory only / no persistence",
      signalCount: "Signals",
      latestObservedAt: "Latest observed",
      noLatestObservedAt: "No signal yet",
    },
    notFound: {
      eyebrow: "Not found",
      title: "That candidate is not in the current dataset.",
      description:
        "Head back to the dashboard to review the active opportunities and their reference links.",
      cta: "Return to dashboard",
    },
  },
} as const;

export type AppDictionary = (typeof dictionaries)[AppLocale];

export function getDictionary(locale: AppLocale = defaultLocale) {
  return dictionaries[locale];
}

export function getAlternateLocale(locale: AppLocale): AppLocale {
  return locale === "ja" ? "en" : "ja";
}

export function getLocalePath(locale: AppLocale, path = "/") {
  if (locale === "en") {
    return path === "/" ? "/en" : `/en${path}`;
  }

  return path;
}

export function getCategoryLabel(value: string, locale: AppLocale = defaultLocale) {
  const normalizedValue = value.trim().toLowerCase();
  return categoryLabels[normalizedValue as keyof typeof categoryLabels]?.[locale] ?? value;
}

export function getKeywordLabel(value: string, locale: AppLocale = defaultLocale) {
  const normalizedValue = value.trim().toLowerCase();
  return keywordLabels[normalizedValue as keyof typeof keywordLabels]?.[locale] ?? value;
}

export function getConnectorLabel(kind: ConnectorKind, locale: AppLocale = defaultLocale) {
  return connectorLabels[kind][locale];
}

export function getExternalLinkTypeLabel(type: ExternalLinkType, locale: AppLocale = defaultLocale) {
  return externalLinkTypeLabels[type][locale];
}

export function getSortOptionLabel(option: CandidateSortOption, locale: AppLocale = defaultLocale) {
  return sortOptionLabels[option][locale];
}
