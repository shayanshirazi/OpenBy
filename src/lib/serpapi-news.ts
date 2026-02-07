/**
 * SerpAPI Google News - fetch related news for a product.
 */

export type NewsItem = {
  title: string;
  link: string;
  thumbnail?: string;
  snippet?: string;
  source?: string;
  date?: string;
};

export type SerpApiNewsResult = {
  items: NewsItem[];
  error?: string;
};

/**
 * Build a search query from product name - use first meaningful words.
 */
function buildNewsQuery(productName: string): string {
  const words = productName
    .replace(/\([^)]*\)/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^\d+$/.test(w))
    .slice(0, 5);
  return words.join(" ") || "tech product";
}

/**
 * Flatten news_results - handle both flat items and nested stories/highlight.
 */
function flattenNewsResults(results: unknown[]): NewsItem[] {
  const items: NewsItem[] = [];

  for (const item of results) {
    const raw = item as Record<string, unknown>;

    // Direct news item
    if (raw.title && raw.link) {
      const source = (raw.source as { name?: string })?.name;
      items.push({
        title: String(raw.title),
        link: String(raw.link),
        thumbnail: raw.thumbnail ? String(raw.thumbnail) : undefined,
        snippet: raw.snippet ? String(raw.snippet) : undefined,
        source: source ?? undefined,
        date: raw.date ? String(raw.date) : undefined,
      });
    }

    // Nested highlight (topic view)
    const highlight = raw.highlight as Record<string, unknown> | undefined;
    if (highlight?.title && highlight?.link) {
      const source = (highlight.source as { name?: string })?.name;
      items.push({
        title: String(highlight.title),
        link: String(highlight.link),
        thumbnail: highlight.thumbnail ? String(highlight.thumbnail) : undefined,
        snippet: highlight.snippet ? String(highlight.snippet) : undefined,
        source: source ?? undefined,
        date: highlight.date ? String(highlight.date) : undefined,
      });
    }

    // Nested stories
    const stories = raw.stories as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(stories)) {
      for (const story of stories) {
        if (story.title && story.link) {
          const source = (story.source as { name?: string })?.name;
          items.push({
            title: String(story.title),
            link: String(story.link),
            thumbnail: story.thumbnail ? String(story.thumbnail) : undefined,
            snippet: story.snippet ? String(story.snippet) : undefined,
            source: source ?? undefined,
            date: story.date ? String(story.date) : undefined,
          });
        }
      }
    }
  }

  return items;
}

/**
 * Fetch related news from SerpAPI Google News.
 */
export async function fetchRelatedNews(productName: string): Promise<SerpApiNewsResult> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return { items: [], error: "SERPAPI_API_KEY is not configured" };
  }

  const query = buildNewsQuery(productName);
  const params = new URLSearchParams({
    engine: "google_news",
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
      news_results?: unknown[];
      error?: string;
    };

    if (json.error) {
      return { items: [], error: json.error };
    }

    const rawResults = json.news_results ?? [];
    const items = flattenNewsResults(rawResults);

    return { items: items.slice(0, 8) };
  } catch (err) {
    console.error("SerpAPI News fetch error:", err);
    return {
      items: [],
      error: err instanceof Error ? err.message : "Failed to fetch news",
    };
  }
}
