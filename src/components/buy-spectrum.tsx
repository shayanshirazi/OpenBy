"use client";

type BuySpectrumProps = {
  score: number | null;
  label?: string;
  /** AI-generated 2-3 sentence explanation based on page data. When provided, replaces the static subtext. */
  explanation?: string | null;
};

export function BuySpectrum({ score, label = "Buy Now Score", explanation }: BuySpectrumProps) {
  const value = score != null ? Math.min(100, Math.max(0, score)) : 50;
  const isGood = value >= 70;
  const isFair = value >= 40 && value < 70;
  const isPoor = value < 40;

  const getVerdict = () => {
    if (isGood) return { text: "Good time to buy", subtext: "Price trend favors buying now", color: "text-emerald-600" };
    if (isFair) return { text: "Consider waiting", subtext: "Price may improve soon", color: "text-amber-600" };
    return { text: "Wait for a better price", subtext: "Historical data suggests waiting", color: "text-rose-600" };
  };

  const verdict = getVerdict();
  const displayText = explanation?.trim() || verdict.subtext;

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="mb-2 text-sm font-medium text-zinc-500">{label}</p>
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-zinc-900">
          {score != null ? score : "—"}
        </span>
        <span className="text-zinc-500">/ 100</span>
      </div>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-zinc-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{
            width: `${value}%`,
            background: isGood
              ? "linear-gradient(90deg, #10b981, #34d399)"
              : isFair
              ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
              : "linear-gradient(90deg, #f43f5e, #fb7185)",
          }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-zinc-400">Poor</span>
        <span className="text-xs text-zinc-400">Fair</span>
        <span className="text-xs text-zinc-400">Good</span>
      </div>
      <div className="mt-6 rounded-xl bg-zinc-50 p-4">
        <p className={`font-semibold ${verdict.color}`}>{verdict.text}</p>
        <p className="mt-1 text-sm text-zinc-600">{displayText}</p>
      </div>
    </div>
  );
}
