// Order status badge — all 9 real statuses from the orders schema (Task 2.8).
// Built now, reused directly in Sprint 3 when checkout creates real orders.

type StatusStyle = { label: string; bg: string; fg: string };

const ORDER_STATUS: Record<string, StatusStyle> = {
  pending_payment: { label: 'Așteaptă plata', bg: 'rgba(184,115,51,0.16)', fg: 'var(--copper)' },
  pending_cod: { label: 'Ramburs în așteptare', bg: 'rgba(184,115,51,0.16)', fg: 'var(--copper)' },
  confirmed: { label: 'Confirmată', bg: 'rgba(143,160,104,0.2)', fg: 'var(--forest-deep)' },
  in_production: { label: 'În producție', bg: 'rgba(139,94,60,0.16)', fg: 'var(--oak-deep)' },
  packed: { label: 'Împachetată', bg: 'rgba(139,94,60,0.16)', fg: 'var(--oak-deep)' },
  shipped: { label: 'Expediată', bg: 'rgba(90,107,60,0.2)', fg: 'var(--forest-mid)' },
  delivered: { label: 'Livrată', bg: 'rgba(143,160,104,0.28)', fg: 'var(--forest-deep)' },
  cancelled: { label: 'Anulată', bg: 'rgba(159,45,32,0.1)', fg: '#9F2D20' },
  refunded: { label: 'Rambursată', bg: 'rgba(93,78,58,0.14)', fg: 'var(--ink-soft)' },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const s = ORDER_STATUS[status] ?? { label: status, bg: 'rgba(93,78,58,0.14)', fg: 'var(--ink-soft)' };
  return (
    <span
      className="label-caps inline-block"
      style={{ backgroundColor: s.bg, color: s.fg, borderRadius: 999, padding: '3px 10px', fontSize: '0.58rem' }}
    >
      {s.label}
    </span>
  );
}
