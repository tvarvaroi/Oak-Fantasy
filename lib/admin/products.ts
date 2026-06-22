// SERVER ONLY. Admin catalog reads. Unlike lib/db/products.ts (public, anon,
// status='active' only), this uses the cookie-bound admin client so RLS's
// "Admin full access products" policy returns EVERY status (draft/active/
// archived) — the admin list must show all of them (the 10 seed SKUs are all
// 'draft', so the public catalog is empty until the founder activates them).

import { getServerSupabase } from '@/lib/supabase-server';
import type { Database } from '@/types/supabase';

export type AdminProduct = Database['public']['Tables']['products']['Row'];

export async function fetchAllProducts(): Promise<AdminProduct[]> {
  const sb = getServerSupabase();
  const { data, error } = await sb
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function fetchProductById(id: string): Promise<AdminProduct | null> {
  const sb = getServerSupabase();
  const { data } = await sb.from('products').select('*').eq('id', id).maybeSingle();
  return data ?? null;
}
