import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { fetchDashboardStats } from '@/lib/admin/dashboard';
import StatCard from '@/components/admin/StatCard';
import SubscribersChart from '@/components/admin/SubscribersChart';

// /admin dashboard — stats + subscribers trend (Task 2.7). The shell (sidebar,
// topbar, logout) lives in the (protected) layout.
//
// SECURITY: gate at the page top (Task 2.3 RSC-leak lesson).

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdminOrNotFound();
  const stats = await fetchDashboardStats();

  const subDezabonati = stats.subscribers.total - stats.subscribers.active;

  return (
    <div style={{ maxWidth: 1100 }}>
      <p className="label-caps" style={{ color: 'var(--copper)' }}>
        Panou
      </p>
      <h1
        className="font-caudex"
        style={{ marginTop: 8, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--oak-deep)', fontWeight: 700, lineHeight: 1.1 }}
      >
        Administrare Oak Fantasy
      </h1>

      {/* Stats (D3, D4: 4-col responsive grid) */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Produse"
          value={stats.products.total}
          sub={`${stats.products.active} active · ${stats.products.draft} draft · ${stats.products.archived} arhivate`}
        />
        <StatCard
          label="Abonați"
          value={stats.subscribers.total}
          sub={subDezabonati > 0 ? `${stats.subscribers.active} activi · ${subDezabonati} dezabonați` : `${stats.subscribers.active} activi`}
        />
        <StatCard label="Comenzi" value={stats.orders.total} sub="După lansare" />
        <StatCard
          label="Produse fără poză"
          value={stats.products.withoutImage}
          sub={`din ${stats.products.total} ${stats.products.total === 1 ? 'produs' : 'produse'}`}
        />
      </div>

      {/* Subscribers trend */}
      <div
        className="mt-8"
        style={{
          backgroundColor: 'var(--paper-aged)',
          border: '1px solid rgba(92,58,32,0.18)',
          borderRadius: 10,
          padding: '22px 22px 18px',
        }}
      >
        <h2 className="font-caudex" style={{ fontSize: '1.1rem', color: 'var(--oak-deep)', fontWeight: 700 }}>
          Abonați noi
        </h2>
        <p className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.82rem', marginBottom: 14 }}>
          Ultimele 6 luni
        </p>
        <SubscribersChart data={stats.subscribersByMonth} />
      </div>
    </div>
  );
}
