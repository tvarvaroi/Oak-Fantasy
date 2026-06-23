'use client';

import { useState } from 'react';

// Placeholder for Task 3.1 — visible, honest. Real cart wiring lands in Task
// 3.2; for now a click surfaces an inline "coming soon" note (not a dead/fake
// button).
export default function AddToCartButton({ label, comingSoon }: { label: string; comingSoon: string }) {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setClicked(true)}
        className="font-caudex transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
        style={{
          backgroundColor: 'var(--oak-warm)',
          color: 'var(--cream-warm)',
          borderRadius: 8,
          letterSpacing: '0.04em',
          padding: '15px 32px',
          fontSize: '1rem',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 6px rgba(31,24,16,0.2)',
          width: 'fit-content',
        }}
      >
        {label}
      </button>
      {clicked ? (
        <p className="font-lora" style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }} role="status">
          {comingSoon}
        </p>
      ) : null}
    </div>
  );
}
