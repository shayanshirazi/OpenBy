"use client";

import type { TweetItem } from "@/lib/serpapi-social";
import type { ViralityResult } from "@/lib/social-virality";
import { MessageCircle, ExternalLink, TrendingUp, BarChart3 } from "lucide-react";

type SocialMediaPresenceSectionProps = {
  items: TweetItem[];
  score: number;
  analysis: string;
  virality?: ViralityResult;
  error?: string;
};

export function SocialMediaPresenceSection({
  items,
  score,
  virality,
  error,
}: SocialMediaPresenceSectionProps) {
  const scoreColor =
    score >= 70
      ? "bg-emerald-100 text-emerald-700"
      : score >= 40
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700";

  return (
    <section className="relative overflow-hidden border-b border-zinc-200/80 py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50/50 via-white to-indigo-50/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(14,165,233,0.05),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 ring-1 ring-sky-500/20">
              <MessageCircle className="h-7 w-7 text-sky-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Social Media Virality
              </h2>
              <p className="mt-1 text-zinc-600">
                Reach, engagement, growth rate, and network amplification
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-500">Virality Score</span>
            <span
              className={`inline-flex min-w-[3.5rem] items-center justify-center rounded-xl px-4 py-2 text-xl font-bold ${scoreColor}`}
            >
              {score}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-10 rounded-xl border border-amber-200 bg-amber-50/50 px-6 py-4">
            <p className="text-amber-700 text-sm">{error}</p>
          </div>
        )}

        {/* Key Metrics */}
        {virality && !error && (
          <div className="mb-10 rounded-xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-zinc-900">
              <BarChart3 className="h-5 w-5 text-sky-600" />
              Key Metrics
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Reach (R)</p>
                <p className="mt-1 text-lg font-bold text-zinc-900">
                  {virality.reach.toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600">Total impressions</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Engagement (E)</p>
                <p className="mt-1 text-lg font-bold text-zinc-900">
                  {virality.engagement.toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600">likes + 2×comments + 3×shares</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">ER</p>
                <p className="mt-1 text-lg font-bold text-zinc-900">
                  {(virality.engagementRate * 100).toFixed(2)}%
                </p>
                <p className="mt-0.5 text-xs text-zinc-600">Engagement rate (E ÷ R)</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Growth (G)</p>
                <p className="mt-1 text-lg font-bold text-zinc-900">
                  {virality.growthRate.toFixed(1)}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600">Engagement/hr over time</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Network (N)</p>
                <p className="mt-1 text-lg font-bold text-zinc-900">
                  {(virality.networkAmplification * 100).toFixed(1)}%
                </p>
                <p className="mt-0.5 text-xs text-zinc-600">Share amplification</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50/50 px-4 py-3">
              <TrendingUp className="h-5 w-5 text-sky-600" />
              <p className="text-sm text-zinc-700">
                <strong>Composite V</strong> = 0.5×ER + 0.3×G + 0.2×N (normalized to 0–100). Based on {virality.postCount} posts.
              </p>
            </div>
          </div>
        )}

        {/* Post cards */}
        {items.length > 0 ? (
          <div>
            <h3 className="mb-4 text-sm font-semibold text-zinc-700">Mentioned posts</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm transition-all hover:border-sky-200 hover:shadow-lg"
                >
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    {(item.authorName || item.authorHandle) && (
                      <div className="flex items-center gap-2">
                        {item.thumbnail && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-900">
                            {item.authorName ?? item.authorHandle}
                          </p>
                          {item.authorHandle && item.authorName && (
                            <p className="truncate text-xs text-zinc-500">
                              {item.authorHandle}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    <p className="line-clamp-4 flex-1 text-sm text-zinc-700 leading-relaxed">
                      {item.snippet}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      {item.publishedDate && (
                        <span className="text-xs text-zinc-500">
                          {item.publishedDate}
                        </span>
                      )}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-400 group-hover:text-sky-500" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-zinc-400" />
            <p className="mt-4 text-zinc-600">No social mentions found</p>
          </div>
        )}
      </div>
    </section>
  );
}
