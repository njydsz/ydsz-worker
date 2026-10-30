/**
 * Unified market API client.
 *
 * Wraps ``/api/market/*`` endpoints for the dashboard marketplace SPA.
 */

import { request } from "../request";

// ── Shared types ──────────────────────────────────────────────────────────
export interface MarketItem {
  market_id: string;
  type: string;
  source: string;
  identity: string;
  name: string;
  description: string;
  icon_url?: string | null;
  icon_name?: string | null;
  color?: string | null;
  version: string;
  author?: { name: string; url?: string | null } | null;
  category: string;
  tags: string[];
  rating?: number | null;
  downloads: number;
  installed: boolean;
  installed_version?: string | null;
  has_update: boolean;
  size_bytes?: number | null;
  source_url?: string | null;
  updated_at?: string | null;
}

export interface MarketDetail extends MarketItem {
  readme?: string | null;
  screenshots?: string[];
  changelog?: string | null;
  dependencies?: string[];
  quick_prompts?: Record<string, string>[];
  metadata?: Record<string, unknown>;
}

export interface MarketSearchResult {
  items: MarketItem[];
  total: number;
  per_type: Record<string, number>;
  query: string;
  limit: number;
  offset: number;
}

export interface MarketListResult {
  items: MarketItem[];
  total: number;
  limit: number;
  offset: number;
  sort: string;
  category?: string | null;
  type: string;
}

export interface InstallReceipt {
  market_item: MarketItem;
  target: { type: string; id: string };
  installed_version: string;
  metadata?: Record<string, unknown>;
}

export interface Category {
  slug: string;
  label: string;
  count?: number;
}

export interface UpdateInfo {
  market_id: string;
  installed_version: string;
  latest_version: string;
  changelog?: string | null;
}

// ── Query params helper ───────────────────────────────────────────────────
interface ListParams {
  q?: string;
  category?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

function toQuery(params: ListParams): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.sort) sp.set("sort", params.sort);
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.offset) sp.set("offset", String(params.offset));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ── API methods ───────────────────────────────────────────────────────────
export const marketApi = {
  /** Cross-type search. */
  async search(
    query: string,
    types?: string[],
    params: Omit<ListParams, "q"> = {},
  ): Promise<MarketSearchResult> {
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (types?.length) sp.set("types", types.join(","));
    if (params.category) sp.set("category", params.category);
    if (params.sort) sp.set("sort", params.sort);
    sp.set("limit", String(params.limit ?? 20));
    sp.set("offset", String(params.offset ?? 0));
    const raw = await request(`/api/market/search?${sp.toString()}`);
    return raw as MarketSearchResult;
  },

  /** Per-type list. */
  async list(type: string, params: ListParams = {}): Promise<MarketListResult> {
    const raw = await request(`/api/market/${type}/list${toQuery(params)}`);
    return raw as MarketListResult;
  },

  /** Detail for drawer. */
  async detail(type: string, identity: string): Promise<MarketDetail> {
    const raw = await request(`/api/market/${type}/${identity}`);
    return raw as MarketDetail;
  },

  /** Install. */
  async install(
    type: string,
    identity: string,
    body: Record<string, unknown>,
  ): Promise<InstallReceipt> {
    const raw = await request(`/api/market/${type}/${identity}/install`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return raw as InstallReceipt;
  },

  /** Installed items (cross-type). */
  async installed(params: { limit?: number; offset?: number } = {}): Promise<{
    items: Record<string, unknown>[];
    total: number;
  }> {
    const sp = new URLSearchParams();
    if (params.limit) sp.set("limit", String(params.limit));
    if (params.offset) sp.set("offset", String(params.offset));
    const qs = sp.toString();
    return request(`/api/market/installed${qs ? "?" + qs : ""}`);
  },

  /** Check updates for a type. */
  async categories(type: string): Promise<{ categories: Category[]; type: string }> {
    return request(`/api/market/${type}/categories`);
  },
};
