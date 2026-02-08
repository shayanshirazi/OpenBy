/**
 * Generate product images via Gemini (OpenRouter) - no external image API needed.
 * Uses modalities: ["image", "text"] with a Gemini image-capable model.
 */

import { getSupabaseAdmin } from "@/lib/supabase";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Use Gemini image model requested. */
const IMAGE_MODELS: Array<{ model: string; modalities: Array<"image" | "text"> }> = [
  { model: "google/gemini-2.5-flash-image", modalities: ["image", "text"] },
];

/**
 * Upload base64 image to Supabase Storage and return public URL.
 * Creates bucket if needed. Requires storage.buckets insert policy for service role.
 */
async function uploadToStorage(productId: string, dataUrl: string): Promise<string | null> {
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return null;

  const [, ext, base64] = match;
  const buffer = Buffer.from(base64!, "base64");
  const db = getSupabaseAdmin();
  const bucketName = "product-images";

  try {
    await db.storage.createBucket(bucketName, { public: true }).catch(() => {});
  } catch {
    /* bucket may already exist */
  }

  const path = `products/${productId}.${ext === "png" ? "png" : "jpg"}`;
  const { error } = await db.storage.from(bucketName).upload(path, buffer, {
    contentType: `image/${ext}`,
    upsert: true,
  });

  if (error) {
    console.error("[gemini-images] Storage upload failed:", error.message);
    return null;
  }

  const { data: urlData } = db.storage.from(bucketName).getPublicUrl(path);
  return urlData?.publicUrl ?? null;
}

/**
 * Generate a product image via Gemini. Uploads to Supabase Storage, returns public URL.
 */
export async function generateProductImage(
  productId: string,
  productTitle: string,
  category?: string | null
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const prompt = `Generate a clean, professional product photo for: ${productTitle}${category ? ` (${category})` : ""}.
Style: white or neutral background, centered product, high quality product photography.
Make sure ONLY the product is visible (no people, no props, no extra items, no packaging unless it's integral).
No text, no watermarks, no logos. Use it like an advertisement product photo.`;

  let lastError: string | null = null;

  for (const { model, modalities } of IMAGE_MODELS) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://openby.app",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          modalities,
          temperature: 0.7,
          max_tokens: 1024,
          image_config: {
            aspect_ratio: "1:1",
            image_size: "1K",
          },
        }),
      });

      if (!res.ok) {
        lastError = `${res.status}: ${await res.text()}`;
        continue;
      }

      const data = (await res.json()) as {
        choices?: Array<{
          message?: {
            images?: Array<{ image_url?: { url?: string }; imageUrl?: { url?: string } }>;
          };
        }>;
      };

      const images = data.choices?.[0]?.message?.images;
      const dataUrl = images?.[0]?.image_url?.url ?? images?.[0]?.imageUrl?.url;

      if (dataUrl && dataUrl.startsWith("data:image/")) {
        const publicUrl = await uploadToStorage(productId, dataUrl);
        return publicUrl ?? dataUrl;
      }

      if (dataUrl && dataUrl.startsWith("http")) {
        return dataUrl;
      }
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }

  if (lastError) {
    console.error("[gemini-images] Failed:", lastError);
  }
  return null;
}
