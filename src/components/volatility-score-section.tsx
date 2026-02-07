"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TrendingUp, Info } from "lucide-react";

type VolatilityScoreSectionProps = {
  score: number;
  volatility: number;
  dataPoints: { date: string; price: number; returnPct?: number }[];
  isMockData?: boolean;
  error?: string;
};

export function VolatilityScoreSection({
  score,
  volatility,
  dataPoints,
  isMockData,
  error,
}: VolatilityScoreSectionProps) {
  const chartData = dataPoints.map((d) => ({
    date: d.date,
    price: d.price,
    returnPct: d.returnPct,
  }));

  // Scale Y-axis to data range so volatility is visible (not squashed by 0-based scale)
  const prices = chartData.map((d) => d.price).filter((p) => typeof p === "number");
  const priceMin = prices.length ? Math.min(...prices) : 0;
  const priceMax = prices.length ? Math.max(...prices) : 100;
  const padding = Math.max((priceMax - priceMin) * 0.05, priceMax * 0.01, 0.5);
  const domainMin = Math.max(0, priceMin - padding);
  const domainMax = priceMax + padding;

  const scoreColor =
    score >= 70
      ? "bg-emerald-100 text-emerald-700"
      : score >= 40
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700";

  return (
    <section className="relative overflow-hidden border-b border-zinc-200/80 py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(16,185,129,0.06),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 ring-1 ring-emerald-500/20">
            <TrendingUp className="h-7 w-7 text-emerald-600" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Price Volatility Score
            </h2>
            <p className="mt-1.5 max-w-2xl text-zinc-600">
              Volatility measures how much a product&apos;s price fluctuates day to day, rather than
              whether it is going up or down overall. A product with high volatility has large,
              unpredictable price swings; low volatility means slow, steady changes. Higher volatility
              lowers the Buy Now score because unpredictable prices increase the risk of overpaying.
            </p>
          </div>
        </div>

        {/* How it&apos;s calculated */}
        <div className="mb-8 rounded-xl border border-zinc-200/80 bg-white/80 px-6 py-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-zinc-900">
            <Info className="h-4 w-4 text-emerald-600" />
            How volatility is calculated
          </h3>
          <ol className="space-y-2 text-sm text-zinc-600">
            <li className="flex gap-2">
              <span className="font-medium text-emerald-600">1.</span>
              <span>
                <strong>Daily returns:</strong> Convert prices into percentage changes between
                consecutive days. This makes the measurement scale-independent (a $10 swing matters
                more on a $100 item than a $1,000 item).
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-emerald-600">2.</span>
              <span>
                <strong>Average daily return:</strong> Compute the typical daily movement of the
                price.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-emerald-600">3.</span>
              <span>
                <strong>Standard deviation:</strong> Volatility is the standard deviation of daily
                returns. Each day&apos;s return is compared to the average; squared deviations are averaged;
                the square root brings the value back to scale. The result represents how unstable
                the price is.
              </span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
          {/* Score card */}
          <div className="flex shrink-0 flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-200/80 bg-white/80 px-8 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm lg:w-56">
            <span className="text-sm font-medium text-zinc-500">Volatility Score</span>
            <span
              className={`inline-flex min-w-[4rem] items-center justify-center rounded-xl px-4 py-3 text-2xl font-bold ${scoreColor}`}
            >
              {score}
            </span>
            <span className="text-sm text-zinc-600">
              Volatility: {(volatility * 100).toFixed(2)}%
            </span>
            {isMockData && (
              <span className="text-center text-xs text-amber-600">
                Using simulated price history (real data coming soon)
              </span>
            )}
            {error && (
              <p className="text-center text-xs text-rose-600">{error}</p>
            )}
          </div>

          {/* Chart */}
          <div className="flex-1 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-6 pl-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm">
            {error ? (
              <div className="flex h-32 items-center justify-center rounded-xl bg-zinc-50/50">
                <p className="text-sm text-zinc-500">{error}</p>
              </div>
            ) : chartData.length > 0 ? (
              <div className="aspect-[3/1] w-full min-h-[180px]">
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
                      domain={[domainMin, domainMax]}
                      tickMargin={4}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e4e4e7",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        padding: "10px 14px",
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ fill: "#10b981", strokeWidth: 0 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl bg-zinc-50/50">
                <p className="text-sm text-zinc-500">No price history available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
