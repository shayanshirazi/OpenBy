import Link from "next/link";
import { BestTimeToBuySlideshow } from "./best-time-to-buy-slideshow";

export type BestDealsProduct = {
  id: string;
  title: string;
  current_price: number | string;
  image_url: string | null;
  ai_score: number | null;
  category?: string | null;
};

type BestDealsSectionProps = {
  products: BestDealsProduct[];
  title?: string;
  description?: string;
  emptyLinkHref?: string;
};

export function BestDealsSection({
  products,
  title = "Best Time to Buy",
  description = "Top 5 highest OpenBy Index products across all categories",
  emptyLinkHref = "/search",
}: BestDealsSectionProps) {
  return (
    <section id="best-deals" className="relative bg-gradient-to-b from-zinc-50/80 to-indigo-50/40 py-24">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.95)_0%,transparent_80px)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_50%,rgba(99,102,241,0.08),rgba(59,130,246,0.04),transparent_70%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 -z-[5] bg-[linear-gradient(to_top,rgba(238,242,255,0.9)_0%,transparent_100%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-zinc-600">
            {description}
          </p>
        </div>
        {products.length > 0 ? (
          <BestTimeToBuySlideshow products={products} />
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
            <p className="text-zinc-600">
              No deals yet. Search for products to get AI-powered recommendations!
            </p>
            <Link
              href={emptyLinkHref}
              className="mt-4 inline-block font-medium text-blue-600 hover:underline"
            >
              Start searching →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
