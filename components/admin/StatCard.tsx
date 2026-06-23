// Dashboard stat card (Task 2.7). Server component — pure display.

export default function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--paper-aged)',
        border: '1px solid rgba(92,58,32,0.18)',
        borderRadius: 10,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minHeight: 110,
      }}
    >
      <span className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
        {label}
      </span>
      <span
        className="font-caudex"
        style={{ color: 'var(--oak-deep)', fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', lineHeight: 1 }}
      >
        {value}
      </span>
      {sub ? (
        <span className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.8rem', marginTop: 'auto' }}>
          {sub}
        </span>
      ) : null}
    </div>
  );
}
