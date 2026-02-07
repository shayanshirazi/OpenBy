/**
 * Moving Average (MA) calculations for the OpenBy Index.
 *
 * MA shows whether the current price is low or high compared to its recent trend.
 * - MA(7): short-term average (past 7 days)
 * - MA(60): longer-term average (past 60 days)
 *
 * Current price BELOW MA = potentially good buy (price is lower than trend).
 * Current price ABOVE MA = potentially wait (price is higher than trend).
 *
 * Standard deviation quantifies how far the current price is from the average.
 */

/**
 * Compute simple moving average for each point.
 * For index i, MA = average of prices from i - period + 1 to i (inclusive).
 * Returns null for indices where we don't have enough history.
 */
export function computeMA(prices: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += prices[i - j]!;
      }
      result.push(sum / period);
    }
  }
  return result;
}

/**
 * Standard deviation of the last `period` prices ending at index `endIdx`.
 */
function stdDevOfWindow(prices: number[], endIdx: number, period: number): number {
  const start = Math.max(0, endIdx - period + 1);
  const slice = prices.slice(start, endIdx + 1);
  if (slice.length < 2) return 0;
  const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
  const variance =
    slice.reduce((acc, p) => acc + (p - mean) ** 2, 0) / (slice.length - 1);
  return Math.sqrt(variance);
}

/**
 * Z-score: how many standard deviations is currentPrice from the MA?
 * z < 0: price is below MA (potentially good)
 * z > 0: price is above MA (potentially wait)
 */
export function zScore(
  currentPrice: number,
  ma: number,
  stdDev: number
): number {
  if (stdDev <= 0) return 0;
  return (currentPrice - ma) / stdDev;
}

/**
 * Convert z-score to 0-100 Buy Now score.
 * z = -2 (2 std dev below MA) -> 100 (great buy)
 * z = 0 (at MA) -> 50 (neutral)
 * z = +2 (2 std dev above MA) -> 0 (wait)
 */
export function zScoreToBuyScore(z: number): number {
  const score = 50 - z * 25;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export type MovingAverageResult = {
  currentPrice: number;
  ma7: number | null;
  ma60: number | null;
  ma7ZScore: number | null;
  ma60ZScore: number | null;
  ma7StdDev: number;
  ma60StdDev: number;
  score: number;
  priceAboveMa7: boolean | null;
  priceAboveMa60: boolean | null;
  dataPoints: { date: string; price: number; ma7: number | null; ma60: number | null }[];
};

export function computeMovingAverageAnalysis(
  dataPoints: { date: string; price: number }[]
): MovingAverageResult | null {
  const prices = dataPoints.map((d) => d.price);
  if (prices.length < 7) return null;

  const currentPrice = prices[prices.length - 1]!;
  const ma7Values = computeMA(prices, 7);
  const ma60Values = computeMA(prices, 60);

  const ma7 = ma7Values[ma7Values.length - 1];
  const ma60 = ma60Values[ma60Values.length - 1];

  const ma7StdDev = stdDevOfWindow(prices, prices.length - 1, 7);
  const ma60StdDev = ma60 != null ? stdDevOfWindow(prices, prices.length - 1, 60) : 0;

  const ma7ZScore = ma7 != null && ma7StdDev > 0 ? zScore(currentPrice, ma7, ma7StdDev) : null;
  const ma60ZScore = ma60 != null && ma60StdDev > 0 ? zScore(currentPrice, ma60, ma60StdDev) : null;

  const score7 = ma7ZScore != null ? zScoreToBuyScore(ma7ZScore) : 50;
  const score60 = ma60ZScore != null ? zScoreToBuyScore(ma60ZScore) : 50;
  const score = Math.round((score7 + score60) / 2);

  const dataWithMA = dataPoints.map((d, i) => ({
    ...d,
    ma7: ma7Values[i],
    ma60: ma60Values[i],
  }));

  return {
    currentPrice,
    ma7: ma7 ?? null,
    ma60: ma60 ?? null,
    ma7ZScore,
    ma60ZScore,
    ma7StdDev,
    ma60StdDev,
    score: Math.max(0, Math.min(100, score)),
    priceAboveMa7: ma7 != null ? currentPrice > ma7 : null,
    priceAboveMa60: ma60 != null ? currentPrice > ma60 : null,
    dataPoints: dataWithMA,
  };
}
