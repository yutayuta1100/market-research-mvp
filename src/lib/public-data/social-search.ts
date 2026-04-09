import type { AppLocale } from "@/lib/i18n";
import type { SignalEvidence, SignalVerification, WatchTarget } from "@/lib/connectors/types";
import { buildSocialSearchUrl } from "@/lib/config/watch-targets";
import {
  buildAbsoluteUrl,
  countMatchedTerms,
  fetchTextWithTimeout,
  getHostnameLabel,
  matchesAllTerms,
  matchesAnyExcludedTerm,
  stripHtmlTags,
} from "@/lib/public-data/common";

interface SocialSearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  sourceLabel: string;
  observedAt?: string;
  matchedTerms: number;
  matchScore: number;
}

export interface SocialSignalSnapshot {
  metricValue: number;
  strength: number;
  summary: string;
  observedAt: string;
  referenceUrl: string;
  evidence: SignalEvidence[];
  verification: SignalVerification;
}

const allowedDomains = [
  "youtube.com",
  "instagram.com",
  "reddit.com",
  "x.com",
  "tiktok.com",
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function toSourceLabel(url: string) {
  const hostname = getHostnameLabel(url);

  if (!hostname) {
    return "Social";
  }

  if (hostname.includes("youtube.com")) {
    return "YouTube";
  }

  if (hostname.includes("instagram.com")) {
    return "Instagram";
  }

  if (hostname.includes("reddit.com")) {
    return "Reddit";
  }

  if (hostname.includes("x.com")) {
    return "X";
  }

  if (hostname.includes("tiktok.com")) {
    return "TikTok";
  }

  return hostname;
}

function parseObservedAt(metaHtml: string) {
  const match = /(\d{4}\/\d{1,2}\/\d{1,2})/.exec(metaHtml);

  if (!match?.[1]) {
    return undefined;
  }

  const parsed = new Date(match[1].replace(/\//g, "-"));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function buildVerification(locale: AppLocale, args: {
  evidenceCount: number;
  distinctDomains: number;
}) {
  const status: SignalVerification["status"] =
    args.evidenceCount >= 2 && args.distinctDomains >= 2
      ? "verified"
      : args.evidenceCount >= 1
        ? "mixed"
        : "unverified";

  const summary =
    locale === "ja"
      ? status === "verified"
        ? `${args.distinctDomains} つの公開ソーシャル面から ${args.evidenceCount} 件の一致を確認しました。`
        : status === "mixed"
          ? `${args.evidenceCount} 件の公開ソーシャル一致はありますが、独立した追加ソースの確認余地があります。`
          : "一致する公開ソーシャル結果は確認できませんでした。"
      : status === "verified"
        ? `Confirmed ${args.evidenceCount} matching social results across ${args.distinctDomains} public sources.`
        : status === "mixed"
          ? `${args.evidenceCount} public social result${args.evidenceCount === 1 ? "" : "s"} matched, but more independent confirmation would help.`
          : "No matching public social results were confirmed.";

  return {
    status,
    summary,
    evidenceCount: args.evidenceCount,
  } satisfies SignalVerification;
}

export function parseSocialSearchHtml(args: {
  html: string;
  matchTerms: string[];
  requiredTerms?: string[];
  excludedTerms?: string[];
}) {
  const results: SocialSearchResult[] = [];
  const pattern = /<li><a href="([^"]+)"[^>]*>(.*?)<\/a><div>(.*?)<\/div><em>(.*?)<\/em><\/li>/gs;
  const requiredTerms = args.requiredTerms ?? [];
  const excludedTerms = args.excludedTerms ?? [];

  for (const match of args.html.matchAll(pattern)) {
    const rawUrl = match[1] ?? "";
    const title = stripHtmlTags(match[2] ?? "");
    const metaHtml = match[3] ?? "";
    const snippet = stripHtmlTags(metaHtml);
    const sourceText = stripHtmlTags(match[4] ?? "");
    const url = buildAbsoluteUrl("https://search.yahoo.co.jp", rawUrl);
    const hostname = getHostnameLabel(url);

    if (
      !url ||
      !hostname ||
      url.includes("/playlist?") ||
      !allowedDomains.some((domain) => hostname.endsWith(domain))
    ) {
      continue;
    }

    const combinedText = `${title} ${snippet}`.trim();
    const matchedTerms = countMatchedTerms(combinedText, args.matchTerms);

    if (
      matchedTerms === 0 ||
      !matchesAllTerms(combinedText, requiredTerms) ||
      matchesAnyExcludedTerm(combinedText, excludedTerms)
    ) {
      continue;
    }

    results.push({
      id: `${hostname}-${results.length + 1}`,
      title,
      url,
      snippet,
      sourceLabel: sourceText || toSourceLabel(url),
      observedAt: parseObservedAt(metaHtml),
      matchedTerms,
      matchScore: matchedTerms * 10 + requiredTerms.length * 6,
    });
  }

  return results
    .sort((left, right) => {
      if (right.matchScore !== left.matchScore) {
        return right.matchScore - left.matchScore;
      }

      return (right.observedAt ?? "").localeCompare(left.observedAt ?? "");
    })
    .filter((result, index, collection) => collection.findIndex((entry) => entry.url === result.url) === index);
}

export function normalizeSocialSearch(args: {
  locale: AppLocale;
  target: WatchTarget;
  queryUrl: string;
  html: string;
}) {
  const matchedResults = parseSocialSearchHtml({
    html: args.html,
    matchTerms: args.target.socialMatchTerms,
    requiredTerms: args.target.socialRequiredTerms,
    excludedTerms: args.target.socialExcludedTerms,
  });

  if (matchedResults.length === 0) {
    return null;
  }

  const evidence = matchedResults.slice(0, 3).map((result) => ({
    id: result.id,
    label: result.title,
    url: result.url,
    sourceLabel: toSourceLabel(result.url),
    summary: result.snippet,
    observedAt: result.observedAt,
  }));
  const distinctDomains = new Set(evidence.map((entry) => entry.sourceLabel)).size;
  const verification = buildVerification(args.locale, {
    evidenceCount: evidence.length,
    distinctDomains,
  });
  const observedAt =
    evidence
      .map((entry) => entry.observedAt)
      .filter((entry): entry is string => Boolean(entry))
      .sort((left, right) => right.localeCompare(left))[0] ?? new Date().toISOString();
  const strength = clamp(matchedResults.length * 12 + distinctDomains * 10, 0, 100);

  return {
    metricValue: matchedResults.length,
    strength,
    summary:
      args.locale === "ja"
        ? `公開 SNS 検索で ${matchedResults.length} 件の一致を検出しました。${verification.summary}`
        : `Detected ${matchedResults.length} matching public social results. ${verification.summary}`,
    observedAt,
    referenceUrl: args.queryUrl,
    evidence,
    verification,
  } satisfies SocialSignalSnapshot;
}

export async function fetchSocialSignalSnapshot(args: {
  locale: AppLocale;
  target: WatchTarget;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
  revalidateSeconds?: number;
}) {
  const queryUrl = buildSocialSearchUrl(args.target.socialQuery);
  const html = await fetchTextWithTimeout({
    url: queryUrl,
    timeoutMs: args.timeoutMs,
    fetchImpl: args.fetchImpl,
    revalidateSeconds: args.revalidateSeconds,
  });

  return normalizeSocialSearch({
    locale: args.locale,
    target: args.target,
    queryUrl,
    html,
  });
}
