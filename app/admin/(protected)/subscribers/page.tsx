import { Download } from 'lucide-react';

import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { fetchSubscribers } from '@/lib/admin/subscribers';
import SubscribersTable from '@/components/admin/SubscribersTable';

// /admin/subscribers — newsletter / waitlist list + CSV export (Task 2.5).
// SECURITY: gate at the page top before any data fetch/JSX.

export const dynamic = 'force-dynamic';

export default async function SubscribersPage() {
  await requireAdminOrNotFound();
  const subscribers = await fetchSubscribers();

  const active = subscribers.filter((s) => !s.unsubscribed_at).length;

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="label-caps" style={{ color: 'var(--copper)' }}>
            Listă
          </p>
          <h1
            className="font-caudex"
            style={{ marginTop: 8, fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', color: 'var(--oak-deep)', fontWeight: 700 }}
          >
            Abonați
          </h1>
          <p className="font-lora" style={{ marginTop: 6, color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
            {subscribers.length} {subscribers.length === 1 ? 'abonat' : 'abonați'}
            {subscribers.length !== active ? ` · ${active} activi` : ''}
          </p>
        </div>

        {subscribers.length > 0 ? (
          <a
            href="/admin/subscribers/export"
            className="inline-flex items-center gap-2 font-caudex transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--oak-warm)',
              color: 'var(--cream-warm)',
              borderRadius: 6,
              letterSpacing: '0.03em',
              padding: '11px 22px',
              fontSize: '0.9rem',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 4px rgba(31,24,16,0.18)',
            }}
          >
            <Download size={17} strokeWidth={2} aria-hidden />
            Export CSV
          </a>
        ) : null}
      </div>

      <SubscribersTable subscribers={subscribers} />
    </div>
  );
}
