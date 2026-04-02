import type { CandidateCatalogEntry, ExternalLink } from "@/lib/candidates/types";
import type { ConnectorKind, ConnectorSignal, WatchTarget } from "@/lib/connectors/types";
import { getCategoryLabel, getKeywordLabel, type AppLocale } from "@/lib/i18n";

type LocalizedText = Record<AppLocale, string>;

interface LocalizedExternalLink extends Omit<ExternalLink, "label" | "notes"> {
  label: LocalizedText;
  notes?: LocalizedText;
}

interface CandidateCatalogSource
  extends Omit<CandidateCatalogEntry, "title" | "brand" | "category" | "shortDescription" | "riskFlags" | "externalLinks"> {
  title: LocalizedText;
  brand: LocalizedText;
  categoryKey: string;
  displayKeyword: LocalizedText;
  xQueryTerms: string[];
  shortDescription: LocalizedText;
  riskFlags: LocalizedText[];
  externalLinks: LocalizedExternalLink[];
}

interface LocalizedConnectorSignalSource
  extends Omit<ConnectorSignal, "keyword" | "category" | "metricLabel" | "summary"> {
  keywordKey: string;
  categoryKey: string;
  metricLabel: LocalizedText;
  summary: LocalizedText;
}

function pickText(value: LocalizedText, locale: AppLocale) {
  return value[locale];
}

const candidateCatalogSource: CandidateCatalogSource[] = [
  {
    id: "cand-aurora-headphones",
    slug: "aurora-studio-headphones",
    title: {
      ja: "Aurora Studio ワイヤレスヘッドホン",
      en: "Aurora Studio Wireless Headphones",
    },
    brand: {
      ja: "Aurora Audio",
      en: "Aurora Audio",
    },
    categoryKey: "audio",
    displayKeyword: {
      ja: "Aurora ヘッドホン",
      en: "Aurora headphones",
    },
    xQueryTerms: ['"Aurora Studio"', '"Aurora Audio"', "headphones"],
    thumbnailUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    shortDescription: {
      ja: "季節限定カラーがプレミアム音響コミュニティで安定した再販スプレッドを保っています。",
      en: "Seasonal colorway with steady resale spread across premium audio communities.",
    },
    estimatedBuyPrice: 24800,
    estimatedSellPrice: 33800,
    shippingCost: 900,
    otherCost: 400,
    riskFlags: [
      {
        ja: "広い再入荷が入ると、カラー需要が急速に落ち着く可能性があります。",
        en: "Colorway demand can cool once wider restocks land.",
      },
    ],
    externalLinks: [
      {
        id: "link-aurora-official",
        type: "official",
        label: {
          ja: "公式商品ページ",
          en: "Official product page",
        },
        url: "https://example.com/aurora/headphones",
        notes: {
          ja: "参考表示のみ。自動操作はしません。",
          en: "Reference only. No automated interaction.",
        },
      },
      {
        id: "link-aurora-purchase",
        type: "purchase",
        label: {
          ja: "主要販売ページ",
          en: "Primary retail listing",
        },
        url: "https://example.com/retail/aurora-headphones",
        notes: {
          ja: "人が確認するための購入参考リンクです。",
          en: "Reference purchase link for manual operator review.",
        },
      },
      {
        id: "link-aurora-review",
        type: "reference",
        label: {
          ja: "コミュニティ価格スレッド",
          en: "Community price thread",
        },
        url: "https://example.com/market/aurora-thread",
        notes: {
          ja: "手動コンプ確認や売れ行きメモに役立ちます。",
          en: "Useful for manual comps and sell-through notes.",
        },
      },
    ],
  },
  {
    id: "cand-nova-console",
    slug: "nova-pocket-console",
    title: {
      ja: "Nova Pocket レトロコンソール",
      en: "Nova Pocket Retro Console",
    },
    brand: {
      ja: "Nova",
      en: "Nova",
    },
    categoryKey: "gaming",
    displayKeyword: {
      ja: "Nova 携帯ゲーム機",
      en: "Nova handheld",
    },
    xQueryTerms: ['"Nova Pocket"', '"Nova"', '"retro console"', "handheld"],
    thumbnailUrl:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=80",
    shortDescription: {
      ja: "コンパクトな携帯機で、供給管理された販売とコレクター界隈の再入荷話題が強い状態です。",
      en: "Compact handheld with controlled drops and strong restock chatter in collector circles.",
    },
    estimatedBuyPrice: 18900,
    estimatedSellPrice: 25900,
    shippingCost: 800,
    otherCost: 300,
    riskFlags: [
      {
        ja: "大量補充が入ると、数日で再販価格が圧縮されるおそれがあります。",
        en: "High-volume replenishment could compress resale within days.",
      },
    ],
    externalLinks: [
      {
        id: "link-nova-official",
        type: "official",
        label: {
          ja: "公式ローンチページ",
          en: "Official launch page",
        },
        url: "https://example.com/nova/console",
        notes: {
          ja: "参考表示のみです。",
          en: "Reference only.",
        },
      },
      {
        id: "link-nova-purchase",
        type: "purchase",
        label: {
          ja: "販売予約ページ",
          en: "Retail reservation page",
        },
        url: "https://example.com/retail/nova-console",
        notes: {
          ja: "手動確認専用です。",
          en: "For manual review only.",
        },
      },
      {
        id: "link-nova-raffle",
        type: "raffle",
        label: {
          ja: "抽選告知ページ",
          en: "Lottery announcement",
        },
        url: "https://example.com/lottery/nova-console",
        notes: {
          ja: "参考リンクとしてのみ表示します。",
          en: "Displayed only as a reference link.",
        },
      },
    ],
  },
  {
    id: "cand-summit-power-bank",
    slug: "summit-power-bank-275",
    title: {
      ja: "Summit 27.5K トラベルモバイルバッテリー",
      en: "Summit 27.5K Travel Power Bank",
    },
    brand: {
      ja: "Summit",
      en: "Summit",
    },
    categoryKey: "power",
    displayKeyword: {
      ja: "Summit モバイルバッテリー",
      en: "Summit power bank",
    },
    xQueryTerms: ['"Summit 27.5K"', '"Summit"', '"power bank"', '"travel battery"'],
    thumbnailUrl:
      "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?auto=format&fit=crop&w=1200&q=80",
    shortDescription: {
      ja: "高容量バッテリーで、ベストセラー勢いと堅い価格下限を維持しています。",
      en: "High-capacity battery pack riding bestseller momentum with disciplined price floors.",
    },
    estimatedBuyPrice: 15400,
    estimatedSellPrice: 21400,
    shippingCost: 700,
    otherCost: 250,
    riskFlags: [
      {
        ja: "バッテリー配送制限でフルフィルメント費用が増える可能性があります。",
        en: "Battery shipping restrictions may increase fulfillment costs.",
      },
    ],
    externalLinks: [
      {
        id: "link-summit-official",
        type: "official",
        label: {
          ja: "公式仕様ページ",
          en: "Official specs",
        },
        url: "https://example.com/summit/power-bank",
        notes: {
          ja: "参考表示のみです。",
          en: "Reference only.",
        },
      },
      {
        id: "link-summit-purchase",
        type: "purchase",
        label: {
          ja: "正規販売店ページ",
          en: "Authorized retailer page",
        },
        url: "https://example.com/retail/summit-power-bank",
        notes: {
          ja: "手動確認用リンクです。",
          en: "Manual review link.",
        },
      },
      {
        id: "link-summit-reference",
        type: "reference",
        label: {
          ja: "価格ウォッチメモ",
          en: "Price-watch notes",
        },
        url: "https://example.com/reference/summit-power-bank",
        notes: {
          ja: "トレンド確認用の参考リンクです。",
          en: "Reference link for trend notes.",
        },
      },
    ],
  },
  {
    id: "cand-mythic-box",
    slug: "mythic-booster-collector-box",
    title: {
      ja: "Mythic コレクター・ブースターボックス",
      en: "Mythic Collector Booster Box",
    },
    brand: {
      ja: "Mythic Forge",
      en: "Mythic Forge",
    },
    categoryKey: "collectibles",
    displayKeyword: {
      ja: "Mythic ブースターボックス",
      en: "Mythic booster box",
    },
    xQueryTerms: ['"Mythic Collector Booster"', '"Mythic Forge"', '"booster box"'],
    thumbnailUrl:
      "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=80",
    shortDescription: {
      ja: "発売初週のコレクター商品で、二次流通の比較価格上昇と強い検索流入が見られます。",
      en: "Launch-week collectible with rising secondary comps and strong keyword pull.",
    },
    estimatedBuyPrice: 11800,
    estimatedSellPrice: 19800,
    shippingCost: 750,
    otherCost: 200,
    riskFlags: [
      {
        ja: "発売直後の需要が落ち着くと、コレクター需要が反落する可能性があります。",
        en: "Collectible demand can retrace after the initial release window.",
      },
    ],
    externalLinks: [
      {
        id: "link-mythic-official",
        type: "official",
        label: {
          ja: "公式リリースノート",
          en: "Official release notes",
        },
        url: "https://example.com/mythic/booster-box",
        notes: {
          ja: "参考表示のみです。",
          en: "Reference only.",
        },
      },
      {
        id: "link-mythic-purchase",
        type: "purchase",
        label: {
          ja: "予約販売ページ",
          en: "Preorder page",
        },
        url: "https://example.com/retail/mythic-booster-box",
        notes: {
          ja: "手動確認用リンクです。",
          en: "Manual review link.",
        },
      },
      {
        id: "link-mythic-reference",
        type: "reference",
        label: {
          ja: "コレクター市場スナップショット",
          en: "Collector market snapshot",
        },
        url: "https://example.com/reference/mythic-box",
        notes: {
          ja: "手動検証向けの比較価格参考リンクです。",
          en: "Reference comps for manual verification.",
        },
      },
    ],
  },
];

const mockSignalSource: Record<ConnectorKind, LocalizedConnectorSignalSource[]> = {
  x: [
    {
      id: "x-aurora-1",
      connector: "x",
      candidateSlug: "aurora-studio-headphones",
      keywordKey: "limited release",
      categoryKey: "audio",
      metricLabel: {
        ja: "言及速度",
        en: "Mention velocity",
      },
      metricValue: 74,
      strength: 74,
      summary: {
        ja: "季節カラー発表後も言及速度が高い水準を維持しています。",
        en: "Mention velocity remains elevated after the seasonal color announcement.",
      },
      observedAt: "2026-03-31T08:30:00+09:00",
      referenceUrl: "https://example.com/social/aurora",
    },
    {
      id: "x-nova-1",
      connector: "x",
      candidateSlug: "nova-pocket-console",
      keywordKey: "restock",
      categoryKey: "gaming",
      metricLabel: {
        ja: "再入荷話題量",
        en: "Restock chatter",
      },
      metricValue: 82,
      strength: 82,
      summary: {
        ja: "携帯ゲーム機コレクターの間で再入荷ワードの話題が上向いています。",
        en: "Restock keyword chatter is trending upward among handheld collectors.",
      },
      observedAt: "2026-03-31T10:10:00+09:00",
      referenceUrl: "https://example.com/social/nova",
    },
    {
      id: "x-mythic-1",
      connector: "x",
      candidateSlug: "mythic-booster-collector-box",
      keywordKey: "best seller",
      categoryKey: "collectibles",
      metricLabel: {
        ja: "コレクター反応",
        en: "Collector engagement",
      },
      metricValue: 88,
      strength: 88,
      summary: {
        ja: "最終予約波でもコレクターの反応が強いままです。",
        en: "Collector engagement stayed strong through the final preorder wave.",
      },
      observedAt: "2026-03-30T19:20:00+09:00",
      referenceUrl: "https://example.com/social/mythic",
    },
  ],
  amazon: [
    {
      id: "amazon-aurora-1",
      connector: "amazon",
      candidateSlug: "aurora-studio-headphones",
      keywordKey: "best seller",
      categoryKey: "audio",
      metricLabel: {
        ja: "カテゴリ順位",
        en: "Category rank",
      },
      metricValue: 12,
      strength: 79,
      summary: {
        ja: "ポータブルオーディオで上位ベストセラー帯を維持しています。",
        en: "The item is holding a top-tier bestseller slot in portable audio.",
      },
      observedAt: "2026-03-31T07:00:00+09:00",
      referenceUrl: "https://example.com/amazon/aurora",
    },
    {
      id: "amazon-summit-1",
      connector: "amazon",
      candidateSlug: "summit-power-bank-275",
      keywordKey: "best seller",
      categoryKey: "power",
      metricLabel: {
        ja: "カテゴリ順位",
        en: "Category rank",
      },
      metricValue: 7,
      strength: 86,
      summary: {
        ja: "トラベル電源カテゴリで上位帯を維持しています。",
        en: "Travel power remains near the top of its category leaderboard.",
      },
      observedAt: "2026-03-31T09:15:00+09:00",
      referenceUrl: "https://example.com/amazon/summit",
    },
    {
      id: "amazon-mythic-1",
      connector: "amazon",
      candidateSlug: "mythic-booster-collector-box",
      keywordKey: "limited release",
      categoryKey: "collectibles",
      metricLabel: {
        ja: "カテゴリ順位",
        en: "Category rank",
      },
      metricValue: 4,
      strength: 90,
      summary: {
        ja: "コレクターボックスがホビー予約ランキング上位に位置しています。",
        en: "Collector box sits near the top of hobby preorder rankings.",
      },
      observedAt: "2026-03-31T11:40:00+09:00",
      referenceUrl: "https://example.com/amazon/mythic",
    },
  ],
  keepa: [
    {
      id: "keepa-nova-1",
      connector: "keepa",
      candidateSlug: "nova-pocket-console",
      keywordKey: "price spike",
      categoryKey: "gaming",
      metricLabel: {
        ja: "30日フロア差",
        en: "30-day floor delta",
      },
      metricValue: 18,
      strength: 76,
      summary: {
        ja: "中古市場の下限価格が直近30日より上昇しています。",
        en: "Used-market floor prices have risen against the prior 30-day window.",
      },
      observedAt: "2026-03-31T06:45:00+09:00",
      referenceUrl: "https://example.com/keepa/nova",
    },
    {
      id: "keepa-summit-1",
      connector: "keepa",
      candidateSlug: "summit-power-bank-275",
      keywordKey: "price spike",
      categoryKey: "power",
      metricLabel: {
        ja: "90日Buy Box差",
        en: "90-day buy box delta",
      },
      metricValue: 11,
      strength: 71,
      summary: {
        ja: "Buy Box の粘りから、前四半期より健全な価格下限が示唆されます。",
        en: "Buy-box resilience suggests a healthier floor than the prior quarter.",
      },
      observedAt: "2026-03-30T18:30:00+09:00",
      referenceUrl: "https://example.com/keepa/summit",
    },
    {
      id: "keepa-mythic-1",
      connector: "keepa",
      candidateSlug: "mythic-booster-collector-box",
      keywordKey: "price spike",
      categoryKey: "collectibles",
      metricLabel: {
        ja: "二次流通フロア差",
        en: "Secondary floor delta",
      },
      metricValue: 24,
      strength: 84,
      summary: {
        ja: "二次流通の下限価格が週ごとに段階的に上がっています。",
        en: "Secondary floor continues to stair-step higher week over week.",
      },
      observedAt: "2026-03-31T12:20:00+09:00",
      referenceUrl: "https://example.com/keepa/mythic",
    },
  ],
};

export function getCandidateCatalog(locale: AppLocale): CandidateCatalogEntry[] {
  return candidateCatalogSource.map((candidate) => ({
    id: candidate.id,
    slug: candidate.slug,
    title: pickText(candidate.title, locale),
    brand: pickText(candidate.brand, locale),
    category: getCategoryLabel(candidate.categoryKey, locale),
    thumbnailUrl: candidate.thumbnailUrl,
    shortDescription: pickText(candidate.shortDescription, locale),
    estimatedBuyPrice: candidate.estimatedBuyPrice,
    estimatedSellPrice: candidate.estimatedSellPrice,
    shippingCost: candidate.shippingCost,
    otherCost: candidate.otherCost,
    riskFlags: candidate.riskFlags.map((risk) => pickText(risk, locale)),
    externalLinks: candidate.externalLinks.map((link) => ({
      id: link.id,
      type: link.type,
      label: pickText(link.label, locale),
      url: link.url,
      notes: link.notes ? pickText(link.notes, locale) : undefined,
    })),
  }));
}

export function getWatchTargets(locale: AppLocale): WatchTarget[] {
  return candidateCatalogSource.map((candidate) => ({
    candidateSlug: candidate.slug,
    displayKeyword: pickText(candidate.displayKeyword, locale),
    category: getCategoryLabel(candidate.categoryKey, locale),
    xQueryTerms: candidate.xQueryTerms,
  }));
}

export function getMockSignalFixtures(locale: AppLocale): Record<ConnectorKind, ConnectorSignal[]> {
  return {
    x: mockSignalSource.x.map((signal) => ({
      id: signal.id,
      connector: signal.connector,
      candidateSlug: signal.candidateSlug,
      keyword: getKeywordLabel(signal.keywordKey, locale),
      category: getCategoryLabel(signal.categoryKey, locale),
      metricLabel: pickText(signal.metricLabel, locale),
      metricValue: signal.metricValue,
      strength: signal.strength,
      summary: pickText(signal.summary, locale),
      observedAt: signal.observedAt,
      referenceUrl: signal.referenceUrl,
    })),
    amazon: mockSignalSource.amazon.map((signal) => ({
      id: signal.id,
      connector: signal.connector,
      candidateSlug: signal.candidateSlug,
      keyword: getKeywordLabel(signal.keywordKey, locale),
      category: getCategoryLabel(signal.categoryKey, locale),
      metricLabel: pickText(signal.metricLabel, locale),
      metricValue: signal.metricValue,
      strength: signal.strength,
      summary: pickText(signal.summary, locale),
      observedAt: signal.observedAt,
      referenceUrl: signal.referenceUrl,
    })),
    keepa: mockSignalSource.keepa.map((signal) => ({
      id: signal.id,
      connector: signal.connector,
      candidateSlug: signal.candidateSlug,
      keyword: getKeywordLabel(signal.keywordKey, locale),
      category: getCategoryLabel(signal.categoryKey, locale),
      metricLabel: pickText(signal.metricLabel, locale),
      metricValue: signal.metricValue,
      strength: signal.strength,
      summary: pickText(signal.summary, locale),
      observedAt: signal.observedAt,
      referenceUrl: signal.referenceUrl,
    })),
  };
}
