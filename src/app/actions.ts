"use server";

import { supabase } from "@/lib/supabase";
import { mockSearchAmazon } from "@/lib/mock-amazon";

export async function submitFeedback(formData: FormData) {
  const name = formData.get("name")?.toString()?.trim();
  const email = formData.get("email")?.toString()?.trim();
  const type = formData.get("type")?.toString()?.trim();
  const message = formData.get("message")?.toString()?.trim();

  if (!name || name.length < 2) {
    return { success: false, error: "Please enter your name." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!message || message.length < 10) {
    return { success: false, error: "Please enter a message (at least 10 characters)." };
  }

  try {
    const { error } = await supabase.from("feedback").insert({
      name,
      email,
      type: type || "general",
      message,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function getProductById(id: string) {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (productError || !product) {
    return null;
  }

  const { data: priceHistory } = await supabase
    .from("price_history")
    .select("*")
    .eq("product_id", product.id)
    .order("date", { ascending: true });

  const { data: aiInsights } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("product_id", product.id);

  return {
    ...product,
    price_history: priceHistory ?? [],
    ai_insights: aiInsights ?? [],
  };
}

export async function getProduct(asin: string) {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("asin", asin)
    .single();

  if (productError || !product) {
    return null;
  }

  const { data: priceHistory } = await supabase
    .from("price_history")
    .select("*")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false });

  const { data: aiInsights } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("product_id", product.id);

  return {
    ...product,
    price_history: priceHistory ?? [],
    ai_insights: aiInsights ?? [],
  };
}

export async function searchProducts(query: string) {
  const { data: existingProducts } = await supabase
    .from("products")
    .select("*")
    .ilike("title", `%${query}%`);

  if (existingProducts && existingProducts.length > 0) {
    const productsWithInsights = await Promise.all(
      existingProducts.map(async (product) => {
        const { data: aiInsights } = await supabase
          .from("ai_insights")
          .select("score, summary")
          .eq("product_id", product.id);
        const insight = aiInsights?.[0];
        return {
          ...product,
          ai_score: insight?.score ?? null,
          ai_summary: insight?.summary ?? null,
        };
      })
    );
    return productsWithInsights;
  }

  const mockProducts = mockSearchAmazon(query);

  const productsToInsert = mockProducts.map(
    ({ price_history: _ph, ai_score: _as, ai_summary: _asum, ...product }) => ({
      asin: product.asin,
      title: product.title,
      current_price: product.current_price,
      image_url: product.image_url,
      category: product.category,
    })
  );

  const { data: savedProducts, error: insertError } = await supabase
    .from("products")
    .insert(productsToInsert)
    .select();

  if (insertError || !savedProducts) {
    throw new Error(insertError?.message ?? "Failed to save products");
  }

  for (let i = 0; i < savedProducts.length; i++) {
    const product = savedProducts[i];
    const mock = mockProducts[i];

    await supabase.from("price_history").insert(
      mock.price_history.map((ph) => ({
        product_id: product.id,
        price: ph.price,
        date: ph.date,
      }))
    );

    await supabase.from("ai_insights").insert({
      product_id: product.id,
      score: mock.ai_score,
      summary: mock.ai_summary,
    });
  }

  return savedProducts.map((product, i) => ({
    ...product,
    ai_score: mockProducts[i].ai_score,
    ai_summary: mockProducts[i].ai_summary,
  }));
}

export async function getBestDeals(limit = 12) {
  const { data: products } = await supabase
    .from("products")
    .select("id, title, current_price, image_url, created_at, ai_insights(score)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!products) return [];

  return products.map((product) => {
    const aiInsights = product.ai_insights as { score: number }[] | null;
    const score = aiInsights?.[0]?.score ?? null;
    return {
      ...product,
      ai_score: score,
    };
  });
}

export type BestDealsSort = "recommended" | "newest" | "price-low" | "price-high";

export async function getBestDealsFiltered(options: {
  sort?: BestDealsSort;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}) {
  const { sort = "recommended", minPrice, maxPrice, limit = 48 } = options;

  let query = supabase
    .from("products")
    .select("id, title, current_price, image_url, created_at, ai_insights(score)");

  if (minPrice != null) {
    query = query.gte("current_price", minPrice);
  }
  if (maxPrice != null) {
    query = query.lte("current_price", maxPrice);
  }

  if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (sort === "price-low") {
    query = query.order("current_price", { ascending: true });
  } else if (sort === "price-high") {
    query = query.order("current_price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: products } = await query.limit(limit * 2);

  if (!products) return [];

  const withScore = products.map((product) => {
    const aiInsights = product.ai_insights as { score: number }[] | null;
    const score = aiInsights?.[0]?.score ?? null;
    return {
      ...product,
      ai_score: score,
    };
  });

  if (sort === "recommended") {
    withScore.sort((a, b) => {
      const scoreA = a.ai_score ?? 0;
      const scoreB = b.ai_score ?? 0;
      return scoreB - scoreA;
    });
  }

  return withScore.slice(0, limit);
}

export async function getRelatedProducts(
  excludeId: string,
  category?: string | null,
  limit = 8
) {
  let query = supabase
    .from("products")
    .select("id, title, current_price, image_url, ai_insights(score)")
    .neq("id", excludeId);

  if (category) {
    query = query.eq("category", category);
  }

  const { data: products } = await query
    .order("created_at", { ascending: false })
    .limit(limit * 2);

  if (!products) return [];

  const withScore = products.map((product) => {
    const aiInsights = product.ai_insights as { score: number }[] | null;
    const score = aiInsights?.[0]?.score ?? null;
    return {
      ...product,
      ai_score: score,
    };
  });

  withScore.sort((a, b) => {
    const scoreA = a.ai_score ?? 0;
    const scoreB = b.ai_score ?? 0;
    return scoreB - scoreA;
  });

  return withScore.slice(0, limit);
}
