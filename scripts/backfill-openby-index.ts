/**
 * Backfill: images (Gemini), descriptions, and OpenBy Index for all products.
 * Run: npm run backfill-index
 */

import "./load-env";
import { createClient } from "@supabase/supabase-js";
import { generateProductImage } from "../src/lib/gemini-images";
import { generate } from "../src/lib/openrouter";
import { getCanadaInflation } from "../src/app/actions";
import {
  getLLMProductScores,
  getRelatedNews,
  getSocialMediaPresence,
  getProductSearchTrends,
  getProductVolatility,
  getProductMovingAverage,
  getHistoricalPricesFromGemini,
  saveProductOpenByIndex,
} from "../src/app/actions";
import { calculateOpenByIndexFromPartial, type IndexCategory } from "../src/lib/openby-index";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const db = createClient(supabaseUrl, supabaseKey);


const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { data: products, error } = await db
    .from("products")
    .select("id, title, description, image_url, category, current_price, openby_index")
    .order("id");

  if (error || !products?.length) {
    console.error(error?.message ?? "No products");
    process.exit(1);
  }

  const { data: priceHistories } = await db
    .from("price_history")
    .select("product_id, price, date")
    .in("product_id", products.map((p) => p.id));

  const historyByProduct = new Map<string | number, { price: number; date?: string }[]>();
  for (const ph of priceHistories ?? []) {
    const list = historyByProduct.get(ph.product_id) ?? [];
    list.push({ price: ph.price, date: ph.date });
    historyByProduct.set(ph.product_id, list);
  }

  const needsWork = products.filter((p) => {
    const missingScore = p.openby_index == null;
    const missingImage = !p.image_url?.trim() || p.image_url.includes("placehold.co");
    return missingScore || missingImage;
  });

  if (needsWork.length === 0) {
    console.log("All products already have scores and images.");
    return;
  }

  console.log(`Processing ${needsWork.length} products...\n`);

  for (let i = 0; i < needsWork.length; i++) {
    const p = needsWork[i]!;
    const title = (p.title ?? "").trim() || "product";
    const short = title.slice(0, 45);
    process.stdout.write(`[${i + 1}/${products.length}] ${short}... `);

    try {
      const needsDesc = !p.description?.trim();

      const needsImage = !p.image_url?.trim() || p.image_url.includes("placehold.co");
      if (needsImage) {
        const img = await generateProductImage(p.id, title, p.category);
        if (img) {
          await db.from("products").update({ image_url: img }).eq("id", p.id);
          process.stdout.write("img✓ ");
        } else {
          process.stdout.write("img✗ ");
        }
        await delay(800);
      }

      let description = p.description?.trim() || "";
      if (needsDesc) {
        const desc = await generate(
          `Write 3-4 sentences about: "${title}"${p.category ? ` (${p.category})` : ""}. Be informative. No price.`,
          { systemPrompt: "Concise product copywriter. 3-4 sentences only.", temperature: 0.5, maxTokens: 200 }
        );
        if (desc?.trim()) {
          description = desc.trim();
          await db.from("products").update({ description }).eq("id", p.id);
          process.stdout.write("desc✓ ");
        }
        await delay(500);
      }
      const currentPrice = Number(p.current_price) || 0;
      let priceHistory = (historyByProduct.get(p.id) ?? [])
        .sort((a, b) => ((a.date ?? "") < (b.date ?? "") ? -1 : 1))
        .map((x) => ({ price: x.price, date: x.date }));

      if (priceHistory.length < 7) {
        const fromGemini = await getHistoricalPricesFromGemini(title, p.category, currentPrice);
        priceHistory = fromGemini.length >= 7 ? fromGemini : priceHistory;
      }

      const scores: Partial<Record<IndexCategory, number>> = {};

      const [newsData, inflationData, llmData] = await Promise.all([
        getRelatedNews(title),
        getCanadaInflation(),
        getLLMProductScores(title, description || title),
      ]);
      scores.relatedNews = newsData.score;
      scores.inflationScore = inflationData.score;
      scores.llmScore = llmData.llmScore;

      const socialData = await getSocialMediaPresence(title);
      scores.socialMediaPresence = socialData.score;

      const searchData = await getProductSearchTrends(title, p.category);
      scores.searchTrend = searchData.score;

      const volatilityData = await getProductVolatility(p.id, currentPrice, priceHistory);
      scores.volatility = volatilityData.score;

      const maData = await getProductMovingAverage(p.id, currentPrice, priceHistory);
      scores.movingAverage = maData.score;
      scores.predictedPrice = 100;

      const index = calculateOpenByIndexFromPartial(scores);
      await saveProductOpenByIndex(p.id, index);
      console.log(`→ ${index}`);
    } catch (e) {
      console.log("✗", e instanceof Error ? e.message : String(e));
      try {
        await saveProductOpenByIndex(p.id, 50);
        console.log("  (saved fallback 50)");
      } catch {
        /* ignore */
      }
    }

    await delay(400);
  }

  console.log("\n✅ Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
