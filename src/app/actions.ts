"use server";

import { supabase, getSupabaseAdmin } from "@/lib/supabase";
import { mockSearchAmazon } from "@/lib/mock-amazon";
import { fetchProductImageFromNews } from "@/lib/serpapi-news";
import { searchGoogleImage } from "@/lib/google-images";
import {
  generate,
  chatCompletion,
  type OpenRouterModel,
  type ChatMessage,
} from "@/lib/openrouter";
import { getGoogleTrendsData, type GoogleTrendsResult } from "@/lib/google-trends";
import { getCanadaInflationData, type CanadaInflationResult } from "@/lib/bank-of-canada";
import { fetchRelatedNews, type NewsItem } from "@/lib/serpapi-news";
import { fetchSocialPostMetrics, type TweetItem } from "@/lib/serpapi-social";
import {
  fetchForumDiscussions,
  fetchSocialTrends,
  computeSocialPresenceScore,
  type ForumItem,
  type RelatedQueryItem,
} from "@/lib/serpapi-social-extended";
import { computeVirality, type ViralityResult } from "@/lib/social-virality";
import { PRODUCT_QA_MODELS, type ProductQAModelKey } from "@/lib/product-qa";
import {
  computeVolatility,
  volatilityToScore,
} from "@/lib/volatility";
import { computeMovingAverageAnalysis } from "@/lib/moving-average";
import { fetchProductPrice } from "@/lib/priceapi";
import { calculateOpenByIndexFromPartial, type IndexCategory } from "@/lib/openby-index";

/**
 * Generate AI response via OpenRouter (Gemini, Claude, GPT, etc.).
 * Use for any feature that needs model-generated text.
 */
export async function aiGenerate(
  userPrompt: string,
  options?: {
    systemPrompt?: string;
    model?: OpenRouterModel;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<{ text: string } | { error: string }> {
  try {
    const text = await generate(userPrompt, options);
    return { text };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "AI generation failed",
    };
  }
}

/**
 * Full control: chat completion with multiple messages.
 */
export async function aiChat(
  messages: ChatMessage[],
  options?: {
    model?: OpenRouterModel;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<{ content: string } | { error: string }> {
  try {
    const result = await chatCompletion({
      messages,
      model: options?.model,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });
    return { content: result.content };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "AI chat failed",
    };
  }
}

export async function askProductQuestion(
  productTitle: string,
  productDescription: string,
  userQuestion: string,
  modelKey: ProductQAModelKey
): Promise<{ content: string } | { error: string }> {
  const model = PRODUCT_QA_MODELS[modelKey];
  const systemPrompt = `You are a helpful product advisor for OpenBy, an AI-powered price tracking platform. The user is viewing a product page and has a specific question about it.

Product: ${productTitle}
Description: ${productDescription || "No description available."}

Answer the user's question concisely and helpfully. Focus on buying advice, price considerations, value, alternatives, or product-specific details. Keep responses to 2-4 sentences unless the question requires more detail.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userQuestion },
  ];

  return aiChat(messages, {
    model,
    temperature: 0.5,
    maxTokens: 512,
  });
}

const LLM_BUY_PROMPT = `You are a product buying advisor. Given a product name and description, assess if TODAY is a good time to buy it.

Your response MUST follow this exact format:
- First line: A single number from 1 to 10 (1 = terrible time to buy today, 10 = excellent time to buy today). You may use decimals like 7.5 or 9.2. Nothing else on that line.
- Second line: Empty
- Following lines: 2-3 sentences explaining your assessment for today. Consider current price trends, seasonal factors, new product releases, and whether waiting would likely yield a better deal.`;

export type LLMModelScore = {
  score: number | null; // 1-10 scale
  text: string;
  error?: string;
};

export async function getLLMProductScores(
  productName: string,
  description: string
): Promise<{
  openai: LLMModelScore;
  gemini: LLMModelScore;
  claude: LLMModelScore;
  llmScore: number; // 0-100 for index (score/10 * 100)
}> {
  const userPrompt = `Product: ${productName}

Description: ${description || "No description available."}

Is today a good time to buy this product? Respond with a score from 1 to 10 (you may use decimals like 9.6) on the first line, then 2-3 sentences of explanation.`;

  const models = [
    { key: "openai" as const, model: "openai/gpt-4o" as OpenRouterModel },
    { key: "gemini" as const, model: "google/gemini-2.0-flash-001" as OpenRouterModel },
    { key: "claude" as const, model: "anthropic/claude-3.5-sonnet" as OpenRouterModel },
  ];

  const results = await Promise.all(
    models.map(async ({ key, model }) => {
      try {
        const content = await generate(userPrompt, {
          systemPrompt: LLM_BUY_PROMPT,
          model,
          temperature: 0.4,
          maxTokens: 300,
        });
        const lines = content.trim().split("\n").filter(Boolean);
        const firstLine = lines[0] ?? "";
        const scoreMatch = firstLine.match(/\b(\d{1,2}(?:\.\d+)?)\b/);
        const raw = scoreMatch ? parseFloat(scoreMatch[1]) : null;
        const score = raw != null ? Math.min(10, Math.max(1, raw)) : null;
        const text = lines.slice(1).join(" ").trim() || content.trim();
        return { key, score, text, error: undefined };
      } catch (err) {
        return {
          key,
          score: null,
          text: "",
          error: err instanceof Error ? err.message : "Failed",
        };
      }
    })
  );

  const byKey = Object.fromEntries(
    results.map((r) => [
      r.key,
      { score: r.score, text: r.text, ...(r.error && { error: r.error }) },
    ])
  );

  const scores = results.filter((r) => r.score != null).map((r) => r.score!);
  const avgOutOf10 =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 5;
  const llmScore = Math.round((avgOutOf10 / 10) * 100);

  return {
    openai: byKey.openai,
    gemini: byKey.gemini,
    claude: byKey.claude,
    llmScore,
  };
}

export async function getCanadaInflation(): Promise<CanadaInflationResult> {
  return getCanadaInflationData();
}

const NEWS_QUANTIFY_PROMPT = `You are a product buying analyst. Given a list of recent news headlines/snippets related to a product or its category, assess how these news items affect whether NOW is a good time to buy.

Your response MUST follow this exact format:
- First line: A single number from 0 to 100 (0 = news strongly suggests waiting, 100 = news strongly suggests buying now). Nothing else on that line.
- Second line: Empty
- Following lines: 2-4 sentences summarizing how the news affects the buying decision. Be concise and practical.`;

export type RelatedNewsResult = {
  items: NewsItem[];
  score: number;
  analysis: string;
  error?: string;
};

export async function getRelatedNews(
  productName: string
): Promise<RelatedNewsResult> {
  const { items, error } = await fetchRelatedNews(productName);

  if (error || items.length === 0) {
    return {
      items: [],
      score: 50,
      analysis: "No recent news available to assess.",
      error,
    };
  }

  const newsText = items
    .slice(0, 6)
    .map((n, i) => `${i + 1}. ${n.title}${n.snippet ? ` — ${n.snippet.slice(0, 120)}...` : ""}`)
    .join("\n");

  try {
    const content = await generate(
      `Product context: ${productName}\n\nRecent related news:\n${newsText}\n\nBased on these news items, how do they affect whether now is a good time to buy?`,
      {
        systemPrompt: NEWS_QUANTIFY_PROMPT,
        model: "google/gemini-2.0-flash-001",
        temperature: 0.3,
        maxTokens: 300,
      }
    );

    const lines = content.trim().split("\n").filter(Boolean);
    const firstLine = lines[0] ?? "";
    const scoreMatch = firstLine.match(/\b(\d{1,3})\b/);
    const raw = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
    const score = raw != null ? Math.min(100, Math.max(0, raw)) : 50;
    const analysis = lines.slice(1).join(" ").trim() || "News suggests a neutral outlook.";

    return { items, score, analysis };
  } catch (err) {
    return {
      items,
      score: 50,
      analysis: "Could not analyze news impact.",
      error: err instanceof Error ? err.message : "Analysis failed",
    };
  }
}

export type SocialMediaPresenceResult = {
  items: TweetItem[];
  score: number;
  analysis: string;
  virality?: ViralityResult;
  forums?: ForumItem[];
  relatedQueries?: RelatedQueryItem[];
  risingQueries?: RelatedQueryItem[];
  youtubeInterest?: number | null;
  error?: string;
};

/**
 * Social presence from forums (Reddit/Quora), trends (related queries, YouTube interest),
 * and optionally Twitter virality when tweets are found. Doesn't rely on Twitter.
 */
export async function getSocialMediaPresence(
  productName: string
): Promise<SocialMediaPresenceResult> {
  const [tweetResult, forumResult, trendsResult] = await Promise.all([
    fetchSocialPostMetrics(productName),
    fetchForumDiscussions(productName),
    fetchSocialTrends(productName),
  ]);

  const { postMetrics, items: tweetItems, error: tweetError } = tweetResult;
  const { items: forumItems } = forumResult;
  const {
    relatedQueries,
    risingQueries,
    youtubeInterest,
    error: trendsError,
  } = trendsResult;

  const totalComments = forumItems.reduce(
    (sum, f) => sum + (f.commentCount ?? f.answerCount ?? 0),
    0
  );

  const extendedScore = computeSocialPresenceScore({
    forumCount: forumItems.length,
    totalComments,
    relatedQueryCount: relatedQueries.length,
    risingQueryCount: risingQueries.length,
    youtubeInterest,
  });

  let score = extendedScore;
  let virality: ViralityResult | undefined;
  let analysisParts: string[] = [];

  if (postMetrics.length > 0) {
    virality = computeVirality(postMetrics);
    score = Math.round((extendedScore * 0.4 + virality.compositeScore * 0.6));
    analysisParts.push(
      `${virality.postCount} X/Twitter posts. Reach: ${virality.reach.toLocaleString()}, Engagement: ${virality.engagement.toLocaleString()}.`
    );
  }

  if (forumItems.length > 0) {
    analysisParts.push(
      `${forumItems.length} Reddit/Quora discussions (${totalComments.toLocaleString()} comments).`
    );
  }
  if (relatedQueries.length > 0 || risingQueries.length > 0) {
    analysisParts.push(
      `${relatedQueries.length + risingQueries.length} related/rising search queries.`
    );
  }
  if (youtubeInterest != null) {
    analysisParts.push(`YouTube interest: ${youtubeInterest}/100.`);
  }

  const analysis =
    analysisParts.length > 0
      ? analysisParts.join(" ")
      : "Limited social signals. Forum and trend data used for score.";

  return {
    items: tweetItems,
    score: Math.min(100, Math.max(0, score)),
    analysis,
    virality,
    forums: forumItems.length > 0 ? forumItems : undefined,
    relatedQueries: relatedQueries.length > 0 ? relatedQueries : undefined,
    risingQueries: risingQueries.length > 0 ? risingQueries : undefined,
    youtubeInterest: youtubeInterest ?? undefined,
    error: tweetError ?? trendsError,
  };
}

/** Fetch approximate historical prices from Gemini when real data is unavailable. */
export async function getHistoricalPricesFromGemini(
  productName: string,
  category: string | null | undefined,
  currentPrice: number
): Promise<{ date: string; price: number }[]> {
  try {
    const productContext = category ? `${productName} (${category})` : productName;
    const content = await generate(
      `You are a retail price analyst. Estimate approximate daily prices for this product over the past 100 days.
Product: ${productContext}
Current price (most recent day): $${currentPrice.toFixed(2)}

Provide a plausible price history. Consider:
- Tech products often have gradual declines, occasional sales dips, or Black Friday spikes
- Prices typically fluctuate 2-15% over 100 days
- The last day MUST be exactly $${currentPrice.toFixed(2)}
- Work backwards from today

Return ONLY a list of lines in format: YYYY-MM-DD,price
Example:
2025-01-15,389.99
2025-01-16,395.00
...
${new Date().toISOString().split("T")[0]},${currentPrice.toFixed(2)}

Provide about 30-50 points spread over the past 100 days (can skip some days). Start from the oldest date.`,
      {
        model: "google/gemini-2.0-flash-001",
        temperature: 0.4,
        maxTokens: 6000,
      }
    );

    const lines = (content ?? "")
      .trim()
      .split(/\n/)
      .map((l) => l.trim())
      .filter((l) => /^\d{4}-\d{2}-\d{2}\s*,\s*[\d.]+$/.test(l));

    const points: { date: string; price: number }[] = [];
    const seen = new Set<string>();
    for (const line of lines) {
      const [dateStr, priceStr] = line.split(",").map((s) => s.trim());
      if (!dateStr || !priceStr) continue;
      const price = parseFloat(priceStr);
      if (Number.isNaN(price) || price <= 0) continue;
      if (seen.has(dateStr)) continue;
      seen.add(dateStr);
      points.push({ date: dateStr, price: Math.round(price * 100) / 100 });
    }

    if (points.length < 7) return [];

    const sorted = [...points].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const last = sorted[sorted.length - 1];
    if (last) last.price = currentPrice;
    return sorted;
  } catch {
    return [];
  }
}

/** Generate mock price history when real data is unavailable. Deterministic per productId. */
function generateMockPriceHistory(
  productId: string,
  currentPrice: number,
  days = 30
): { date: string; price: number }[] {
  const prices: { date: string; price: number }[] = [];
  const now = new Date();
  // Simple seeded "random" from productId
  let seed = 0;
  for (let i = 0; i < productId.length; i++) {
    seed += productId.charCodeAt(i) ?? 0;
  }

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const isLastDay = i === 0;
    const t = (days - 1 - i) / Math.max(1, days - 1);
    const rand = Math.sin(seed + i * 1.5) * 0.5 + 0.5;
    const variance = currentPrice * (0.015 * (rand - 0.5));
    const trend = currentPrice * 0.002 * t * (rand - 0.4);
    const price = isLastDay
      ? currentPrice
      : Math.round((currentPrice + variance + trend) * 100) / 100;
    prices.push({
      date: date.toISOString().split("T")[0] ?? "",
      price: Math.max(price, currentPrice * 0.75),
    });
  }
  return prices;
}

export type VolatilityResult = {
  score: number;
  volatility: number;
  dataPoints: { date: string; price: number; returnPct?: number }[];
  isMockData?: boolean;
  error?: string;
};

export async function getProductVolatility(
  productId: string,
  currentPrice: number,
  priceHistory?: Array<{ price: number; date?: string }>
): Promise<VolatilityResult> {
  const dataPoints = getPriceHistoryForProduct(productId, currentPrice, priceHistory, 30);

  const prices = dataPoints.map((p) => p.price);
  const volatility = computeVolatility(prices);
  const score = volatilityToScore(volatility);

  const returns = (() => {
    const r: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      const prev = prices[i - 1]!;
      if (prev === 0) continue;
      r.push(((prices[i]! - prev) / prev) * 100);
    }
    return r;
  })();

  const enrichedPoints = dataPoints.map((d, i) => ({
    ...d,
    returnPct: i > 0 ? returns[i - 1] : undefined,
  }));

  return {
    score,
    volatility,
    dataPoints: enrichedPoints,
    isMockData: !priceHistory || priceHistory.length < 2,
  };
}

function getPriceHistoryForProduct(
  productId: string,
  currentPrice: number,
  priceHistory?: Array<{ price: number; date?: string }>,
  minDays = 30
): { date: string; price: number }[] {
  if (priceHistory && priceHistory.length >= 2) {
    const sorted = [...priceHistory]
      .filter((p) => typeof p.price === "number" && !Number.isNaN(p.price))
      .sort((a, b) => {
        const dA = (a as { date?: string }).date ?? "";
        const dB = (b as { date?: string }).date ?? "";
        const da = dA ? new Date(dA).getTime() : 0;
        const db = dB ? new Date(dB).getTime() : 0;
        return da - db;
      });
    if (sorted.length >= 2) {
      return sorted.map((p) => ({
        date: (p as { date?: string }).date ?? "",
        price: Number(p.price),
      }));
    }
  }
  return generateMockPriceHistory(productId, currentPrice, minDays);
}

export type MovingAverageResult = {
  score: number;
  currentPrice: number;
  ma7: number | null;
  ma60: number | null;
  ma7ZScore: number | null;
  ma60ZScore: number | null;
  ma7StdDev: number;
  ma60StdDev: number;
  priceAboveMa7: boolean | null;
  priceAboveMa60: boolean | null;
  dataPoints: { date: string; price: number; ma7: number | null; ma60: number | null }[];
  isMockData?: boolean;
  error?: string;
};

export async function getProductMovingAverage(
  productId: string,
  currentPrice: number,
  priceHistory?: Array<{ price: number; date?: string }>
): Promise<MovingAverageResult> {
  const dataPoints = getPriceHistoryForProduct(productId, currentPrice, priceHistory, 90);
  const isMockData = !priceHistory || priceHistory.length < 7;

  const result = computeMovingAverageAnalysis(dataPoints);

  if (!result) {
    return {
      score: 50,
      currentPrice,
      ma7: null,
      ma60: null,
      ma7ZScore: null,
      ma60ZScore: null,
      ma7StdDev: 0,
      ma60StdDev: 0,
      priceAboveMa7: null,
      priceAboveMa60: null,
      dataPoints: dataPoints.map((d) => ({ ...d, ma7: null, ma60: null })),
      isMockData,
    };
  }

  return {
    ...result,
    isMockData,
  };
}

export type BuyRecommendationData = {
  productTitle: string;
  productCategory?: string | null;
  currentPrice: number;
  openByIndex: number;
  llmScore: number;
  llmAssessments: { openai?: string; gemini?: string; claude?: string };
  newsScore: number;
  newsAnalysis?: string;
  newsHeadlines?: string[];
  socialScore: number;
  socialAnalysis?: string;
  inflationScore: number;
  inflationLatest?: number;
  searchTrendScore: number;
  volatilityScore: number;
  volatilityPercent?: number;
  maScore: number;
  ma7?: number | null;
  ma60?: number | null;
  priceAboveMa7?: boolean | null;
  priceAboveMa60?: boolean | null;
  priceChange7d?: "up" | "down" | null;
};

/**
 * Generate 4-6 sentence buy recommendation explanation using Gemini.
 * Cites only from the provided data - no hallucination.
 */
export async function generateBuyRecommendationExplanation(
  data: BuyRecommendationData
): Promise<string> {
  const to10 = (n: number) => (n / 10).toFixed(1);
  const dataBlock = `
Product: ${data.productTitle}${data.productCategory ? ` (${data.productCategory})` : ""}
Current price: $${data.currentPrice.toFixed(2)}

OpenBy Index: ${to10(data.openByIndex)} (0-10 scale)

LLM buy scores: ${to10(data.llmScore)}. ${data.llmAssessments.openai ?? "—"} | ${data.llmAssessments.gemini ?? "—"} | ${data.llmAssessments.claude ?? "—"}

News score: ${to10(data.newsScore)}. ${data.newsAnalysis ?? ""}
${data.newsHeadlines?.length ? `Headlines: ${data.newsHeadlines.slice(0, 5).join("; ")}` : ""}

Social media score: ${to10(data.socialScore)}. ${data.socialAnalysis ?? ""}

Inflation score: ${to10(data.inflationScore)}. ${data.inflationLatest != null ? `Latest inflation: ${data.inflationLatest}%` : ""}

Search trend score: ${to10(data.searchTrendScore)}

Volatility score: ${to10(data.volatilityScore)}. ${data.volatilityPercent != null ? `Volatility: ${(data.volatilityPercent * 100).toFixed(2)}%` : ""}

Moving average score: ${to10(data.maScore)}. MA(7): ${data.ma7 != null ? `$${data.ma7.toFixed(2)}` : "—"}. MA(60): ${data.ma60 != null ? `$${data.ma60.toFixed(2)}` : "—"}. ${data.priceAboveMa7 != null ? `Price ${data.priceAboveMa7 ? "above" : "below"} MA(7).` : ""} ${data.priceAboveMa60 != null ? `Price ${data.priceAboveMa60 ? "above" : "below"} MA(60).` : ""}

7-day price change: ${data.priceChange7d ?? "no data"}
`.trim();

  const systemPrompt = `You are a product buying advisor. Your task is to write 4-6 sentences explaining why this is or is not a good time to buy the product. All scores are on a 0-10 scale. CRITICAL: Cite ONLY facts and numbers from the data provided below. Do not add any information, assumptions, or claims not present in the data. Be specific and thorough, covering price trends, moving averages, LLM assessments, and other relevant signals. When mentioning scores, use the 0-10 scale (e.g., "7.2" not "72/100"). Use these exact terms when referencing factors so users can jump to sections: "OpenBy Index", "LLM score", "moving average", "7-day moving average", "60-day moving average", "volatility", "inflation", "related news", "social media", "search trend".`;

  const userPrompt = `Based ONLY on this data, write 4-6 sentences explaining the buy recommendation:\n\n${dataBlock}`;

  try {
    const result = await generate(userPrompt, {
      systemPrompt,
      model: "google/gemini-2.0-flash-001",
      temperature: 0.3,
      maxTokens: 400,
    });
    return result?.trim() ?? "";
  } catch {
    return "";
  }
}

export type RefreshPriceResult =
  | { ok: true; price: number; message?: string }
  | { ok: false; error: string };

/**
 * Fetch current price from PriceAPI and store in price_history.
 * Use product ASIN for Amazon lookup, or product title as keyword fallback.
 */
export async function refreshProductPrice(
  productId: string,
  asin: string | null,
  productTitle: string
): Promise<RefreshPriceResult> {
  const result = await fetchProductPrice({
    asin: asin ?? undefined,
    keyword: !asin ? productTitle : undefined,
    source: "amazon",
    country: "us",
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const today = new Date().toISOString().split("T")[0] ?? "";

  const { error: insertError } = await supabase.from("price_history").insert({
    product_id: productId,
    price: result.price,
    date: today,
  });

  if (insertError) {
    return { ok: false, error: `Failed to save: ${insertError.message}` };
  }

  await supabase
    .from("products")
    .update({ current_price: result.price })
    .eq("id", productId);

  return {
    ok: true,
    price: result.price,
    message: `Price $${result.price.toFixed(2)} saved. Refresh the page to see updated charts.`,
  };
}

export async function getProductSearchTrends(
  productName: string,
  category?: string | null
): Promise<GoogleTrendsResult> {
  return getGoogleTrendsData(productName, category);
}

/**
 * Get top 8 related search terms for a product. Uses API data when available,
 * falls back to Gemini when insufficient results.
 */
export async function getRelatedSearchTerms(
  productName: string,
  category?: string | null,
  existingQueries: string[] = []
): Promise<string[]> {
  const existing = existingQueries
    .map((q) => q?.trim())
    .filter((q): q is string => Boolean(q))
    .filter((q, i, arr) => arr.indexOf(q) === i);

  if (existing.length >= 8) return existing.slice(0, 8);

  try {
    const productContext = category ? `${productName} (${category})` : productName;
    const content = await generate(
      `List exactly 8 short search queries that people commonly use when researching or shopping for this product. Each query should be 2-6 words. Be specific and practical (e.g. "best laptop 2024", "MacBook Pro vs Dell", "wireless keyboard reviews").
Product: ${productContext}
${existing.length > 0 ? `Already have: ${existing.join(", ")}. Generate ${8 - existing.length} more that are different.` : ""}
Return ONLY 8 queries, one per line, no numbering or bullets.`,
      {
        model: "google/gemini-2.0-flash-001",
        temperature: 0.5,
        maxTokens: 150,
      }
    );

    const existingLower = new Set(existing.map((e) => e.toLowerCase()));
    const lines = (content ?? "")
      .trim()
      .split(/\n/)
      .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((l) => l.length >= 2 && l.length <= 80 && !existingLower.has(l.toLowerCase()));
    const generated = lines.slice(0, 8 - existing.length);
    return [...existing, ...generated].slice(0, 8);
  } catch {
    return existing.slice(0, 8);
  }
}

export async function submitFeedback(formData: FormData) {
  const name = formData.get("name")?.toString()?.trim();
  const email = formData.get("email")?.toString()?.trim();
  const type = formData.get("type")?.toString()?.trim();
  const message = formData.get("message")?.toString()?.trim();

  if (!name || name.length < 2) {
    return { success: false, error: "Please enter your name." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!message || message.length < 10) {
    return { success: false, error: "Please enter a message (at least 10 characters)." };
  }

  try {
    const { error } = await supabase.from("feedback").insert({
      name,
      email,
      type: type || "general",
      message,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

function isPlaceholderImage(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  return url.includes("placehold.co");
}

/** Try News API first (SerpAPI), then Google Images as fallback (limited daily quota). */
async function fetchProductImage(title: string): Promise<string | null> {
  const fromNews = await fetchProductImageFromNews(title);
  if (fromNews) return fromNews;
  return searchGoogleImage(title);
}

async function ensureProductImageUrl(
  productId: string,
  title: string,
  category?: string | null,
  currentUrl?: string | null
): Promise<string | null> {
  if (!isPlaceholderImage(currentUrl)) return currentUrl ?? null;

  const { data: row } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", productId)
    .single();
  const existing = row?.image_url?.toString()?.trim();
  if (existing && !isPlaceholderImage(existing)) return existing;

  const imageUrl = await fetchProductImage(title);
  if (!imageUrl) return currentUrl ?? null;

  const db = getSupabaseAdmin();
  await db.from("products").update({ image_url: imageUrl }).eq("id", productId);

  return imageUrl;
}

async function ensureProductDescription(
  productId: string,
  title: string,
  category?: string | null
): Promise<string | null> {
  const { data: row } = await supabase
    .from("products")
    .select("description")
    .eq("id", productId)
    .single();
  const existing = row?.description?.toString()?.trim();
  if (existing) return existing;

  const result = await generate(
    `Write a 3-4 sentence product description for: "${title}"${category ? ` (category: ${category})` : ""}. Be informative and highlight key features. Do not include price.`,
    {
      systemPrompt:
        "You are a concise product copywriter. Write 3-4 sentences only. No bullet points.",
      temperature: 0.5,
      maxTokens: 200,
    }
  );

  const generated = result?.trim();
  if (!generated) return null;

  const db = getSupabaseAdmin();
  await db.from("products").update({ description: generated }).eq("id", productId);

  return generated;
}

export async function getProductById(id: string) {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (productError || !product) {
    return null;
  }

  const { data: priceHistory } = await supabase
    .from("price_history")
    .select("*")
    .eq("product_id", product.id)
    .order("date", { ascending: true });

  const { data: aiInsights } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("product_id", product.id);

  const needsDescription = !product.description?.trim();
  const needsImage = isPlaceholderImage(product.image_url);

  const [descriptionResult, imageUrlResult] = await Promise.all([
    needsDescription ? ensureProductDescription(product.id, product.title ?? "", product.category) : Promise.resolve(null),
    needsImage ? ensureProductImageUrl(product.id, product.title ?? "", product.category, product.image_url) : Promise.resolve(null),
  ]);

  const description = product.description?.trim() ?? descriptionResult ?? null;
  const imageUrl = (imageUrlResult ?? product.image_url) ?? product.image_url;

  return {
    ...product,
    description: description ?? product.description,
    image_url: imageUrl ?? product.image_url,
    price_history: priceHistory ?? [],
    ai_insights: aiInsights ?? [],
  };
}

/** Save OpenBy Index to products and ai_insights (for card display). */
export async function saveProductOpenByIndex(productId: string, openByIndex: number): Promise<void> {
  const db = getSupabaseAdmin();
  const score = Math.round(openByIndex);
  await db.from("products").update({ openby_index: score }).eq("id", productId);
  const { data: rows } = await db.from("ai_insights").select("id").eq("product_id", productId).limit(1);
  if (rows?.length) {
    await db.from("ai_insights").update({ score }).eq("product_id", productId);
  } else {
    await db.from("ai_insights").insert({ product_id: productId, score, summary: `OpenBy Index: ${score}/100` });
  }
}

/** Calculate full OpenBy Index for a product and save to DB. Used for backfill. Ensures description & image first. */
export async function calculateAndSaveProductOpenByIndex(productId: string): Promise<number | null> {
  const product = await getProductById(productId);
  if (!product) return null;

  const title = product.title ?? "";
  const description = product.description ?? "";
  const currentPrice = Number(product.current_price) || 0;
  const priceHistory = (product.price_history ?? []) as Array<{ price: number; date?: string }>;

  const scores: Partial<Record<IndexCategory, number>> = {};

  const sections: IndexCategory[] = [
    "relatedNews",
    "llmScore",
    "socialMediaPresence",
    "searchTrend",
    "volatility",
    "movingAverage",
    "inflationScore",
  ];

  let effectiveHistory = priceHistory;
  if (priceHistory.length < 7) {
    const fromGemini = await getHistoricalPricesFromGemini(title, product.category, currentPrice);
    effectiveHistory = fromGemini.length >= 7 ? fromGemini : priceHistory;
  }

  try {
    const [newsData, inflationData, llmData] = await Promise.all([
      getRelatedNews(title),
      getCanadaInflation(),
      getLLMProductScores(title, description),
    ]);
    scores.relatedNews = newsData.score;
    scores.inflationScore = inflationData.score;
    scores.llmScore = llmData.llmScore;

    const socialData = await getSocialMediaPresence(title);
    scores.socialMediaPresence = socialData.score;

    const searchData = await getProductSearchTrends(title, product.category);
    scores.searchTrend = searchData.score;

    const volatilityData = await getProductVolatility(productId, currentPrice, effectiveHistory);
    scores.volatility = volatilityData.score;

    const maData = await getProductMovingAverage(productId, currentPrice, effectiveHistory);
    scores.movingAverage = maData.score;

    scores.predictedPrice = 100;

    const openByIndex = calculateOpenByIndexFromPartial(scores);
    await saveProductOpenByIndex(productId, openByIndex);
    return openByIndex;
  } catch (err) {
    console.error(`[calculateAndSaveProductOpenByIndex] ${productId}:`, err);
    return null;
  }
}

export async function getProduct(asin: string) {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("asin", asin)
    .single();

  if (productError || !product) {
    return null;
  }

  const { data: priceHistory } = await supabase
    .from("price_history")
    .select("*")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false });

  const { data: aiInsights } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("product_id", product.id);

  return {
    ...product,
    price_history: priceHistory ?? [],
    ai_insights: aiInsights ?? [],
  };
}

export async function searchProducts(query: string) {
  const { data: existingProducts } = await supabase
    .from("products")
    .select("*")
    .ilike("title", `%${query}%`);

  if (existingProducts && existingProducts.length > 0) {
    const productsWithInsights = await Promise.all(
      existingProducts.map(async (product) => {
        const { data: aiInsights } = await supabase
          .from("ai_insights")
          .select("score, summary")
          .eq("product_id", product.id);
        const insight = aiInsights?.[0];
        const score = product.openby_index ?? insight?.score ?? null;
        return {
          ...product,
          ai_score: score,
          ai_summary: insight?.summary ?? null,
        };
      })
    );
    return productsWithInsights;
  }

  const mockProducts = mockSearchAmazon(query);

  const productsToInsert = mockProducts.map(
    ({ price_history: _ph, ai_score: _as, ai_summary: _asum, ...product }) => ({
      asin: product.asin,
      title: product.title,
      current_price: product.current_price,
      image_url: product.image_url,
      category: product.category,
    })
  );

  const { data: savedProducts, error: insertError } = await supabase
    .from("products")
    .insert(productsToInsert)
    .select();

  if (insertError || !savedProducts) {
    throw new Error(insertError?.message ?? "Failed to save products");
  }

  for (let i = 0; i < savedProducts.length; i++) {
    const product = savedProducts[i];
    const mock = mockProducts[i];

    await supabase.from("price_history").insert(
      mock.price_history.map((ph) => ({
        product_id: product.id,
        price: ph.price,
        date: ph.date,
      }))
    );

    await supabase.from("ai_insights").insert({
      product_id: product.id,
      score: mock.ai_score,
      summary: mock.ai_summary,
    });
  }

  return savedProducts.map((product, i) => ({
    ...product,
    ai_score: mockProducts[i].ai_score,
    ai_summary: mockProducts[i].ai_summary,
  }));
}

export type SearchSort =
  | "date"
  | "price-asc"
  | "price-desc"
  | "score"
  | "recommended"
  | "alphabetical";

const PRODUCTS_PER_PAGE = 15;

export async function searchProductsFiltered(
  query: string,
  options: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minScore?: number;
    maxScore?: number;
    sort?: SearchSort;
    page?: number;
    limit?: number;
  } = {}
) {
  const products = await searchProducts(query);
  const {
    category,
    minPrice,
    maxPrice,
    minScore,
    maxScore,
    sort = "recommended",
    page = 1,
    limit = PRODUCTS_PER_PAGE,
  } = options;

  let filtered = products;

  if (category) {
    filtered = filtered.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
  }
  if (minPrice != null) {
    filtered = filtered.filter(
      (p) => Number(p.current_price) >= minPrice
    );
  }
  if (maxPrice != null) {
    filtered = filtered.filter(
      (p) => Number(p.current_price) <= maxPrice
    );
  }
  if (minScore != null) {
    filtered = filtered.filter((p) => {
      const s = p.ai_score ?? 0;
      return s >= minScore;
    });
  }
  if (maxScore != null) {
    filtered = filtered.filter((p) => {
      const s = p.ai_score ?? 0;
      return s <= maxScore;
    });
  }

  const sorted = [...filtered];
  if (sort === "date") {
    sorted.sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
    );
  } else if (sort === "price-asc") {
    sorted.sort(
      (a, b) => Number(a.current_price) - Number(b.current_price)
    );
  } else if (sort === "price-desc") {
    sorted.sort(
      (a, b) => Number(b.current_price) - Number(a.current_price)
    );
  } else if (sort === "score" || sort === "recommended") {
    sorted.sort((a, b) => {
      const sa = a.ai_score ?? 0;
      const sb = b.ai_score ?? 0;
      return sb - sa;
    });
  } else if (sort === "alphabetical") {
    sorted.sort((a, b) =>
      (a.title ?? "").localeCompare(b.title ?? "")
    );
  }

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const pageSafe = Math.max(1, Math.min(page, totalPages));
  const start = (pageSafe - 1) * limit;
  const paginated = sorted.slice(start, start + limit);

  return { products: paginated, totalCount, totalPages, page: pageSafe };
}

export async function getBestDeals(limit = 12) {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, title, current_price, image_url, openby_index, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getBestDeals]", error.message);
    return [];
  }
  if (!products || products.length === 0) return [];

  const { data: insights } = await supabase
    .from("ai_insights")
    .select("product_id, score")
    .in("product_id", products.map((p) => p.id));

  const insightScoreByProduct = new Map(
    (insights ?? []).map((i) => [i.product_id, i.score as number])
  );

  return products.map((product) => ({
    ...product,
    ai_score: product.openby_index ?? insightScoreByProduct.get(product.id) ?? null,
  }));
}

export type BestDealsSort =
  | "recommended"
  | "newest"
  | "price-low"
  | "price-high"
  | "score"
  | "alphabetical";

export async function getBestDealsFiltered(options: {
  sort?: BestDealsSort;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  minScore?: number;
  maxScore?: number;
  page?: number;
  limit?: number;
}) {
  const {
    sort = "recommended",
    minPrice,
    maxPrice,
    category,
    minScore,
    maxScore,
    page = 1,
    limit = PRODUCTS_PER_PAGE,
  } = options;

  const { data: products, error } = await supabase
    .from("products")
    .select("id, title, current_price, image_url, openby_index, created_at, category")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getBestDealsFiltered]", error.message);
    return { products: [], totalCount: 0, totalPages: 1, page: 1 };
  }
  if (!products || products.length === 0) {
    return { products: [], totalCount: 0, totalPages: 1, page: 1 };
  }

  const { data: insights } = await supabase
    .from("ai_insights")
    .select("product_id, score")
    .in("product_id", products.map((p) => p.id));
  const insightScoreByProduct = new Map(
    (insights ?? []).map((i) => [i.product_id, i.score as number])
  );

  let filtered = products.map((product) => ({
    ...product,
    ai_score: product.openby_index ?? insightScoreByProduct.get(product.id) ?? null,
  }));

  if (category) {
    filtered = filtered.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
  }
  if (minPrice != null) {
    filtered = filtered.filter((p) => Number(p.current_price) >= minPrice);
  }
  if (maxPrice != null) {
    filtered = filtered.filter((p) => Number(p.current_price) <= maxPrice);
  }
  if (minScore != null) {
    filtered = filtered.filter((p) => (p.ai_score ?? 0) >= minScore);
  }
  if (maxScore != null) {
    filtered = filtered.filter((p) => (p.ai_score ?? 0) <= maxScore);
  }

  const sorted = [...filtered];
  if (sort === "newest") {
    sorted.sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
    );
  } else if (sort === "price-low") {
    sorted.sort((a, b) => Number(a.current_price) - Number(b.current_price));
  } else if (sort === "price-high") {
    sorted.sort((a, b) => Number(b.current_price) - Number(a.current_price));
  } else if (sort === "recommended" || sort === "score") {
    sorted.sort((a, b) => (b.ai_score ?? 0) - (a.ai_score ?? 0));
  } else if (sort === "alphabetical") {
    sorted.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
  }

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const pageSafe = Math.max(1, Math.min(page, totalPages));
  const start = (pageSafe - 1) * limit;
  const paginated = sorted.slice(start, start + limit);

  return { products: paginated, totalCount, totalPages, page: pageSafe };
}

export async function getRelatedProducts(
  excludeId: string,
  category?: string | null,
  limit = 8
) {
  let query = supabase
    .from("products")
    .select("id, title, current_price, image_url, openby_index, ai_insights(score)")
    .neq("id", excludeId);

  if (category) {
    query = query.eq("category", category);
  }

  const { data: products } = await query
    .order("created_at", { ascending: false })
    .limit(limit * 2);

  if (!products) return [];

  const withScore = products.map((product) => {
    const score = product.openby_index ?? (product.ai_insights as { score: number }[])?.[0]?.score ?? null;
    return {
      ...product,
      ai_score: score,
    };
  });

  withScore.sort((a, b) => {
    const scoreA = a.ai_score ?? 0;
    const scoreB = b.ai_score ?? 0;
    return scoreB - scoreA;
  });

  return withScore.slice(0, limit);
}
