/**
 * Bank of Canada Valet API - Canada inflation (CPI) data.
 * Free, no API key required.
 * @see https://www.bankofcanada.ca/valet/docs
 */

export type InflationDataPoint = {
  date: string;
  value: number;
};

export type CanadaInflationResult = {
  score: number; // 0-100 for OpenBy Index
  latestValue: number;
  dataPoints: InflationDataPoint[];
  error?: string;
};

const API_BASE = "https://www.bankofcanada.ca/valet";
const SERIES = "STATIC_TOTALCPICHANGE"; // Total CPI YoY %

/**
 * Convert inflation rate to 0-100 score. Bank of Canada targets 2%.
 * Lower deviation from 2% = higher score. 2% = 100.
 */
function inflationToScore(inflation: number): number {
  const deviation = Math.abs(inflation - 2);
  const penalty = Math.min(50, deviation * 15);
  return Math.round(Math.max(0, 100 - penalty));
}

/**
 * Fetch Canada CPI inflation (YoY %) for the past year from Bank of Canada.
 */
export async function getCanadaInflationData(): Promise<CanadaInflationResult> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const params = new URLSearchParams({
    start_date: startDate.toISOString().slice(0, 10),
    end_date: endDate.toISOString().slice(0, 10),
  });

  try {
    const res = await fetch(
      `${API_BASE}/observations/${SERIES}/json?${params}`,
      { next: { revalidate: 86400 } } // cache 24h
    );

    if (!res.ok) {
      throw new Error(`Bank of Canada API error: ${res.status}`);
    }

    const json = (await res.json()) as {
      observations?: Array<{
        d: string;
        [key: string]: { v: string } | string | undefined;
      }>;
    };

    const observations = json?.observations ?? [];
    const dataPoints: InflationDataPoint[] = [];

    for (const obs of observations) {
      const raw = (obs[SERIES] as { v: string } | undefined)?.v;
      const val = parseFloat(String(raw ?? ""));
      if (!Number.isNaN(val)) {
        dataPoints.push({
          date: obs.d ?? "",
          value: val,
        });
      }
    }

    dataPoints.sort((a, b) => a.date.localeCompare(b.date));

    const latest = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1]!.value : 2;
    const score = inflationToScore(latest);

    return {
      score,
      latestValue: latest,
      dataPoints,
    };
  } catch (err) {
    console.error("Bank of Canada inflation fetch error:", err);
    return {
      score: 50,
      latestValue: 2,
      dataPoints: [],
      error: err instanceof Error ? err.message : "Failed to fetch inflation data",
    };
  }
}
