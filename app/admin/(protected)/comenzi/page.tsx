import Link from 'next/link';

import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { fetchOrders, formatOrderDate } from '@/lib/admin/orders';
import { baniToRon } from '@/lib/schemas/product';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, isOrderStatus } from '@/lib/orders/status';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';

// /admin/comenzi — real orders list (Task 3.6). Status filter via ?status= (D3).
// SECURITY: gate at the page top (RSC-leak lesson).

export const dynamic = 'force-dynamic';

const COLUMNS = ['Nr. comandă', 'Client', 'Dată', 'Status', 'Total', ''];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requireAdminOrNotFound();

  const activeFilter = searchParams.status && isOrderStatus(searchParams.status)
    ? searchParams.status
    : undefined;
  const orders = await fetchOrders(activeFilter);

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '0 12px 10px',
    borderBottom: '1px solid rgba(92,58,32,0.2)',
  };
  const tdStyle: React.CSSProperties = {
    padding: '13px 12px',
    borderBottom: '1px solid rgba(92,58,32,0.12)',
    verticalAlign: 'middle',
  };

  const pillBase: React.CSSProperties = {
    padding: '5px 12px',
    borderRadius: 999,
    fontSize: '0.62rem',
    border: '1px solid rgba(92,58,32,0.25)',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <p className="label-caps" style={{ color: 'var(--copper)' }}>
        Vânzări
      </p>
      <h1
        className="font-caudex"
        style={{ marginTop: 8, fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', color: 'var(--oak-deep)', fontWeight: 700 }}
      >
        Comenzi
      </h1>
      <p className="font-lora" style={{ marginTop: 6, color: 'var(--ink-soft)', fontSize: '0.9rem', marginBottom: 18 }}>
        {orders.length} {orders.length === 1 ? 'comandă' : 'comenzi'}
        {activeFilter ? ` · ${ORDER_STATUS_LABELS[activeFilter]}` : ''}
      </p>

      {/* Status filter pills (D3) */}
      <div className="flex flex-wrap gap-2" style={{ marginBottom: 24 }}>
        <Link
          href="/admin/comenzi"
          className="label-caps transition-opacity hover:opacity-80"
          style={{
            ...pillBase,
            backgroundColor: !activeFilter ? 'var(--oak-warm)' : 'transparent',
            color: !activeFilter ? 'var(--cream-warm)' : 'var(--ink-soft)',
          }}
        >
          Toate
        </Link>
        {ORDER_STATUSES.map((s) => {
          const on = activeFilter === s;
          return (
            <Link
              key={s}
              href={`/admin/comenzi?status=${s}`}
              className="label-caps transition-opacity hover:opacity-80"
              style={{
                ...pillBase,
                backgroundColor: on ? 'var(--oak-warm)' : 'transparent',
                color: on ? 'var(--cream-warm)' : 'var(--ink-soft)',
              }}
            >
              {ORDER_STATUS_LABELS[s]}
            </Link>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr>
              {COLUMNS.map((c, i) => (
                <th key={i} className="label-caps" style={{ ...thStyle, color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} style={{ ...tdStyle, textAlign: 'center', padding: '48px 12px' }}>
                  <span className="font-lora" style={{ color: 'var(--ink-soft)' }}>
                    {activeFilter ? 'Nicio comandă cu acest status.' : 'Comenzile vor apărea aici după prima vânzare.'}
                  </span>
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td style={tdStyle}>
                    <Link
                      href={`/admin/comenzi/${o.id}`}
                      className="font-caudex transition-opacity hover:opacity-70"
                      style={{ color: 'var(--oak-deep)', fontWeight: 700 }}
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td style={tdStyle}>
                    <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.88rem' }}>
                      {o.guest_email ?? '—'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
                      {formatOrderDate(o.created_at) || '—'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td style={tdStyle}>
                    <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.88rem' }}>
                      {baniToRon(o.total_ron).toLocaleString('ro-RO')} RON
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <Link
                      href={`/admin/comenzi/${o.id}`}
                      className="font-lora transition-opacity hover:opacity-70"
                      style={{ color: 'var(--copper)', fontSize: '0.85rem' }}
                    >
                      Vezi →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
