import type { Locale } from '@/lib/i18n-routes';

import LegalPlaceholder from './LegalPlaceholder';

interface LegalSectionProps {
  id: string;
  index: number;
  title: string;
  locale: Locale;
  children?: React.ReactNode;
}

// One section in a legal skeleton. Numbered heading + optional custom
// content (used by /retur to embed a statutory citation note) or the
// shared LegalPlaceholder body otherwise.
//
// Anchor `id` lets future lawyer-supplied copy deep-link sections from
// the contact form (e.g. "I have a question about section 7"). Cost is
// near-zero; benefit is real once content lands.
export default function LegalSection({
  id,
  index,
  title,
  locale,
  children,
}: LegalSectionProps) {
  const num = String(index).padStart(2, '0');

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      style={{ scrollMarginTop: 96 }}
    >
      <header className="flex items-baseline gap-3 mb-3">
        <span
          className="font-caudex"
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
            fontSize: 'clamp(1.2rem, 2.4vw, 1.55rem)',
            lineHeight: 1.3,
            fontWeight: 700,
          }}
        >
          {title}
        </h2>
      </header>

      <div className="flex flex-col gap-3">
        {children ?? <LegalPlaceholder locale={locale} />}
      </div>
    </section>
  );
}
