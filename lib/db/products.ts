// Server-side catalog fetch. Intended for Server Components only (used by
// /tocatoare). Uses the anon client server-side — RLS allows public SELECT of
// products where status='active'. Returns [] on any failure so a Supabase
// hiccup never crashes the prerender (see _brain/notes/gotchas.md, "supabaseUrl
// is required" — the prior top-level client throws on missing env).

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export type CatalogProduct = Database['public']['Tables']['products']['Row'];

export async function fetchActiveProducts(): Promise<CatalogProduct[]> {
  return (await readActiveProducts()) ?? [];
}

// Same read, for the one caller that must tell "the read FAILED" (null) from
// "there is nothing on sale" ([]): the sitemap, which would otherwise cache a
// list without any product for an hour. Missing configuration is not a
// failure — it stays [] so a machine without Supabase env still renders.
export async function readActiveProducts(): Promise<CatalogProduct[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const sb = createClient<Database>(url, key);
    const { data, error } = await sb
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });
    if (error) return null;
    return data ?? [];
  } catch {
    return null;
  }
}

// Number of active products, for the homepage NumbersStrip. null on any
// failure (never 0): the caller hides the figure rather than show a wrong one.
export async function countActiveProducts(): Promise<number | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const sb = createClient<Database>(url, key);
    const { count, error } = await sb
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');
    if (error || !count) return null;
    return count;
  } catch {
    return null;
  }
}

// Stock availability for a set of products. inventory RLS is admin-only, so the
// public catalog can't read it with the anon client — we use the service-role
// key SERVER-SIDE and expose ONLY a boolean (inStock) to the client; the exact
// count never leaves the server (Task 4.1).
//
// Returns null when the stock could not be read (missing key, network, RLS
// error) — callers then FAIL OPEN and treat everything as in stock, so a
// transient inventory hiccup never hides the whole catalog. A product with
// no inventory row is simply absent from the map = 0 available: it cannot be
// ordered (reserve_stock needs the row), so it reads "out of stock" on the
// catalog AND on its product page alike (2026-11-20; before, an empty map
// meant both "fetch failed" and "no row", so the product page said in stock
// while the catalog said sold out).
export async function fetchStockMap(productIds: string[]): Promise<Map<string, number> | null> {
  if (productIds.length === 0) return new Map();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  try {
    const sb = createClient<Database>(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await sb
      .from('inventory')
      .select('product_id, quantity_available')
      .in('product_id', productIds);
    if (error || !data) return null;
    return new Map(data.map((r) => [r.product_id, r.quantity_available ?? 0]));
  } catch {
    return null;
  }
}

/** In stock = at least one available. Fail-open when the stock is unknown (null). */
export function isInStock(stock: Map<string, number> | null, productId: string): boolean {
  if (stock === null) return true;
  return (stock.get(productId) ?? 0) > 0;
}

// Derives the set of out-of-stock product ids (available <= 0, or no row).
// Fail-open: stock unreadable (null) yields an empty set — nothing marked sold out.
export async function fetchOutOfStockIds(productIds: string[]): Promise<string[]> {
  const stock = await fetchStockMap(productIds);
  return productIds.filter((id) => !isInStock(stock, id));
}

// Single active product by slug, for the detail page. Returns null if the slug
// doesn't exist OR the product isn't active (draft/archived → 404, never public
// — RLS also enforces status='active' for anon, this is belt-and-suspenders).
export async function fetchProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const sb = createClient<Database>(url, key);
    const { data, error } = await sb
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();
    if (error) return null;
    return data ?? null;
  } catch {
    return null;
  }
}
