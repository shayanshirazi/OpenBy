import type { IndexBreakdown } from "@/lib/openby-index";

type IndexBreakdownTableProps = {
  breakdown: IndexBreakdown[];
  totalScore: number;
};

export function IndexBreakdownTable({ breakdown, totalScore }: IndexBreakdownTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm">
      <div className="border-b border-zinc-200/80 bg-zinc-50/50 px-6 py-4">
        <h3 className="font-semibold text-zinc-900">OpenBy Index Calculation</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Scores are weighted and summed. Total is the live OpenBy Index.
        </p>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200/80">
            <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600">Category</th>
            <th className="px-6 py-3 text-right text-sm font-medium text-zinc-600">Weight</th>
            <th className="px-6 py-3 text-right text-sm font-medium text-zinc-600">Score</th>
            <th className="px-6 py-3 text-right text-sm font-medium text-zinc-600">Contribution</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((row) => (
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
