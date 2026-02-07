"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Laptop,
  Monitor,
  Smartphone,
  Cpu,
  Keyboard,
  Headphones,
  Tablet,
  Watch,
  Camera,
  HardDrive,
  Gamepad2,
  Tv,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CARD_WIDTH = 160;
const GAP = 16;
const ITEM_WIDTH = CARD_WIDTH + GAP;
const VISIBLE_CARDS = 4;
const TRANSITION_MS = 300;

const ICON_MAP: Record<string, React.ElementType> = {
  laptop: Laptop,
  monitor: Monitor,
  smartphone: Smartphone,
  cpu: Cpu,
  keyboard: Keyboard,
  headphones: Headphones,
  tablet: Tablet,
  watch: Watch,
  camera: Camera,
  hardDrive: HardDrive,
  gamepad2: Gamepad2,
  tv: Tv,
};

type Category = {
  name: string;
  icon: string;
  query: string;
};

function CategoryCard({ category }: { category: Category }) {
  const { name, icon: iconKey, query } = category;
  const Icon = ICON_MAP[iconKey] ?? Cpu;
  return (
    <Link
      href={`/search?q=${query}`}
      className="shrink-0"
      style={{ width: CARD_WIDTH }}
    >
      <Card className="group h-full w-full border-zinc-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-200/60 hover:shadow-lg hover:shadow-blue-500/5">
        <CardContent className="flex flex-col items-center gap-3 p-4">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-3 transition-colors group-hover:from-blue-100 group-hover:to-indigo-100">
            <Icon className="h-8 w-8 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-zinc-900">{name}</span>
        </CardContent>
      </Card>
    </Link>
  );
}

export function CategorySlideshow({ categories }: { categories: Category[] }) {
  const maxIndex = Math.max(0, categories.length - VISIBLE_CARDS);
  const [index, setIndex] = useState(0);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, maxIndex));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const canGoNext = index < maxIndex;
  const canGoPrev = index > 0;

  return (
    <div className="relative flex w-full items-center gap-2">
      <button
        onClick={goPrev}
        disabled={!canGoPrev}
        aria-label="Previous categories"
        className="z-10 shrink-0 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40"
      >
        <ChevronLeft className="h-6 w-6 text-zinc-700" />
      </button>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div
          className="flex"
          style={{
            gap: GAP,
            transform: `translateX(-${index * ITEM_WIDTH}px)`,
            transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
          }}
        >
          {categories.map((category, i) => (
            <CategoryCard key={`${category.query}-${i}`} category={category} />
          ))}
        </div>
      </div>

      <button
        onClick={goNext}
        disabled={!canGoNext}
        aria-label="Next categories"
        className="z-10 shrink-0 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40"
      >
        <ChevronRight className="h-6 w-6 text-zinc-700" />
      </button>
    </div>
  );
}
