import { LEGAL_INFO } from '@/lib/legal-info';

interface LegalBannerProps {
  eyebrow: string;
  // Body template with literal `{contactEmail}` placeholder. Substituted
  // here so the content map stays JSON-serializable (see contact gotcha
  // 2026-06-16 on functions in copy maps).
  bodyTemplate: string;
}

export default function LegalBanner({
  eyebrow,
  bodyTemplate,
}: LegalBannerProps) {
  const body = bodyTemplate.replace(
    '{contactEmail}',
    LEGAL_INFO.contactEmail,
  );

  // Render the body as plain text but turn the contact email into a
  // mailto: link without rebuilding the sentence. We split once on the
  // email value because it's the only dynamic token.
  const parts = body.split(LEGAL_INFO.contactEmail);

  return (
    <aside
      role="status"
      style={{
        backgroundColor: 'var(--cream-warm)',
        border: '1px solid var(--copper)',
        borderRadius: 6,
        padding: 'clamp(18px, 3vw, 26px) clamp(20px, 3.5vw, 32px)',
      }}
    >
      <p
        className="label-caps"
        style={{
          color: 'var(--copper)',
          fontSize: '0.66rem',
          margin: 0,
        }}
      >
        {eyebrow}
      </p>
      <p
        className="font-lora"
        style={{
          marginTop: 8,
          marginBottom: 0,
          color: 'var(--ink)',
          fontSize: '0.95rem',
          lineHeight: 1.7,
        }}
      >
        {parts[0]}
        <a
          href={`mailto:${LEGAL_INFO.contactEmail}`}
          style={{ color: 'var(--oak-warm)', textDecoration: 'underline' }}
        >
          {LEGAL_INFO.contactEmail}
        </a>
        {parts[1] ?? ''}
      </p>
    </aside>
  );
}
