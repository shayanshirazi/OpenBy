"use server";

import { supabase } from "@/lib/supabase";
import { mockSearchAmazon } from "@/lib/mock-amazon";
import { searchGoogleImage } from "@/lib/google-images";
import {
  generate,
  chatCompletion,
  type OpenRouterModel,
  type ChatMessage,
} from "@/lib/openrouter";


/**
 * Generate AI response via OpenRouter (Gemini, Claude, GPT, etc.).
 * Use for any feature that needs model-generated text.
 */
export async function aiGenerate(
  userPrompt: string,
  options?: {
    systemPrompt?: string;
    model?: OpenRouterModel;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<{ text: string } | { error: string }> {
  try {
    const text = await generate(userPrompt, options);
    return { text };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "AI generation failed",
    };
  }
}

/**
 * Full control: chat completion with multiple messages.
 */
export async function aiChat(
  messages: ChatMessage[],
  options?: {
    model?: OpenRouterModel;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<{ content: string } | { error: string }> {
  try {
    const result = await chatCompletion({
      messages,
      model: options?.model,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });
    return { content: result.content };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "AI chat failed",
    };
  }
}

const LLM_BUY_PROMPT = `You are a product buying advisor. Given a product name and description, assess if TODAY is a good time to buy it.

Your response MUST follow this exact format:
- First line: A single number from 1 to 10 (1 = terrible time to buy today, 10 = excellent time to buy today). You may use decimals like 7.5 or 9.2. Nothing else on that line.
- Second line: Empty
- Following lines: 2-3 sentences explaining your assessment for today. Consider current price trends, seasonal factors, new product releases, and whether waiting would likely yield a better deal.`;

export type LLMModelScore = {
  score: number | null; // 1-10 scale
  text: string;
  error?: string;
};

export async function getLLMProductScores(
  productName: string,
  description: string
): Promise<{
  openai: LLMModelScore;
  gemini: LLMModelScore;
  claude: LLMModelScore;
  llmScore: number; // 0-100 for index (score/10 * 100)
}> {
  const userPrompt = `Product: ${productName}

Description: ${description || "No description available."}

Is today a good time to buy this product? Respond with a score from 1 to 10 (you may use decimals like 9.6) on the first line, then 2-3 sentences of explanation.`;

  const models = [
    { key: "openai" as const, model: "openai/gpt-4o" as OpenRouterModel },
    { key: "gemini" as const, model: "google/gemini-2.0-flash-001" as OpenRouterModel },
    { key: "claude" as const, model: "anthropic/claude-3.5-sonnet" as OpenRouterModel },
  ];

  const results = await Promise.all(
    models.map(async ({ key, model }) => {
      try {
        const content = await generate(userPrompt, {
          systemPrompt: LLM_BUY_PROMPT,
          model,
          temperature: 0.4,
          maxTokens: 300,
        });
        const lines = content.trim().split("\n").filter(Boolean);
        const firstLine = lines[0] ?? "";
        const scoreMatch = firstLine.match(/\b(\d{1,2}(?:\.\d+)?)\b/);
        const raw = scoreMatch ? parseFloat(scoreMatch[1]) : null;
        const score = raw != null ? Math.min(10, Math.max(1, raw)) : null;
        const text = lines.slice(1).join(" ").trim() || content.trim();
        return { key, score, text, error: undefined };
      } catch (err) {
        return {
          key,
          score: null,
          text: "",
          error: err instanceof Error ? err.message : "Failed",
        };
      }
    })
  );

  const byKey = Object.fromEntries(
    results.map((r) => [
      r.key,
      { score: r.score, text: r.text, ...(r.error && { error: r.error }) },
    ])
  );

  const scores = results.filter((r) => r.score != null).map((r) => r.score!);
  const avgOutOf10 =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 5;
  const llmScore = Math.round((avgOutOf10 / 10) * 100);

  return {
    openai: byKey.openai,
    gemini: byKey.gemini,
    claude: byKey.claude,
    llmScore,
  };
}

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

function isPlaceholderImage(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  return url.includes("placehold.co");
}

async function ensureProductImageUrl(
  productId: string,
  title: string,
  category?: string | null,
  currentUrl?: string | null
): Promise<string | null> {
  if (!isPlaceholderImage(currentUrl)) return currentUrl ?? null;

  const { data: row } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", productId)
    .single();
  const existing = row?.image_url?.toString()?.trim();
  if (existing && !isPlaceholderImage(existing)) return existing;

  const imageUrl = await searchGoogleImage(title);
  if (!imageUrl) return currentUrl ?? null;

  await supabase
    .from("products")
    .update({ image_url: imageUrl })
    .eq("id", productId);

  return imageUrl;
}

async function ensureProductDescription(
  productId: string,
  title: string,
  category?: string | null
): Promise<string | null> {
  const { data: row } = await supabase
    .from("products")
    .select("description")
    .eq("id", productId)
    .single();
  const existing = row?.description?.toString()?.trim();
  if (existing) return existing;

  const result = await generate(
    `Write a 3-4 sentence product description for: "${title}"${category ? ` (category: ${category})` : ""}. Be informative and highlight key features. Do not include price.`,
    {
      systemPrompt:
        "You are a concise product copywriter. Write 3-4 sentences only. No bullet points.",
      temperature: 0.5,
      maxTokens: 200,
    }
  );

  const generated = result?.trim();
  if (!generated) return null;

  await supabase
    .from("products")
    .update({ description: generated })
    .eq("id", productId);

  return generated;
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

  const description =
    product.description?.trim() ??
    (await ensureProductDescription(product.id, product.title ?? "", product.category));

  const imageUrl =
    (await ensureProductImageUrl(
      product.id,
      product.title ?? "",
      product.category,
      product.image_url
    )) ?? product.image_url;

  return {
    ...product,
    description: description ?? product.description,
    image_url: imageUrl ?? product.image_url,
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

export type SearchSort =
  | "date"
  | "price-asc"
  | "price-desc"
  | "score"
  | "recommended"
  | "alphabetical";

const PRODUCTS_PER_PAGE = 15;

export async function searchProductsFiltered(
  query: string,
  options: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minScore?: number;
    maxScore?: number;
    sort?: SearchSort;
    page?: number;
    limit?: number;
  } = {}
) {
  const products = await searchProducts(query);
  const {
    category,
    minPrice,
    maxPrice,
    minScore,
    maxScore,
    sort = "recommended",
    page = 1,
    limit = PRODUCTS_PER_PAGE,
  } = options;

  let filtered = products;

  if (category) {
    filtered = filtered.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
  }
  if (minPrice != null) {
    filtered = filtered.filter(
      (p) => Number(p.current_price) >= minPrice
    );
  }
  if (maxPrice != null) {
    filtered = filtered.filter(
      (p) => Number(p.current_price) <= maxPrice
    );
  }
  if (minScore != null) {
    filtered = filtered.filter((p) => {
      const s = p.ai_score ?? 0;
      return s >= minScore;
    });
  }
  if (maxScore != null) {
    filtered = filtered.filter((p) => {
      const s = p.ai_score ?? 0;
      return s <= maxScore;
    });
  }

  const sorted = [...filtered];
  if (sort === "date") {
    sorted.sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
    );
  } else if (sort === "price-asc") {
    sorted.sort(
      (a, b) => Number(a.current_price) - Number(b.current_price)
    );
  } else if (sort === "price-desc") {
    sorted.sort(
      (a, b) => Number(b.current_price) - Number(a.current_price)
    );
  } else if (sort === "score" || sort === "recommended") {
    sorted.sort((a, b) => {
      const sa = a.ai_score ?? 0;
      const sb = b.ai_score ?? 0;
      return sb - sa;
    });
  } else if (sort === "alphabetical") {
    sorted.sort((a, b) =>
      (a.title ?? "").localeCompare(b.title ?? "")
    );
  }

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const pageSafe = Math.max(1, Math.min(page, totalPages));
  const start = (pageSafe - 1) * limit;
  const paginated = sorted.slice(start, start + limit);

  return { products: paginated, totalCount, totalPages, page: pageSafe };
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

export type BestDealsSort =
  | "recommended"
  | "newest"
  | "price-low"
  | "price-high"
  | "score"
  | "alphabetical";

export async function getBestDealsFiltered(options: {
  sort?: BestDealsSort;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  minScore?: number;
  maxScore?: number;
  page?: number;
  limit?: number;
}) {
  const {
    sort = "recommended",
    minPrice,
    maxPrice,
    category,
    minScore,
    maxScore,
    page = 1,
    limit = PRODUCTS_PER_PAGE,
  } = options;

  const { data: products, error } = await supabase
    .from("products")
    .select("id, title, current_price, image_url, created_at, category")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getBestDealsFiltered]", error.message);
    return { products: [], totalCount: 0, totalPages: 1, page: 1 };
  }
  if (!products || products.length === 0) {
    return { products: [], totalCount: 0, totalPages: 1, page: 1 };
  }

  const { data: insights } = await supabase
    .from("ai_insights")
    .select("product_id, score")
    .in("product_id", products.map((p) => p.id));
  const scoreByProduct = new Map(
    (insights ?? []).map((i) => [i.product_id, i.score as number])
  );

  let filtered = products.map((product) => ({
    ...product,
    ai_score: scoreByProduct.get(product.id) ?? null,
  }));

  if (category) {
    filtered = filtered.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
  }
  if (minPrice != null) {
    filtered = filtered.filter((p) => Number(p.current_price) >= minPrice);
  }
  if (maxPrice != null) {
    filtered = filtered.filter((p) => Number(p.current_price) <= maxPrice);
  }
  if (minScore != null) {
    filtered = filtered.filter((p) => (p.ai_score ?? 0) >= minScore);
  }
  if (maxScore != null) {
    filtered = filtered.filter((p) => (p.ai_score ?? 0) <= maxScore);
  }

  const sorted = [...filtered];
  if (sort === "newest") {
    sorted.sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
    );
  } else if (sort === "price-low") {
    sorted.sort((a, b) => Number(a.current_price) - Number(b.current_price));
  } else if (sort === "price-high") {
    sorted.sort((a, b) => Number(b.current_price) - Number(a.current_price));
  } else if (sort === "recommended" || sort === "score") {
    sorted.sort((a, b) => (b.ai_score ?? 0) - (a.ai_score ?? 0));
  } else if (sort === "alphabetical") {
    sorted.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
  }

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const pageSafe = Math.max(1, Math.min(page, totalPages));
  const start = (pageSafe - 1) * limit;
  const paginated = sorted.slice(start, start + limit);

  return { products: paginated, totalCount, totalPages, page: pageSafe };
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
