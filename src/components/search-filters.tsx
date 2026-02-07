"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef } from "react";
import { CATEGORIES } from "@/lib/categories";
import { RangeSlider } from "@/components/ui/range-slider";
import type { SearchSort } from "@/app/actions";

const PRICE_MIN = 0;
const PRICE_MAX = 3000;
const INDEX_MIN = 0;
const INDEX_MAX = 100;

const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "date", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "score", label: "OpenBy Index" },
  { value: "alphabetical", label: "Alphabetical" },
];

export function SearchFilters({ query }: { query: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const minScoreParam = searchParams.get("minScore");
  const maxScoreParam = searchParams.get("maxScore");
  const sort = (searchParams.get("sort") as SearchSort) ?? "recommended";

  const priceValue: [number, number] = useMemo(() => {
    const min = minPriceParam ? parseFloat(minPriceParam) : PRICE_MIN;
    const max = maxPriceParam ? parseFloat(maxPriceParam) : PRICE_MAX;
    return [
      isNaN(min) ? PRICE_MIN : Math.max(PRICE_MIN, Math.min(min, PRICE_MAX)),
      isNaN(max) ? PRICE_MAX : Math.max(PRICE_MIN, Math.min(max, PRICE_MAX)),
    ];
  }, [minPriceParam, maxPriceParam]);

  const indexValue: [number, number] = useMemo(() => {
    const min = minScoreParam ? parseFloat(minScoreParam) : INDEX_MIN;
    const max = maxScoreParam ? parseFloat(maxScoreParam) : INDEX_MAX;
    return [
      isNaN(min) ? INDEX_MIN : Math.max(INDEX_MIN, Math.min(min, INDEX_MAX)),
      isNaN(max) ? INDEX_MAX : Math.max(INDEX_MIN, Math.min(max, INDEX_MAX)),
    ];
  }, [minScoreParam, maxScoreParam]);

  const updateParams = useCallback(
    (updates: Record<string, string>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("q", query);
      if (resetPage) params.delete("page");
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams, query]
  );

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ sort: e.target.value });
  };

  const handleCategoryChange = (cat: string) => {
    updateParams({ category: cat === category ? "" : cat });
  };

  const priceDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const indexDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handlePriceChange = useCallback(
    ([min, max]: [number, number]) => {
      if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
      priceDebounceRef.current = setTimeout(() => {
        updateParams({
          minPrice: min > PRICE_MIN ? String(min) : "",
          maxPrice: max < PRICE_MAX ? String(max) : "",
        });
      }, 150);
    },
    [updateParams]
  );

  const handleIndexChange = useCallback(
    ([min, max]: [number, number]) => {
      if (indexDebounceRef.current) clearTimeout(indexDebounceRef.current);
      indexDebounceRef.current = setTimeout(() => {
        updateParams({
          minScore: min > INDEX_MIN ? String(min) : "",
          maxScore: max < INDEX_MAX ? String(max) : "",
        });
      }, 150);
    },
    [updateParams]
  );

  const clearFilters = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const hasFilters =
    category ||
    minPriceParam ||
    maxPriceParam ||
    minScoreParam ||
    maxScoreParam;

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="sticky top-24 space-y-6 rounded-xl border border-zinc-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Filters</h3>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Sort */}
        <div>
          <label htmlFor="sort" className="mb-2 block text-sm font-medium text-zinc-700">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={handleSortChange}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 transition-colors hover:border-zinc-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-zinc-700">Category</h4>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {CATEGORIES.map((cat) => (
              <label
                key={cat.name}
                className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
              >
                <input
                  type="checkbox"
                  checked={category === cat.name}
                  onChange={() => handleCategoryChange(cat.name)}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        {/* Price range spectrum */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-zinc-700">Price range</h4>
          <RangeSlider
            min={PRICE_MIN}
            max={PRICE_MAX}
            value={priceValue}
            onChange={handlePriceChange}
            step={25}
            formatValue={(v) => `$${v}`}
          />
        </div>

        {/* OpenBy Index spectrum */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-zinc-700">OpenBy Index</h4>
          <RangeSlider
            min={INDEX_MIN}
            max={INDEX_MAX}
            value={indexValue}
            onChange={handleIndexChange}
            step={1}
            formatValue={(v) => String(Math.round(v))}
          />
        </div>
      </div>
    </aside>
  );
}
