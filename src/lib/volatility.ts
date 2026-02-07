/**
 * Price volatility calculation for the OpenBy Index.
 *
 * Volatility measures how much a product's price fluctuates day to day,
 * not whether it's going up or down. High volatility = large unpredictable
 * swings. Low volatility = slow, steady changes.
 *
 * Calculation steps:
 * 1. Convert prices into daily returns (percentage change between consecutive days)
 * 2. Compute the average daily return
 * 3. Compute the standard deviation of returns (= volatility)
 */

export function computeDailyReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1]!;
    if (prev === 0) continue;
    returns.push((prices[i]! - prev) / prev);
  }
  return returns;
}

export function computeVolatility(prices: number[]): number {
  const returns = computeDailyReturns(prices);
  if (returns.length < 2) return 0;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((acc, r) => acc + (r - mean) ** 2, 0) / (returns.length - 1);

  return Math.sqrt(variance);
}

/**
 * Convert raw volatility (std dev of daily returns) to 0-100 score.
 * Higher volatility = lower score (riskier to buy now).
 * Typical retail product daily volatility: ~0.2% to 3%.
 */
export function volatilityToScore(volatility: number): number {
  if (volatility <= 0) return 100;
  // Map: ~0.001 (very stable) -> 100, ~0.02 (moderate) -> 50, ~0.05+ (high) -> 0
  const score = 100 - Math.min(100, volatility * 2500);
  return Math.round(Math.max(0, Math.min(100, score)));
}
