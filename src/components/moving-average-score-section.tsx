"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingDown, Info, ArrowUp, ArrowDown } from "lucide-react";

type MovingAverageScoreSectionProps = {
  id?: string;
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

export function MovingAverageScoreSection({
  id,
  score,
  currentPrice,
  ma7,
  ma60,
  ma7ZScore,
  ma60ZScore,
  ma7StdDev,
  ma60StdDev,
  priceAboveMa7,
  priceAboveMa60,
  dataPoints,
  isMockData,
  error,
}: MovingAverageScoreSectionProps) {
  const chartData = dataPoints
    .filter((d) => d.ma7 != null || d.ma60 != null)
    .map((d) => ({
      date: d.date,
      price: d.price,
      "MA(7)": d.ma7 != null ? Math.round(d.ma7 * 100) / 100 : null,
      "MA(60)": d.ma60 != null ? Math.round(d.ma60 * 100) / 100 : null,
    }));

  const scoreColor =
    score >= 70
      ? "bg-emerald-100 text-emerald-700"
      : score >= 40
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700";

  return (
    <section id={id} className="relative overflow-hidden border-b border-zinc-200/80 py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50/50 via-white to-indigo-50/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(14,165,233,0.06),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 ring-1 ring-sky-500/20">
            <TrendingDown className="h-7 w-7 text-sky-600" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Moving Average Score
            </h2>
            <p className="mt-1.5 max-w-2xl text-zinc-600">
              The moving average shows whether the current price is low or high compared to its
              recent trend. Price <strong>below</strong> the MA suggests a potential dip (good time
              to buy); price <strong>above</strong> suggests a run-up (consider waiting). We use
              MA(7) for short-term and MA(60) for longer-term context. Standard deviation quantifies
              how far the current price is from the average.
            </p>
          </div>
        </div>

        {/* How it&apos;s calculated */}
        <div className="mb-8 rounded-xl border border-zinc-200/80 bg-white/80 px-6 py-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-zinc-900">
            <Info className="h-4 w-4 text-sky-600" />
            How we use MA(7) and MA(60)
          </h3>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li>
              <strong>MA(7):</strong> Average of the last 7 days. Short-term trend. Current price
              below MA(7) = recent dip, often a buying opportunity.
            </li>
            <li>
              <strong>MA(60):</strong> Average of the last 60 days. Longer-term trend. Compares
              current price to the 2‑month average.
            </li>
            <li>
              <strong>Z-score (std dev difference):</strong> (Current price − MA) ÷ standard
              deviation. Negative z = below average (good). Positive z = above average. We combine
              MA(7) and MA(60) z-scores into a single 0–100 Buy Now score.
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
          {/* Score card & MA comparison */}
          <div className="flex shrink-0 flex-col gap-6 lg:w-64">
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-200/80 bg-white/80 px-6 py-6 shadow-sm backdrop-blur-sm">
              <span className="text-sm font-medium text-zinc-500">MA Score</span>
              <span
                className={`inline-flex min-w-[4rem] items-center justify-center rounded-xl px-4 py-3 text-2xl font-bold ${scoreColor}`}
              >
                {(score / 10).toFixed(1)}
                <span className="align-sub text-[0.5em] font-normal opacity-90">/10</span>
              </span>
              <span className="text-sm text-zinc-600">
                Current: ${currentPrice.toFixed(2)}
              </span>
              {isMockData && (
                <span className="text-center text-xs text-amber-600">
                  Using simulated price history
                </span>
              )}
              {error && <p className="text-center text-xs text-rose-600">{error}</p>}
            </div>

            {/* MA(7) and MA(60) comparison */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm">
              <h4 className="mb-3 text-sm font-semibold text-zinc-900">Price vs Moving Averages</h4>
              <div className="space-y-4">
                {ma7 != null && (
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600">MA(7): ${ma7.toFixed(2)}</span>
                      {priceAboveMa7 != null && (
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            priceAboveMa7 ? "text-amber-600" : "text-emerald-600"
                          }`}
                        >
                          {priceAboveMa7 ? (
                            <>
                              <ArrowUp className="h-3.5 w-3.5" />
                              Above
                            </>
                          ) : (
                            <>
                              <ArrowDown className="h-3.5 w-3.5" />
                              Below
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    {ma7ZScore != null && (
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Z-score: {ma7ZScore.toFixed(2)}σ (std dev: ${ma7StdDev.toFixed(2)})
                      </p>
                    )}
                  </div>
                )}
                {ma60 != null && (
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600">MA(60): ${ma60.toFixed(2)}</span>
                      {priceAboveMa60 != null && (
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            priceAboveMa60 ? "text-amber-600" : "text-emerald-600"
                          }`}
                        >
                          {priceAboveMa60 ? (
                            <>
                              <ArrowUp className="h-3.5 w-3.5" />
                              Above
                            </>
                          ) : (
                            <>
                              <ArrowDown className="h-3.5 w-3.5" />
                              Below
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    {ma60ZScore != null && (
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Z-score: {ma60ZScore.toFixed(2)}σ (std dev: ${ma60StdDev.toFixed(2)})
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-6 pl-8 shadow-sm backdrop-blur-sm">
            {error ? (
              <div className="flex h-64 items-center justify-center rounded-xl bg-zinc-50/50">
                <p className="text-sm text-zinc-500">{error}</p>
              </div>
            ) : chartData.length > 0 ? (
              <div className="aspect-[3/1] w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 12, right: 12, left: 12, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e4e4e7" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#71717a"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => {
                        const [y, m] = String(v).split("-");
                        return m ? `${m}/${y?.slice(2)}` : v;
                      }}
                    />
                    <YAxis
                      stroke="#71717a"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
                      width={56}
                      tickMargin={4}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e4e4e7",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        padding: "10px 14px",
                      }}
                      formatter={(value: unknown, name: string) => [
                        typeof value === "number" && !Number.isNaN(value)
                          ? `$${value.toFixed(2)}`
                          : "—",
                        name,
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      name="Price"
                      stroke="#0ea5e9"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="MA(7)"
                      name="MA(7)"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="MA(60)"
                      name="MA(60)"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl bg-zinc-50/50">
                <p className="text-sm text-zinc-500">Need at least 7 days of price data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
