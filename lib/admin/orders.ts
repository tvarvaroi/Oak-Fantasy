// SERVER ONLY. Admin orders read (Task 2.8 placeholder → Task 3.6 real). RLS
// "Admin full access orders" / "...order_status_history" gates these. Returns
// [] / null gracefully so pages never crash on a transient DB error.

import { getServerSupabase } from '@/lib/supabase-server';
import type { Database } from '@/types/supabase';
import { isOrderStatus } from '@/lib/orders/status';

export type AdminOrder = Database['public']['Tables']['orders']['Row'];
export type AdminOrderItem = Database['public']['Tables']['order_items']['Row'];
export type AdminOrderHistory = Database['public']['Tables']['order_status_history']['Row'];

// List, newest first. Optional status filter (D3) — ignored unless it's one of
// the 9 valid statuses, so a junk ?status= can't break the query.
export async function fetchOrders(statusFilter?: string): Promise<AdminOrder[]> {
  const sb = getServerSupabase();
  let query = sb.from('orders').select('*').order('created_at', { ascending: false });
  if (statusFilter && isOrderStatus(statusFilter)) {
    query = query.eq('status', statusFilter);
  }
  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export interface OrderDetail {
  order: AdminOrder;
  items: AdminOrderItem[];
  history: AdminOrderHistory[];
}

export async function fetchOrderDetail(id: string): Promise<OrderDetail | null> {
  // Guard non-UUID input before hitting the DB.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return null;
  }
  const sb = getServerSupabase();
  const { data: order } = await sb.from('orders').select('*').eq('id', id).maybeSingle();
  if (!order) return null;

  const { data: items } = await sb
    .from('order_items')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: true });

  const { data: history } = await sb
    .from('order_status_history')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: true });

  return { order, items: items ?? [], history: history ?? [] };
}

export function formatOrderDate(iso: string | null): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Bucharest',
  }).format(new Date(iso));
}

export function formatOrderDateTime(iso: string | null): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Bucharest',
  }).format(new Date(iso));
}
