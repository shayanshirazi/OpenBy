"use client";

import type { NewsItem } from "@/lib/serpapi-news";
import { Newspaper, ExternalLink } from "lucide-react";

type RelatedNewsSectionProps = {
  id?: string;
  items: NewsItem[];
  score: number;
  analysis: string;
  error?: string;
};

export function RelatedNewsSection({
  id,
  items,
  score,
  analysis,
  error,
}: RelatedNewsSectionProps) {
  const scoreColor =
    score >= 70
      ? "bg-emerald-100 text-emerald-700"
      : score >= 40
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700";

  return (
    <section id={id} className="relative overflow-hidden border-b border-zinc-200/80 py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50/50 via-white to-blue-50/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(236,72,153,0.05),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/10 to-blue-500/10 ring-1 ring-rose-500/20">
              <Newspaper className="h-7 w-7 text-rose-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Related News
              </h2>
              <p className="mt-1 text-zinc-600">
                Recent news that may affect your purchase decision
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-500">News Score</span>
            <span
              className={`inline-flex min-w-[3.5rem] items-center justify-center rounded-xl px-4 py-2 text-xl font-bold ${scoreColor}`}
            >
              {(score / 10).toFixed(1)}
              <span className="align-sub text-[0.55em] font-normal opacity-90">/10</span>
            </span>
          </div>
        </div>

        {/* Analysis */}
        {analysis && !error && (
          <div className="mb-10 rounded-xl border border-zinc-200/80 bg-white/80 px-6 py-4 shadow-sm">
            <p className="text-zinc-700 leading-relaxed">{analysis}</p>
          </div>
        )}

        {error && (
          <div className="mb-10 rounded-xl border border-amber-200 bg-amber-50/50 px-6 py-4">
            <p className="text-amber-700 text-sm">{error}</p>
          </div>
        )}

        {/* News cards */}
        {items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm transition-all hover:border-rose-200 hover:shadow-lg"
              >
                <div className="relative aspect-video w-full bg-zinc-100">
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
                      <Newspaper className="h-10 w-10 text-zinc-400" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="line-clamp-2 font-medium text-zinc-900 group-hover:text-rose-600">
                    {item.title}
                  </h3>
                  {item.snippet && (
                    <p className="line-clamp-2 text-sm text-zinc-600">
                      {item.snippet}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    {item.source && (
                      <span className="text-xs text-zinc-500">{item.source}</span>
                    )}
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-rose-500" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
            <Newspaper className="mx-auto h-12 w-12 text-zinc-400" />
            <p className="mt-4 text-zinc-600">No related news found</p>
          </div>
        )}
      </div>
    </section>
  );
}
