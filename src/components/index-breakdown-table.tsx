"use client";

import { useState, useMemo } from "react";
import type { IndexBreakdown } from "@/lib/openby-index";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

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
    if (sortBy !== column) return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 opacity-50" />;
    return asc ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5" />
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-zinc-200/80 bg-zinc-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-zinc-900">OpenBy Index Calculation</h3>
          <p className="mt-1 text-sm text-zinc-600">
            Scores are weighted and summed. Total is the live OpenBy Index.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            <option value="category">Category (A–Z)</option>
            <option value="weight">Weight</option>
            <option value="score">Score</option>
            <option value="contribution">Contribution</option>
          </select>
          <button
            type="button"
            onClick={() => setAsc((a) => !a)}
            className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100"
            title={asc ? "Ascending (click for descending)" : "Descending (click for ascending)"}
          >
            {asc ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <table className="w-full">
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
              <td className="px-6 py-3 text-sm font-medium text-zinc-900">{row.label}</td>
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
