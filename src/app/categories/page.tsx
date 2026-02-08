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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getBestDealsFiltered } from "@/app/actions";
import { BestDealsSection } from "@/components/best-deals-section";
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
  const { products: bestDeals } = await getBestDealsFiltered({
    sort: "score",
    limit: 5,
    page: 1,
  });

  return (
    <div className="min-h-screen">
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

      {/* Best Deals - same as main page */}
      <BestDealsSection products={bestDeals} emptyLinkHref="/search" />
    </div>
  );
}
