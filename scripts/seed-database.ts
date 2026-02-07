/**
 * Seed script: Clears DB, inserts 100 products, generates descriptions & fetches images.
 * Run: npx tsx scripts/seed-database.ts
 * Requires: .env.local with Supabase, OPENROUTER_API_KEY, GOOGLE_CSE_API_KEY, GOOGLE_CSE_CX
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { SEED_PRODUCTS } from "./seed-data";
import { searchGoogleImage } from "../src/lib/google-images";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or Supabase key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const AI_SUMMARIES = [
  "Great time to buy",
  "Price near 90-day low",
  "Fair deal - average pricing",
  "Consider waiting for a sale",
  "Strong value at current price",
  "Below typical market price",
  "Good discount available",
  "Price trending down",
];

function generateAsin(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 10 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
}

function generatePriceHistory(basePrice: number): { price: number; date: string }[] {
  const history = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const variance = basePrice * (0.02 * (Math.random() - 0.5));
    const trend = basePrice * 0.001 * (29 - i) * (Math.random() - 0.3);
    const price = Math.round((basePrice + variance + trend) * 100) / 100;
    history.push({
      price: Math.max(price, basePrice * 0.7),
      date: date.toISOString().split("T")[0],
    });
  }
  return history;
}

async function generateDescription(title: string, category: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content:
            "You are a concise product copywriter. Write 3-4 sentences only. No bullet points.",
        },
        {
          role: "user",
          content: `Write a 3-4 sentence product description for: "${title}" (category: ${category}). Be informative and highlight key features. Do not include price.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content?.trim();
  return text ?? null;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log("🗑️  Clearing existing data...");

  const { data: existingProducts } = await supabase.from("products").select("id");
  if (existingProducts?.length) {
    for (const p of existingProducts) {
      await supabase.from("ai_insights").delete().eq("product_id", p.id);
      await supabase.from("price_history").delete().eq("product_id", p.id);
    }
    for (const p of existingProducts) {
      await supabase.from("products").delete().eq("id", p.id);
    }
  }

  console.log("✅ Cleared. Inserting 100 products...");

  const productsToInsert = SEED_PRODUCTS.map((p) => {
    const priceHistory = generatePriceHistory(p.basePrice);
    const currentPrice = priceHistory[priceHistory.length - 1]?.price ?? p.basePrice;
    return {
      asin: generateAsin(),
      title: p.title,
      current_price: Math.round(currentPrice * 100) / 100,
      image_url: "", // Will be filled by Google search
      category: p.category,
      description: null as string | null,
      _priceHistory: priceHistory,
      _aiScore: Math.floor(Math.random() * 101),
      _aiSummary: AI_SUMMARIES[Math.floor(Math.random() * AI_SUMMARIES.length)],
    };
  });

  const { data: savedProducts, error: insertError } = await supabase
    .from("products")
    .insert(
      productsToInsert.map(({ _priceHistory, _aiScore, _aiSummary, ...p }) => ({
        asin: p.asin,
        title: p.title,
        current_price: p.current_price,
        image_url: p.image_url,
        category: p.category,
        description: p.description,
      }))
    )
    .select();

  if (insertError || !savedProducts) {
    console.error("Failed to insert products:", insertError?.message);
    process.exit(1);
  }

  for (let i = 0; i < savedProducts.length; i++) {
    const product = savedProducts[i];
    const meta = productsToInsert[i];
    await supabase.from("price_history").insert(
      meta._priceHistory.map((ph) => ({
        product_id: product.id,
        price: ph.price,
        date: ph.date,
      }))
    );
    await supabase.from("ai_insights").insert({
      product_id: product.id,
      score: meta._aiScore,
      summary: meta._aiSummary,
    });
  }

  console.log("✅ Products, price history, and AI insights inserted.");

  console.log("📝 Generating descriptions and fetching images (this may take a few minutes)...");

  for (let i = 0; i < savedProducts.length; i++) {
    const product = savedProducts[i];
    const title = product.title ?? "";
    const category = product.category ?? "";

    const [description, imageUrl] = await Promise.all([
      generateDescription(title, category),
      searchGoogleImage(title),
    ]);

    const updates: Record<string, unknown> = {};
    if (description) updates.description = description;
    if (imageUrl) updates.image_url = imageUrl;

    if (Object.keys(updates).length > 0) {
      await supabase.from("products").update(updates).eq("id", product.id);
    }

    const imgStatus = imageUrl ? "✓" : "✗";
    const descStatus = description ? "✓" : "✗";
    console.log(`  [${i + 1}/100] ${title.slice(0, 40)}... desc:${descStatus} img:${imgStatus}`);

    // Rate limit: ~1 req/sec for Google CSE (100/day), small delay for OpenRouter
    await delay(1200);
  }

  console.log("✅ Seed complete. 100 products with descriptions and images.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
