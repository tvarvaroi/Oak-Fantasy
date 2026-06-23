// SERVER ONLY. Admin orders read (Task 2.8 placeholder; real data in Sprint 3).
// orders is empty now; RLS "Admin full access orders" gates this. Returns []
// gracefully so the placeholder page never crashes.

import { getServerSupabase } from '@/lib/supabase-server';
import type { Database } from '@/types/supabase';

export type AdminOrder = Database['public']['Tables']['orders']['Row'];

export async function fetchOrders(): Promise<AdminOrder[]> {
  const sb = getServerSupabase();
  const { data, error } = await sb
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
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
