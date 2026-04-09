import type { WatchTarget } from "@/lib/connectors/types";
import { buildAmazonSearchUrl } from "@/lib/config/watch-targets";
import {
  buildAbsoluteUrl,
  countMatchedTerms,
  decodeHtmlEntities,
  fetchTextWithTimeout,
  matchesAllTerms,
  matchesAnyExcludedTerm,
  parsePriceNumber,
} from "@/lib/public-data/common";

export interface AmazonProductSnapshot {
  asin: string;
  title: string;
  price: number;
  imageUrl?: string;
  productUrl: string;
  queryUrl: string;
  matchedTerms: number;
  matchScore: number;
  source: "amazon" | "yahoo-shopping";
  sourceLabel: string;
}

function extractMatch(block: string, pattern: RegExp) {
  const match = pattern.exec(block);
  return match?.[1] ? decodeHtmlEntities(match[1]) : null;
}

export function parseAmazonSearchHtml(args: {
  html: string;
  queryUrl: string;
  matchTerms: string[];
  requiredTerms?: string[];
  excludedTerms?: string[];
}) {
  const blocks = args.html
    .split('data-component-type="s-search-result"')
    .slice(1, 9)
    .map((block) => block.slice(0, 30000));

  const snapshots: AmazonProductSnapshot[] = [];

  for (const block of blocks) {
    const asin = extractMatch(block, /data-asin="([^"]+)"/);
    const title =
      extractMatch(block, /<img class="s-image"[^>]*alt="([^"]+)"/) ??
      extractMatch(block, /<h2[^>]*>.*?<span[^>]*>(.*?)<\/span>/s);
    const href =
      extractMatch(block, /<a[^>]+class="a-link-normal s-no-outline"[^>]+href="([^"]+)"/) ??
      extractMatch(block, /<h2[^>]*>.*?<a[^>]+href="([^"]+)"/s);
    const priceText = extractMatch(block, /<span class="a-offscreen">([^<]+)<\/span>/);
    const imageUrl = extractMatch(block, /<img class="s-image"[^>]*src="([^"]+)"/);
    const price = parsePriceNumber(priceText);
    const matchedTerms = countMatchedTerms(title ?? "", args.matchTerms);
    const requiredTerms = args.requiredTerms ?? [];
    const excludedTerms = args.excludedTerms ?? [];

    if (
      !asin ||
      !title ||
      !href ||
      price === null ||
      matchedTerms === 0 ||
      !matchesAllTerms(title, requiredTerms) ||
      matchesAnyExcludedTerm(title, excludedTerms)
    ) {
      continue;
    }

    snapshots.push({
      asin,
      title,
      price,
      imageUrl: imageUrl ?? undefined,
      productUrl: buildAbsoluteUrl("https://www.amazon.co.jp", href) ?? args.queryUrl,
      queryUrl: args.queryUrl,
      matchedTerms,
      matchScore: matchedTerms * 10 + requiredTerms.length * 6,
      source: "amazon",
      sourceLabel: "Amazon",
    });
  }

  return snapshots.sort((left, right) => {
    if (right.matchScore !== left.matchScore) {
      return right.matchScore - left.matchScore;
    }

    return left.price - right.price;
  });
}

export async function fetchAmazonProductSnapshot(args: {
  target: WatchTarget;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
  revalidateSeconds?: number;
}) {
  const queryUrl = buildAmazonSearchUrl(args.target.amazonSearchQuery);
  const html = await fetchTextWithTimeout({
    url: queryUrl,
    timeoutMs: args.timeoutMs,
    fetchImpl: args.fetchImpl,
    revalidateSeconds: args.revalidateSeconds,
  });

  return (
    parseAmazonSearchHtml({
      html,
      queryUrl,
      matchTerms: args.target.amazonMatchTerms,
      requiredTerms: args.target.amazonRequiredTerms,
      excludedTerms: args.target.amazonExcludedTerms,
    })[0] ?? null
  );
}
