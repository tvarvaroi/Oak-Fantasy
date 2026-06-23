// SERVER ONLY. Order confirmation fetch (Task 3.4). Service-role read — guest
// orders have no session; the UUID orderId in the URL is the access control
// (D3, 122-bit unguessable). Returns only what the confirmation page shows.

import { getServiceSupabase } from '@/lib/supabase-server';
import type { Database } from '@/types/supabase';

export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

export async function fetchOrderConfirmation(
  orderId: string,
): Promise<{ order: OrderRow; items: OrderItemRow[] } | null> {
  // Guard against non-UUID input (avoids a DB error on malformed slugs).
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
    return null;
  }
  const sb = getServiceSupabase();
  const { data: order } = await sb.from('orders').select('*').eq('id', orderId).maybeSingle();
  if (!order) return null;
  const { data: items } = await sb.from('order_items').select('*').eq('order_id', orderId);
  return { order, items: items ?? [] };
}
