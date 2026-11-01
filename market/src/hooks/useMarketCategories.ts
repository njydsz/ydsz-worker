import { useState, useEffect } from "react";
import { marketApi, type CategoryFacet } from "../api/market";

export function useMarketCategories(type: string) {
  const [categories, setCategories] = useState<CategoryFacet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    marketApi
      .categories(type)
      .then((res) => {
        if (!cancelled) setCategories(res.categories);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [type]);

  return { categories, loading };
}
