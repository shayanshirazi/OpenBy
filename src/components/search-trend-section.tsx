"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { TrendDataPoint } from "@/lib/google-trends";
import { TrendingUp } from "lucide-react";

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
      ? "from-emerald-500/90 to-teal-500/90"
      : score >= 40
        ? "from-amber-500/90 to-orange-500/90"
        : "from-rose-500/90 to-pink-500/90";

  return (
    <section className="relative overflow-hidden border-b border-zinc-200/80 py-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white to-indigo-50/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(99,102,241,0.06),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(139,92,246,0.05),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 ring-1 ring-indigo-500/20">
            <TrendingUp className="h-7 w-7 text-indigo-600" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Search Trend
            </h2>
            <p className="mt-1.5 max-w-xl text-zinc-600">
              Google search interest over the past 3 months. We adjust for
              baseline to avoid inflated scores and factor this into the OpenBy
              Index.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
          {/* Score card */}
          <div className="flex shrink-0 flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-200/80 bg-white/80 px-8 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm lg:w-56">
            <span className="text-sm font-medium text-zinc-500">
              Search Trend Score
            </span>
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${scoreColor} shadow-lg shadow-black/5`}
            >
              <span className="text-3xl font-bold text-white drop-shadow-sm">
                {score}
              </span>
            </div>
            {error && (
              <p className="text-center text-xs text-amber-600">
                Using neutral (fetch failed)
              </p>
            )}
          </div>

          {/* Chart */}
          <div className="min-h-[300px] flex-1 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm">
            {error ? (
              <div className="flex h-72 items-center justify-center rounded-xl bg-zinc-50/50">
                <p className="text-sm text-zinc-500">{error}</p>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 12, right: 12, left: 0, bottom: 8 }}
                >
                  <defs>
                    <linearGradient
                      id="trendGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="#e4e4e7"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    tick={{ fontSize: 11 }}
                    axisLine={{ stroke: "#e4e4e7" }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fontSize: 11 }}
                    domain={[0, 85]}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e4e4e7",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      padding: "10px 14px",
                    }}
                    formatter={(value: number) => [value, "Interest"]}
                    labelFormatter={(label) => label}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#trendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-72 items-center justify-center rounded-xl bg-zinc-50/50">
                <p className="text-sm text-zinc-500">No trend data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
