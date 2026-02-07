import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBestDealsFiltered, type BestDealsSort } from "@/app/actions";
import { BestDealsFilters } from "@/components/best-deals-filters";

type BestDealsPageProps = {
  searchParams: Promise<{ sort?: string; minPrice?: string; maxPrice?: string }>;
};

export default async function BestDealsPage({ searchParams }: BestDealsPageProps) {
  const params = await searchParams;
  const sort = (params.sort as BestDealsSort) ?? "recommended";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;

  const products = await getBestDealsFiltered({
    sort,
    minPrice: minPrice != null && !isNaN(minPrice) ? minPrice : undefined,
    maxPrice: maxPrice != null && !isNaN(maxPrice) ? maxPrice : undefined,
  });

  return (
    <div className="min-h-screen">
      <section className="relative border-b border-zinc-200/80 bg-gradient-to-b from-blue-50/70 via-indigo-50/40 to-white py-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(59,130,246,0.22),rgba(99,102,241,0.1),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <h1 className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Best Deals
          </h1>
          <p className="mt-2 text-zinc-600">
            Highest AI-scored products. Filter by price and sort to find the best
            buys.
          </p>

          <div className="mt-6">
            <Suspense fallback={<div className="h-12" />}>
              <BestDealsFilters />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="relative bg-gradient-to-b from-white to-indigo-50/40 py-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_50%,rgba(99,102,241,0.14),rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
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
                          OpenBy Index: {product.ai_score ?? "—"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-20 text-center">
              <p className="text-zinc-600">
                No deals match your filters. Try adjusting the price range or
                search for products to get AI recommendations.
              </p>
              <Link
                href="/search"
                className="mt-4 inline-block font-medium text-blue-600 hover:underline"
              >
                Search products →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
