import Link from "next/link";
import { Suspense } from "react";
import { getBestDealsFiltered, type BestDealsSort } from "@/app/actions";
import { BestDealsFilters } from "@/components/best-deals-filters";
import { Pagination } from "@/components/ui/pagination";
import { ProductCard } from "@/components/product-card";

type BestDealsPageProps = {
  searchParams: Promise<{
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    category?: string;
    minScore?: string;
    maxScore?: string;
    page?: string;
  }>;
};

export default async function BestDealsPage({ searchParams }: BestDealsPageProps) {
  const params = await searchParams;
  const sort = (params.sort as BestDealsSort) ?? "recommended";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const minScore = params.minScore ? parseFloat(params.minScore) : undefined;
  const maxScore = params.maxScore ? parseFloat(params.maxScore) : undefined;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const result = await getBestDealsFiltered({
    sort,
    minPrice: minPrice != null && !isNaN(minPrice) ? minPrice : undefined,
    maxPrice: maxPrice != null && !isNaN(maxPrice) ? maxPrice : undefined,
    category: params.category?.trim() || undefined,
    minScore: minScore != null && !isNaN(minScore) ? minScore : undefined,
    maxScore: maxScore != null && !isNaN(maxScore) ? maxScore : undefined,
    page: isNaN(page) ? 1 : page,
  });

  const { products, totalCount, totalPages, page: currentPage } = result;

  const buildPageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (params.sort) sp.set("sort", params.sort);
    if (params.minPrice) sp.set("minPrice", params.minPrice);
    if (params.maxPrice) sp.set("maxPrice", params.maxPrice);
    if (params.category) sp.set("category", params.category);
    if (params.minScore) sp.set("minScore", params.minScore);
    if (params.maxScore) sp.set("maxScore", params.maxScore);
    if (p > 1) sp.set("page", String(p));
    const q = sp.toString();
    return q ? `/best-deals?${q}` : "/best-deals";
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-indigo-50/30">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.05),transparent)]" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Best Deals
          </h1>
          <p className="mt-2 text-zinc-600">
            All products. Filter by category, price, OpenBy Index, and sort to
            find the best buys.
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left sidebar filters */}
          <Suspense fallback={<div className="h-64 w-64 shrink-0 rounded-xl bg-zinc-100/50" />}>
            <BestDealsFilters />
          </Suspense>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            <div className="mb-6 rounded-xl border border-zinc-200/80 bg-white/60 px-5 py-4 shadow-sm backdrop-blur-sm">
              <h2 className="text-xl font-medium text-zinc-900">
                All products
                {totalCount > 0 && (
                  <span className="ml-2 text-base font-normal text-zinc-500">
                    ({totalCount}{" "}
                    {totalCount === 1 ? "product" : "products"})
                  </span>
                )}
              </h2>
            </div>

            {products.length > 0 ? (
              <>
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
              </>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-20 text-center">
                <p className="text-zinc-600">
                  No products match your filters. Try adjusting the filters or{" "}
                  <Link
                    href="/search"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    search for products
                  </Link>{" "}
                  to add more.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
