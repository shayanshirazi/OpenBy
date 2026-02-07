/**
 * Google Trends data fetching and analysis.
 * Uses google-trends-api for interest over time.
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
/** Offset applied to all trend values so scores don't appear inflated */
const TREND_OFFSET = 15;

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
  const lower = title.toLowerCase().replace(/\([^)]*\)/g, "");
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
 * Build keyword candidates. Prioritize descriptor+type phrases (e.g. "wireless mechanical keyboard"),
 * then brand+category, category, and product name variations.
 */
function buildKeywordCandidates(
  productName: string,
  category: string | null | undefined
): string[] {
  const candidates: string[] = [];
  const catKeyword = getCategoryTrendKeyword(category);
  const brand = extractBrand(productName);

  // 1. Descriptor + product type (e.g. "wireless mechanical keyboard", "noise cancelling headphones")
  const descriptorPhrases = extractDescriptorPhrases(productName, catKeyword ?? null);
  for (const p of descriptorPhrases) {
    if (p.length >= 4) candidates.push(p);
  }

  // 2. Brand + category
  if (brand && catKeyword) {
    candidates.push(`${brand} ${catKeyword}`);
  }

  // 3. Category
  if (catKeyword) {
    candidates.push(catKeyword);
  }

  // 4. Product name phrases (2–4 words)
  for (const kw of getProductNameKeywords(productName)) {
    if (!candidates.includes(kw)) candidates.push(kw);
  }

  // 5. Brand + descriptor + type (e.g. "Keychron mechanical keyboard")
  if (brand) {
    for (const p of descriptorPhrases) {
      if (p.length >= 4 && !candidates.includes(`${brand} ${p}`)) {
        candidates.push(`${brand} ${p}`);
      }
    }
  }

  return [...new Set(candidates)];
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
  const endTime = new Date();
  const startTime = new Date();
  startTime.setMonth(startTime.getMonth() - 1); // 1 month for faster, more reliable response

  const res = await googleTrends.interestOverTime({
    keyword,
    startTime,
    endTime,
    geo: "US",
    agent: httpsAgent,
  });

  type TimelinePoint = { time: string; formattedTime: string; formattedAxisTime: string; value?: (number | string)[] };
  let timelineData: TimelinePoint[] = [];
  try {
    const str = typeof res === "string" ? res : String(res);
    const jsonStr = str.startsWith(")") || str.startsWith("<") ? str.slice(Math.max(str.indexOf("{"), 0)) : str;
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
 * Tries multiple keyword strategies and uses the best result.
 */
export async function getGoogleTrendsData(
  productName: string,
  category?: string | null
): Promise<GoogleTrendsResult> {
  const keywords = buildKeywordCandidates(productName, category);

  for (const keyword of keywords) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const { dataPoints, score } = await withTimeout(
          fetchTrendsForKeyword(keyword),
          REQUEST_TIMEOUT_MS
        );

        // Accept any result with at least 1 data point
        if (dataPoints.length > 0) {
          return {
            score,
            dataPoints,
            keywordUsed: keyword,
          };
        }
      } catch (err) {
        if (attempt === MAX_RETRIES) {
          console.warn(`Google Trends failed for keyword "${keyword}":`, err);
          break;
        }
        // Brief delay before retry
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  // All keywords failed – return neutral default, no generic fallback used
  return {
    score: 50,
    dataPoints: [],
    error: "Could not fetch trend data. Using neutral score.",
    keywordUsed: keywords.length > 0 ? keywords[0] : undefined,
  };
}
