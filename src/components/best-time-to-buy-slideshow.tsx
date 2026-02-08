"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CARD_WIDTH = 260;
const GAP = 16;
const VISIBLE_CARDS = 3;
const TRANSITION_MS = 350;

function getScoreBadgeClasses(score: number | null): string {
  if (score == null) return "from-zinc-600 to-zinc-700";
  if (score <= 20) return "from-red-600 to-red-500";
  if (score <= 40) return "from-red-600 to-orange-500";
  if (score <= 60) return "from-orange-500 to-yellow-500";
  if (score <= 80) return "from-yellow-500 to-green-600";
  return "from-green-600 to-blue-600";
}

type Product = {
  id: string;
  title: string;
  current_price: number | string;
  image_url: string | null;
  ai_score: number | null;
  category?: string | null;
};

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="shrink-0"
      style={{ width: CARD_WIDTH }}
    >
      <Card className="h-full w-full overflow-hidden rounded-xl border border-zinc-200/80 p-0 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]">
        <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
          <Image
            src={product.image_url?.trim() || "https://placehold.co/400"}
            alt={product.title}
            fill
            unoptimized
            className="object-cover"
            sizes="260px"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between gap-3 px-4 pt-4 pb-2">
          <h3 className="line-clamp-2 text-sm font-medium text-zinc-900">
            {product.title}
          </h3>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold text-zinc-600">
              ${Number(product.current_price).toFixed(2)}
            </p>
            <Badge
              title="OpenBy Index: AI-powered score (0–100)"
              className={`cursor-help flex size-8 items-center justify-center rounded-sm bg-gradient-to-r ${getScoreBadgeClasses(product.ai_score ?? null)} border-0 px-1.5 py-0.5 text-sm font-semibold text-white shadow-sm`}
            >
              {product.ai_score ?? "—"}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function BestTimeToBuySlideshow({ products }: { products: Product[] }) {
  const maxIndex = Math.max(0, products.length - VISIBLE_CARDS);
  const [index, setIndex] = useState(0);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % (maxIndex + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + maxIndex + 1) % (maxIndex + 1));
  }, [maxIndex]);

  useEffect(() => {
    if (products.length <= VISIBLE_CARDS) return;
    const id = setInterval(goNext, 5000);
    return () => clearInterval(id);
  }, [products.length, goNext]);

  if (products.length === 0) return null;

  const visibleWidth = VISIBLE_CARDS * CARD_WIDTH + (VISIBLE_CARDS - 1) * GAP;
  const offset = index * (CARD_WIDTH + GAP);

  return (
    <div className="relative flex justify-center pb-12">
      <div
        className="overflow-hidden"
        style={{ width: visibleWidth, marginLeft: 48, marginRight: 48 }}
      >
        <div
          className="flex"
          style={{
            gap: GAP,
            transform: `translateX(-${offset}px)`,
            transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
            willChange: "transform",
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {products.length > VISIBLE_CARDS && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl"
          >
            <ChevronLeft className="h-6 w-6 text-zinc-700" />
          </button>
          <button
            onClick={goNext}
            aria-label="Next"
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl"
          >
            <ChevronRight className="h-6 w-6 text-zinc-700" />
          </button>
        </>
      )}

      {products.length > VISIBLE_CARDS && (
        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-indigo-600" : "w-2 bg-zinc-300 hover:bg-zinc-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
