import type { CandidateCatalogEntry, ExternalLink } from "@/lib/candidates/types";
import {
  buildAmazonSearchUrl,
  buildSocialSearchUrl,
  buildYahooAuctionsSearchUrl,
  watchTargetSources,
} from "@/lib/config/watch-targets";
import type { ConnectorKind, ConnectorSignal, WatchTarget } from "@/lib/connectors/types";
import { getCategoryLabel, type AppLocale } from "@/lib/i18n";

type LocalizedText = Record<AppLocale, string>;

interface MockSignalSource {
  id: string;
  connector: ConnectorKind;
  candidateSlug: string;
  metricLabel: LocalizedText;
  metricValue: number;
  strength: number;
  summary: LocalizedText;
  observedAt: string;
  referenceUrl: string;
}

function pickText(value: LocalizedText, locale: AppLocale) {
  return value[locale];
}

function buildBaseLinks(args: {
  locale: AppLocale;
  officialLabel: LocalizedText;
  officialUrl: string;
  amazonSearchQuery: string;
  socialSearchQuery: string;
  resaleSearchQuery: string;
}): ExternalLink[] {
  return [
    {
      id: `${args.amazonSearchQuery}-official`,
      type: "official",
      label: pickText(args.officialLabel, args.locale),
      url: args.officialUrl,
      notes:
        args.locale === "ja"
          ? "メーカーや公式商品ページの確認用リンクです。"
          : "Official manufacturer or product page for manual verification.",
    },
    {
      id: `${args.amazonSearchQuery}-purchase`,
      type: "purchase",
      label: args.locale === "ja" ? "Amazon 検索リンク" : "Amazon search link",
      url: buildAmazonSearchUrl(args.amazonSearchQuery),
      notes:
        args.locale === "ja"
          ? "自動操作はせず、人が価格と在庫を確認するための購入参考リンクです。"
          : "Reference-only purchase link for manual price and stock review.",
    },
    {
      id: `${args.resaleSearchQuery}-market`,
      type: "reference",
      label: args.locale === "ja" ? "Yahoo!オークション相場検索" : "Yahoo! Auctions market search",
      url: buildYahooAuctionsSearchUrl(args.resaleSearchQuery),
      notes:
        args.locale === "ja"
          ? "現在の国内相場を目視確認するための参考リンクです。"
          : "Reference market-search link for manual Japanese resale checks.",
    },
    {
      id: `${args.socialSearchQuery}-social`,
      type: "reference",
      label: args.locale === "ja" ? "公開 SNS 検索" : "Public social search",
      url: buildSocialSearchUrl(args.socialSearchQuery),
      notes:
        args.locale === "ja"
          ? "公開 SNS やコミュニティ投稿の一次ソースを人手で裏取りするための参考リンクです。"
          : "Reference-only link for manually verifying public social and community sources.",
    },
  ];
}

const mockSignalSource: Record<ConnectorKind, MockSignalSource[]> = {
  x: [
    {
      id: "social-sony-1",
      connector: "x",
      candidateSlug: "sony-wh-1000xm5",
      metricLabel: {
        ja: "直近 SNS 投稿数",
        en: "Recent social posts",
      },
      metricValue: 6,
      strength: 66,
      summary: {
        ja: "Reddit 上で WH-1000XM5 の価格比較と買い替え相談が複数スレッドで観測されています。",
        en: "Multiple Reddit threads are still discussing WH-1000XM5 pricing and upgrade decisions.",
      },
      observedAt: "2026-04-08T19:10:00+09:00",
      referenceUrl: buildSocialSearchUrl(
        "(\"WH-1000XM5\" OR \"Sony XM5\") (site:youtube.com OR site:instagram.com OR site:reddit.com OR site:x.com)",
      ),
    },
    {
      id: "social-switch-1",
      connector: "x",
      candidateSlug: "nintendo-switch-2",
      metricLabel: {
        ja: "直近 SNS 投稿数",
        en: "Recent social posts",
      },
      metricValue: 10,
      strength: 88,
      summary: {
        ja: "Switch 2 の在庫・抽選・再入荷に関する話題が継続しており、需要観測に使えます。",
        en: "Switch 2 stock, lottery, and restock threads remain active enough to support demand monitoring.",
      },
      observedAt: "2026-04-08T20:20:00+09:00",
      referenceUrl: buildSocialSearchUrl(
        "(\"Nintendo Switch 2\" OR \"Switch 2\") (site:youtube.com OR site:instagram.com OR site:reddit.com OR site:x.com)",
      ),
    },
    {
      id: "social-anker-1",
      connector: "x",
      candidateSlug: "anker-prime-27650",
      metricLabel: {
        ja: "直近 SNS 投稿数",
        en: "Recent social posts",
      },
      metricValue: 5,
      strength: 58,
      summary: {
        ja: "Anker Prime 27650 のセール価格と運用レビューが公開 SNS に流れています。",
        en: "Public social posts still surface sale pricing and usage reviews for the Anker Prime 27650.",
      },
      observedAt: "2026-04-08T17:50:00+09:00",
      referenceUrl: buildSocialSearchUrl(
        "(\"Anker Prime 27650\" OR \"Anker Prime 27,650\") (site:youtube.com OR site:instagram.com OR site:reddit.com OR site:x.com)",
      ),
    },
    {
      id: "social-pokemon-1",
      connector: "x",
      candidateSlug: "pokemon-card-151-box",
      metricLabel: {
        ja: "直近 SNS 投稿数",
        en: "Recent social posts",
      },
      metricValue: 12,
      strength: 94,
      summary: {
        ja: "Pokemon 151 BOX の再販・当たり封入・価格差に関する投稿が複数コミュニティで継続しています。",
        en: "Pokemon 151 booster-box chatter remains active across multiple communities around reprints and pricing.",
      },
      observedAt: "2026-04-08T21:10:00+09:00",
      referenceUrl: buildSocialSearchUrl(
        "(\"ポケモンカード151\" OR \"Pokemon 151 booster box\") (site:youtube.com OR site:instagram.com OR site:reddit.com OR site:x.com)",
      ),
    },
  ],
  amazon: [
    {
      id: "amazon-sony-1",
      connector: "amazon",
      candidateSlug: "sony-wh-1000xm5",
      metricLabel: {
        ja: "Amazon 実売価格",
        en: "Amazon live price",
      },
      metricValue: 47800,
      strength: 72,
      summary: {
        ja: "Amazon 検索上位の WH-1000XM5 実売価格を参照しています。",
        en: "Using the live price from the highest-matching Amazon search result for WH-1000XM5.",
      },
      observedAt: "2026-04-08T20:35:00+09:00",
      referenceUrl: buildAmazonSearchUrl("Sony WH-1000XM5"),
    },
    {
      id: "amazon-switch-1",
      connector: "amazon",
      candidateSlug: "nintendo-switch-2",
      metricLabel: {
        ja: "Amazon 実売価格",
        en: "Amazon live price",
      },
      metricValue: 69980,
      strength: 91,
      summary: {
        ja: "Switch 2 本体の Amazon 検索上位価格を仕入れ基準として参照しています。",
        en: "Using the top Amazon price for Nintendo Switch 2 console as the buy-side reference.",
      },
      observedAt: "2026-04-08T20:40:00+09:00",
      referenceUrl: buildAmazonSearchUrl("Nintendo Switch 2 本体"),
    },
    {
      id: "amazon-anker-1",
      connector: "amazon",
      candidateSlug: "anker-prime-27650",
      metricLabel: {
        ja: "Amazon 実売価格",
        en: "Amazon live price",
      },
      metricValue: 21990,
      strength: 63,
      summary: {
        ja: "Anker Prime 27650 の Amazon 検索上位価格を参照しています。",
        en: "Using the top matching Amazon price for the Anker Prime 27650.",
      },
      observedAt: "2026-04-08T18:30:00+09:00",
      referenceUrl: buildAmazonSearchUrl("Anker Prime 27650"),
    },
    {
      id: "amazon-pokemon-1",
      connector: "amazon",
      candidateSlug: "pokemon-card-151-box",
      metricLabel: {
        ja: "Amazon 実売価格",
        en: "Amazon live price",
      },
      metricValue: 16800,
      strength: 85,
      summary: {
        ja: "ポケモンカード 151 BOX の Amazon 検索上位価格を仕入れ参考値に使っています。",
        en: "Using the top Amazon price for Pokemon 151 booster boxes as the buy-side reference.",
      },
      observedAt: "2026-04-08T21:15:00+09:00",
      referenceUrl: buildAmazonSearchUrl("ポケモンカード 151 box"),
    },
  ],
  keepa: [
    {
      id: "market-sony-1",
      connector: "keepa",
      candidateSlug: "sony-wh-1000xm5",
      metricLabel: {
        ja: "国内相場中央値",
        en: "Median resale listing",
      },
      metricValue: 54800,
      strength: 61,
      summary: {
        ja: "Yahoo!オークション検索上位の現在価格帯を相場参考値に使っています。",
        en: "Using the median current Yahoo! Auctions listing price as the resale reference.",
      },
      observedAt: "2026-04-08T19:40:00+09:00",
      referenceUrl: buildYahooAuctionsSearchUrl("WH-1000XM5"),
    },
    {
      id: "market-switch-1",
      connector: "keepa",
      candidateSlug: "nintendo-switch-2",
      metricLabel: {
        ja: "国内相場中央値",
        en: "Median resale listing",
      },
      metricValue: 79800,
      strength: 90,
      summary: {
        ja: "Switch 2 本体の国内出品相場を現在価格ベースで参照しています。",
        en: "Using the current Japanese listing median as the reference market price for Switch 2.",
      },
      observedAt: "2026-04-08T20:45:00+09:00",
      referenceUrl: buildYahooAuctionsSearchUrl("Nintendo Switch 2 本体"),
    },
    {
      id: "market-anker-1",
      connector: "keepa",
      candidateSlug: "anker-prime-27650",
      metricLabel: {
        ja: "国内相場中央値",
        en: "Median resale listing",
      },
      metricValue: 26800,
      strength: 55,
      summary: {
        ja: "Anker Prime 27650 の国内出品相場を現在価格ベースで確認しています。",
        en: "Using the current domestic listing median as the reference price for the Anker Prime 27650.",
      },
      observedAt: "2026-04-08T18:55:00+09:00",
      referenceUrl: buildYahooAuctionsSearchUrl("Anker Prime 27650"),
    },
    {
      id: "market-pokemon-1",
      connector: "keepa",
      candidateSlug: "pokemon-card-151-box",
      metricLabel: {
        ja: "国内相場中央値",
        en: "Median resale listing",
      },
      metricValue: 21800,
      strength: 92,
      summary: {
        ja: "151 BOX の国内出品相場中央値を比較価格として使っています。",
        en: "Using the domestic listing median for 151 booster boxes as the reference market price.",
      },
      observedAt: "2026-04-08T21:05:00+09:00",
      referenceUrl: buildYahooAuctionsSearchUrl("ポケモンカード 151 box"),
    },
  ],
};

export function getCandidateCatalog(locale: AppLocale): CandidateCatalogEntry[] {
  return watchTargetSources.map((target) => ({
    id: target.id,
    slug: target.slug,
    title: target.title[locale],
    brand: target.brand[locale],
    category: getCategoryLabel(target.categoryKey, locale),
    thumbnailUrl: target.fallbackThumbnailUrl,
    shortDescription: target.shortDescription[locale],
    estimatedBuyPrice: target.fallbackBuyPrice,
    estimatedSellPrice: target.fallbackSellPrice,
    shippingCost: 750,
    otherCost: 0,
    riskFlags: target.riskFlags.map((risk) => risk[locale]),
    externalLinks: buildBaseLinks({
      locale,
      officialLabel: target.officialLabel,
      officialUrl: target.officialUrl,
      amazonSearchQuery: target.amazonSearchQuery,
      socialSearchQuery: target.socialSearchQuery,
      resaleSearchQuery: target.resaleSearchQuery,
    }),
  }));
}

export function getWatchTargets(locale: AppLocale): WatchTarget[] {
  return watchTargetSources.map((target) => ({
    candidateSlug: target.slug,
    displayKeyword: target.displayKeyword[locale],
    category: getCategoryLabel(target.categoryKey, locale),
    xQueryTerms: target.xQueryTerms,
    socialQuery: target.socialSearchQuery,
    socialMatchTerms: target.socialMatchTerms,
    socialRequiredTerms: target.socialRequiredTerms,
    socialExcludedTerms: target.socialExcludedTerms,
    amazonSearchQuery: target.amazonSearchQuery,
    amazonMatchTerms: target.amazonMatchTerms,
    amazonRequiredTerms: target.amazonRequiredTerms,
    amazonExcludedTerms: target.amazonExcludedTerms,
    resaleSearchQuery: target.resaleSearchQuery,
    resaleMatchTerms: target.resaleMatchTerms,
    resaleRequiredTerms: target.resaleRequiredTerms,
    resaleExcludedTerms: target.resaleExcludedTerms,
    fallbackBuyPrice: target.fallbackBuyPrice,
    fallbackSellPrice: target.fallbackSellPrice,
    fallbackThumbnailUrl: target.fallbackThumbnailUrl,
    officialUrl: target.officialUrl,
    officialLabel: target.officialLabel[locale],
  }));
}

export function getMockSignalFixtures(locale: AppLocale): Record<ConnectorKind, ConnectorSignal[]> {
  const targets = getWatchTargets(locale);
  const targetsBySlug = new Map(targets.map((target) => [target.candidateSlug, target]));

  return {
    x: mockSignalSource.x.map((signal) => ({
      id: signal.id,
      connector: signal.connector,
      candidateSlug: signal.candidateSlug,
      keyword: targetsBySlug.get(signal.candidateSlug)?.displayKeyword ?? "",
      category: targetsBySlug.get(signal.candidateSlug)?.category ?? "",
      metricLabel: signal.metricLabel[locale],
      metricValue: signal.metricValue,
      strength: signal.strength,
      summary: signal.summary[locale],
      observedAt: signal.observedAt,
      referenceUrl: signal.referenceUrl,
      verification: {
        status: "verified",
        summary:
          locale === "ja"
            ? "複数の公開 SNS 投稿で確認済みのモック根拠です。"
            : "Mock evidence marked as verified across multiple public social posts.",
        evidenceCount: 2,
      },
      evidence: [
        {
          id: `${signal.id}-search`,
          label: locale === "ja" ? "検索結果を確認" : "Open search results",
          url: signal.referenceUrl,
          sourceLabel: locale === "ja" ? "公開 SNS 検索" : "Public social search",
          observedAt: signal.observedAt,
        },
      ],
    })),
    amazon: mockSignalSource.amazon.map((signal) => ({
      id: signal.id,
      connector: signal.connector,
      candidateSlug: signal.candidateSlug,
      keyword: targetsBySlug.get(signal.candidateSlug)?.displayKeyword ?? "",
      category: targetsBySlug.get(signal.candidateSlug)?.category ?? "",
      metricLabel: signal.metricLabel[locale],
      metricValue: signal.metricValue,
      strength: signal.strength,
      summary: signal.summary[locale],
      observedAt: signal.observedAt,
      referenceUrl: signal.referenceUrl,
      verification: {
        status: "verified",
        summary:
          locale === "ja"
            ? "Amazon の実在検索リンクを使ったモック価格です。"
            : "Mock price tied to a real Amazon search URL.",
        evidenceCount: 1,
      },
      evidence: [
        {
          id: `${signal.id}-amazon`,
          label: locale === "ja" ? "Amazon 検索を開く" : "Open Amazon search",
          url: signal.referenceUrl,
          sourceLabel: "Amazon",
          observedAt: signal.observedAt,
        },
      ],
    })),
    keepa: mockSignalSource.keepa.map((signal) => ({
      id: signal.id,
      connector: signal.connector,
      candidateSlug: signal.candidateSlug,
      keyword: targetsBySlug.get(signal.candidateSlug)?.displayKeyword ?? "",
      category: targetsBySlug.get(signal.candidateSlug)?.category ?? "",
      metricLabel: signal.metricLabel[locale],
      metricValue: signal.metricValue,
      strength: signal.strength,
      summary: signal.summary[locale],
      observedAt: signal.observedAt,
      referenceUrl: signal.referenceUrl,
      verification: {
        status: "mixed",
        summary:
          locale === "ja"
            ? "国内相場を模したモック値です。live path では公開相場検索を参照します。"
            : "Mock reference price modeled after a public domestic market search.",
        evidenceCount: 1,
      },
      evidence: [
        {
          id: `${signal.id}-market`,
          label: locale === "ja" ? "相場検索を開く" : "Open market search",
          url: signal.referenceUrl,
          sourceLabel: locale === "ja" ? "Yahoo!オークション" : "Yahoo! Auctions",
          observedAt: signal.observedAt,
        },
      ],
    })),
  };
}
