import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { fetchOrders, formatOrderDate } from '@/lib/admin/orders';
import { baniToRon } from '@/lib/schemas/product';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';

// /admin/comenzi — orders table (Task 2.8). Structure is ready for Sprint 3
// (checkout creates real orders); empty now. SECURITY: gate at the page top.

export const dynamic = 'force-dynamic';

const COLUMNS = ['Nr. comandă', 'Client', 'Dată', 'Status', 'Total', 'Acțiuni'];

export default async function OrdersPage() {
  await requireAdminOrNotFound();
  const orders = await fetchOrders();

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
      <p className="font-lora" style={{ marginTop: 6, color: 'var(--ink-soft)', fontSize: '0.9rem', marginBottom: 24 }}>
        {orders.length} {orders.length === 1 ? 'comandă' : 'comenzi'}
      </p>

      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c} className="label-caps" style={{ ...thStyle, color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
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
                    Comenzile vor apărea aici după lansare.
                  </span>
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td style={tdStyle}>
                    <span className="font-caudex" style={{ color: 'var(--oak-deep)', fontWeight: 700 }}>
                      {o.order_number}
                    </span>
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
                    <span className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
                      —
                    </span>
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
