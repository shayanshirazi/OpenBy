/**
 * SerpAPI Google Search - fetch related tweets for a product.
 * Uses engine=google with "product twitter" query to get twitter_results.
 */

import type { PostMetrics } from "./social-virality";

export type TweetItem = {
  link: string;
  snippet: string;
  publishedDate?: string;
  thumbnail?: string;
  authorName?: string;
  authorHandle?: string;
};

export type SerpApiSocialResult = {
  items: TweetItem[];
  error?: string;
};

function buildSocialQuery(productName: string): string {
  const words = productName
    .replace(/\([^)]*\)/g, "")
    .replace(/["'`]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^\d+$/.test(w))
    .slice(0, 4);
  return `${words.join(" ")} twitter`.trim() || "tech product twitter";
}

function flattenTweets(raw: unknown): TweetItem[] {
  const tweets: TweetItem[] = [];
  const arr = Array.isArray(raw) ? raw : [];

  for (const t of arr) {
    const item = t as Record<string, unknown>;
    const link = item.link ?? item.link_url;
    const snippet = item.snippet ?? item.title;
    if (!link || !snippet) continue;

    const author = item.author as Record<string, unknown> | undefined;
    tweets.push({
      link: String(link),
      snippet: String(snippet),
      publishedDate: item.published_date ? String(item.published_date) : undefined,
      thumbnail: item.thumbnail ? String(item.thumbnail) : undefined,
      authorName: author?.name ? String(author.name) : undefined,
      authorHandle: author?.handle ? String(author.handle) : undefined,
    });
  }

  return tweets;
}

/**
 * Fetch related tweets from SerpAPI (Google search with twitter results).
 */
export async function fetchRelatedTweets(productName: string): Promise<SerpApiSocialResult> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return { items: [], error: "SERPAPI_API_KEY is not configured" };
  }

  const query = buildSocialQuery(productName);
  const params = new URLSearchParams({
    engine: "google",
    q: query,
    gl: "us",
    hl: "en",
    api_key: apiKey,
  });

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`SerpAPI error: ${res.status}`);
    }

    const json = (await res.json()) as {
      twitter_results?: {
        tweets?: unknown;
      };
      error?: string;
    };

    if (json.error) {
      return { items: [], error: json.error };
    }

    const tweetsRaw = json.twitter_results?.tweets;
    const items = flattenTweets(tweetsRaw ?? []);

    return { items: items.slice(0, 6) };
  } catch (err) {
    console.error("SerpAPI Social fetch error:", err);
    return {
      items: [],
      error: err instanceof Error ? err.message : "Failed to fetch tweets",
    };
  }
}

/** Parse date string to timestamp (ms). Returns now if unparseable. */
function parseDate(s: string | undefined): number {
  if (!s) return Date.now();
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? Date.now() : d.getTime();
}

/**
 * Convert SerpAPI tweets to PostMetrics for virality calculation.
 * Estimates reach, engagement from position (higher in results = more reach/engagement)
 * and content length. Use real engagement API when available.
 */
export function tweetsToPostMetrics(items: TweetItem[]): PostMetrics[] {
  const now = Date.now();
  return items.map((item, i) => {
    const position = i + 1;
    const rankFactor = Math.max(0.2, 1 - position * 0.12);
    const contentFactor = Math.min(1.5, 0.5 + (item.snippet?.length ?? 0) / 200);
    const reach = Math.round(300 * rankFactor * contentFactor + 100);
    const likes = Math.round(15 * rankFactor * contentFactor + 2);
    const comments = Math.round(4 * rankFactor * contentFactor + 1);
    const shares = Math.round(3 * rankFactor * contentFactor);
    const timestamp = parseDate(item.publishedDate) || now - (items.length - i) * 86400000;
    return { reach, likes, comments, shares, timestamp };
  });
}

export type SocialMetricsResult = {
  postMetrics: PostMetrics[];
  items: TweetItem[];
  error?: string;
};

/** Fetch tweets and convert to post metrics for virality scoring. */
export async function fetchSocialPostMetrics(
  productName: string
): Promise<SocialMetricsResult> {
  const { items, error } = await fetchRelatedTweets(productName);
  const postMetrics = tweetsToPostMetrics(items);
  return { postMetrics, items, error };
}
