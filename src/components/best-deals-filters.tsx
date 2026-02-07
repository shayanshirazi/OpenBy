"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended (OpenBy Index)" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
] as const;

export function BestDealsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sort = searchParams.get("sort") ?? "recommended";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const updateFilters = useCallback(
    (updates: { sort?: string; minPrice?: string; maxPrice?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.sort != null) params.set("sort", updates.sort);
      if (updates.minPrice != null) params.set("minPrice", updates.minPrice);
      if (updates.maxPrice != null) params.set("maxPrice", updates.maxPrice);
      router.push(`/best-deals?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ sort: e.target.value });
  };

  const handlePriceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    updateFilters({
      minPrice: String(formData.get("minPrice") ?? "").trim(),
      maxPrice: String(formData.get("maxPrice") ?? "").trim(),
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-sm font-medium text-zinc-600">
          Sort by
        </label>
        <select
          id="sort"
          value={sort}
          onChange={handleSortChange}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <form
        key={`${minPrice}-${maxPrice}`}
        onSubmit={handlePriceSubmit}
        className="flex items-center gap-2"
      >
        <label className="text-sm font-medium text-zinc-600">Price range</label>
        <Input
          name="minPrice"
          type="number"
          placeholder="Min"
          min={0}
          step={0.01}
          defaultValue={minPrice}
          className="h-9 w-24 border-zinc-200"
        />
        <span className="text-zinc-400">–</span>
        <Input
          name="maxPrice"
          type="number"
          placeholder="Max"
          min={0}
          step={0.01}
          defaultValue={maxPrice}
          className="h-9 w-24 border-zinc-200"
        />
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-violet-400/80 via-purple-400/75 to-fuchsia-400/80 px-4 py-2 text-sm font-medium text-white backdrop-blur-md border border-white/30 shadow-md shadow-violet-500/20 transition-all hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400 hover:border-white/40"
        >
          Apply
        </button>
      </form>
    </div>
  );
}
