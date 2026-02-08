import { useEffect, useRef, useState } from "react";

export type ProductSuggestion = {
  id: string;
  title: string;
  image_url: string | null;
  score: number | null;
};

export function useProductSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastQueryRef = useRef("");

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    let isActive = true;
    const controller = new AbortController();
    const id = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        lastQueryRef.current = q;
        const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load suggestions");
        const data = (await res.json()) as { items: ProductSuggestion[] };
        if (isActive && lastQueryRef.current === q) {
          setSuggestions(data.items ?? []);
        }
      } catch (err) {
        if (isActive) setSuggestions([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }, 250);

    return () => {
      isActive = false;
      controller.abort();
      window.clearTimeout(id);
    };
  }, [query]);

  return { suggestions, isLoading };
}
