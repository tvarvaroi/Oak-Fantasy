// SERVER ONLY. Dashboard aggregates (Task 2.7). All reads via the cookie-bound
// admin client (RLS) and degrade gracefully — a failed/empty query yields zeros
// so the dashboard never crashes (e.g. subscribers return [] until the Task 2.5
// admin-read migration is applied on the live DB).

import { getServerSupabase } from '@/lib/supabase-server';

export interface MonthlyPoint {
  label: string;
  count: number;
}

export interface DashboardStats {
  products: { total: number; active: number; draft: number; archived: number; withoutImage: number };
  subscribers: { total: number; active: number };
  orders: { total: number };
  subscribersByMonth: MonthlyPoint[];
}

const RO_MONTHS = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'noi', 'dec'];

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Last 6 calendar months (oldest -> newest), each bucket counting subscribers
// whose created_at falls in that month. Empty months render as 0 (D2).
function buildLast6Months(dates: (string | null)[]): MonthlyPoint[] {
  const now = new Date();
  const buckets = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    return { key: monthKey(d), label: RO_MONTHS[d.getMonth()], count: 0 };
  });
  for (const iso of dates) {
    if (!iso) continue;
    const bucket = buckets.find((b) => b.key === monthKey(new Date(iso)));
    if (bucket) bucket.count += 1;
  }
  return buckets.map(({ label, count }) => ({ label, count }));
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const sb = getServerSupabase();

  const [{ data: products }, { data: subs }, { count: ordersCount }] = await Promise.all([
    sb.from('products').select('status, hero_image_url'),
    sb.from('email_subscribers').select('created_at, unsubscribed_at'),
    sb.from('orders').select('*', { count: 'exact', head: true }),
  ]);

  const p = products ?? [];
  const s = subs ?? [];

  return {
    products: {
      total: p.length,
      active: p.filter((x) => x.status === 'active').length,
      draft: p.filter((x) => x.status === 'draft').length,
      archived: p.filter((x) => x.status === 'archived').length,
      withoutImage: p.filter((x) => !x.hero_image_url).length,
    },
    subscribers: {
      total: s.length,
      active: s.filter((x) => !x.unsubscribed_at).length,
    },
    orders: { total: ordersCount ?? 0 },
    subscribersByMonth: buildLast6Months(s.map((x) => x.created_at)),
  };
}
