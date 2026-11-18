import type { LegalSectionMeta } from './content';

// Table of contents for a legal document. A native <details> (no JS): closed
// by default so on a phone the reader reaches the text in one screen, and
// every entry is an anchor to its numbered section.
export default function LegalToc({ label, sections }: { label: string; sections: LegalSectionMeta[] }) {
  return (
    <details
      className="group"
      data-testid="legal-toc"
      style={{
        backgroundColor: 'var(--paper-aged)',
        border: '1px solid rgba(139,94,60,0.22)',
        borderRadius: 6,
      }}
    >
      <summary
        className="flex items-center justify-between gap-3 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ padding: '14px 18px', minHeight: 48, outlineColor: 'var(--oak-warm)', borderRadius: 6 }}
      >
        <span className="font-caudex" style={{ color: 'var(--oak-deep)', fontWeight: 700, fontSize: '1rem' }}>
          {label}
          <span className="font-lora" style={{ color: 'var(--ink-soft)', fontWeight: 400, fontSize: '0.88rem', marginLeft: 8 }}>
            ({sections.length})
          </span>
        </span>
        <span
          aria-hidden
          className="transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          style={{ color: 'var(--copper)', fontSize: '0.8rem' }}
        >
          ▾
        </span>
      </summary>
      <ol className="flex flex-col" style={{ margin: 0, padding: '0 18px 14px', listStyle: 'none' }}>
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="font-lora grid grid-cols-[2rem_minmax(0,1fr)] items-baseline hover:underline"
              style={{ color: 'var(--ink)', fontSize: '0.95rem', lineHeight: 1.45, padding: '11px 0', minHeight: 44, textUnderlineOffset: 3 }}
            >
              <span className="font-caudex" style={{ color: 'var(--copper)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{s.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
