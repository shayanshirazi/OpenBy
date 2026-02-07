/**
 * Google Custom Search API for fetching product images from Google Images.
 * Requires GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX (Programmable Search Engine with Image search enabled).
 * Enable image search: programmablesearchengine.google.com → Edit → Search features → Image search ON
 * CSE must search "the entire web" (add *.google.com to sites) for image results.
 */

const GOOGLE_CSE_URL = "https://www.googleapis.com/customsearch/v1";

type GoogleImageSearchResponse = {
  error?: { code?: number; message?: string; status?: string };
  items?: Array<{
    link?: string;
    image?: {
      thumbnailLink?: string;
      contextLink?: string;
      byteSize?: number;
      height?: number;
      width?: number;
    };
    pagemap?: {
      cse_image?: Array<{ src?: string }>;
      cse_thumbnail?: Array<{ src?: string }>;
    };
  }>;
};

export async function searchGoogleImage(query: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;
  if (!apiKey || !cx) return null;

  const params = new URLSearchParams({
    key: apiKey,
    cx,
    q: query,
    searchType: "image",
    num: "3",
    safe: "active",
    imgType: "photo",
    imgSize: "large",
  });

  const res = await fetch(`${GOOGLE_CSE_URL}?${params.toString()}`, {
    cache: "no-store",
  });
  const data = (await res.json()) as GoogleImageSearchResponse;

  if (!res.ok) {
    const err = data.error ?? { message: res.statusText };
    console.error("[google-images] API error:", res.status, err.message, err.status);
    return null;
  }

  if (data.error) {
    console.error("[google-images] Response error:", data.error.message, data.error.status);
    return null;
  }

  const item = data.items?.[0];
  if (!item) return null;

  // link = direct image URL for image search; fallbacks: pagemap.cse_image, thumbnailLink
  const imageUrl =
    item.link?.trim() ??
    item.pagemap?.cse_image?.[0]?.src?.trim() ??
    item.image?.thumbnailLink?.trim();
  return imageUrl && imageUrl.startsWith("http") ? imageUrl : null;
}
