import type { AppLocale } from "@/lib/i18n";
import type { SignalEvidence, WatchTarget } from "@/lib/connectors/types";
import { buildYahooAuctionsSearchUrl } from "@/lib/config/watch-targets";
import {
  countMatchedTerms,
  decodeHtmlEntities,
  fetchTextWithTimeout,
  matchesAllTerms,
  matchesAnyExcludedTerm,
  median,
  parsePriceNumber,
} from "@/lib/public-data/common";

export interface ResaleMarketSnapshot {
  estimatedSellPrice: number;
  summary: string;
  observedAt: string;
  referenceUrl: string;
  evidence: SignalEvidence[];
}

interface YahooAuctionListing {
  id: string;
  title: string;
  price: number;
  url: string;
  imageUrl?: string;
  matchedTerms: number;
  matchScore: number;
}

function extractAttribute(tag: string, attribute: string) {
  const pattern = new RegExp(`${attribute}="([^"]*)"`);
  const match = pattern.exec(tag);
  return match?.[1] ? decodeHtmlEntities(match[1]) : "";
}

export function parseYahooAuctionsHtml(args: {
  html: string;
  matchTerms: string[];
  requiredTerms?: string[];
  excludedTerms?: string[];
}) {
  const pattern = /<a[^>]+class="[^"]*Product__titleLink[^"]*"[^>]*>/g;

  const listings: YahooAuctionListing[] = [];
  const seenIds = new Set<string>();

  for (const match of args.html.matchAll(pattern)) {
    const tag = match[0] ?? "";
    const url = extractAttribute(tag, "href");
    const id = extractAttribute(tag, "data-auction-id");
    const title = extractAttribute(tag, "data-auction-title");
    const imageUrl = extractAttribute(tag, "data-auction-img");
    const price = parsePriceNumber(extractAttribute(tag, "data-auction-price"));
    const matchedTerms = countMatchedTerms(title, args.matchTerms);
    const requiredTerms = args.requiredTerms ?? [];
    const excludedTerms = args.excludedTerms ?? [];

    if (
      !url ||
      !id ||
      !title ||
      price === null ||
      seenIds.has(id) ||
      matchedTerms === 0 ||
      !matchesAllTerms(title, requiredTerms) ||
      matchesAnyExcludedTerm(title, excludedTerms)
    ) {
      continue;
    }

    seenIds.add(id);
    listings.push({
      id,
      title,
      price,
      url,
      imageUrl: imageUrl || undefined,
      matchedTerms,
      matchScore: matchedTerms * 10 + requiredTerms.length * 6,
    });
  }

  return listings.sort((left, right) => {
    if (right.matchScore !== left.matchScore) {
      return right.matchScore - left.matchScore;
    }

    return left.price - right.price;
  });
}

export async function fetchYahooAuctionsSnapshot(args: {
  locale: AppLocale;
  target: WatchTarget;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
  revalidateSeconds?: number;
}) {
  const searchUrl = buildYahooAuctionsSearchUrl(args.target.resaleSearchQuery);
  const html = await fetchTextWithTimeout({
    url: searchUrl,
    timeoutMs: args.timeoutMs,
    fetchImpl: args.fetchImpl,
    revalidateSeconds: args.revalidateSeconds,
  });

  const listings = parseYahooAuctionsHtml({
    html,
    matchTerms: args.target.resaleMatchTerms,
    requiredTerms: args.target.resaleRequiredTerms,
    excludedTerms: args.target.resaleExcludedTerms,
  }).slice(0, 5);

  const prices = listings.map((listing) => listing.price);
  const estimatedSellPrice = median(prices);

  if (estimatedSellPrice === null) {
    return null;
  }

  const observedAt = new Date().toISOString();

  return {
    estimatedSellPrice,
    summary:
      args.locale === "ja"
        ? `Yahoo!オークション上位 ${listings.length} 件の現在価格中央値を参考売価に使っています。`
        : `Using the median current price across the top ${listings.length} Yahoo! Auctions matches as the reference sell price.`,
    observedAt,
    referenceUrl: listings[0]?.url ?? searchUrl,
    evidence: listings.map((listing) => ({
      id: listing.id,
      label: listing.title,
      url: listing.url,
      sourceLabel: args.locale === "ja" ? "Yahoo!オークション" : "Yahoo! Auctions",
      summary:
        args.locale === "ja"
          ? `現在価格 ${listing.price.toLocaleString("ja-JP")} 円`
          : `Current listing JPY ${listing.price.toLocaleString("ja-JP")}`,
      observedAt,
    })),
  } satisfies ResaleMarketSnapshot;
}
