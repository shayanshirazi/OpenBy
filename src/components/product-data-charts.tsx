"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type PricePoint = { price: number; date: string };

// Example data for charts we don't have real data for
const EXAMPLE_PRICE_DISTRIBUTION = [
  { range: "$0-50", count: 12, label: "Low" },
  { range: "$50-100", count: 28, label: "Mid" },
  { range: "$100-200", count: 45, label: "Avg" },
  { range: "$200+", count: 18, label: "High" },
];

const EXAMPLE_WEEKLY_TREND = [
  { week: "W1", price: 189, avg: 195 },
  { week: "W2", price: 182, avg: 192 },
  { week: "W3", price: 179, avg: 188 },
  { week: "W4", price: 175, avg: 185 },
];

const EXAMPLE_SEASONALITY = [
  { month: "Jan", index: 98 },
  { month: "Feb", index: 95 },
  { month: "Mar", index: 92 },
  { month: "Apr", index: 90 },
  { month: "May", index: 88 },
  { month: "Jun", index: 92 },
  { month: "Jul", index: 95 },
  { month: "Aug", index: 97 },
  { month: "Sep", index: 100 },
  { month: "Oct", index: 102 },
  { month: "Nov", index: 98 },
  { month: "Dec", index: 95 },
];

type ProductDataChartsProps = {
  priceHistory: PricePoint[];
  currentPrice: number;
};

export function ProductDataCharts({
  priceHistory,
  currentPrice,
}: ProductDataChartsProps) {
  const chartData = priceHistory.map((d) => ({
    price: d.price,
    date: d.date,
  }));

  return (
    <div className="space-y-8">
      {/* Price History */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-zinc-900">30-Day Price History</h3>
        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="date"
                  stroke="#737373"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis
                  stroke="#737373"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  name="Price"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg bg-zinc-50 text-zinc-500">
            No price history data yet
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Price vs Market Average (example) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-zinc-900">Price vs Market Average</h3>
          <p className="mb-4 text-xs text-zinc-500">Example: Your price vs category average (simulated)</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EXAMPLE_WEEKLY_TREND} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="week" stroke="#737373" tick={{ fontSize: 11 }} />
                <YAxis stroke="#737373" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value: number) => [`$${value}`, ""]} />
                <Area type="monotone" dataKey="avg" stroke="#94a3b8" fill="#e2e8f0" strokeWidth={1} name="Market Avg" />
                <Area type="monotone" dataKey="price" stroke="#2563eb" fill="#3b82f620" strokeWidth={2} name="This Product" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Price Distribution (example) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-zinc-900">Price Distribution in Category</h3>
          <p className="mb-4 text-xs text-zinc-500">Example: How similar products are priced (simulated)</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EXAMPLE_PRICE_DISTRIBUTION} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis dataKey="range" stroke="#737373" tick={{ fontSize: 11 }} />
                <YAxis stroke="#737373" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Products" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Seasonality (example) */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-zinc-900">Seasonal Price Index</h3>
        <p className="mb-4 text-xs text-zinc-500">
          Example: Typical price index by month (100 = average). Lower = better time to buy.
        </p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={EXAMPLE_SEASONALITY} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
              <XAxis dataKey="month" stroke="#737373" tick={{ fontSize: 11 }} />
              <YAxis stroke="#737373" tick={{ fontSize: 11 }} domain={[85, 105]} />
              <Tooltip formatter={(value: number) => [value, "Index"]} />
              <Bar dataKey="index" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Price Index" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
