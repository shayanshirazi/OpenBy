/**
 * Pexels API for fetching product images.
 * Get a free API key at https://www.pexels.com/api/
 */

const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";

export async function searchProductImage(
  query: string,
  perPage = 3
): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(
    `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=square`,
    {
      headers: { Authorization: apiKey },
      next: { revalidate: 0 },
    }
  );

  if (!res.ok) return null;

  const data = (await res.json()) as {
    photos?: Array<{
      src?: { large?: string; medium?: string; original?: string };
    }>;
  };

  const url = data.photos?.[0]?.src?.large ?? data.photos?.[0]?.src?.medium ?? data.photos?.[0]?.src?.original ?? null;
  return url ?? null;
}
