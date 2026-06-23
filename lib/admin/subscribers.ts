// SERVER ONLY. Admin read of the newsletter / waitlist list (Task 2.5). Uses
// the cookie-bound admin client; RLS "Admin reads subscribers" (is_admin())
// gates it — no service role (D4). Returns [] on failure so the page never
// crashes the prerender.

import { getServerSupabase } from '@/lib/supabase-server';
import type { Database } from '@/types/supabase';

export type Subscriber = Database['public']['Tables']['email_subscribers']['Row'];

export async function fetchSubscribers(): Promise<Subscriber[]> {
  const sb = getServerSupabase();
  const { data, error } = await sb
    .from('email_subscribers')
    .select('*')
    .order('created_at', { ascending: false }); // D1: newest first
  if (error) return [];
  return data ?? [];
}

// Deterministic RO-formatted timestamp in Europe/Bucharest (handles DST via
// Intl tz data). Server-side only (used by the table SC + the CSV handler), so
// no client/server hydration concern. Returns '' for a null timestamp.
export function formatSubscriberDate(iso: string | null): string {
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
