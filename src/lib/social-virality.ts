/**
 * Social virality metrics and composite score.
 * Based on: Reach, Engagement, ER, Growth Rate, Network Amplification.
 */

export type PostMetrics = {
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  timestamp: number; // ms since epoch
};

/** E = likes + 2*comments + 3*shares */
export function computeEngagement(posts: PostMetrics[]): number {
  return posts.reduce(
    (sum, p) => sum + p.likes + 2 * p.comments + 3 * p.shares,
    0
  );
}

/** R = total reach (impressions) */
export function computeReach(posts: PostMetrics[]): number {
  return posts.reduce((sum, p) => sum + p.reach, 0);
}

/** ER = E / R (engagement rate). Returns 0 if R is 0. */
export function computeEngagementRate(engagement: number, reach: number): number {
  if (reach <= 0) return 0;
  return engagement / reach;
}

/**
 * G = (E(t2) - E(t1)) / (t2 - t1) — engagement growth rate over time.
 * Uses earliest and latest posts. Returns 0 if insufficient data.
 */
export function computeGrowthRate(posts: PostMetrics[]): number {
  if (posts.length < 2) return 0;
  const sorted = [...posts].sort((a, b) => a.timestamp - b.timestamp);
  const e1 = sorted[0]!.likes + 2 * sorted[0]!.comments + 3 * sorted[0]!.shares;
  const e2 = sorted[sorted.length - 1]!.likes +
    2 * sorted[sorted.length - 1]!.comments +
    3 * sorted[sorted.length - 1]!.shares;
  const t1 = sorted[0]!.timestamp;
  const t2 = sorted[sorted.length - 1]!.timestamp;
  const dtHours = (t2 - t1) / (1000 * 60 * 60);
  if (dtHours <= 0) return 0;
  return (e2 - e1) / dtHours;
}

/**
 * Network Amplification (N): estimated from shares vs reach.
 * N ≈ (shares / reach) normalized, or from retweet trees.
 * Simplified: shares-weighted ratio of total shares to reach.
 */
export function computeNetworkAmplification(posts: PostMetrics[]): number {
  const totalReach = computeReach(posts);
  const totalShares = posts.reduce((s, p) => s + p.shares, 0);
  if (totalReach <= 0) return 0;
  return Math.min(1, (totalShares / totalReach) * 10);
}

/** Normalize value to [0, 1] given a reasonable max. */
function normalize(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, value / max));
}

export type ViralityResult = {
  reach: number;
  engagement: number;
  engagementRate: number;
  growthRate: number;
  networkAmplification: number;
  compositeScore: number;
  postCount: number;
};

/** Sensible maxima for normalization (tuned for product/brand posts). */
const DEFAULTS = {
  maxER: 0.1,
  maxGrowthPerHour: 50,
  maxN: 1,
};

/**
 * V = w1*ER_norm + w2*G_norm + w3*N_norm
 * Weights: w1=0.5, w2=0.3, w3=0.2 (ER and growth matter most).
 */
export function computeVirality(
  posts: PostMetrics[],
  options?: { maxER?: number; maxGrowth?: number }
): ViralityResult {
  const maxER = options?.maxER ?? DEFAULTS.maxER;
  const maxGrowth = options?.maxGrowth ?? DEFAULTS.maxGrowthPerHour;

  const reach = computeReach(posts);
  const engagement = computeEngagement(posts);
  const engagementRate = computeEngagementRate(engagement, reach);
  const growthRate = computeGrowthRate(posts);
  const networkAmp = computeNetworkAmplification(posts);

  const erNorm = normalize(engagementRate, maxER);
  const gNorm = normalize(growthRate, maxGrowth);
  const nNorm = normalize(networkAmp, DEFAULTS.maxN);

  const w1 = 0.5;
  const w2 = 0.3;
  const w3 = 0.2;
  const vRaw = w1 * erNorm + w2 * gNorm + w3 * nNorm;
  const compositeScore = Math.round(vRaw * 100);

  return {
    reach,
    engagement,
    engagementRate,
    growthRate,
    networkAmplification: networkAmp,
    compositeScore: Math.min(100, Math.max(0, compositeScore)),
    postCount: posts.length,
  };
}
