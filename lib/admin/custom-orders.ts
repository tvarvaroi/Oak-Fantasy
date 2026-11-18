// SERVER ONLY. Admin reads for custom-order requests (2026-11-18). All reads go
// through the cookie-bound client, so RLS "Admin full access custom_orders"
// (is_admin()) is the gate; failures degrade to empty/0, never throw.

import { getServerSupabase } from '@/lib/supabase-server';
import {
  NEW_CUSTOM_ORDER_STATUS,
  type CustomOrderStatus,
} from '@/lib/schemas/custom-order';
import type { Database } from '@/types/supabase';

export type CustomOrderRow = Database['public']['Tables']['custom_orders']['Row'];

export async function fetchCustomOrders(status?: CustomOrderStatus): Promise<CustomOrderRow[]> {
  const sb = getServerSupabase();
  let query = sb.from('custom_orders').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) {
    console.error('[admin/custom-orders] list failed:', error);
    return [];
  }
  return data ?? [];
}

export async function fetchCustomOrder(id: string): Promise<CustomOrderRow | null> {
  // Non-uuid ids would make Postgres throw (22P02); treat them as "not found".
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await getServerSupabase()
    .from('custom_orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('[admin/custom-orders] detail failed:', error);
    return null;
  }
  return data;
}

/** Requests still in "Nouă" — sidebar badge + dashboard card. */
export async function countNewCustomOrders(): Promise<number> {
  const { count, error } = await getServerSupabase()
    .from('custom_orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', NEW_CUSTOM_ORDER_STATUS);
  if (error) return 0;
  return count ?? 0;
}
