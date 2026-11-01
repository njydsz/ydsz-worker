import { useState, useEffect } from "react";
import { marketApi, type MarketItem } from "../api/market";

export function useMarketDetail(type: string, identity: string | null) {
  const [item, setItem] = useState<MarketItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!identity) {
      setItem(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    marketApi
      .detail(type, identity)
      .then((d) => {
        if (!cancelled) setItem(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Not found");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [type, identity]);

  return { item, loading, error };
}
