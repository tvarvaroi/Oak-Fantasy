// Section-level placeholder used by every LegalSection while skeleton
// pages wait for lawyer-approved copy. We render the SAME body for every
// section on purpose — we are not generating provisional legal opinion.

import type { Locale } from '@/lib/i18n-routes';

const COPY = {
  ro: 'Conținutul juridic al acestei secțiuni este în pregătire înainte de lansarea publică oficială.',
  en: 'The legal content for this section is being prepared before the official public launch.',
} as const;

export default function LegalPlaceholder({ locale }: { locale: Locale }) {
  return (
    <p
      className="font-lora"
      style={{
        fontStyle: 'italic',
        color: 'var(--ink-soft)',
        opacity: 0.75,
        fontSize: '0.98rem',
        lineHeight: 1.75,
        margin: 0,
      }}
    >
      {COPY[locale]}
    </p>
  );
}
