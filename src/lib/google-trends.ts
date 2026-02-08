/**
 * Google Trends data fetching and analysis.
 * Uses SerpAPI Google Trends Interest Over Time (reliable).
 * Falls back to google-trends-api if SerpAPI is not configured (may be throttled by Google).
 */

import https from "https";
import googleTrends from "google-trends-api";
import { CATEGORIES } from "@/lib/categories";

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 4,
});

export type TrendDataPoint = {
  date: string;
  formattedTime: string;
  value: number;
};

export type GoogleTrendsResult = {
  score: number; // 0-100
  dataPoints: TrendDataPoint[];
  error?: string;
  keywordUsed?: string;
};

/** Map product category name to a good Google Trends search term */
function getCategoryTrendKeyword(category: string | null | undefined): string | null {
  if (!category?.trim()) return null;
  const normalized = category.trim().toLowerCase();
  const match = CATEGORIES.find(
    (c) => c.name.toLowerCase() === normalized || c.query === normalized
  );
  return match?.query ?? normalized;
}

/** Extract brand (first word) from product title if it looks like a brand */
function extractBrand(title: string): string | null {
  const first = title.trim().split(/\s+/)[0];
  if (!first || first.length < 2) return null;
  if (/^\d|^\d+"/.test(first)) return null;
  if (first[0] === first[0]?.toUpperCase() && first.length <= 15) return first;
  return null;
}

/** Known descriptor/feature words that combine well with product types for Trends */
const DESCRIPTOR_WORDS = new Set([
  "wireless", "bluetooth", "mechanical", "noise", "cancelling", "canceling",
  "4k", "uhd", "ips", "oled", "qled", "gaming", "portable", "compact",
  "rgb", "led", "smart", "premium", "pro", "mini", "ultra", "max",
  "external", "internal", "wireless", "noise-cancelling", "noise-canceling",
  "gaming", "mechanical", "wireless", "smart", "curved", "flat",
]);

/** Product-type words often found in titles */
const PRODUCT_TYPE_WORDS = new Set([
  "keyboard", "keyboards", "headphones", "headphone", "earbuds", "earbud",
  "monitor", "monitors", "laptop", "laptops", "phone", "phones", "smartphone",
  "tablet", "tablets", "camera", "cameras", "watch", "watches", "smartwatch",
  "speaker", "speakers", "mouse", "ssd", "drive", "drives", "tv", "tvs",
  "gpu", "cpu", "ram", "motherboard", "controller", "headset", "webcam",
]);

/** Extract descriptor + product-type phrases from title (e.g. "wireless mechanical keyboard") */
function extractDescriptorPhrases(title: string, categoryKeyword: string | null): string[] {
  const lower = title.toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/["'`]/g, ""); // strip quotes early to avoid bad keywords
  const words = lower
    .replace(/[\d."]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !/^\d+$/.test(w) && !/^[a-z]\d$/i.test(w));

  const descriptors: string[] = [];
  const productTypes: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const next = words[i + 1];
    const twoWord = next ? `${w} ${next}` : w;

    if (["noise cancelling", "noise canceling"].includes(twoWord)) {
      descriptors.push("noise cancelling");
      i++;
      continue;
    }
    if (DESCRIPTOR_WORDS.has(w)) {
      descriptors.push(w);
    }
    if (PRODUCT_TYPE_WORDS.has(w)) {
      productTypes.push(w);
    }
  }

  if (categoryKeyword && !productTypes.some((p) => p.includes(categoryKeyword) || categoryKeyword.includes(p))) {
    productTypes.push(categoryKeyword);
  }

  const phrases: string[] = [];
  const baseType = productTypes[0] ?? categoryKeyword;
  if (baseType) {
    phrases.push(baseType);
    for (const d of descriptors.slice(0, 3)) {
      phrases.push(`${d} ${baseType}`);
    }
    if (descriptors.length >= 2) {
      phrases.push(`${descriptors.slice(0, 2).join(" ")} ${baseType}`);
    }
  }
  return [...new Set(phrases)];
}

/** Get meaningful word sequences from product title */
function getProductNameKeywords(productName: string): string[] {
  const words = productName
    .replace(/\([^)]*\)/g, "")
    .replace(/["'`]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^\d+$/.test(w));
  const result: string[] = [];
  for (let n = 4; n >= 2; n--) {
    const phrase = words.slice(0, n).join(" ").trim();
    if (phrase.length >= 4) result.push(phrase);
  }
  return result;
}

/**
 * Build keyword candidates. Prioritize category so trends always work
 * (category terms like "keyboard", "headphones" are reliable in Google Trends).
 */
function buildKeywordCandidates(
  productName: string,
  category: string | null | undefined
): string[] {
  const candidates: string[] = [];
  const catKeyword = getCategoryTrendKeyword(category);
  const brand = extractBrand(productName);
  const descriptorPhrases = extractDescriptorPhrases(productName, catKeyword ?? null);

  // 1. Category first – most reliable, works always
  if (catKeyword) {
    candidates.push(catKeyword);
  }

  // 2. Descriptor + product type (e.g. "wireless mechanical keyboard")
  for (const p of descriptorPhrases) {
    if (p.length >= 4 && !candidates.includes(p)) candidates.push(p);
  }

  // 3. Brand + category
  if (brand && catKeyword) {
    candidates.push(`${brand} ${catKeyword}`);
  }

  // 4. Brand + descriptor + type
  if (brand) {
    for (const p of descriptorPhrases) {
      if (p.length >= 4 && !candidates.includes(`${brand} ${p}`)) {
        candidates.push(`${brand} ${p}`);
      }
    }
  }

  // 5. Product name phrases – fallback
  for (const kw of getProductNameKeywords(productName)) {
    if (!candidates.includes(kw)) candidates.push(kw);
  }

  return [...new Set(candidates)];
}

/** Sanitize keyword for Google Trends API - removes chars that cause 400 Bad Request */
function sanitizeKeyword(keyword: string): string {
  return keyword
    .replace(/["'`]/g, "") // strip quotes that break requests
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100); // Google has max length limits
}

/** Fetch trends via SerpAPI (reliable, requires SERPAPI_API_KEY) */
async function fetchTrendsViaSerpAPI(keyword: string): Promise<{
  dataPoints: TrendDataPoint[];
  score: number;
} | null> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey?.trim()) return null;

  const sanitized = sanitizeKeyword(keyword);
  if (!sanitized || sanitized.length < 2) return null;

  const params = new URLSearchParams({
    engine: "google_trends",
    q: sanitized,
    data_type: "TIMESERIES",
    geo: "US",
    hl: "en",
    date: "today 1-m",
    api_key: apiKey,
  });

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      interest_over_time?: {
        timeline_data?: Array<{
          date?: string;
          values?: Array<{ query?: string; value?: string; extracted_value?: number }>;
        }>;
        averages?: Array<{ query?: string; value?: number }>;
      };
    };

    const timeline = json.interest_over_time?.timeline_data ?? [];
    const dataPoints: TrendDataPoint[] = [];
    let sum = 0;
    let count = 0;

    for (const point of timeline) {
      const val = point.values?.[0];
      const num = val?.extracted_value ?? (val?.value ? parseInt(String(val.value), 10) : NaN);
      if (!Number.isNaN(num) && num >= 0) {
        const dateStr = point.date ?? "";
        dataPoints.push({
          date: dateStr,
          formattedTime: dateStr,
          value: num,
        });
        sum += num;
        count++;
      }
    }

    if (dataPoints.length === 0) return null;

    const avgFromTimeline = count > 0 ? sum / count : 0;
    const avgFromApi = json.interest_over_time?.averages?.[0]?.value;
    const score =
      typeof avgFromApi === "number"
        ? Math.round(Math.min(100, Math.max(0, avgFromApi)))
        : Math.round(Math.min(100, Math.max(0, avgFromTimeline)));

    return { dataPoints, score };
  } catch {
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Request timed out")), ms);
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}

async function fetchTrendsForKeyword(keyword: string): Promise<{
  dataPoints: TrendDataPoint[];
  score: number;
}> {
  const sanitized = sanitizeKeyword(keyword);
  if (!sanitized || sanitized.length < 2) {
    return { dataPoints: [], score: 50 };
  }

  const endTime = new Date();
  const startTime = new Date();
  startTime.setMonth(startTime.getMonth() - 1); // 1 month for faster, more reliable response

  let res: unknown;
  try {
    res = await googleTrends.interestOverTime({
      keyword: sanitized,
      startTime,
      endTime,
      geo: "US",
      agent: httpsAgent,
    });
  } catch {
    return { dataPoints: [], score: 50 };
  }

  const str = typeof res === "string" ? res : String(res);
  if (str.startsWith("<") || str.startsWith("<!") || str.includes("<HTML>") || str.includes("<html")) {
    return { dataPoints: [], score: 50 };
  }

  type TimelinePoint = { time: string; formattedTime: string; formattedAxisTime: string; value?: (number | string)[] };
  let timelineData: TimelinePoint[] = [];
  try {
    const jsonStr = str.startsWith(")") ? str.slice(Math.max(str.indexOf("{"), 0)) : str;
    const parsed = JSON.parse(jsonStr) as { default?: { timelineData?: TimelinePoint[] }; timelineData?: TimelinePoint[] };
    timelineData = parsed?.default?.timelineData ?? parsed?.timelineData ?? [];
  } catch {
    return { dataPoints: [], score: 50 };
  }
  const dataPoints: TrendDataPoint[] = [];
  let sum = 0;
  let count = 0;

  for (const point of timelineData) {
    const raw = point.value?.[0];
    const num =
      typeof raw === "number" ? raw : parseInt(String(raw ?? 0), 10);
    if (!Number.isNaN(num)) {
      dataPoints.push({
        date: point.formattedAxisTime ?? point.formattedTime ?? point.time,
        formattedTime: point.formattedTime ?? point.formattedAxisTime ?? "",
        value: num,
      });
      sum += num;
      count++;
    }
  }

  const score =
    count > 0 ? Math.round(Math.min(100, Math.max(0, sum / count))) : 50;
  return { dataPoints, score };
}

/**
 * Fetch Google Trends interest over time for the past month.
 * Uses SerpAPI first (reliable), falls back to google-trends-api if needed.
 * Tries multiple keyword strategies (category first) and uses the best result.
 */
export async function getGoogleTrendsData(
  productName: string,
  category?: string | null
): Promise<GoogleTrendsResult> {
  const rawKeywords = buildKeywordCandidates(productName, category);
  const keywords = [...new Set(rawKeywords
    .map(sanitizeKeyword)
    .filter((k) => k.length >= 2))];

  // 1. Try SerpAPI first (reliable, no throttling)
  for (const keyword of keywords) {
    const result = await fetchTrendsViaSerpAPI(keyword);
    if (result && result.dataPoints.length > 0) {
      return {
        score: result.score,
        dataPoints: result.dataPoints,
        keywordUsed: keyword,
      };
    }
    await new Promise((r) => setTimeout(r, 200)); // brief delay between keywords
  }

  // 2. Fallback to google-trends-api (may be throttled/blocked by Google)
  for (const keyword of keywords) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const { dataPoints, score } = await withTimeout(
          fetchTrendsForKeyword(keyword),
          REQUEST_TIMEOUT_MS
        );

        if (dataPoints.length > 0) {
          return {
            score,
            dataPoints,
            keywordUsed: keyword,
          };
        }
      } catch {
        if (attempt === MAX_RETRIES) {
          break;
        }
        await new Promise((r) => setTimeout(r, 600));
      }
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  return {
    score: 50,
    dataPoints: [],
    error: "Could not fetch trend data. Using neutral score.",
    keywordUsed: keywords.length > 0 ? keywords[0] : undefined,
  };
}
