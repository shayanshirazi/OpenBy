import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  buildPageHref: (page: number) => string;
  className?: string;
};

export function Pagination({
  currentPage,
  totalPages,
  buildPageHref,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const showPages = 5;
  let start = Math.max(1, currentPage - Math.floor(showPages / 2));
  let end = Math.min(totalPages, start + showPages - 1);
  if (end - start + 1 < showPages) {
    start = Math.max(1, end - showPages + 1);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      {currentPage <= 1 ? (
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-400"
          aria-hidden
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
      ) : (
        <Link
          href={buildPageHref(currentPage - 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}

      {start > 1 && (
        <>
          <Link
            href={buildPageHref(1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            1
          </Link>
          {start > 2 && (
            <span className="px-1 text-zinc-400">…</span>
          )}
        </>
      )}

      {pages.map((p) =>
        p === currentPage ? (
          <span
            key={p}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500 bg-blue-500 text-sm font-medium text-white"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={buildPageHref(p)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            {p}
          </Link>
        )
      )}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-zinc-400">…</span>
          )}
          <Link
            href={buildPageHref(totalPages)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            {totalPages}
          </Link>
        </>
      )}

      {currentPage >= totalPages ? (
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-400"
          aria-hidden
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      ) : (
        <Link
          href={buildPageHref(currentPage + 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}
