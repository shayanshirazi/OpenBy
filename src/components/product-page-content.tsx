"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Laptop,
  Monitor,
  Smartphone,
  Cpu,
  Keyboard,
  Headphones,
  Tablet,
  Watch,
  Camera,
  HardDrive,
  Gamepad2,
  Tv,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import {
  getLLMProductScores,
  getProductSearchTrends,
  getRelatedSearchTerms,
  getHistoricalPricesFromGemini,
  getCanadaInflation,
  getRelatedNews,
  getSocialMediaPresence,
  getProductVolatility,
  getProductMovingAverage,
  generateBuyRecommendationExplanation,
  getRelatedProducts,
  getBestDeals,
  saveProductOpenByIndex,
} from "@/app/actions";
import { BuySpectrum } from "@/components/buy-spectrum";
import { BestDealsSlideshow } from "@/components/best-deals-slideshow";
import { LLMScoreSection } from "@/components/llm-score-section";
import { ProductQASection } from "@/components/product-qa-section";
import { SearchTrendSection } from "@/components/search-trend-section";
import { VolatilityScoreSection } from "@/components/volatility-score-section";
import { MovingAverageScoreSection } from "@/components/moving-average-score-section";
import { InflationScoreSection } from "@/components/inflation-score-section";
import { RelatedNewsSection } from "@/components/related-news-section";
import { SocialMediaPresenceSection } from "@/components/social-media-presence-section";
import { IndexBreakdownTable } from "@/components/index-breakdown-table";
import { CATEGORIES } from "@/lib/categories";
import {
  buildIndexBreakdownWithLoading,
  calculateOpenByIndexFromPartial,
  type IndexCategory,
} from "@/lib/openby-index";

const ICON_MAP: Record<string, React.ElementType> = {
  laptop: Laptop,
  monitor: Monitor,
  smartphone: Smartphone,
  cpu: Cpu,
  keyboard: Keyboard,
  headphones: Headphones,
  tablet: Tablet,
  watch: Watch,
  camera: Camera,
  hardDrive: HardDrive,
  gamepad2: Gamepad2,
  tv: Tv,
};

function SectionSkeleton({ id, title }: { id: string; title: string }) {
  return (
    <section id={id} className="relative overflow-hidden border-b border-zinc-200/80 py-16">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 animate-pulse items-center justify-center rounded-2xl bg-zinc-200">
            <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
            <p className="mt-1 text-sm text-zinc-500">Calculating…</p>
          </div>
        </div>
        <div className="mt-8 h-48 animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    </section>
  );
}

type Product = {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  current_price: number | null;
  image_url: string | null;
  price_history?: Array<{ price: number; date?: string; created_at?: string }>;
};

type Props = {
  product: Product;
};

export function ProductPageContent({ product }: Props) {
  const id = product.id;
  const title = product.title ?? "";
  const description = product.description ?? "";
  const currentPrice = Number(product.current_price) || 0;
  const priceHistory = useMemo(
    () =>
      (product.price_history ?? []).map((p) => ({
        price: Number(p.price),
        date: (p as { date?: string }).date ?? (p as { created_at?: string }).created_at?.split("T")[0] ?? "",
      })) as Array<{ price: number; date?: string }>,
    [product.price_history]
  );

  const [scores, setScores] = useState<Partial<Record<IndexCategory, number | null>>>({
    predictedPrice: null,
    relatedNews: null,
    inflationScore: null,
    llmScore: null,
    movingAverage: null,
    volatility: null,
    socialMediaPresence: null,
    searchTrend: null,
  });

  const [calculatingSection, setCalculatingSection] = useState<IndexCategory | null>("inflationScore");

  const [llmData, setLlmData] = useState<Awaited<ReturnType<typeof getLLMProductScores>> | null>(null);
  const [newsData, setNewsData] = useState<Awaited<ReturnType<typeof getRelatedNews>> | null>(null);
  const [socialData, setSocialData] = useState<Awaited<ReturnType<typeof getSocialMediaPresence>> | null>(null);
  const [inflationData, setInflationData] = useState<Awaited<ReturnType<typeof getCanadaInflation>> | null>(null);
  const [searchTrendData, setSearchTrendData] = useState<Awaited<ReturnType<typeof getProductSearchTrends>> | null>(null);
  const [volatilityData, setVolatilityData] = useState<Awaited<ReturnType<typeof getProductVolatility>> | null>(null);
  const [maData, setMaData] = useState<Awaited<ReturnType<typeof getProductMovingAverage>> | null>(null);
  const [relatedSearches, setRelatedSearches] = useState<string[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Awaited<ReturnType<typeof getRelatedProducts>>>([]);
  const [buyExplanation, setBuyExplanation] = useState<string | null>(null);
  const [effectivePriceHistory, setEffectivePriceHistory] = useState<Array<{ date: string; price: number }>>(priceHistory);
  const [priceChange7d, setPriceChange7d] = useState<"up" | "down" | null>(null);

  const hasStartedFetch = useRef(false);

  const updateScore = useCallback((key: IndexCategory, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  }, []);

  const openByIndex = calculateOpenByIndexFromPartial(scores);
  const breakdown = buildIndexBreakdownWithLoading(scores);

  const priceFormatted = currentPrice.toFixed(2);
  const [priceDollarsRaw, priceCents] = priceFormatted.split(".");
  const priceDollars = parseInt(priceDollarsRaw ?? "0", 10).toLocaleString();

  useEffect(() => {
    if (hasStartedFetch.current) return;
    hasStartedFetch.current = true;
    let cancelled = false;

    const priceHistoryPromise =
      priceHistory.length >= 7
        ? Promise.resolve(priceHistory)
        : getHistoricalPricesFromGemini(title, product.category, currentPrice).then((h) =>
            h.length >= 7 ? h : priceHistory
          );

    priceHistoryPromise.then((h) => {
      if (!cancelled) {
        setEffectivePriceHistory(h);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        const cutoffStr = cutoff.toISOString().split("T")[0] ?? "";
        const recent = h
          .filter((p) => (p.date ?? "") >= cutoffStr)
          .sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? -1 : 1));
        if (recent.length >= 1) {
          const p7 = recent[0]!.price;
          setPriceChange7d(currentPrice > p7 ? "up" : currentPrice < p7 ? "down" : null);
        }
      }
    });

    // Order by weight (highest first). Volatility & movingAverage need price history, so run them last.
    const sections: IndexCategory[] = [
      "relatedNews",        // 15%
      "llmScore",           // 15%
      "socialMediaPresence", // 10%
      "searchTrend",        // 10%
      "volatility",         // 10% (needs price history)
      "movingAverage",      // 15% (needs price history)
      "inflationScore",     // 5%
    ];

    async function runSequential() {
      let effectiveHistory = priceHistory;
      const localScores: Partial<Record<IndexCategory, number>> = {};

      for (let i = 0; i < sections.length; i++) {
        if (cancelled) return;
        const key = sections[i]!;
        setCalculatingSection(key);

        if (key === "volatility" || key === "movingAverage") {
          effectiveHistory = await priceHistoryPromise;
          if (cancelled) return;
        }

        try {
          if (key === "inflationScore") {
            const data = await getCanadaInflation();
            if (cancelled) return;
            setInflationData(data);
            localScores[key] = data.score;
            updateScore(key, data.score);
          } else if (key === "llmScore") {
            const data = await getLLMProductScores(title, description);
            if (cancelled) return;
            setLlmData(data);
            localScores[key] = data.llmScore;
            updateScore(key, data.llmScore);
          } else if (key === "relatedNews") {
            const data = await getRelatedNews(title);
            if (cancelled) return;
            setNewsData(data);
            localScores[key] = data.score;
            updateScore(key, data.score);
          } else if (key === "socialMediaPresence") {
            const data = await getSocialMediaPresence(title);
            if (cancelled) return;
            setSocialData(data);
            localScores[key] = data.score;
            updateScore(key, data.score);
            const existing = [
              ...(data.relatedQueries ?? []).map((q) => q.query),
              ...(data.risingQueries ?? []).map((q) => q.query),
            ].filter((q): q is string => Boolean(q?.trim())).filter((q, idx, arr) => arr.indexOf(q) === idx);
            const searches = await getRelatedSearchTerms(title, product.category, existing);
            if (!cancelled) setRelatedSearches(searches);
          } else if (key === "searchTrend") {
            const data = await getProductSearchTrends(title, product.category);
            if (cancelled) return;
            setSearchTrendData(data);
            localScores[key] = data.score;
            updateScore(key, data.score);
          } else if (key === "volatility") {
            const data = await getProductVolatility(id, currentPrice, effectiveHistory);
            if (cancelled) return;
            setVolatilityData(data);
            localScores[key] = data.score;
            updateScore(key, data.score);
          } else if (key === "movingAverage") {
            const data = await getProductMovingAverage(id, currentPrice, effectiveHistory);
            if (cancelled) return;
            setMaData(data);
            localScores[key] = data.score;
            updateScore(key, data.score);
          }
        } catch {
          localScores[key] = 50;
          updateScore(key, 50);
        }
      }

      if (cancelled) return;
      localScores.predictedPrice = 100;
      const finalIndex = calculateOpenByIndexFromPartial(localScores);
      saveProductOpenByIndex(id, finalIndex).catch(() => {});
      setCalculatingSection(null);
      updateScore("predictedPrice", 100);

      let rel = await getRelatedProducts(id, product.category ?? undefined, 12);
      if (rel.length === 0) rel = (await getBestDeals(12)).filter((p) => p.id !== id);
      // Randomize related products for variety within same category.
      for (let i = rel.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rel[i], rel[j]] = [rel[j], rel[i]];
      }
      if (!cancelled) setRelatedProducts(rel);
    }

    runSequential();
    return () => {
      cancelled = true;
      hasStartedFetch.current = false; // Allow re-run when Strict Mode remounts
    };
  }, [id, title, description, currentPrice, product.category, priceHistory, updateScore]);

  useEffect(() => {
    let cancelled = false;
    async function loadRelated() {
      let rel = await getRelatedProducts(id, product.category ?? undefined, 12);
      if (rel.length === 0) rel = (await getBestDeals(12)).filter((p) => p.id !== id);
      for (let i = rel.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rel[i], rel[j]] = [rel[j], rel[i]];
      }
      if (!cancelled) setRelatedProducts(rel);
    }
    loadRelated();
    return () => {
      cancelled = true;
    };
  }, [id, product.category]);

  useEffect(() => {
    if (calculatingSection !== null) return;
    if (!llmData || !newsData || !socialData || !inflationData || !searchTrendData || !volatilityData || !maData) return;
    generateBuyRecommendationExplanation({
      productTitle: title,
      productCategory: product.category,
      currentPrice,
      openByIndex,
      llmScore: llmData.llmScore,
      llmAssessments: { openai: llmData.openai.text, gemini: llmData.gemini.text, claude: llmData.claude.text },
      newsScore: newsData.score,
      newsAnalysis: newsData.analysis,
      newsHeadlines: newsData.items?.map((i) => i.title ?? i.snippet).filter(Boolean),
      socialScore: socialData.score,
      socialAnalysis: socialData.analysis,
      inflationScore: inflationData.score,
      inflationLatest: inflationData.latestValue,
      searchTrendScore: searchTrendData.score,
      volatilityScore: volatilityData.score,
      volatilityPercent: volatilityData.volatility,
      maScore: maData.score,
      ma7: maData.ma7,
      ma60: maData.ma60,
      priceAboveMa7: maData.priceAboveMa7,
      priceAboveMa60: maData.priceAboveMa60,
      priceChange7d,
    }).then(setBuyExplanation);
  }, [calculatingSection, llmData, newsData, socialData, inflationData, searchTrendData, volatilityData, maData, title, product.category, currentPrice, priceChange7d, openByIndex]);

  return (
    <div className="min-h-screen">
      <div className="relative min-h-[480px] w-full overflow-hidden border-b border-zinc-200/80">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url?.trim() || "https://placehold.co/600"}
            alt=""
            className="h-full w-full object-cover object-center blur-xl scale-105 opacity-55 saturate-150"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/60 to-white/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_30%,transparent_40%,rgba(255,255,255,0.6)_100%)]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 shadow-lg ring-1 ring-zinc-200/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url?.trim() || "https://placehold.co/600"}
                  alt={title || "Product"}
                  className="h-full w-full object-contain p-2"
                  loading="eager"
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 lg:col-span-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">{title}</h1>
                {product.category && (
                  <span className="mt-2 inline-block rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700">
                    {product.category}
                  </span>
                )}
                {description && <p className="mt-3 text-zinc-600 leading-relaxed">{description}</p>}
                <div className="mt-4">
                  <span className="text-sm font-medium text-zinc-500">Current Price</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                      ${priceDollars}
                      <span className="text-[0.5em] font-semibold [vertical-align:-0.1em]">.{priceCents}</span>
                    </p>
                    {priceChange7d && (
                      <span className={`flex items-center gap-1.5 text-sm font-semibold ${priceChange7d === "up" ? "text-red-600" : "text-green-600"}`}>
                        {priceChange7d === "up" ? <ArrowUp className="h-4 w-4 shrink-0" /> : <ArrowDown className="h-4 w-4 shrink-0" />}
                        <span>{priceChange7d === "up" ? "Higher in past 7 days" : "Lower than past 7 days"}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {calculatingSection && (
            <div className="mt-12 mb-6 flex flex-col items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-900 px-6 py-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/calculating-loading.png"
                alt=""
                className="h-16 w-auto"
                aria-hidden
              />
              <p className="text-center text-base font-semibold text-white">
                Score is being calculated in real time
              </p>
            </div>
          )}
          <div className="mt-8">
            <BuySpectrum
              score={openByIndex}
              label="OpenBy Index"
              explanation={calculatingSection ? "Calculating scores section by section…" : buyExplanation}
            />
          </div>
        </div>
      </div>

      <section id="openby-index" className="w-full border-b border-zinc-200/80 bg-zinc-50/50 py-10">
        <div className="px-6 sm:px-8 lg:px-12">
          <IndexBreakdownTable breakdown={breakdown} totalScore={openByIndex} calculatingSection={calculatingSection} />
        </div>
      </section>

      {inflationData ? (
        <InflationScoreSection
          id="inflation"
          score={inflationData.score}
          latestValue={inflationData.latestValue}
          dataPoints={inflationData.dataPoints}
          error={inflationData.error}
        />
      ) : calculatingSection === "inflationScore" ? (
        <SectionSkeleton id="inflation" title="Inflation Score" />
      ) : null}

      {llmData ? (
        <LLMScoreSection id="llm-score" openai={llmData.openai} gemini={llmData.gemini} claude={llmData.claude} />
      ) : calculatingSection === "llmScore" ? (
        <SectionSkeleton id="llm-score" title="LLM Score" />
      ) : null}

      <ProductQASection productTitle={title} productDescription={description} />

      {newsData ? (
        <RelatedNewsSection id="related-news" items={newsData.items} score={newsData.score} analysis={newsData.analysis} error={newsData.error} />
      ) : calculatingSection === "relatedNews" ? (
        <SectionSkeleton id="related-news" title="Related News" />
      ) : null}

      {socialData ? (
        <SocialMediaPresenceSection
          id="social-media"
          items={socialData.items}
          score={socialData.score}
          analysis={socialData.analysis}
          virality={socialData.virality}
          forums={socialData.forums}
          relatedQueries={socialData.relatedQueries}
          risingQueries={socialData.risingQueries}
          youtubeInterest={socialData.youtubeInterest}
          error={socialData.error}
        />
      ) : calculatingSection === "socialMediaPresence" ? (
        <SectionSkeleton id="social-media" title="Social Media Presence" />
      ) : null}

      {searchTrendData ? (
        <SearchTrendSection
          id="search-trend"
          score={searchTrendData.score}
          dataPoints={searchTrendData.dataPoints}
          error={searchTrendData.error}
          keywordUsed={searchTrendData.keywordUsed}
          productName={title}
          relatedSearches={relatedSearches}
        />
      ) : calculatingSection === "searchTrend" ? (
        <SectionSkeleton id="search-trend" title="Search Trend" />
      ) : null}

      {volatilityData ? (
        <VolatilityScoreSection
          id="volatility"
          score={volatilityData.score}
          volatility={volatilityData.volatility}
          dataPoints={volatilityData.dataPoints}
          isMockData={volatilityData.isMockData}
          error={volatilityData.error}
        />
      ) : calculatingSection === "volatility" ? (
        <SectionSkeleton id="volatility" title="Volatility Score" />
      ) : null}

      {maData ? (
        <MovingAverageScoreSection
          id="moving-average"
          score={maData.score}
          currentPrice={maData.currentPrice}
          ma7={maData.ma7}
          ma60={maData.ma60}
          ma7ZScore={maData.ma7ZScore}
          ma60ZScore={maData.ma60ZScore}
          ma7StdDev={maData.ma7StdDev}
          ma60StdDev={maData.ma60StdDev}
          priceAboveMa7={maData.priceAboveMa7}
          priceAboveMa60={maData.priceAboveMa60}
          dataPoints={maData.dataPoints}
          isMockData={maData.isMockData}
          error={maData.error}
        />
      ) : calculatingSection === "movingAverage" ? (
        <SectionSkeleton id="moving-average" title="Moving Average Score" />
      ) : null}

      {relatedProducts.length > 0 && (
        <section className="relative border-b border-zinc-200/80 bg-gradient-to-b from-indigo-50/40 via-blue-50/30 to-white py-16">
          <div className="relative mx-auto max-w-6xl px-6">
            <div className="mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Related Products</h2>
              <p className="mt-2 text-zinc-600">More items from the same category</p>
            </div>
            <BestDealsSlideshow products={relatedProducts} />
          </div>
        </section>
      )}

      <section className="relative border-b border-zinc-200/80 bg-gradient-to-b from-purple-50/30 via-white to-indigo-50/40 py-16">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Find More Deals by Category</h2>
            <p className="mx-auto mt-2 max-w-xl text-zinc-600">
              Browse other categories to discover the best time to buy.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.slice(0, 8).map((category, i) => {
              const Icon = ICON_MAP[category.icon] ?? Cpu;
              return (
                <Link
                  key={i}
                  href={`/search?q=${category.query}`}
                  className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900 group-hover:text-blue-600">{category.name}</p>
                    <p className="truncate text-sm text-zinc-500">{category.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-zinc-400 group-hover:translate-x-1 group-hover:text-blue-600" />
                </Link>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-400/80 via-purple-400/75 to-fuchsia-400/80 px-6 py-3 font-semibold text-white"
            >
              View All Categories
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
