import Link from "next/link";
import Image from "next/image";
import { searchProducts } from "@/app/actions";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;

  if (!q?.trim()) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-black/60">Enter a search term to find products.</p>
      </div>
    );
  }

  const products = await searchProducts(q.trim());

  return (
    <div className="relative mx-auto max-w-6xl px-6 py-12 bg-gradient-to-b from-blue-50/40 via-white to-indigo-50/30">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.05),transparent)]" />
      <h2 className="mb-8 text-xl font-medium text-black">
        Results for &quot;{q}&quot;
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
              <CardHeader className="p-0">
                <div className="relative aspect-square w-full bg-zinc-100">
                  <Image
                    src={product.image_url ?? "https://placehold.co/400"}
                    alt={product.title}
                    fill
                    unoptimized
                    className="object-contain p-4"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 p-4">
                <h3 className="line-clamp-2 font-medium text-black">
                  {product.title}
                </h3>
                <p className="text-lg font-semibold text-black">
                  ${Number(product.current_price).toFixed(2)}
                </p>
              </CardContent>
              <CardFooter className="px-4 pb-4 pt-0">
                <Badge variant="secondary">
                  Buy Score: {product.ai_score ?? "—"}
                </Badge>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
