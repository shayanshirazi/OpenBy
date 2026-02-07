/**
 * SerpAPI Google Forums + Google Trends - social presence data that doesn't rely on Twitter.
 * Uses engine=google_forums for Reddit/Quora discussions and engine=google_trends for
 * related queries, rising trends, and YouTube interest.
 */

export type ForumItem = {
  title: string;
  link: string;
  source: string;
  snippet?: string;
  displayedMeta?: string;
  commentCount?: number;
  answerCount?: number;
  votes?: number;
};

export type RelatedQueryItem = {
  query: string;
  value: string;
  extractedValue: number;
  type: "top" | "rising";
};

export type SocialExtendedResult = {
  forums: ForumItem[];
  relatedQueries: RelatedQueryItem[];
  risingQueries: RelatedQueryItem[];
  youtubeInterest: number | null;
  error?: string;
};

function buildForumQuery(productName: string): string {
  const words = productName
    .replace(/\([^)]*\)/g, "")
    .replace(/["'`]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^\d+$/.test(w))
    .slice(0, 4);
  return `${words.join(" ")} review reddit`.trim() || "tech product review";
}

function buildTrendsQuery(productName: string): string {
  const words = productName
    .replace(/\([^)]*\)/g, "")
    .replace(/["'`]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^\d+$/.test(w))
    .slice(0, 3);
  return words.join(" ").trim() || "tech";
}

/** Parse "40+ comments" or "1.1K+ answers" to number */
function parseCount(s: string | undefined): number {
  if (!s) return 0;
  const m = s.match(/(\d+(?:\.\d+)?)\s*([KkMm])?\+?\s*(?:comments|answers)/i);
  if (!m) return 0;
  let n = parseFloat(m[1] ?? "0");
  const suffix = (m[2] ?? "").toLowerCase();
  if (suffix === "k") n *= 1000;
  else if (suffix === "m") n *= 1_000_000;
  return Math.round(n);
}

/** Fetch Reddit/Quora discussions via Google Forums API */
export async function fetchForumDiscussions(
  productName: string
): Promise<{ items: ForumItem[]; error?: string }> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return { items: [], error: "SERPAPI_API_KEY is not configured" };
  }

  const query = buildForumQuery(productName);
  const params = new URLSearchParams({
    engine: "google_forums",
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
      throw new Error(`SerpAPI Forums error: ${res.status}`);
    }

    const json = (await res.json()) as {
      organic_results?: Array<{
        title?: string;
        link?: string;
        snippet?: string;
        displayed_meta?: string;
        source?: string;
        sitelinks?: { list?: Array<{ answer_count?: number }> };
        answers?: Array<{ votes?: number }>;
      }>;
      error?: string;
    };

    if (json.error) {
      return { items: [], error: json.error };
    }

    const items: ForumItem[] = [];
    const raw = json.organic_results ?? [];

    for (const r of raw.slice(0, 10)) {
      const title = r.title ?? "";
      const link = r.link ?? "";
      if (!title || !link) continue;

      const commentCount = parseCount(r.displayed_meta);
      const listItem = r.sitelinks?.list?.[0];
      const answerCount = listItem?.answer_count ?? (commentCount || undefined);
      const topVotes = r.answers?.[0]?.votes;

      items.push({
        title,
        link,
        source: r.source ?? "Forum",
        snippet: r.snippet,
        displayedMeta: r.displayed_meta,
        commentCount: commentCount || undefined,
        answerCount: answerCount ?? undefined,
        votes: topVotes,
      });
    }

    return { items };
  } catch (err) {
    console.error("SerpAPI Forums fetch error:", err);
    return {
      items: [],
      error: err instanceof Error ? err.message : "Failed to fetch forums",
    };
  }
}

/** Fetch Google Trends related queries and YouTube interest */
export async function fetchSocialTrends(
  productName: string
): Promise<{
  relatedQueries: RelatedQueryItem[];
  risingQueries: RelatedQueryItem[];
  youtubeInterest: number | null;
  error?: string;
}> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return {
      relatedQueries: [],
      risingQueries: [],
      youtubeInterest: null,
      error: "SERPAPI_API_KEY is not configured",
    };
  }

  const query = buildTrendsQuery(productName);
  if (!query || query.length < 2) {
    return {
      relatedQueries: [],
      risingQueries: [],
      youtubeInterest: null,
    };
  }

  const relatedQueries: RelatedQueryItem[] = [];
  const risingQueries: RelatedQueryItem[] = [];
  let youtubeInterest: number | null = null;

  // 1. Related queries (proxy for hashtags / trending topics)
  try {
    const rqParams = new URLSearchParams({
      engine: "google_trends",
      q: query,
      data_type: "RELATED_QUERIES",
      geo: "US",
      hl: "en",
      date: "today 3-m",
      api_key: apiKey,
    });

    const rqRes = await fetch(`https://serpapi.com/search.json?${rqParams}`, {
      next: { revalidate: 3600 },
    });

    if (rqRes.ok) {
      const rqJson = (await rqRes.json()) as {
        related_queries?: {
          top?: Array<{ query?: string; value?: string; extracted_value?: number }>;
          rising?: Array<{ query?: string; value?: string; extracted_value?: number }>;
        };
      };

      const top = rqJson.related_queries?.top ?? [];
      const rising = rqJson.related_queries?.rising ?? [];

      for (const t of top.slice(0, 8)) {
        if (t.query) {
          relatedQueries.push({
            query: t.query,
            value: t.value ?? "0",
            extractedValue: t.extracted_value ?? 0,
            type: "top",
          });
        }
      }
      for (const r of rising.slice(0, 6)) {
        if (r.query) {
          risingQueries.push({
            query: r.query,
            value: r.value ?? "0",
            extractedValue: r.extracted_value ?? 0,
            type: "rising",
          });
        }
      }
    }
  } catch (err) {
    console.error("SerpAPI Trends related queries error:", err);
  }

  // 2. YouTube interest (social platform search trends)
  try {
    const ytParams = new URLSearchParams({
      engine: "google_trends",
      q: query,
      data_type: "TIMESERIES",
      gprop: "youtube",
      geo: "US",
      hl: "en",
      date: "today 1-m",
      api_key: apiKey,
    });

    const ytRes = await fetch(`https://serpapi.com/search.json?${ytParams}`, {
      next: { revalidate: 3600 },
    });

    if (ytRes.ok) {
      const ytJson = (await ytRes.json()) as {
        interest_over_time?: {
          timeline_data?: Array<{ values?: Array<{ extracted_value?: number }> }>;
          averages?: Array<{ value?: number }>;
        };
      };

      const avg = ytJson.interest_over_time?.averages?.[0]?.value;
      if (typeof avg === "number") {
        youtubeInterest = Math.min(100, Math.max(0, avg));
      } else {
        const timeline = ytJson.interest_over_time?.timeline_data ?? [];
        if (timeline.length > 0) {
          const values = timeline
            .flatMap((t) => t.values ?? [])
            .map((v) => v.extracted_value ?? 0)
            .filter((n) => n > 0);
          if (values.length > 0) {
            const sum = values.reduce((a, b) => a + b, 0);
            youtubeInterest = Math.min(100, Math.max(0, Math.round(sum / values.length)));
          }
        }
      }
    }
  } catch (err) {
    console.error("SerpAPI Trends YouTube error:", err);
  }

  return {
    relatedQueries,
    risingQueries,
    youtubeInterest,
  };
}

/**
 * Compute a 0-100 social presence score from forums + trends.
 * Doesn't rely on Twitter. Higher = more buzz.
 */
export function computeSocialPresenceScore(data: {
  forumCount: number;
  totalComments: number;
  relatedQueryCount: number;
  risingQueryCount: number;
  youtubeInterest: number | null;
}): number {
  const {
    forumCount,
    totalComments,
    relatedQueryCount,
    risingQueryCount,
    youtubeInterest,
  } = data;

  // Weighted components (each contributes up to a portion of 100)
  const forumScore = Math.min(40, forumCount * 4 + Math.min(20, Math.log10(totalComments + 1) * 8));
  const queryScore = Math.min(30, (relatedQueryCount + risingQueryCount * 2) * 3);
  const trendScore = youtubeInterest != null ? Math.min(30, (youtubeInterest / 100) * 30) : 15; // default 15 if no YouTube data

  const raw = forumScore + queryScore + trendScore;
  return Math.round(Math.min(100, Math.max(0, raw)));
}
