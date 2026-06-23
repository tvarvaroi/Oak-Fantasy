// Order status badge — all 9 real statuses from the orders schema (Task 2.8).
// Labels come from the shared source (lib/orders/status.ts, Task 3.6); only the
// per-status colors live here.

import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/orders/status';

const STATUS_COLORS: Record<OrderStatus, { bg: string; fg: string }> = {
  pending_payment: { bg: 'rgba(184,115,51,0.16)', fg: 'var(--copper)' },
  pending_cod: { bg: 'rgba(184,115,51,0.16)', fg: 'var(--copper)' },
  confirmed: { bg: 'rgba(143,160,104,0.2)', fg: 'var(--forest-deep)' },
  in_production: { bg: 'rgba(139,94,60,0.16)', fg: 'var(--oak-deep)' },
  packed: { bg: 'rgba(139,94,60,0.16)', fg: 'var(--oak-deep)' },
  shipped: { bg: 'rgba(90,107,60,0.2)', fg: 'var(--forest-mid)' },
  delivered: { bg: 'rgba(143,160,104,0.28)', fg: 'var(--forest-deep)' },
  cancelled: { bg: 'rgba(159,45,32,0.1)', fg: '#9F2D20' },
  refunded: { bg: 'rgba(93,78,58,0.14)', fg: 'var(--ink-soft)' },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status as OrderStatus] ?? {
    bg: 'rgba(93,78,58,0.14)',
    fg: 'var(--ink-soft)',
  };
  const label = ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
  return (
    <span
      className="label-caps inline-block"
      style={{ backgroundColor: colors.bg, color: colors.fg, borderRadius: 999, padding: '3px 10px', fontSize: '0.58rem' }}
    >
      {label}
    </span>
  );
}
