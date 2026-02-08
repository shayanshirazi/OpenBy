"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProductSuggestions } from "@/hooks/use-product-suggestions";

export function Navbar() {
  const pathname = usePathname();
  const [showOnHome, setShowOnHome] = useState(false);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<number>();
  const { suggestions } = useProductSuggestions(query);

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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
              setIsOpen(true);
            }}
            onBlur={() => {
              closeTimeoutRef.current = window.setTimeout(() => setIsOpen(false), 150);
            }}
          />

          {isOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-[60] mt-2 rounded-xl border border-zinc-200 bg-white/95 p-2 shadow-xl backdrop-blur-sm">
              {suggestions.map((item) => (
                <a
                  key={item.id}
                  href={`/product/${item.id}`}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-zinc-100"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url?.trim() || "https://placehold.co/48"}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-md object-cover"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{item.title}</p>
                  </div>
                  <span className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-2 py-0.5 text-[0.7rem] font-semibold text-white">
                    {item.score ?? "—"}
                  </span>
                </a>
              ))}
            </div>
          )}
        </form>

        {/* Right: Links */}
        <nav className="flex shrink-0 items-center gap-8">
          <Link
            href="/categories"
            className="inline-block text-sm font-semibold text-zinc-700 transition-[transform,color] duration-200 hover:scale-110 hover:text-zinc-900"
          >
            Categories
          </Link>
          <Link
            href="/best-deals"
            className="inline-block text-sm font-semibold text-zinc-700 transition-[transform,color] duration-200 hover:scale-110 hover:text-zinc-900"
          >
            Best Deals
          </Link>
        </nav>
      </div>
    </header>
  );
}
