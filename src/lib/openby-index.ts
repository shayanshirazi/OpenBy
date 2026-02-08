/**
 * OpenBy Index - Dynamic calculation (not persisted).
 * Weights must sum to 100.
 */

export const INDEX_WEIGHTS = {
  relatedNews: 15,
  inflationScore: 5,
  predictedPrice: 20,
  llmScore: 15,
  movingAverage: 15,
  volatility: 10,
  socialMediaPresence: 10,
  searchTrend: 10,
} as const;

export type IndexCategory = keyof typeof INDEX_WEIGHTS;

export type IndexBreakdown = {
  category: IndexCategory;
  label: string;
  weight: number;
  score: number;
  weightedScore: number;
};

const CATEGORY_LABELS: Record<IndexCategory, string> = {
  relatedNews: "Related News",
  inflationScore: "Inflation Score",
  predictedPrice: "Predicted Price (OpenBy Model)",
  llmScore: "LLM Score",
  movingAverage: "Moving Average Score",
  volatility: "Volatility Score",
  socialMediaPresence: "Social Media Presence",
  searchTrend: "Search Trend",
};

export const CATEGORY_DESCRIPTIONS: Record<IndexCategory, string> = {
  relatedNews:
    "News sentiment reflects whether recent articles are positive or negative, which can influence short-term price movements. More recent news matters more than old news, since fresh information impacts prices faster.",
  inflationScore:
    "Inflation indicates how purchasing power and overall prices are changing, which affects demand and future pricing.",
  predictedPrice:
    "The predicted future price using our AI model estimates where the product is heading, helping determine if buying now is cheaper than waiting.",
  llmScore:
    "The LLM score summarizes qualitative factors (product quality, market buzz, risks) that numbers alone may miss.",
  movingAverage:
    "The moving average shows whether the current price is low or high compared to its recent trend.",
  volatility:
    "Predicted volatility measures how much the price is expected to fluctuate, indicating how risky it is to buy now.",
  socialMediaPresence:
    "Virality score from reach, engagement (E = likes + 2×comments + 3×shares), engagement rate, growth rate, and network amplification. V = 0.5×ER + 0.3×G + 0.2×N.",
  searchTrend:
    "Google Trends shows whether search interest is rising or falling, which often precedes changes in demand.",
};

const WEIGHT_DESC_ORDER: IndexCategory[] = [
  "predictedPrice", "relatedNews", "llmScore", "movingAverage",
  "volatility", "socialMediaPresence", "searchTrend", "inflationScore",
];

export function buildIndexBreakdown(scores: Partial<Record<IndexCategory, number>>): IndexBreakdown[] {
  const breakdown: IndexBreakdown[] = [];

  for (const cat of WEIGHT_DESC_ORDER) {
    const weight = INDEX_WEIGHTS[cat];
    const score = scores[cat] ?? 100; // Default full score for unimplemented categories
    breakdown.push({
      category: cat,
      label: CATEGORY_LABELS[cat],
      weight,
      score,
      weightedScore: (score / 100) * weight,
    });
  }

  return breakdown;
}

/** Score is number | null; null = loading. Uses 0 for loading when computing total. */
export type IndexBreakdownRow = IndexBreakdown & { isLoading?: boolean };

export function buildIndexBreakdownWithLoading(
  scores: Partial<Record<IndexCategory, number | null>>
): IndexBreakdownRow[] {
  const breakdown: IndexBreakdownRow[] = [];

  for (const cat of WEIGHT_DESC_ORDER) {
    const weight = INDEX_WEIGHTS[cat];
    const raw = scores[cat];
    const isLoading = raw === undefined || raw === null;
    const score = isLoading ? 0 : raw;
    breakdown.push({
      category: cat,
      label: CATEGORY_LABELS[cat],
      weight,
      score,
      weightedScore: isLoading ? 0 : (score / 100) * weight,
      isLoading,
    });
  }

  return breakdown;
}

/** Total using 0 for loading items – score starts at 0 and grows as sections complete */
export function calculateOpenByIndexFromPartial(
  scores: Partial<Record<IndexCategory, number | null>>
): number {
  let total = 0;
  for (const cat of WEIGHT_DESC_ORDER) {
    const weight = INDEX_WEIGHTS[cat];
    const s = scores[cat];
    if (s === undefined || s === null) continue;
    total += (s / 100) * weight;
  }
  return Math.round(Math.min(100, Math.max(0, total)));
}

export function calculateOpenByIndex(breakdown: IndexBreakdown[]): number {
  const total = breakdown.reduce((sum, b) => sum + b.weightedScore, 0);
  return Math.round(Math.min(100, Math.max(0, total)));
}
