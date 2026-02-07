import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { searchProductsFiltered, type SearchSort } from "@/app/actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchFilters } from "@/components/search-filters";

function getScoreBadgeClasses(score: number | null): string {
  if (score == null) return "from-zinc-600 to-zinc-700";
  if (score <= 20) return "from-red-600 to-red-500";
  if (score <= 40) return "from-red-600 to-orange-500";
  if (score <= 60) return "from-orange-500 to-yellow-500";
  if (score <= 80) return "from-yellow-500 to-green-600";
  return "from-green-600 to-blue-600";
}

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    minScore?: string;
    maxScore?: string;
    sort?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const { q, category, minPrice, maxPrice, minScore, maxScore, sort } = params;

  if (!q?.trim()) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-600">Enter a search term to find products.</p>
      </div>
    );
  }

  const products = await searchProductsFiltered(q.trim(), {
    category: category || undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    minScore: minScore ? parseFloat(minScore) : undefined,
    maxScore: maxScore ? parseFloat(maxScore) : undefined,
    sort: (sort as SearchSort) || "recommended",
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-indigo-50/30">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.05),transparent)]" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left sidebar filters */}
          <Suspense fallback={<div className="h-64 w-64 shrink-0 rounded-xl bg-zinc-100/50" />}>
            <SearchFilters query={q.trim()} />
          </Suspense>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            <div className="mb-6 rounded-xl border border-zinc-200/80 bg-white/60 px-5 py-4 shadow-sm backdrop-blur-sm">
              <h2 className="text-xl font-medium text-zinc-900">
                Results for &quot;{q.trim().toLowerCase()}&quot;
                {products.length > 0 && (
                  <span className="ml-2 text-base font-normal text-zinc-500">
                    ({products.length} {products.length === 1 ? "product" : "products"})
                  </span>
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="flex h-full flex-col overflow-hidden gap-0 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]">
                    <div className="relative aspect-[16/10] w-full bg-zinc-100">
                      <Image
                        src={product.image_url ?? "https://placehold.co/400"}
                        alt={product.title ?? ""}
                        fill
                        unoptimized
                        className="object-contain p-3"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-3 px-4 pt-4 pb-2">
                      <h3 className="line-clamp-2 text-sm font-medium text-zinc-900">
                        {product.title}
                      </h3>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-zinc-600">
                          ${Number(product.current_price).toFixed(2)}
                        </p>
                        <Badge
                          title="OpenBy Index: AI-powered score (0–100) showing how good a time it is to buy. Higher = better deal."
                          className={`cursor-help flex size-8 items-center justify-center rounded-sm bg-gradient-to-r ${getScoreBadgeClasses(product.ai_score ?? null)} border-0 px-1.5 py-0.5 text-sm font-semibold text-white shadow-sm`}
                        >
                          {product.ai_score ?? "—"}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {products.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
                <p className="text-zinc-600">
                  No products match your filters. Try adjusting the filters or search for something else.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
