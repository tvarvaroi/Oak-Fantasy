// Server-side catalog fetch. Intended for Server Components only (used by
// /tocatoare). Uses the anon client server-side — RLS allows public SELECT of
// products where status='active'. Returns [] on any failure so a Supabase
// hiccup never crashes the prerender (see _brain/notes/gotchas.md, "supabaseUrl
// is required" — the prior top-level client throws on missing env).

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export type CatalogProduct = Database['public']['Tables']['products']['Row'];

export async function fetchActiveProducts(): Promise<CatalogProduct[]> {
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
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

// Stock availability for a set of products. inventory RLS is admin-only, so the
// public catalog can't read it with the anon client — we use the service-role
// key SERVER-SIDE and expose ONLY a boolean (inStock) to the client; the exact
// count never leaves the server (Task 4.1). Fails OPEN: on any error / missing
// key it returns an empty map and callers treat everything as in stock, so a
// transient inventory hiccup never hides the whole catalog.
export async function fetchStockMap(productIds: string[]): Promise<Map<string, number>> {
  const empty = new Map<string, number>();
  if (productIds.length === 0) return empty;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return empty;
  try {
    const sb = createClient<Database>(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await sb
      .from('inventory')
      .select('product_id, quantity_available')
      .in('product_id', productIds);
    if (error || !data) return empty;
    return new Map(data.map((r) => [r.product_id, r.quantity_available ?? 0]));
  } catch {
    return empty;
  }
}

// Derives the set of out-of-stock product ids (available <= 0). Fail-open: an
// empty stock map (fetch failed) yields an empty set — nothing marked sold out.
export async function fetchOutOfStockIds(productIds: string[]): Promise<string[]> {
  const stock = await fetchStockMap(productIds);
  if (stock.size === 0) return [];
  return productIds.filter((id) => (stock.get(id) ?? 0) <= 0);
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
