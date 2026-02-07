import Link from "next/link";
import { notFound } from "next/navigation";
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
} from "lucide-react";
import { getProductById, getRelatedProducts, getBestDeals, getLLMProductScores, getProductSearchTrends, getCanadaInflation, getRelatedNews, getSocialMediaPresence, getProductVolatility, getProductMovingAverage, generateBuyRecommendationExplanation } from "@/app/actions";
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
  buildIndexBreakdown,
  calculateOpenByIndex,
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

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const title = product.title ?? "";
  const description = product.description ?? "";

  const currentPrice = Number(product.current_price) || 0;
  const priceHistory = (product.price_history ?? []) as Array<{ price: number; date?: string }>;

  const [{ openai, gemini, claude, llmScore }, searchTrendResult, inflationResult, newsResult, socialResult, volatilityResult, movingAverageResult] = await Promise.all([
    getLLMProductScores(title, description),
    getProductSearchTrends(title, product.category),
    getCanadaInflation(),
    getRelatedNews(title),
    getSocialMediaPresence(title),
    getProductVolatility(product.id, currentPrice, priceHistory),
    getProductMovingAverage(product.id, currentPrice, priceHistory),
  ]);

  const searchTrendScore = searchTrendResult.score;

  const breakdown = buildIndexBreakdown({
    llmScore,
    relatedNews: newsResult.score,
    inflationScore: inflationResult.score,
    predictedPrice: 100,
    movingAverage: movingAverageResult.score,
    volatility: volatilityResult.score,
    socialMediaPresence: socialResult.score,
    searchTrend: searchTrendScore,
  });

  const openByIndex = calculateOpenByIndex(breakdown);

  let relatedProducts = await getRelatedProducts(id, product.category, 12);
  if (relatedProducts.length === 0) {
    relatedProducts = (await getBestDeals(12)).filter((p) => p.id !== id);
  }

  // 7-day price change: compare oldest vs newest in last 7 days
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().split("T")[0] ?? "";
  const recentHistory = (priceHistory ?? [])
    .filter((p) => typeof p.price === "number" && (p.date ?? "") >= cutoffStr)
    .sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? -1 : 1));
  let priceChange7d: "up" | "down" | null = null;
  if (recentHistory.length >= 2) {
    const oldP = recentHistory[0]!.price;
    const newP = recentHistory[recentHistory.length - 1]!.price;
    if (newP > oldP) priceChange7d = "up";
    else if (newP < oldP) priceChange7d = "down";
  }

  const buyExplanation = await generateBuyRecommendationExplanation({
    productTitle: title,
    productCategory: product.category,
    currentPrice,
    openByIndex,
    llmScore,
    llmAssessments: {
      openai: openai.text || undefined,
      gemini: gemini.text || undefined,
      claude: claude.text || undefined,
    },
    newsScore: newsResult.score,
    newsAnalysis: newsResult.analysis,
    newsHeadlines: newsResult.items?.map((i) => i.title ?? i.snippet).filter(Boolean),
    socialScore: socialResult.score,
    socialAnalysis: socialResult.analysis,
    inflationScore: inflationResult.score,
    inflationLatest: inflationResult.latestValue,
    searchTrendScore: searchTrendResult.score,
    volatilityScore: volatilityResult.score,
    volatilityPercent: volatilityResult.volatility,
    maScore: movingAverageResult.score,
    ma7: movingAverageResult.ma7,
    ma60: movingAverageResult.ma60,
    priceAboveMa7: movingAverageResult.priceAboveMa7,
    priceAboveMa60: movingAverageResult.priceAboveMa60,
    priceChange7d,
  });

  return (
    <div className="min-h-screen">
      {/* Hero: Image, Name, Price, Score */}
      <div className="relative overflow-hidden border-b border-zinc-200/80">
        {/* Blurred product image as background */}
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url ?? "https://placehold.co/600"}
            alt=""
            className="h-full w-full object-cover blur-2xl scale-110 opacity-30"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Image */}
            <div className="lg:col-span-2">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 shadow-lg ring-1 ring-zinc-200/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url ?? "https://placehold.co/600"}
                  alt={product.title ?? "Product"}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </div>
            </div>

            {/* Title, Category, Description, Price */}
            <div className="flex flex-col gap-6 lg:col-span-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                  {product.title}
                </h1>
                {product.category && (
                  <span className="mt-2 inline-block rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700">
                    {product.category}
                  </span>
                )}
                {description && (
                  <p className="mt-3 text-zinc-600 leading-relaxed">{description}</p>
                )}
                <div className="mt-4">
                  <span className="text-sm font-medium text-zinc-500">Current Price</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                      ${Number(product.current_price).toFixed(2)}
                    </p>
                    {priceChange7d && (
                      <span
                        className={`flex items-center gap-1.5 text-sm font-semibold ${
                          priceChange7d === "up" ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {priceChange7d === "up" ? (
                          <ArrowUp className="h-4 w-4 shrink-0" />
                        ) : (
                          <ArrowDown className="h-4 w-4 shrink-0" />
                        )}
                        <span>
                          {priceChange7d === "up" ? "Up" : "Down"} in past 7 days
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Full-width Buy Now Recommendation */}
          <div className="mt-8">
            <BuySpectrum score={openByIndex} label="Buy Now Recommendation" explanation={buyExplanation} />
          </div>
        </div>
      </div>

      {/* OpenBy Index Calculation - Full-width section */}
      <section className="w-full border-b border-zinc-200/80 bg-zinc-50/50 py-10">
        <div className="px-6 sm:px-8 lg:px-12">
          <IndexBreakdownTable breakdown={breakdown} totalScore={openByIndex} />
        </div>
      </section>

      {/* LLM Score Section */}
      <LLMScoreSection openai={openai} gemini={gemini} claude={claude} />

      {/* Product Q&A - Ask specific question */}
      <ProductQASection productTitle={title} productDescription={description} />

      {/* Related News Section */}
      <RelatedNewsSection
        items={newsResult.items}
        score={newsResult.score}
        analysis={newsResult.analysis}
        error={newsResult.error}
      />

      {/* Social Media Presence Section */}
      <SocialMediaPresenceSection
        items={socialResult.items}
        score={socialResult.score}
        analysis={socialResult.analysis}
        virality={socialResult.virality}
        error={socialResult.error}
      />

      {/* Inflation Score Section */}
      <InflationScoreSection
        score={inflationResult.score}
        latestValue={inflationResult.latestValue}
        dataPoints={inflationResult.dataPoints}
        error={inflationResult.error}
      />

      {/* Search Trend Section */}
      <SearchTrendSection
        score={searchTrendResult.score}
        dataPoints={searchTrendResult.dataPoints}
        error={searchTrendResult.error}
        keywordUsed={searchTrendResult.keywordUsed}
      />

      {/* Moving Average Score Section */}
      <MovingAverageScoreSection
        score={movingAverageResult.score}
        currentPrice={movingAverageResult.currentPrice}
        ma7={movingAverageResult.ma7}
        ma60={movingAverageResult.ma60}
        ma7ZScore={movingAverageResult.ma7ZScore}
        ma60ZScore={movingAverageResult.ma60ZScore}
        ma7StdDev={movingAverageResult.ma7StdDev}
        ma60StdDev={movingAverageResult.ma60StdDev}
        priceAboveMa7={movingAverageResult.priceAboveMa7}
        priceAboveMa60={movingAverageResult.priceAboveMa60}
        dataPoints={movingAverageResult.dataPoints}
        isMockData={movingAverageResult.isMockData}
        error={movingAverageResult.error}
      />

      {/* Volatility Score Section */}
      <VolatilityScoreSection
        score={volatilityResult.score}
        volatility={volatilityResult.volatility}
        dataPoints={volatilityResult.dataPoints}
        isMockData={volatilityResult.isMockData}
        error={volatilityResult.error}
      />

      {/* Related / Best Deals Slideshow */}
      {relatedProducts.length > 0 && (
        <section className="relative border-b border-zinc-200/80 bg-gradient-to-b from-indigo-50/40 via-blue-50/30 to-white py-16">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_80%_40%,rgba(59,130,246,0.18),rgba(168,85,247,0.08),transparent_60%)]" />
          <div className="relative mx-auto max-w-6xl px-6">
            <div className="mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Related Products & Best Deals
              </h2>
              <p className="mt-2 text-zinc-600">
                Similar products with top OpenBy Index
              </p>
            </div>
            <BestDealsSlideshow products={relatedProducts} />
          </div>
        </section>
      )}

      {/* Browse by Category */}
      <section className="relative border-b border-zinc-200/80 bg-gradient-to-b from-purple-50/30 via-white to-indigo-50/40 py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_80%_at_50%_100%,rgba(168,85,247,0.16),rgba(99,102,241,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Find More Deals by Category
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-zinc-600">
              Browse other categories to discover the best time to buy. Our AI tracks
              prices across tech so you don&apos;t have to.
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
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 transition-colors group-hover:from-blue-100 group-hover:to-indigo-100">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900 group-hover:text-blue-600">
                      {category.name}
                    </p>
                    <p className="truncate text-sm text-zinc-500">
                      {category.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                </Link>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-400/80 via-purple-400/75 to-fuchsia-400/80 px-6 py-3 font-semibold text-white backdrop-blur-md border border-white/30 shadow-lg shadow-violet-500/25 transition-all hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400 hover:border-white/40 hover:shadow-violet-500/30"
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
