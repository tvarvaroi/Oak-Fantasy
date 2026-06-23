import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { fetchOrderDetail, formatOrderDateTime } from '@/lib/admin/orders';
import { baniToRon } from '@/lib/schemas/product';
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
} from '@/lib/orders/status';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import OrderStatusControl from '@/components/admin/OrderStatusControl';

// /admin/comenzi/[id] — full order detail + status management (Task 3.6).
// SECURITY: gate at the page top. Product data comes from order_items snapshots
// (never a live products join — a deleted/edited product can't break history).

export const dynamic = 'force-dynamic';

function ronStr(bani: number): string {
  return baniToRon(bani).toLocaleString('ro-RO');
}

const card: React.CSSProperties = {
  backgroundColor: 'var(--paper-aged)',
  border: '1px solid rgba(92,58,32,0.18)',
  borderRadius: 10,
  padding: '20px 22px',
};
const sectionLabel: React.CSSProperties = {
  color: 'var(--ink-soft)',
  fontSize: '0.58rem',
  marginBottom: 10,
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  await requireAdminOrNotFound();

  const detail = await fetchOrderDetail(params.id);
  if (!detail) notFound();
  const { order, items, history } = detail;

  const sa = (order.shipping_address ?? null) as null | {
    recipient_name?: string;
    street?: string;
    city?: string;
    county?: string;
    postal_code?: string;
    phone?: string;
    country?: string;
  };

  const paymentMethodLabel =
    order.payment_method === 'cod'
      ? 'Ramburs (la livrare)'
      : order.payment_method === 'stripe_card'
        ? 'Card bancar'
        : (order.payment_method ?? '—');

  const locale = (order as { locale?: string }).locale ?? 'ro';

  return (
    <div style={{ maxWidth: 920 }}>
      <Link
        href="/admin/comenzi"
        className="font-lora transition-opacity hover:opacity-70"
        style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}
      >
        ← Toate comenzile
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 14 }}>
        <h1
          className="font-caudex"
          style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)', color: 'var(--oak-deep)', fontWeight: 700 }}
        >
          {order.order_number}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="font-lora" style={{ marginTop: 6, color: 'var(--ink-soft)', fontSize: '0.88rem' }}>
        {formatOrderDateTime(order.created_at)} · Limbă: {locale.toUpperCase()}
      </p>

      {/* Status management */}
      <div style={{ ...card, marginTop: 22 }}>
        <p className="label-caps" style={sectionLabel}>
          Gestionare status
        </p>
        <OrderStatusControl
          orderId={order.id}
          currentStatus={order.status}
          paymentStatus={order.payment_status}
        />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: 16 }}>
        {/* Client */}
        <div style={card}>
          <p className="label-caps" style={sectionLabel}>
            Client
          </p>
          <p className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            {sa?.recipient_name || '—'}
            <br />
            {order.guest_email ?? '—'}
            <br />
            {order.guest_phone ?? '—'}
          </p>
        </div>

        {/* Shipping */}
        <div style={card}>
          <p className="label-caps" style={sectionLabel}>
            Adresă livrare
          </p>
          {sa ? (
            <p className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem', lineHeight: 1.7 }}>
              {sa.street}
              <br />
              {sa.city}, {sa.county} {sa.postal_code}
              <br />
              {sa.country ?? 'România'}
            </p>
          ) : (
            <p className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>—</p>
          )}
        </div>

        {/* Payment */}
        <div style={card}>
          <p className="label-caps" style={sectionLabel}>
            Plată
          </p>
          <p className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            {paymentMethodLabel}
            <br />
            <span style={{ color: 'var(--ink-soft)' }}>
              {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
            </span>
          </p>
        </div>
      </div>

      {/* Items */}
      <div style={{ ...card, marginTop: 16 }}>
        <p className="label-caps" style={sectionLabel}>
          Produse
        </p>
        <div className="flex flex-col gap-2.5">
          {items.map((it) => {
            const snap = (it.product_snapshot ?? {}) as { name_ro?: string; name_en?: string };
            return (
              <div key={it.id} className="flex items-start justify-between gap-3">
                <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem' }}>
                  {snap.name_ro ?? snap.name_en ?? '—'} × {it.quantity}
                  {it.engraving_text ? (
                    <span style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>
                      {' '}· Gravare: “{it.engraving_text}”
                    </span>
                  ) : null}
                </span>
                <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  {ronStr(it.line_total_ron)} RON
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ borderTop: '1px solid rgba(92,58,32,0.15)', marginTop: 14, paddingTop: 12 }}>
          <Row label="Subtotal" value={`${ronStr(order.subtotal_ron)} RON`} />
          <Row
            label="Transport"
            value={order.shipping_cost_ron > 0 ? `${ronStr(order.shipping_cost_ron)} RON` : 'Gratuit'}
          />
          <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
            <span className="font-caudex" style={{ color: 'var(--oak-deep)', fontWeight: 700, fontSize: '1.05rem' }}>
              Total
            </span>
            <span className="font-caudex" style={{ color: 'var(--ink)', fontWeight: 700, fontSize: '1.2rem' }}>
              {ronStr(order.total_ron)} RON
            </span>
          </div>
        </div>
      </div>

      {/* Customer notes */}
      {order.customer_notes ? (
        <div style={{ ...card, marginTop: 16 }}>
          <p className="label-caps" style={sectionLabel}>
            Observații client
          </p>
          <p className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {order.customer_notes}
          </p>
        </div>
      ) : null}

      {/* Status history */}
      <div style={{ ...card, marginTop: 16 }}>
        <p className="label-caps" style={sectionLabel}>
          Istoric status
        </p>
        {history.length === 0 ? (
          <p className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.88rem' }}>
            Fără istoric înregistrat.
          </p>
        ) : (
          <ol className="flex flex-col gap-3" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {history.map((h) => (
              <li key={h.id} className="flex items-start gap-3">
                <span
                  aria-hidden
                  style={{
                    marginTop: 6,
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: 'var(--copper)',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem' }}>
                    {h.from_status
                      ? `${ORDER_STATUS_LABELS[h.from_status as OrderStatus] ?? h.from_status} → `
                      : ''}
                    <span style={{ fontWeight: 600 }}>
                      {ORDER_STATUS_LABELS[h.to_status as OrderStatus] ?? h.to_status}
                    </span>
                  </p>
                  <p className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.78rem', marginTop: 2 }}>
                    {formatOrderDateTime(h.created_at)}
                    {h.note ? ` · ${h.note}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
      <span className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.88rem' }}>
        {label}
      </span>
      <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.88rem' }}>
        {value}
      </span>
    </div>
  );
}
