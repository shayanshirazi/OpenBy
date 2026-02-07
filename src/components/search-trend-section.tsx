"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { TrendDataPoint } from "@/lib/google-trends";

type SearchTrendSectionProps = {
  score: number;
  dataPoints: TrendDataPoint[];
  error?: string;
};

export function SearchTrendSection({
  score,
  dataPoints,
  error,
}: SearchTrendSectionProps) {
  const chartData = dataPoints.map((d) => ({
    date: d.formattedTime || d.date,
    value: d.value,
  }));

  const scoreColor =
    score >= 70
      ? "bg-emerald-100 text-emerald-700"
      : score >= 40
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700";

  return (
    <section className="relative border-b border-zinc-200/80 bg-gradient-to-b from-white to-indigo-50/40 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_50%,rgba(99,102,241,0.08),transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Search Trend
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-zinc-600">
            Google search interest for this product over the past month. Higher
            sustained interest can indicate demand; we factor this into the
            OpenBy Index to help you decide when to buy.
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Score card */}
          <div className="flex shrink-0 flex-col items-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-8 py-6 shadow-sm lg:w-48">
            <span className="text-sm font-medium text-zinc-600">
              Search Trend Score
            </span>
            <span
              className={`inline-flex min-w-[4rem] items-center justify-center rounded-lg px-4 py-3 text-2xl font-bold ${scoreColor}`}
            >
              {score}
            </span>
            {error && (
              <p className="text-xs text-amber-600">Using neutral (fetch failed)</p>
            )}
          </div>

          {/* Chart */}
          <div className="min-h-[280px] flex-1 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
            {error ? (
              <div className="flex h-64 items-center justify-center text-zinc-500">
                <p className="text-sm">{error}</p>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="trendGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#6366f1"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor="#6366f1"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e5e5"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#737373"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#737373"
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#trendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-zinc-500">
                <p className="text-sm">No trend data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
