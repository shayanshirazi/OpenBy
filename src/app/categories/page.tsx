import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBestDeals } from "@/app/actions";
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

export default async function CategoriesPage() {
  const bestDeals = await getBestDeals(12);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative border-b border-zinc-200/80 bg-gradient-to-b from-blue-50/60 via-indigo-50/30 to-white py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(59,130,246,0.2),rgba(99,102,241,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <h1 className="pb-2 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Browse Categories
          </h1>
          <p className="mt-4 text-lg text-zinc-600">
            Find the best deals across tech. Click a category to explore products
            and track prices.
          </p>
        </div>
      </section>

      {/* Category Cards */}
      <section className="relative border-b border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50/50 py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_80%_at_30%_20%,rgba(99,102,241,0.12),rgba(59,130,246,0.06),transparent_65%)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CATEGORIES.map((category, i) => {
              const Icon = ICON_MAP[category.icon] ?? Cpu;
              return (
                <Link key={i} href={`/search?q=${category.query}`}>
                  <Card className="group h-full border-zinc-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-200/60 hover:shadow-lg hover:shadow-blue-500/5">
                    <CardContent className="flex flex-col gap-4 p-6">
                      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 transition-colors group-hover:from-blue-100 group-hover:to-indigo-100">
                        <Icon className="h-10 w-10 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900">
                          {category.name}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                          {category.description}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-blue-600 group-hover:underline">
                        View products →
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Best Deals Slideshow */}
      <section id="best-deals" className="relative border-b border-zinc-200/80 bg-gradient-to-b from-indigo-50/40 via-blue-50/30 to-white py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_70%_50%,rgba(59,130,246,0.18),rgba(168,85,247,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Best Deals Right Now
            </h2>
            <p className="mt-3 text-zinc-600">
              AI-recommended products with the best buy scores
            </p>
          </div>
          {bestDeals.length > 0 ? (
            <BestDealsSlideshow products={bestDeals} />
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
              <p className="text-zinc-600">
                No deals yet. Search for products to get AI-powered
                recommendations!
              </p>
              <Link
                href="/search"
                className="mt-4 inline-block font-medium text-blue-600 hover:underline"
              >
                Start searching →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Best Deals Grid Section */}
      <section className="relative border-b border-zinc-200/80 bg-gradient-to-b from-white via-purple-50/20 to-indigo-50/30 py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_80%,rgba(168,85,247,0.15),rgba(99,102,241,0.08),transparent_65%)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Top Picks for You
            </h2>
            <p className="mt-3 text-zinc-600">
              Our highest-rated deals across all categories
            </p>
          </div>
          {bestDeals.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {bestDeals.slice(0, 8).map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="group h-full overflow-hidden border-zinc-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl">
                    <div className="relative aspect-square w-full bg-gradient-to-br from-zinc-50 to-zinc-100">
                      <Image
                        src={product.image_url ?? "https://placehold.co/400"}
                        alt={product.title}
                        fill
                        unoptimized
                        className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <CardContent className="flex flex-col gap-4 p-5">
                      <h3 className="line-clamp-2 font-medium text-zinc-900">
                        {product.title}
                      </h3>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xl font-bold text-zinc-900">
                          ${Number(product.current_price).toFixed(2)}
                        </p>
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm">
                          AI Score: {product.ai_score ?? "—"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
