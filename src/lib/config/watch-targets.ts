import type { AppLocale } from "@/lib/i18n";

type LocalizedText = Record<AppLocale, string>;

export interface WatchTargetSource {
  id: string;
  slug: string;
  title: LocalizedText;
  brand: LocalizedText;
  categoryKey: "audio" | "gaming" | "power" | "collectibles";
  displayKeyword: LocalizedText;
  shortDescription: LocalizedText;
  riskFlags: LocalizedText[];
  fallbackBuyPrice: number;
  fallbackSellPrice: number;
  fallbackThumbnailUrl: string;
  officialUrl: string;
  officialLabel: LocalizedText;
  amazonSearchQuery: string;
  amazonMatchTerms: string[];
  amazonRequiredTerms: string[];
  amazonExcludedTerms: string[];
  socialSearchQuery: string;
  socialMatchTerms: string[];
  socialRequiredTerms: string[];
  socialExcludedTerms: string[];
  resaleSearchQuery: string;
  resaleMatchTerms: string[];
  resaleRequiredTerms: string[];
  resaleExcludedTerms: string[];
  xQueryTerms: string[];
}

export function buildAmazonSearchUrl(query: string) {
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(query)}`;
}

export function buildYahooShoppingSearchUrl(query: string) {
  return `https://shopping.yahoo.co.jp/search/${encodeURIComponent(query)}/0/`;
}

export function buildSocialSearchUrl(query: string) {
  return `https://search.yahoo.co.jp/search?p=${encodeURIComponent(query)}`;
}

export function buildYahooAuctionsSearchUrl(query: string) {
  return `https://auctions.yahoo.co.jp/search/search?p=${encodeURIComponent(query)}`;
}

export const watchTargetSources: WatchTargetSource[] = [
  {
    id: "cand-sony-wh1000xm5",
    slug: "sony-wh-1000xm5",
    title: {
      ja: "Sony WH-1000XM5 ワイヤレスノイズキャンセリングヘッドホン",
      en: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    },
    brand: {
      ja: "Sony",
      en: "Sony",
    },
    categoryKey: "audio",
    displayKeyword: {
      ja: "WH-1000XM5",
      en: "WH-1000XM5",
    },
    shortDescription: {
      ja: "Amazon の実売価格、公開 SNS の話題量、国内相場検索を横断してヘッドホン需要を追う候補です。",
      en: "Tracks a real headphone target using Amazon pricing, public social chatter, and domestic resale-market references.",
    },
    riskFlags: [
      {
        ja: "カラー差や中古コンディション差で相場が割れやすいため、個体差の確認が必要です。",
        en: "Color and condition variance can widen the market spread, so manual listing review still matters.",
      },
    ],
    fallbackBuyPrice: 47800,
    fallbackSellPrice: 54800,
    fallbackThumbnailUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    officialUrl: "https://www.sony.jp/headphone/products/WH-1000XM5/",
    officialLabel: {
      ja: "Sony 公式製品ページ",
      en: "Sony official product page",
    },
    amazonSearchQuery: "Sony WH-1000XM5",
    amazonMatchTerms: ["wh-1000xm5", "sony"],
    amazonRequiredTerms: ["wh-1000xm5"],
    amazonExcludedTerms: [
      "wh-1000xm4",
      "wh-1000xm6",
      "wf-1000xm5",
      "イヤーパッド",
      "パッド",
      "交換",
      "冷却",
      "ケース",
      "カバー",
      "スタンド",
      "保護",
      "フィルム",
    ],
    socialSearchQuery:
      "(\"WH-1000XM5\" OR \"Sony XM5\") (site:youtube.com OR site:instagram.com OR site:reddit.com OR site:x.com)",
    socialMatchTerms: ["wh-1000xm5", "sony"],
    socialRequiredTerms: ["wh-1000xm5"],
    socialExcludedTerms: ["wh-1000xm4", "wh-1000xm6", "wf-1000xm5"],
    resaleSearchQuery: "WH-1000XM5",
    resaleMatchTerms: ["wh-1000xm5", "sony"],
    resaleRequiredTerms: ["wh-1000xm5"],
    resaleExcludedTerms: [
      "wh-1000xm4",
      "wh-1000xm6",
      "wf-1000xm5",
      "イヤーパッド",
      "バッテリー",
      "ケース",
      "付属品",
      "互換",
      "交換",
      "専用",
    ],
    xQueryTerms: ['"WH-1000XM5"', '"Sony XM5"'],
  },
  {
    id: "cand-switch-2",
    slug: "nintendo-switch-2",
    title: {
      ja: "Nintendo Switch 2 本体",
      en: "Nintendo Switch 2 Console",
    },
    brand: {
      ja: "Nintendo",
      en: "Nintendo",
    },
    categoryKey: "gaming",
    displayKeyword: {
      ja: "Nintendo Switch 2",
      en: "Nintendo Switch 2",
    },
    shortDescription: {
      ja: "本体価格、在庫話題、国内オークション相場を見ながら供給ギャップを追うゲーム系ターゲットです。",
      en: "Gaming target that watches live retail pricing, stock chatter, and Japanese auction-market references.",
    },
    riskFlags: [
      {
        ja: "大規模再入荷や公式抽選の追加で、短期的にプレミアが縮む可能性があります。",
        en: "Large restocks or new official lottery waves can compress short-term upside quickly.",
      },
    ],
    fallbackBuyPrice: 69980,
    fallbackSellPrice: 79800,
    fallbackThumbnailUrl:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=80",
    officialUrl: "https://www.nintendo.com/jp/hardware/switch2/index.html",
    officialLabel: {
      ja: "Nintendo 公式ページ",
      en: "Nintendo official page",
    },
    amazonSearchQuery: "Nintendo Switch 2 本体",
    amazonMatchTerms: ["switch 2", "本体", "nintendo"],
    amazonRequiredTerms: ["switch 2"],
    amazonExcludedTerms: [
      "switch lite",
      "有機el",
      "online code",
      "オンラインコード",
      "micro sd",
      "microsd",
      "マリオカート",
      "ポケモン",
      "セット",
      "中古",
      "中古即納",
      "整備済",
      "コントローラー",
      "ケース",
      "カバー",
      "保護",
      "フィルム",
    ],
    socialSearchQuery:
      "(\"Nintendo Switch 2\" OR \"Switch 2\") (site:youtube.com OR site:instagram.com OR site:reddit.com OR site:x.com)",
    socialMatchTerms: ["switch 2", "nintendo"],
    socialRequiredTerms: ["switch 2"],
    socialExcludedTerms: ["switch lite", "switch oled", "hac-001"],
    resaleSearchQuery: "Nintendo Switch 2 本体",
    resaleMatchTerms: ["switch 2", "本体", "nintendo"],
    resaleRequiredTerms: ["switch 2"],
    resaleExcludedTerms: [
      "switch lite",
      "switch oled",
      "hac-001",
      "マリオカート",
      "セット",
      "コントローラー",
      "micro sd",
      "microsd",
      "ケース",
      "保護",
    ],
    xQueryTerms: ['"Nintendo Switch 2"', '"Switch 2"'],
  },
  {
    id: "cand-anker-prime-27650",
    slug: "anker-prime-27650",
    title: {
      ja: "Anker Prime 27,650mAh Power Bank (250W)",
      en: "Anker Prime 27,650mAh Power Bank (250W)",
    },
    brand: {
      ja: "Anker",
      en: "Anker",
    },
    categoryKey: "power",
    displayKeyword: {
      ja: "Anker Prime 27650",
      en: "Anker Prime 27650",
    },
    shortDescription: {
      ja: "高出力モバイル電源の値崩れと話題量を追い、セール時の仕入れ候補を見極めるためのターゲットです。",
      en: "Tracks a high-output power bank so operators can spot sale-driven buy opportunities against market demand.",
    },
    riskFlags: [
      {
        ja: "バッテリーカテゴリは新モデル投入で旧モデル相場が急変しやすい点に注意が必要です。",
        en: "Battery accessories can reprice fast when a newer generation or bundle enters the market.",
      },
    ],
    fallbackBuyPrice: 21990,
    fallbackSellPrice: 26800,
    fallbackThumbnailUrl:
      "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?auto=format&fit=crop&w=1200&q=80",
    officialUrl: "https://www.ankerjapan.com/search?q=Anker%20Prime%2027650",
    officialLabel: {
      ja: "Anker 公式検索",
      en: "Anker official search",
    },
    amazonSearchQuery: "Anker Prime 27650",
    amazonMatchTerms: ["anker", "prime", "27650"],
    amazonRequiredTerms: ["anker", "27650"],
    amazonExcludedTerms: [
      "25000",
      "20000",
      "prime charger",
      "347",
      "フィルム",
      "保護フィルム",
      "ケース",
      "カバー",
      "ポーチ",
      "ケーブル",
      "充電器",
      "ホルダー",
    ],
    socialSearchQuery:
      "(\"Anker Prime 27650\" OR \"Anker Prime 27,650\") (site:youtube.com OR site:instagram.com OR site:reddit.com OR site:x.com)",
    socialMatchTerms: ["anker", "prime", "27650"],
    socialRequiredTerms: ["anker", "27650"],
    socialExcludedTerms: ["25000", "20000", "347"],
    resaleSearchQuery: "Anker Prime 27650",
    resaleMatchTerms: ["anker", "prime", "27650"],
    resaleRequiredTerms: ["anker", "27650"],
    resaleExcludedTerms: [
      "25000",
      "20000",
      "347",
      "ケーブル",
      "充電器",
      "ケース",
      "フィルム",
      "保護フィルム",
      "カバー",
      "ポーチ",
      "ホルダー",
    ],
    xQueryTerms: ['"Anker Prime 27650"', '"Anker Prime"'],
  },
  {
    id: "cand-pokemon-151",
    slug: "pokemon-card-151-box",
    title: {
      ja: "ポケモンカードゲーム 151 BOX",
      en: "Pokemon Card Game 151 Booster Box",
    },
    brand: {
      ja: "Pokemon",
      en: "Pokemon",
    },
    categoryKey: "collectibles",
    displayKeyword: {
      ja: "ポケモンカード 151 BOX",
      en: "Pokemon 151 booster box",
    },
    shortDescription: {
      ja: "コレクター需要が残りやすいカード商品を対象に、Amazon 価格と公開話題量、国内相場を横断して監視します。",
      en: "Collectible card target monitored through Amazon pricing, public chatter, and domestic market references.",
    },
    riskFlags: [
      {
        ja: "再販やシュリンク有無で価格帯が大きく分かれるため、出品条件の確認が不可欠です。",
        en: "Reprints and seal condition can split the market materially, so listing conditions must be checked manually.",
      },
    ],
    fallbackBuyPrice: 16800,
    fallbackSellPrice: 21800,
    fallbackThumbnailUrl:
      "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=80",
    officialUrl: "https://www.pokemon-card.com/products/sv/sv2a.html",
    officialLabel: {
      ja: "ポケモンカード公式ページ",
      en: "Pokemon Card official page",
    },
    amazonSearchQuery: "ポケモンカード 151 box",
    amazonMatchTerms: ["151", "box", "ポケモン"],
    amazonRequiredTerms: ["151", "box", "ポケモン"],
    amazonExcludedTerms: [
      "1パック",
      "パック",
      "mega",
      "メガ",
      "ステラミラクル",
      "バトルパートナーズ",
      "シャイニートレジャー",
      "テラスタル",
      "シンフォニア",
      "ブレイブ",
      "ドリーム",
      "オリパ",
      "福袋",
      "シングル",
      "バラ",
      "セット売り",
      "スリーブ",
      "ケース",
      "ファイル",
    ],
    socialSearchQuery:
      "(\"ポケモンカード151\" OR \"Pokemon 151 booster box\") (site:youtube.com OR site:instagram.com OR site:reddit.com OR site:x.com)",
    socialMatchTerms: ["pokemon", "151", "box", "ポケモン"],
    socialRequiredTerms: ["151"],
    socialExcludedTerms: ["all 151", "base set", "1パック", "single pack"],
    resaleSearchQuery: "ポケモンカード 151 box",
    resaleMatchTerms: ["151", "box", "ポケモン"],
    resaleRequiredTerms: ["151", "box"],
    resaleExcludedTerms: [
      "1パック",
      "パック",
      "mega",
      "メガ",
      "ステラミラクル",
      "バトルパートナーズ",
      "シャイニートレジャー",
      "テラスタル",
      "シンフォニア",
      "ブレイブ",
      "ドリーム",
    ],
    xQueryTerms: ['"Pokemon 151"', '"ポケモンカード 151"', '"booster box"'],
  },
];
