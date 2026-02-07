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

export function buildIndexBreakdown(scores: Partial<Record<IndexCategory, number>>): IndexBreakdown[] {
  const breakdown: IndexBreakdown[] = [];

  for (const cat of Object.keys(INDEX_WEIGHTS) as IndexCategory[]) {
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

export function calculateOpenByIndex(breakdown: IndexBreakdown[]): number {
  const total = breakdown.reduce((sum, b) => sum + b.weightedScore, 0);
  return Math.round(Math.min(100, Math.max(0, total)));
}
