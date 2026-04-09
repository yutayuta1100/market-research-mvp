const defaultUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";

export function normalizeComparableText(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

export function stripHtmlTags(value: string) {
  return decodeHtmlEntities(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function countMatchedTerms(text: string, terms: string[]) {
  const normalizedText = normalizeComparableText(text);
  return terms.reduce((count, term) => {
    const normalizedTerm = normalizeComparableText(term);
    return normalizedTerm && normalizedText.includes(normalizedTerm) ? count + 1 : count;
  }, 0);
}

export function matchesAllTerms(text: string, terms: string[]) {
  if (terms.length === 0) {
    return true;
  }

  const normalizedText = normalizeComparableText(text);

  return terms.every((term) => {
    const normalizedTerm = normalizeComparableText(term);
    return normalizedTerm.length > 0 && normalizedText.includes(normalizedTerm);
  });
}

export function matchesAnyExcludedTerm(text: string, terms: string[]) {
  if (terms.length === 0) {
    return false;
  }

  const normalizedText = normalizeComparableText(text);

  return terms.some((term) => {
    const normalizedTerm = normalizeComparableText(term);
    return normalizedTerm.length > 0 && normalizedText.includes(normalizedTerm);
  });
}

export function parsePriceNumber(value: string | undefined | null) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[^\d]/g, "");
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function median(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middleIndex = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middleIndex] ?? null;
  }

  const left = sorted[middleIndex - 1];
  const right = sorted[middleIndex];

  if (left === undefined || right === undefined) {
    return null;
  }

  return Math.round((left + right) / 2);
}

export function buildAbsoluteUrl(baseUrl: string, value: string | undefined | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}

export function getHostnameLabel(value: string | undefined | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function readResponseText(response: Response) {
  return response.text();
}

export async function fetchTextWithTimeout(args: {
  url: string;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
  userAgent?: string;
  headers?: Record<string, string>;
  revalidateSeconds?: number;
}) {
  const fetchImpl = args.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), args.timeoutMs);

  try {
    const requestInit: RequestInit & { next?: { revalidate: number } } = {
      cache: "force-cache",
      headers: {
        "user-agent": args.userAgent ?? defaultUserAgent,
        "accept-language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
        ...args.headers,
      },
      signal: controller.signal,
    };

    if (args.revalidateSeconds) {
      requestInit.next = {
        revalidate: args.revalidateSeconds,
      };
    }

    const response = await fetchImpl(args.url, requestInit);

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}: ${response.statusText}`);
    }

    return readResponseText(response);
  } finally {
    clearTimeout(timeoutHandle);
  }
}

export async function fetchJsonWithTimeout<T>(args: {
  url: string;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
  userAgent?: string;
  headers?: Record<string, string>;
  revalidateSeconds?: number;
}) {
  const text = await fetchTextWithTimeout({
    ...args,
    headers: {
      Accept: "application/json",
      ...args.headers,
    },
  });

  return JSON.parse(text) as T;
}
