import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function getScoreBadgeClasses(score: number | null): string {
  if (score == null) return "from-zinc-600 to-zinc-700";
  if (score <= 20) return "from-red-600 to-red-500";
  if (score <= 40) return "from-red-600 to-orange-500";
  if (score <= 60) return "from-orange-500 to-yellow-500";
  if (score <= 80) return "from-yellow-500 to-green-600";
  return "from-green-600 to-blue-600";
}

export type ProductCardProduct = {
  id: string;
  title?: string | null;
  current_price?: number | null;
  image_url?: string | null;
  ai_score?: number | null;
};

type ProductCardProps = {
  product: ProductCardProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="flex h-full flex-col overflow-hidden gap-0 rounded-xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]">
        <div className="relative aspect-[16/10] w-full bg-zinc-100">
          <Image
            src={product.image_url ?? "https://placehold.co/400"}
            alt={product.title ?? ""}
            fill
            unoptimized
            className="object-contain p-3"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
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
              title="OpenBy Index: AI-powered score (0–100) showing how good a time it is to buy. Higher = better deal."
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
