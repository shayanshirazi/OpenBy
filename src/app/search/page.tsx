import Link from "next/link";
import { Suspense } from "react";
import { searchProductsFiltered, type SearchSort } from "@/app/actions";
import { SearchFilters } from "@/components/search-filters";
import { Pagination } from "@/components/ui/pagination";
import { ProductCard } from "@/components/product-card";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    minScore?: string;
    maxScore?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const { q, category, minPrice, maxPrice, minScore, maxScore, sort, page } = params;
  const pageNum = page ? parseInt(page, 10) : 1;

  if (!q?.trim()) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-600">Enter a search term to find products.</p>
      </div>
    );
  }

  const result = await searchProductsFiltered(q.trim(), {
    category: category || undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    minScore: minScore ? parseFloat(minScore) : undefined,
    maxScore: maxScore ? parseFloat(maxScore) : undefined,
    sort: (sort as SearchSort) || "recommended",
    page: isNaN(pageNum) ? 1 : pageNum,
  });

  const { products, totalCount, totalPages, page: currentPage } = result;

  const buildPageHref = (p: number) => {
    const sp = new URLSearchParams();
    sp.set("q", q.trim());
    if (category) sp.set("category", category);
    if (minPrice) sp.set("minPrice", minPrice);
    if (maxPrice) sp.set("maxPrice", maxPrice);
    if (minScore) sp.set("minScore", minScore);
    if (maxScore) sp.set("maxScore", maxScore);
    if (sort) sp.set("sort", sort);
    if (p > 1) sp.set("page", String(p));
    return `/search?${sp.toString()}`;
  };

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
                {totalCount > 0 && (
                  <span className="ml-2 text-base font-normal text-zinc-500">
                    ({totalCount} {totalCount === 1 ? "product" : "products"})
                  </span>
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                buildPageHref={buildPageHref}
                className="mt-8"
              />
            )}

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
