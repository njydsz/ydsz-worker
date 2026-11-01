import { useState, useEffect, useRef, useCallback } from "react";
import { marketApi, type MarketListResult } from "../api/market";

interface UseMarketSearchOptions {
  debounceMs?: number;
}

export function useMarketSearch(types?: string[], options: UseMarketSearchOptions = {}) {
  const { debounceMs = 300 } = options;
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [data, setData] = useState<MarketListResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);
    return () => clearTimeout(debounceTimer.current);
  }, [query, debounceMs]);

  const doSearch = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await marketApi.search(debouncedQuery, types);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, types]);

  useEffect(() => {
    doSearch();
  }, [doSearch]);

  return { query, setQuery, data, loading, error };
}
