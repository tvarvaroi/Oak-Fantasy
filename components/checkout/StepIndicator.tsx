import { Check } from 'lucide-react';

// 3-step progress indicator for checkout.
export default function StepIndicator({ current, labels }: { current: 1 | 2 | 3; labels: string[] }) {
  return (
    <ol className="flex items-center" style={{ marginBottom: 36 }}>
      {labels.map((label, i) => {
        const step = (i + 1) as 1 | 2 | 3;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex items-center" style={{ flex: i < labels.length - 1 ? 1 : '0 0 auto' }}>
            <div className="flex items-center gap-2.5">
              <span
                className="flex items-center justify-center font-caudex"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: done || active ? 'var(--oak-warm)' : 'transparent',
                  color: done || active ? 'var(--cream-warm)' : 'var(--ink-soft)',
                  border: done || active ? 'none' : '1px solid rgba(92,58,32,0.35)',
                }}
              >
                {done ? <Check size={15} strokeWidth={2.5} /> : step}
              </span>
              <span
                className="font-caudex hidden sm:inline"
                style={{ fontSize: '0.85rem', color: active ? 'var(--oak-deep)' : 'var(--ink-soft)', fontWeight: active ? 700 : 400 }}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 ? (
              <span style={{ flex: 1, height: 1, margin: '0 12px', backgroundColor: done ? 'var(--oak-warm)' : 'rgba(92,58,32,0.2)' }} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
