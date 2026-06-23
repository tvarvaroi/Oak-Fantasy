'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { adjustStock } from '@/lib/admin/inventory-actions';

// Stock management island on the product edit page (Task 4.1). Shows current
// total/reserved/available and an absolute-set adjust form (D6). The movement
// history is rendered server-side by the page (label map is server-only).

export default function StockPanel({
  productId,
  slug,
  total,
  reserved,
  available,
  hasInventory,
}: {
  productId: string;
  slug: string;
  total: number;
  reserved: number;
  available: number;
  hasInventory: boolean;
}) {
  const router = useRouter();
  const [newTotal, setNewTotal] = useState(String(total));
  const [reason, setReason] = useState('');
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  const parsed = Number(newTotal);
  const valid = Number.isInteger(parsed) && parsed >= 0;
  const dirty = String(total) !== newTotal.trim();

  const onSave = () => {
    setFeedback(null);
    if (!valid) {
      setFeedback({ kind: 'err', msg: 'Introdu un număr întreg ≥ 0.' });
      return;
    }
    startTransition(async () => {
      const res = await adjustStock(productId, parsed, reason, slug);
      if (res.ok) {
        setFeedback({ kind: 'ok', msg: 'Stoc actualizat.' });
        setReason('');
        router.refresh();
      } else {
        setFeedback({ kind: 'err', msg: res.error });
      }
    });
  };

  const statBox: React.CSSProperties = {
    flex: 1,
    minWidth: 90,
    backgroundColor: 'var(--cream-warm)',
    border: '1px solid rgba(92,58,32,0.18)',
    borderRadius: 8,
    padding: '12px 14px',
    textAlign: 'center',
  };

  return (
    <div>
      {/* Current numbers */}
      <div className="flex flex-wrap gap-3" style={{ marginBottom: 18 }}>
        <div style={statBox}>
          <p className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.55rem' }}>Total</p>
          <p className="font-caudex" style={{ color: 'var(--oak-deep)', fontWeight: 700, fontSize: '1.4rem' }}>{total}</p>
        </div>
        <div style={statBox}>
          <p className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.55rem' }}>Rezervat</p>
          <p className="font-caudex" style={{ color: 'var(--copper)', fontWeight: 700, fontSize: '1.4rem' }}>{reserved}</p>
        </div>
        <div style={statBox}>
          <p className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.55rem' }}>Disponibil</p>
          <p
            className="font-caudex"
            style={{ color: available <= 0 ? '#9F2D20' : 'var(--forest-deep)', fontWeight: 700, fontSize: '1.4rem' }}
          >
            {available}
          </p>
        </div>
      </div>

      {!hasInventory ? (
        <p className="font-lora" style={{ color: '#9F2D20', fontSize: '0.85rem', marginBottom: 12 }}>
          Acest produs nu are încă un rând de inventar. Creează-l în Supabase înainte de a ajusta stocul.
        </p>
      ) : null}

      {/* Adjust form (absolute set, D6) */}
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
            Setează total nou
          </span>
          <input
            type="number"
            min={0}
            step={1}
            value={newTotal}
            onChange={(e) => setNewTotal(e.target.value)}
            disabled={pending}
            style={{
              width: 110,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid rgba(92,58,32,0.28)',
              backgroundColor: 'var(--cream-warm)',
              color: 'var(--ink)',
              fontSize: '0.95rem',
            }}
          />
        </label>
        <label className="flex flex-col gap-1" style={{ flex: 1, minWidth: 180 }}>
          <span className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
            Motiv (opțional)
          </span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={pending}
            maxLength={140}
            placeholder="ex: am mai făcut 5 bucăți"
            className="font-lora"
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid rgba(92,58,32,0.28)',
              backgroundColor: 'var(--cream-warm)',
              color: 'var(--ink)',
              fontSize: '0.9rem',
            }}
          />
        </label>
        <button
          type="button"
          onClick={onSave}
          disabled={pending || !dirty || !valid}
          className="font-caudex transition-all duration-200 hover:opacity-90 disabled:opacity-50"
          style={{
            backgroundColor: 'var(--oak-warm)',
            color: 'var(--cream-warm)',
            borderRadius: 8,
            padding: '11px 24px',
            fontSize: '0.9rem',
            letterSpacing: '0.03em',
          }}
        >
          {pending ? 'Se salvează…' : 'Salvează'}
        </button>
      </div>

      {feedback ? (
        <p
          className="font-lora"
          role="status"
          style={{ marginTop: 12, fontSize: '0.85rem', color: feedback.kind === 'ok' ? 'var(--forest-deep)' : '#9F2D20' }}
        >
          {feedback.msg}
        </p>
      ) : null}
    </div>
  );
}
