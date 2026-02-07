/**
 * PriceAPI client for fetching current product prices.
 * Uses async job flow: create job → poll status → download results.
 * See: https://readme.priceapi.com/docs/basic-workflow
 */

const PRICEAPI_BASE = "https://api.priceapi.com";

export type PriceAPIProduct = {
  source: string;
  country: string;
  key: string;
  value: string;
  success: boolean;
  reason?: string | null;
  name?: string;
  offers?: Array<{
    price?: string;
    price_with_shipping?: string | null;
    currency?: string;
    shop_name?: string;
  }>;
};

export type PriceAPIJobResult = {
  job_id: string;
  status: string;
  products?: PriceAPIProduct[];
};

export type FetchPriceResult =
  | { ok: true; price: number; currency?: string; productName?: string }
  | { ok: false; error: string };

function getToken(): string | null {
  return process.env.PRICEAPI_API_KEY ?? process.env.PRICEAPI_TOKEN ?? null;
}

/**
 * Create a PriceAPI job to fetch product data by ASIN (Amazon) or keyword.
 */
export async function createJob(params: {
  source?: string;
  country?: string;
  key: "source_id" | "term";
  values: string;
}): Promise<{ jobId: string } | { error: string }> {
  const token = getToken();
  if (!token) {
    return { error: "PRICEAPI_API_KEY or PRICEAPI_TOKEN not configured" };
  }

  const body = new URLSearchParams({
    token,
    source: params.source ?? "amazon",
    country: params.country ?? "us",
    key: params.key,
    values: params.values,
  });

  const res = await fetch(`${PRICEAPI_BASE}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    return { error: `PriceAPI create failed: ${res.status} ${text}` };
  }

  const data = (await res.json()) as { job_id?: string; reason?: string };
  const jobId = data.job_id;
  if (!jobId) {
    return { error: data.reason ?? "No job_id in response" };
  }
  return { jobId };
}

/**
 * Poll job status until finished or timeout.
 */
export async function waitForJob(
  jobId: string,
  options?: { pollIntervalMs?: number; timeoutMs?: number }
): Promise<{ status: string } | { error: string }> {
  const token = getToken();
  if (!token) {
    return { error: "PRICEAPI_API_KEY not configured" };
  }

  const pollInterval = options?.pollIntervalMs ?? 3000;
  const timeout = options?.timeoutMs ?? 120000; // 2 min default
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const res = await fetch(
      `${PRICEAPI_BASE}/jobs/${jobId}?token=${encodeURIComponent(token)}`
    );
    if (!res.ok) {
      return { error: `PriceAPI status failed: ${res.status}` };
    }
    const data = (await res.json()) as {
      status?: string;
      reason?: string;
    };
    const status = data.status ?? "";
    if (status === "finished") {
      return { status };
    }
    if (status === "failed" || data.reason) {
      return { error: data.reason ?? `Job failed: ${status}` };
    }
    await new Promise((r) => setTimeout(r, pollInterval));
  }
  return { error: "PriceAPI job timed out" };
}

/**
 * Download job results.
 */
export async function getJobResults(
  jobId: string
): Promise<PriceAPIJobResult | { error: string }> {
  const token = getToken();
  if (!token) {
    return { error: "PRICEAPI_API_KEY not configured" };
  }

  const res = await fetch(
    `${PRICEAPI_BASE}/products/bulk/${jobId}?token=${encodeURIComponent(token)}`
  );
  if (!res.ok) {
    const text = await res.text();
    return { error: `PriceAPI download failed: ${res.status} ${text}` };
  }
  return (await res.json()) as PriceAPIJobResult;
}

/**
 * Extract lowest price from a product's offers.
 */
function extractLowestPrice(product: PriceAPIProduct): number | null {
  const offers = product.offers ?? [];
  if (offers.length === 0) return null;
  let lowest: number | null = null;
  for (const o of offers) {
    const p = o.price ?? o.price_with_shipping;
    if (p != null && p !== "") {
      const parsed = parseFloat(String(p).replace(/[^0-9.-]/g, ""));
      if (!Number.isNaN(parsed) && parsed > 0) {
        if (lowest == null || parsed < lowest) lowest = parsed;
      }
    }
  }
  return lowest;
}

/**
 * Full flow: create job, poll until done, download, return lowest price.
 * Use ASIN for Amazon (key=source_id) or product title for keyword search (key=term).
 */
export async function fetchProductPrice(params: {
  asin?: string;
  keyword?: string;
  source?: string;
  country?: string;
}): Promise<FetchPriceResult> {
  const { asin, keyword, source = "amazon", country = "us" } = params;

  const key = asin ? "source_id" : "term";
  const values = (asin ?? keyword ?? "").trim();
  if (!values) {
    return { ok: false, error: "Provide asin or keyword" };
  }

  const create = await createJob({ source, country, key, values });
  if ("error" in create) return { ok: false, error: create.error };

  const wait = await waitForJob(create.jobId);
  if ("error" in wait) return { ok: false, error: wait.error };

  const results = await getJobResults(create.jobId);
  if ("error" in results) return { ok: false, error: results.error };

  const products = results.products ?? [];
  const product = products[0];
  if (!product) {
    return { ok: false, error: "No product in PriceAPI response" };
  }
  if (!product.success) {
    return {
      ok: false,
      error: product.reason ?? "Product lookup failed",
    };
  }

  const price = extractLowestPrice(product);
  if (price == null) {
    return { ok: false, error: "No price in offers" };
  }

  const currency =
    product.offers?.[0]?.currency ??
    (country === "us" || country === "ca" ? "USD" : undefined);

  return {
    ok: true,
    price,
    currency,
    productName: product.name ?? undefined,
  };
}
