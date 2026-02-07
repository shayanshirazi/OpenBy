/**
 * Google Trends data fetching and analysis.
 * Uses google-trends-api for interest over time.
 */

import googleTrends from "google-trends-api";
import { CATEGORIES } from "@/lib/categories";

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

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
  // Skip if it looks like a number or model (e.g. "27", "4K")
  if (/^\d|^\d+"/.test(first)) return null;
  // Common brands are capitalized
  if (first[0] === first[0]?.toUpperCase() && first.length <= 15) return first;
  return null;
}

/** Extract a descriptive phrase (2–3 words) from product title, avoiding model numbers */
function getShortPhrase(title: string): string {
  const words = title
    .replace(/\([^)]*\)/g, "")
    .replace(/[\d."]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^\d+$/.test(w));
  return words.slice(0, 3).join(" ").trim() || "electronics";
}

/**
 * Build keyword candidates to try, from most specific to most generic.
 * Broader keywords return more reliable, higher-volume trend data.
 */
function buildKeywordCandidates(
  productName: string,
  category: string | null | undefined
): string[] {
  const candidates: string[] = [];
  const catKeyword = getCategoryTrendKeyword(category);
  const brand = extractBrand(productName);
  const shortPhrase = getShortPhrase(productName);

  // 1. Category only – best volume, most reliable (e.g. "headphones", "monitor")
  if (catKeyword) {
    candidates.push(catKeyword);
  }
  // 2. Brand + category (e.g. "Sony headphones", "LG monitor")
  if (brand && catKeyword) {
    candidates.push(`${brand} ${catKeyword}`);
  }
  // 3. Short phrase if meaningful (e.g. "noise cancelling headphones", "4K monitor")
  if (shortPhrase.length >= 10 && shortPhrase !== "electronics") {
    candidates.push(shortPhrase);
  }
  // 4. First 2–3 words of title, cleaned
  const firstWords = productName
    .replace(/\([^)]*\)/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 3)
    .join(" ");
  if (firstWords.length >= 4) {
    candidates.push(firstWords);
  }
  // 5. Fallback
  candidates.push("electronics");

  // Dedupe while preserving order
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
  startTime.setMonth(startTime.getMonth() - 1);

  const res = await googleTrends.interestOverTime({
    keyword,
    startTime,
    endTime,
    geo: "US",
  });

  const parsed = JSON.parse(res) as {
    default?: {
      timelineData?: Array<{
        time: string;
        formattedTime: string;
        formattedAxisTime: string;
        value?: (number | string)[];
        formattedValue?: string[];
      }>;
    };
  };

  const timelineData = parsed?.default?.timelineData ?? [];
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

        // Prefer results with enough data points
        if (dataPoints.length >= 3) {
          return {
            score,
            dataPoints,
            keywordUsed: keyword,
          };
        }

        // If we got some data but few points, still use it if score looks reasonable
        if (dataPoints.length > 0 && score > 10) {
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

  // All keywords failed – return neutral default
  return {
    score: 50,
    dataPoints: [],
    error: "Could not fetch trend data. Using neutral score.",
    keywordUsed: keywords[0],
  };
}
