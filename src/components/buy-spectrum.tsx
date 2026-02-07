"use client";

import React from "react";

type BuySpectrumProps = {
  score: number | null;
  label?: string;
  /** AI-generated 2-3 sentence explanation based on page data. When provided, replaces the static subtext. */
  explanation?: string | null;
};

/** Phrases to link to sections, in order (longer phrases first) */
const SECTION_LINKS: [RegExp, string][] = [
  [/\b7-day moving average\b/gi, "moving-average"],
  [/\b60-day moving average\b/gi, "moving-average"],
  [/\bOpenBy Index\b/gi, "openby-index"],
  [/\bLLM buy score\b/gi, "llm-score"],
  [/\bLLM score\b/gi, "llm-score"],
  [/\bmoving average\b/gi, "moving-average"],
  [/\brelated news\b/gi, "related-news"],
  [/\bnews score\b/gi, "related-news"],
  [/\bsocial media\b/gi, "social-media"],
  [/\bsearch trend\b/gi, "search-trend"],
  [/\bvolatility\b/gi, "volatility"],
  [/\binflation\b/gi, "inflation"],
];

function parseExplanationWithLinks(text: string): React.ReactNode[] {
  const matches: { start: number; end: number; text: string; id: string }[] = [];
  for (const [re, id] of SECTION_LINKS) {
    const str = text;
    let m;
    const regex = new RegExp(re.source, re.flags);
    while ((m = regex.exec(str)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], id });
    }
  }
  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - b.start - (a.end - a.start);
  });
  const filtered: typeof matches = [];
  for (const m of matches) {
    if (filtered.length === 0 || m.start >= filtered[filtered.length - 1]!.end) {
      filtered.push(m);
    }
  }
  const result: React.ReactNode[] = [];
  let lastEnd = 0;
  let key = 0;
  for (const m of filtered) {
    if (m.start > lastEnd) {
      result.push(
        <React.Fragment key={key++}>{text.slice(lastEnd, m.start)}</React.Fragment>
      );
    }
    result.push(
      <a
        key={key++}
        href={`#${m.id}`}
        className="font-medium text-indigo-600 hover:underline hover:text-indigo-700"
      >
        {m.text}
      </a>
    );
    lastEnd = m.end;
  }
  if (lastEnd < text.length) {
    result.push(<React.Fragment key={key++}>{text.slice(lastEnd)}</React.Fragment>);
  }
  return result;
}

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
  const displayScore = score != null ? (score / 10).toFixed(1) : "—";

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="mb-2 text-sm font-medium text-zinc-500">{label}</p>
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-zinc-900">
          {displayScore}
          {score != null && <span className="align-sub text-[0.5em] font-normal text-zinc-500">/10</span>}
        </span>
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
        <p className="mt-1 text-sm leading-relaxed text-zinc-600">
          {explanation?.trim()
            ? parseExplanationWithLinks(displayText)
            : displayText}
        </p>
      </div>
    </div>
  );
}
