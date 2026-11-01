import { useState, useEffect, useCallback } from "react";
import { marketApi, type MarketListResult } from "../api/market";

interface UseMarketListOptions {
  q?: string;
  category?: string;
  sort?: string;
  pageSize?: number;
}

export function useMarketList(type: string, options: UseMarketListOptions = {}) {
  const { q, category, sort = "relevance", pageSize = 24 } = options;
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<MarketListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOffset(0);
  }, [type, q, category, sort]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { sort, limit: pageSize, offset };
      if (q) params.q = q;
      if (category) params.category = category;
      const result = await marketApi.list(type, params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [type, q, category, sort, pageSize, offset]);

  useEffect(() => {
    load();
  }, [load]);

  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const totalPages = Math.ceil(total / pageSize);

  return {
    items,
    total,
    loading,
    error,
    offset,
    setOffset,
    pageSize,
    totalPages,
    reload: load,
  };
}
