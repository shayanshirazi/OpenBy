import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id, title, image_url, openby_index")
    .ilike("title", `%${q}%`)
    .order("openby_index", { ascending: false, nullsLast: true })
    .limit(6);

  if (error) {
    console.error("[search-suggestions]", error.message);
    return NextResponse.json({ items: [] });
  }

  const productIds = (products ?? []).map((p) => p.id);
  const { data: insights } = await supabase
    .from("ai_insights")
    .select("product_id, score")
    .in("product_id", productIds);
  const scoreByProduct = new Map(
    (insights ?? []).map((i) => [i.product_id, i.score as number])
  );

  const items = (products ?? []).map((product) => ({
    id: product.id,
    title: product.title ?? "Untitled product",
    image_url: product.image_url ?? null,
    score: product.openby_index ?? scoreByProduct.get(product.id) ?? null,
  }));

  return NextResponse.json({ items });
}
