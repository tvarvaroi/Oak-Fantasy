interface LegalSectionProps {
  id: string;
  index: number;
  title: string;
  children: React.ReactNode;
}

// One numbered section of a legal document. The anchor `id` is the target
// of the table of contents and of deep links from other pages (e.g. the
// returns notice at checkout → /retur#exceptions).
export default function LegalSection({ id, index, title, children }: LegalSectionProps) {
  const num = String(index).padStart(2, '0');

  return (
    <section id={id} aria-labelledby={`${id}-heading`} style={{ scrollMarginTop: 96 }}>
      <header className="flex items-baseline gap-3 mb-4">
        <span
          className="font-caudex"
          aria-hidden
          style={{
            color: 'var(--copper)',
            fontSize: '0.85rem',
            letterSpacing: '0.18em',
            fontWeight: 700,
          }}
        >
          {num}
        </span>
        <h2
          id={`${id}-heading`}
          className="font-caudex"
          style={{
            margin: 0,
            color: 'var(--oak-deep)',
            fontSize: 'clamp(1.25rem, 2.4vw, 1.55rem)',
            lineHeight: 1.3,
            fontWeight: 700,
          }}
        >
          {title}
        </h2>
      </header>

      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
