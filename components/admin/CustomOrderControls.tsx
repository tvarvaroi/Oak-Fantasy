'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

import {
  CUSTOM_ORDER_LIMITS,
  CUSTOM_ORDER_STATUSES,
  CUSTOM_ORDER_STATUS_LABELS,
} from '@/lib/schemas/custom-order';
import { deleteCustomOrder, updateCustomOrder } from '@/lib/admin/custom-order-actions';

// Client island on /admin/comenzi-custom/[id] (2026-11-18): status + internal
// notes (one "Salvează") and a hard delete behind a confirmation dialog. The
// dialog is composed from the Radix primitives directly because the shadcn
// wrapper's overlay is bg-black/80 (pure black is off-brand).

const errorRed = '#9F2D20';

export default function CustomOrderControls({
  id,
  currentStatus,
  currentNotes,
  customerName,
}: {
  id: string;
  currentStatus: string;
  currentNotes: string;
  customerName: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const dirty = status !== currentStatus || notes !== currentNotes;

  const save = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateCustomOrder({ id, status, internalNotes: notes });
      if (res.ok) {
        // The action stores trimmed notes; mirror that so the form isn't "dirty".
        setNotes(notes.trim());
        setFeedback({ kind: 'ok', msg: 'Salvat.' });
        router.refresh();
      } else {
        setFeedback({ kind: 'err', msg: res.error });
      }
    });
  };

  const remove = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await deleteCustomOrder(id);
      if (res.ok) {
        setConfirmOpen(false);
        router.push('/admin/comenzi-custom');
        router.refresh();
      } else {
        setConfirmOpen(false);
        setFeedback({ kind: 'err', msg: res.error });
      }
    });
  };

  const fieldStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid rgba(92,58,32,0.28)',
    backgroundColor: 'var(--cream-warm)',
    color: 'var(--ink)',
    fontSize: '0.92rem',
  };

  const btnPrimary: React.CSSProperties = {
    backgroundColor: 'var(--oak-warm)',
    color: 'var(--cream-warm)',
    borderRadius: 8,
    padding: '10px 22px',
    fontSize: '0.9rem',
    letterSpacing: '0.03em',
    minHeight: 44,
  };

  const btnDanger: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: errorRed,
    border: `1px solid ${errorRed}66`,
    borderRadius: 8,
    padding: '10px 18px',
    fontSize: '0.9rem',
    letterSpacing: '0.03em',
    minHeight: 44,
  };

  return (
    <div>
      <label htmlFor="custom-order-status" className="label-caps block" style={{ color: 'var(--ink-soft)', fontSize: '0.58rem', marginBottom: 8 }}>
        Status
      </label>
      <select
        id="custom-order-status"
        className="font-lora"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={pending}
        style={{ ...fieldStyle, minWidth: 220, minHeight: 44 }}
      >
        {CUSTOM_ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {CUSTOM_ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <label htmlFor="custom-order-notes" className="label-caps block" style={{ color: 'var(--ink-soft)', fontSize: '0.58rem', margin: '20px 0 8px' }}>
        Note interne
      </label>
      <textarea
        id="custom-order-notes"
        className="font-lora w-full"
        rows={6}
        maxLength={CUSTOM_ORDER_LIMITS.notesMax}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={pending}
        placeholder="Ce ați stabilit, preț, termen, detalii de livrare…"
        style={{ ...fieldStyle, lineHeight: 1.6, resize: 'vertical' }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="font-caudex transition-all duration-200 hover:opacity-90 disabled:opacity-50"
          style={btnPrimary}
        >
          {pending ? 'Se salvează…' : 'Salvează'}
        </button>

        <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialog.Trigger asChild>
            <button
              type="button"
              disabled={pending}
              className="font-caudex transition-all duration-200 hover:opacity-80 disabled:opacity-50"
              style={btnDanger}
            >
              Șterge cererea
            </button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay
              style={{ position: 'fixed', inset: 0, zIndex: 70, backgroundColor: 'rgba(31,24,16,0.55)' }}
            />
            <AlertDialog.Content
              style={{
                position: 'fixed',
                zIndex: 71,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(440px, calc(100vw - 32px))',
                backgroundColor: 'var(--paper-aged)',
                border: '1px solid rgba(92,58,32,0.22)',
                borderRadius: 10,
                padding: '24px 24px 20px',
                boxShadow: '0 18px 48px rgba(31,24,16,0.28)',
              }}
            >
              <AlertDialog.Title className="font-caudex" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--oak-deep)' }}>
                Ștergi cererea lui {customerName}?
              </AlertDialog.Title>
              <AlertDialog.Description className="font-lora" style={{ marginTop: 8, fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--ink-soft)' }}>
                Cererea și notele ei dispar definitiv din baza de date. Dacă doar nu se mai face,
                folosește statusul „Anulată”.
              </AlertDialog.Description>
              <div className="flex flex-wrap justify-end gap-3" style={{ marginTop: 22 }}>
                <AlertDialog.Cancel asChild>
                  <button
                    type="button"
                    className="font-caudex transition-opacity hover:opacity-80"
                    style={{ ...btnPrimary, backgroundColor: 'transparent', color: 'var(--oak-deep)', border: '1px solid rgba(92,58,32,0.35)' }}
                  >
                    Renunță
                  </button>
                </AlertDialog.Cancel>
                <button
                  type="button"
                  onClick={remove}
                  disabled={pending}
                  className="font-caudex transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ ...btnPrimary, backgroundColor: errorRed }}
                >
                  {pending ? 'Se șterge…' : 'Șterge definitiv'}
                </button>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>

      {feedback ? (
        <p
          className="font-lora"
          role="status"
          style={{ marginTop: 12, fontSize: '0.85rem', color: feedback.kind === 'ok' ? 'var(--forest-deep)' : errorRed }}
        >
          {feedback.msg}
        </p>
      ) : null}
    </div>
  );
}
