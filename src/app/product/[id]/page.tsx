import Image from "next/image";
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
} from "lucide-react";
import { getProductById, getRelatedProducts, getBestDeals } from "@/app/actions";
import { BuySpectrum } from "@/components/buy-spectrum";
import { ProductDataCharts } from "@/components/product-data-charts";
import { BestDealsSlideshow } from "@/components/best-deals-slideshow";
import { CATEGORIES } from "@/lib/categories";

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

  const aiInsight = product.ai_insights?.[0];
  const aiScore = (aiInsight as { score?: number })?.score ?? null;
  const aiRecommendation = aiInsight?.summary ?? product.ai_summary ?? "No AI recommendation available.";

  const priceHistoryData = (product.price_history ?? []).map(
    (ph: { price: number; date: string }) => ({
      price: ph.price,
      date: ph.date,
    })
  );

  let relatedProducts = await getRelatedProducts(id, product.category, 12);
  if (relatedProducts.length === 0) {
    relatedProducts = (await getBestDeals(12)).filter((p) => p.id !== id);
  }

  return (
    <div className="min-h-screen">
      {/* Hero: Image, Name, Price, Score, Buy Spectrum */}
      <div className="relative border-b border-zinc-200/80 bg-gradient-to-b from-blue-50/50 via-indigo-50/20 to-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_20%_30%,rgba(59,130,246,0.2),rgba(99,102,241,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Image */}
            <div className="lg:col-span-2">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 shadow-lg">
                <Image
                  src={product.image_url ?? "https://placehold.co/400"}
                  alt={product.title}
                  fill
                  unoptimized
                  className="object-contain p-8"
                  priority
                />
              </div>
            </div>

            {/* Title, Price, Score, Spectrum */}
            <div className="flex flex-col gap-6 lg:col-span-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                  {product.title}
                </h1>
                <p className="mt-2 text-3xl font-bold text-zinc-900">
                  ${Number(product.current_price).toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 text-white shadow-md">
                  <span className="text-xs font-medium opacity-90">AI Score</span>
                  <p className="text-2xl font-bold">{aiScore ?? "—"}</p>
                </div>
                {product.category && (
                  <span className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
                    {product.category}
                  </span>
                )}
              </div>

              <BuySpectrum score={aiScore} label="Buy Now Recommendation" />

              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-sm font-medium text-zinc-500">AI Insight</p>
                <p className="mt-2 text-zinc-700">{aiRecommendation}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DATA Section */}
      <section className="relative border-b border-zinc-200/80 bg-gradient-to-b from-white to-blue-50/40 py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_50%,rgba(99,102,241,0.16),rgba(59,130,246,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Data & Analytics
            </h2>
            <p className="mt-2 text-zinc-600">
              Price trends, market comparison, and historical analysis
            </p>
          </div>
          <ProductDataCharts
            priceHistory={priceHistoryData}
            currentPrice={Number(product.current_price)}
          />
        </div>
      </section>

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
                Similar products with top AI buy scores
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
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-zinc-800"
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
