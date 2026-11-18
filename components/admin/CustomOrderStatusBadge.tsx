// Status badge for custom-order requests (2026-11-18). Labels from the shared
// source (lib/schemas/custom-order.ts); colors follow OrderStatusBadge so the
// two admin lists read the same ("new" = copper, done = forest, cancelled = red).

import {
  CUSTOM_ORDER_STATUS_LABELS,
  type CustomOrderStatus,
} from '@/lib/schemas/custom-order';

const STATUS_COLORS: Record<CustomOrderStatus, { bg: string; fg: string }> = {
  new: { bg: 'rgba(184,115,51,0.16)', fg: 'var(--copper)' },
  contacted: { bg: 'rgba(139,94,60,0.16)', fg: 'var(--oak-deep)' },
  in_progress: { bg: 'rgba(90,107,60,0.2)', fg: 'var(--forest-mid)' },
  completed: { bg: 'rgba(143,160,104,0.28)', fg: 'var(--forest-deep)' },
  cancelled: { bg: 'rgba(159,45,32,0.1)', fg: '#9F2D20' },
};

export default function CustomOrderStatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status as CustomOrderStatus] ?? {
    bg: 'rgba(93,78,58,0.14)',
    fg: 'var(--ink-soft)',
  };
  const label = CUSTOM_ORDER_STATUS_LABELS[status as CustomOrderStatus] ?? status;
  return (
    <span
      className="label-caps inline-block"
      style={{ backgroundColor: colors.bg, color: colors.fg, borderRadius: 999, padding: '3px 10px', fontSize: '0.58rem', whiteSpace: 'nowrap' }}
    >
      {label}
    </span>
  );
}
