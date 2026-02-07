"use client";

import { useState, useMemo } from "react";
import type { IndexBreakdown } from "@/lib/openby-index";
import { CATEGORY_DESCRIPTIONS } from "@/lib/openby-index";
import { ArrowUp, ArrowDown, HelpCircle } from "lucide-react";

type SortOption = "category" | "weight" | "score" | "contribution";

type IndexBreakdownTableProps = {
  breakdown: IndexBreakdown[];
  totalScore: number;
};

export function IndexBreakdownTable({ breakdown, totalScore }: IndexBreakdownTableProps) {
  const [sortBy, setSortBy] = useState<SortOption>("weight");
  const [asc, setAsc] = useState(false);

  const sortedBreakdown = useMemo(() => {
    const copy = [...breakdown];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "category":
          cmp = a.label.localeCompare(b.label);
          break;
        case "weight":
          cmp = a.weight - b.weight;
          break;
        case "score":
          cmp = a.score - b.score;
          break;
        case "contribution":
          cmp = a.weightedScore - b.weightedScore;
          break;
        default:
          return 0;
      }
      return asc ? cmp : -cmp;
    });
    return copy;
  }, [breakdown, sortBy, asc]);

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setAsc((a) => !a);
    } else {
      setSortBy(option);
      setAsc(false);
    }
  };

  const SortIcon = ({ column }: { column: SortOption }) => {
    if (sortBy !== column) return null;
    return asc ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5" />
    );
  };

  return (
    <div className="w-full overflow-visible rounded-xl border border-zinc-200/80 bg-white shadow-sm">
      <div className="border-b border-zinc-200/80 bg-zinc-50/50 px-6 py-4">
        <h3 className="font-semibold text-zinc-900">OpenBy Index Calculation</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Scores are weighted and summed. Total is the live OpenBy Index.
        </p>
      </div>
      <table className="w-full overflow-visible">
        <thead>
          <tr className="border-b border-zinc-200/80">
            <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600">
              <button
                type="button"
                onClick={() => toggleSort("category")}
                className="flex items-center font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                Category
                <SortIcon column="category" />
              </button>
            </th>
            <th className="px-6 py-3 text-right text-sm font-medium text-zinc-600">
              <button
                type="button"
                onClick={() => toggleSort("weight")}
                className="inline-flex items-center font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                Weight
                <SortIcon column="weight" />
              </button>
            </th>
            <th className="px-6 py-3 text-right text-sm font-medium text-zinc-600">
              <button
                type="button"
                onClick={() => toggleSort("score")}
                className="inline-flex items-center font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                Score
                <SortIcon column="score" />
              </button>
            </th>
            <th className="px-6 py-3 text-right text-sm font-medium text-zinc-600">
              <button
                type="button"
                onClick={() => toggleSort("contribution")}
                className="inline-flex items-center font-medium text-zinc-600 transition-colors hover:text-zinc-900"
              >
                Contribution
                <SortIcon column="contribution" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedBreakdown.map((row) => (
            <tr key={row.category} className="border-b border-zinc-100 last:border-0">
              <td className="overflow-visible px-6 py-3">
                <div className="flex items-center gap-1.5 overflow-visible">
                  <span className="text-sm font-medium text-zinc-900">{row.label}</span>
                  <div className="group relative inline-flex overflow-visible">
                    <HelpCircle
                      className="h-4 w-4 shrink-0 cursor-help text-zinc-400 transition-colors hover:text-indigo-500"
                      aria-label={`Info about ${row.label}`}
                    />
                    <div className="pointer-events-none absolute top-full left-1/2 z-[9999] mt-2 w-72 -translate-x-1/2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-left text-sm font-normal text-zinc-700 shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <p className="leading-relaxed">
                        {CATEGORY_DESCRIPTIONS[row.category]}
                      </p>
                      <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 -rotate-45 border-l border-t border-zinc-200 bg-white" />
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-3 text-right text-sm text-zinc-600">{row.weight}%</td>
              <td className="px-6 py-3 text-right text-sm font-medium text-zinc-900">{row.score}</td>
              <td className="px-6 py-3 text-right text-sm font-medium text-zinc-700">
                {row.weightedScore.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-zinc-200 bg-zinc-50/50">
            <td className="px-6 py-4 text-sm font-semibold text-zinc-900" colSpan={3}>
              OpenBy Index
            </td>
            <td className="px-6 py-4 text-right text-lg font-bold text-zinc-900">{totalScore}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
