import { useState, useEffect } from "react";
import { marketApi, type MarketItem } from "../api/market";

/**
 * Installed tab — public users see an empty list (no auth).
 * When this Market SPA is embedded in the dashboard via iframe/token,
 * the backend `optional_user` dependency returns the authenticated user
 * and the installed list will populate.
 */
export function useInstalledTab() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    marketApi
      .installed()
      .then((res) => {
        if (!cancelled) setItems(res.items);
      })
      .catch(() => { /* public user — empty list is fine */ })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { items, loading };
}
