"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const pathname = usePathname();
  const [showOnHome, setShowOnHome] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    const checkScroll = () => {
      setShowOnHome(window.scrollY > window.innerHeight * 0.6);
    };
    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, [pathname]);

  const isVisible = pathname !== "/" || showOnHome;
  if (!isVisible) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-gradient-to-r from-violet-400/4 via-purple-400/3 to-fuchsia-400/4 shadow-sm backdrop-blur-3xl transition-opacity duration-300">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        {/* Left: Logo */}
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="inline-block shrink-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent transition-transform duration-200 hover:scale-110"
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
            placeholder="What are you looking for today?"
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
