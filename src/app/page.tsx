import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBestDeals } from "@/app/actions";
import { CategorySlideshow } from "@/components/category-slideshow";
import { HeroSearch } from "@/components/hero-search";
import { CATEGORIES } from "@/lib/categories";

const FAQ_ITEMS = [
  {
    question: "How accurate is the price prediction?",
    answer:
      "Our AI analyzes historical price trends and market data to provide accurate buy recommendations. We track price fluctuations over 30+ days to identify the best time to purchase.",
  },
  {
    question: "Do you track all Amazon products?",
    answer:
      "We currently track a curated selection of tech products including laptops, monitors, phones, and components. New products are added as you search—try searching for any tech product to get started.",
  },
  {
    question: "Is this free to use?",
    answer:
      "Yes! OpenBy is completely free to use. Search for products, view price history, and get AI-powered buy recommendations at no cost.",
  },
  {
    question: "How often is the price data updated?",
    answer:
      "We collect and update price data daily. Our 30-day price history charts reflect the most recent trends, so you can make informed decisions based on up-to-date information.",
  },
  {
    question: "Can I set up price alerts?",
    answer:
      "Price alerts are on our roadmap! For now, bookmark products you're interested in and check back regularly. Our AI Score helps you know when it's a good time to buy at a glance.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "We aggregate price data from trusted sources and apply our AI models to analyze trends. Our algorithms factor in seasonal patterns, historical lows, and market conditions to generate buy recommendations.",
  },
];

export default async function Home() {
  const bestDeals = await getBestDeals();

  return (
    <div className="min-h-screen">
      <HeroSearch />

      {/* Section 2: Trending Categories */}
      <section id="categories" className="relative overflow-visible bg-white py-24">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(239,246,255,0.5)_0%,transparent_60px)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 -z-[5] bg-[linear-gradient(to_top,rgba(250,250,250,0.9)_0%,transparent_100%)]" />
        <div className="relative mx-auto max-w-6xl px-12 sm:px-16">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Browse by Category
            </h2>
            <p className="mt-3 text-zinc-600">
              Find the best deals across tech categories
            </p>
          </div>
          <CategorySlideshow categories={CATEGORIES} />
        </div>
      </section>

      {/* Section 3: Best AI Picks */}
      <section id="best-deals" className="relative bg-gradient-to-b from-zinc-50/80 to-indigo-50/40 py-24">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.95)_0%,transparent_80px)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_50%,rgba(99,102,241,0.08),rgba(59,130,246,0.04),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 -z-[5] bg-[linear-gradient(to_top,rgba(238,242,255,0.9)_0%,transparent_100%)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Best Time to Buy
            </h2>
            <p className="mt-3 text-zinc-600">
              AI-recommended deals based on price trends
            </p>
          </div>
          {bestDeals.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {bestDeals.map((product) => (
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
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
              <p className="text-zinc-600">
                No deals yet. Search for products to get AI-powered recommendations!
              </p>
              <Link
                href="/"
                className="mt-4 inline-block font-medium text-blue-600 hover:underline"
              >
                Start searching →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: FAQ */}
      <section className="relative bg-gradient-to-b from-indigo-50/40 via-blue-50/30 to-white py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_110%,rgba(59,130,246,0.16),rgba(168,85,247,0.06),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              How it Works
            </h2>
            <p className="mt-3 text-zinc-600">
              Everything you need to know about OpenBy
            </p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map(({ question, answer }) => (
              <details
                key={question}
                className="group rounded-xl border border-zinc-200/80 bg-white shadow-sm transition-all [&[open]]:shadow-md [&[open]]:ring-1 [&[open]]:ring-blue-500/10"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-medium text-zinc-900 [&::-webkit-details-marker]:hidden hover:text-zinc-700">
                  {question}
                  <ChevronDown className="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-zinc-100 px-6 py-5 text-zinc-600 leading-relaxed">
                  {answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
