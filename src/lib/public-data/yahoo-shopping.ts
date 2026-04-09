import type { WatchTarget } from "@/lib/connectors/types";
import { buildYahooShoppingSearchUrl } from "@/lib/config/watch-targets";
import type { AmazonProductSnapshot } from "@/lib/public-data/amazon-search";
import {
  countMatchedTerms,
  decodeHtmlEntities,
  fetchTextWithTimeout,
  matchesAllTerms,
  matchesAnyExcludedTerm,
} from "@/lib/public-data/common";

function extractBeaconValue(beacon: string, key: string) {
  const pattern = new RegExp(`(?:^|;)${key}:([^;]*)`);
  return decodeHtmlEntities(pattern.exec(beacon)?.[1] ?? "").trim();
}

export function parseYahooShoppingSearchHtml(args: {
  html: string;
  queryUrl: string;
  matchTerms: string[];
  requiredTerms?: string[];
  excludedTerms?: string[];
}) {
  const pattern =
    /<a[^>]+href="(https:\/\/store\.shopping\.yahoo\.co\.jp\/[^"]+)"[^>]+data-beacon="([^"]+)"[^>]*>/g;
  const requiredTerms = args.requiredTerms ?? [];
  const excludedTerms = args.excludedTerms ?? [];
  const snapshots: AmazonProductSnapshot[] = [];
  const seenIds = new Set<string>();

  for (const match of args.html.matchAll(pattern)) {
    const productUrl = decodeHtmlEntities(match[1] ?? "");
    const beacon = decodeHtmlEntities(match[2] ?? "");
    const title = extractBeaconValue(beacon, "tname");
    const id = extractBeaconValue(beacon, "itm_uuid") || extractBeaconValue(beacon, "pid") || productUrl;
    const priceText =
      extractBeaconValue(beacon, "apld_prc") ||
      extractBeaconValue(beacon, "prc") ||
      extractBeaconValue(beacon, "o_prc");
    const imageUrl = extractBeaconValue(beacon, "img");
    const matchedTerms = countMatchedTerms(title, args.matchTerms);
    const price = Number(priceText);

    if (
      !productUrl ||
      !title ||
      !id ||
      !Number.isFinite(price) ||
      seenIds.has(id) ||
      matchedTerms === 0 ||
      !matchesAllTerms(title, requiredTerms) ||
      matchesAnyExcludedTerm(title, excludedTerms)
    ) {
      continue;
    }

    seenIds.add(id);
    snapshots.push({
      asin: id,
      title,
      price,
      imageUrl: imageUrl || undefined,
      productUrl,
      queryUrl: args.queryUrl,
      matchedTerms,
      matchScore: matchedTerms * 10 + requiredTerms.length * 6,
      source: "yahoo-shopping",
      sourceLabel: "Yahoo! Shopping",
    });
  }

  return snapshots.sort((left, right) => {
    if (right.matchScore !== left.matchScore) {
      return right.matchScore - left.matchScore;
    }

    return left.price - right.price;
  });
}

export async function fetchYahooShoppingProductSnapshot(args: {
  target: WatchTarget;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
  revalidateSeconds?: number;
}) {
  const queryUrl = buildYahooShoppingSearchUrl(args.target.amazonSearchQuery);
  const html = await fetchTextWithTimeout({
    url: queryUrl,
    timeoutMs: args.timeoutMs,
    fetchImpl: args.fetchImpl,
    revalidateSeconds: args.revalidateSeconds,
  });

  return (
    parseYahooShoppingSearchHtml({
      html,
      queryUrl,
      matchTerms: args.target.amazonMatchTerms,
      requiredTerms: args.target.amazonRequiredTerms,
      excludedTerms: args.target.amazonExcludedTerms,
    })[0] ?? null
  );
}
