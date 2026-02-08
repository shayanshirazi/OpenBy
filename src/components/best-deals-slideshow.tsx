"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CARD_WIDTH = 220;
const GAP = 20;
const ITEM_WIDTH = CARD_WIDTH + GAP;
const VISIBLE_CARDS = 4;
const VISIBLE_WIDTH = VISIBLE_CARDS * CARD_WIDTH + (VISIBLE_CARDS - 1) * GAP;
const NAV_MARGIN = 48;
const CENTER_OFFSET = 0.5;
const TRANSITION_MS = 350;

type Product = {
  id: string;
  title: string;
  current_price: number | string;
  image_url: string | null;
  ai_score: number | null;
};

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="shrink-0"
      style={{ width: CARD_WIDTH }}
    >
      <Card className="group h-full w-full overflow-hidden border-zinc-200/80 bg-white p-0 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl">
        <div className="relative aspect-square w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
          <Image
            src={product.image_url?.trim() || "https://placehold.co/400"}
            alt={product.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="220px"
          />
        </div>
        <CardContent className="flex flex-col gap-3 p-4">
          <h3 className="line-clamp-2 text-sm font-medium text-zinc-900">
            {product.title}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <p className="text-lg font-bold text-zinc-900">
              ${Number(product.current_price).toFixed(2)}
            </p>
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm">
              Index: {product.ai_score ?? "—"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function BestDealsSlideshow({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const indexRef = useRef(index);
  indexRef.current = index;

  if (products.length < 2) {
    return (
      <div className="flex justify-center gap-6 py-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  const items = [
    products[products.length - 1],
    ...products,
    products[0],
  ];
  const totalItems = items.length;

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, totalItems - 1));
  }, [totalItems]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (e.propertyName !== "transform" || e.target !== e.currentTarget)
        return;
      const i = indexRef.current;
      if (i !== 0 && i !== totalItems - 1) return;
      setIsTransitioning(false);
      requestAnimationFrame(() => {
        setIndex(i === 0 ? totalItems - 2 : 1);
        requestAnimationFrame(() => setIsTransitioning(true));
      });
    },
    [totalItems]
  );

  return (
    <div className="relative w-full">
      <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-2">
        <button
          onClick={goPrev}
          aria-label="Previous deals"
          className="rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl"
        >
          <ChevronLeft className="h-6 w-6 text-zinc-700" />
        </button>
      </div>

      <div
        className="overflow-hidden"
        style={{
          marginLeft: NAV_MARGIN,
          marginRight: NAV_MARGIN,
          width: VISIBLE_WIDTH,
        }}
      >
        <div
          className="flex"
          style={{
            gap: GAP,
            transform: `translateX(-${(index - CENTER_OFFSET) * ITEM_WIDTH}px)`,
            transition: isTransitioning
              ? `transform ${TRANSITION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
              : "none",
            willChange: "transform",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2">
        <button
          onClick={goNext}
          aria-label="Next deals"
          className="rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl"
        >
          <ChevronRight className="h-6 w-6 text-zinc-700" />
        </button>
      </div>
    </div>
  );
}
