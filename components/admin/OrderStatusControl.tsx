'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/lib/orders/status';
import { updateOrderStatus, markOrderPaid } from '@/lib/admin/order-actions';

// Client island on the order detail page (Task 3.6). Status dropdown +
// "Actualizează" + a "Marchează plătit" quick action (D5). The page is a server
// component; only this control needs interactivity.

export default function OrderStatusControl({
  orderId,
  currentStatus,
  paymentStatus,
}: {
  orderId: string;
  currentStatus: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentStatus);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  const dirty = selected !== currentStatus;

  const runUpdate = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, selected);
      if (res.ok) {
        setFeedback({ kind: 'ok', msg: 'Status actualizat.' });
        router.refresh();
      } else {
        setFeedback({ kind: 'err', msg: res.error });
      }
    });
  };

  const runMarkPaid = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await markOrderPaid(orderId);
      if (res.ok) {
        setFeedback({ kind: 'ok', msg: 'Comandă marcată ca plătită.' });
        router.refresh();
      } else {
        setFeedback({ kind: 'err', msg: res.error });
      }
    });
  };

  const selectStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid rgba(92,58,32,0.28)',
    backgroundColor: 'var(--cream-warm)',
    color: 'var(--ink)',
    fontSize: '0.92rem',
    minWidth: 200,
  };

  const btnPrimary: React.CSSProperties = {
    backgroundColor: 'var(--oak-warm)',
    color: 'var(--cream-warm)',
    borderRadius: 8,
    padding: '10px 22px',
    fontSize: '0.9rem',
    letterSpacing: '0.03em',
  };

  const btnSecondary: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: 'var(--forest-deep)',
    border: '1px solid rgba(90,107,60,0.5)',
    borderRadius: 8,
    padding: '10px 18px',
    fontSize: '0.9rem',
    letterSpacing: '0.03em',
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="font-lora"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={pending}
          style={selectStyle}
          aria-label="Status comandă"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={runUpdate}
          disabled={pending || !dirty}
          className="font-caudex transition-all duration-200 hover:opacity-90 disabled:opacity-50"
          style={btnPrimary}
        >
          {pending ? 'Se salvează…' : 'Actualizează'}
        </button>

        {paymentStatus !== 'paid' ? (
          <button
            type="button"
            onClick={runMarkPaid}
            disabled={pending}
            className="font-caudex transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={btnSecondary}
          >
            Marchează plătit
          </button>
        ) : null}
      </div>

      {feedback ? (
        <p
          className="font-lora"
          role="status"
          style={{
            marginTop: 12,
            fontSize: '0.85rem',
            color: feedback.kind === 'ok' ? 'var(--forest-deep)' : '#9F2D20',
          }}
        >
          {feedback.msg}
        </p>
      ) : null}
    </div>
  );
}
