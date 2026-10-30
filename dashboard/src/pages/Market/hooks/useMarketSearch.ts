import { useCallback, useRef, useState } from "react";
import { marketApi, type MarketItem } from "../../../api/modules/market";

export function useMarketSearch() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [total, setTotal] = useState(0);
  const [perType, setPerType] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string, types?: string[], delayMs = 300) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await marketApi.search(query, types, {});
        setItems(result.items);
        setTotal(result.total);
        setPerType(result.per_type);
      } finally {
        setLoading(false);
      }
    }, delayMs);
  }, []);

  return { items, total, perType, loading, search };
}