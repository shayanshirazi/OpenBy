"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/70 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        {/* Left: Logo */}
        <Link
          href="/"
          className="shrink-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent transition-opacity hover:opacity-80"
        >
          OpenBy
        </Link>

        {/* Middle: Search */}
        <form action="/search" method="get" className="group relative w-full max-w-[320px]">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-blue-600" />
          </div>
          <Input
            name="q"
            type="search"
            placeholder="Search for products..."
            className="h-10 border-zinc-200/80 bg-white/60 pl-10 transition-colors focus-visible:border-blue-300 focus-visible:bg-white"
            autoComplete="off"
          />
        </form>

        {/* Right: Links */}
        <nav className="flex shrink-0 items-center gap-8">
          <Link
            href="/categories"
            className="text-sm font-semibold text-zinc-700 transition-colors hover:text-zinc-900"
          >
            Categories
          </Link>
          <Link
            href="/best-deals"
            className="text-sm font-semibold text-zinc-700 transition-colors hover:text-zinc-900"
          >
            Best Deals
          </Link>
        </nav>
      </div>
    </header>
  );
}
