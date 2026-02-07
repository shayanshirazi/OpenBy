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
import type { InflationDataPoint } from "@/lib/bank-of-canada";
import { Percent, ExternalLink } from "lucide-react";

type InflationScoreSectionProps = {
  score: number;
  latestValue: number;
  dataPoints: InflationDataPoint[];
  error?: string;
};

export function InflationScoreSection({
  score,
  latestValue,
  dataPoints,
  error,
}: InflationScoreSectionProps) {
  const chartData = dataPoints.map((d) => ({
    date: d.date,
    value: d.value,
  }));

  const scoreColor =
    score >= 70
      ? "bg-emerald-100 text-emerald-700"
      : score >= 40
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700";

  return (
    <section className="relative overflow-hidden border-b border-zinc-200/80 py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(245,158,11,0.06),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 ring-1 ring-amber-500/20">
            <Percent className="h-7 w-7 text-amber-600" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Inflation Score
            </h2>
            <p className="mt-1.5 max-w-2xl text-zinc-600">
              Canada&apos;s inflation rate directly affects tech and consumer goods prices. When the Bank of Canada
              keeps inflation near its 2% target, retail prices tend to be more predictable. Higher inflation
              erodes purchasing power and often pushes retailers to raise prices sooner. For Canadian buyers,
              lower and stable inflation typically means better deals and less urgency to buy before prices rise.
              We use the latest CPI data to inform the OpenBy Index.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
          {/* Score card */}
          <div className="flex shrink-0 flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-200/80 bg-white/80 px-8 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm lg:w-56">
            <span className="text-sm font-medium text-zinc-500">Inflation Score</span>
            <span className={`inline-flex min-w-[4rem] items-center justify-center rounded-xl px-4 py-3 text-2xl font-bold ${scoreColor}`}>
              {score}
            </span>
            <span className="text-sm text-zinc-600">Latest CPI: {latestValue}%</span>
            {error && (
              <p className="text-center text-xs text-amber-600">{error}</p>
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
                <LineChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e4e4e7" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => {
                      const [y, m] = v.split("-");
                      return m ? `${m}/${y?.slice(2)}` : v;
                    }}
                  />
                  <YAxis stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} width={36} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e4e4e7",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      padding: "10px 14px",
                    }}
                    formatter={(value: number) => [`${value}%`, "CPI YoY"]}
                    labelFormatter={(label) => `Month of ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ fill: "#f59e0b", strokeWidth: 0 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-72 items-center justify-center rounded-xl bg-zinc-50/50">
                <p className="text-sm text-zinc-500">No inflation data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Source link */}
        <div className="mt-6 flex justify-end gap-4">
          <a
            href="https://www.bankofcanada.ca/rates/price-indexes/cpi/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-amber-600"
          >
            Source: Bank of Canada CPI
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
          <a
            href="https://tradingeconomics.com/canada/inflation-cpi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-amber-600"
          >
            Trading Economics
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
}
