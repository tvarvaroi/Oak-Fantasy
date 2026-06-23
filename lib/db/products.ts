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
