import { LEGAL_INFO, isPlaceholderMode } from '@/lib/legal-info';

interface LegalCompanyInfoProps {
  sectionLabel: string;
  labels: {
    operator: string;
    cui: string;
    regCom: string;
    sediu: string;
    contact: string;
  };
  placeholderBanner: string;
}

function Row({ label, value }: { label: string; value: string }) {
  const isPlaceholder = value.startsWith('[');
  return (
    <div className="grid grid-cols-[minmax(120px,180px)_1fr] gap-3 items-baseline">
      <span
        className="label-caps"
        style={{ color: 'var(--ink-soft)', fontSize: '0.62rem' }}
      >
        {label}
      </span>
      <span
        className="font-lora"
        style={{
          color: isPlaceholder ? 'var(--ink-soft)' : 'var(--ink)',
          fontStyle: isPlaceholder ? 'italic' : 'normal',
          fontSize: '0.95rem',
          lineHeight: 1.55,
          opacity: isPlaceholder ? 0.85 : 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function LegalCompanyInfo({
  sectionLabel,
  labels,
  placeholderBanner,
}: LegalCompanyInfoProps) {
  return (
    <aside
      className="relative"
      style={{
        backgroundColor: 'var(--paper-aged)',
        border: '1px solid rgba(139,94,60,0.22)',
        borderRadius: 6,
        padding: 'clamp(24px, 4vw, 32px) clamp(20px, 3.5vw, 32px)',
      }}
      aria-label={sectionLabel}
    >
      <div className="paper-texture absolute inset-0 pointer-events-none rounded-[6px]" aria-hidden />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p
            className="label-caps"
            style={{ color: 'var(--copper)', fontSize: '0.62rem' }}
          >
            {sectionLabel}
          </p>
          <div
            style={{
              width: 36,
              height: 1,
              backgroundColor: 'var(--copper)',
              opacity: 0.45,
            }}
            aria-hidden
          />
        </div>

        <div className="flex flex-col gap-3">
          <Row label={labels.operator} value={LEGAL_INFO.companyName} />
          <Row label={labels.cui} value={LEGAL_INFO.cui} />
          <Row label={labels.regCom} value={LEGAL_INFO.regCom} />
          <Row label={labels.sediu} value={LEGAL_INFO.hqAddress} />
          <Row label={labels.contact} value={LEGAL_INFO.contactEmail} />
        </div>

        {isPlaceholderMode && (
          <p
            className="font-lora"
            style={{
              marginTop: 4,
              padding: '10px 12px',
              fontSize: '0.78rem',
              lineHeight: 1.55,
              color: 'var(--ink-soft)',
              backgroundColor: 'rgba(184,115,51,0.08)',
              border: '1px dashed rgba(139,94,60,0.4)',
              borderRadius: 4,
            }}
          >
            {placeholderBanner}
          </p>
        )}
      </div>
    </aside>
  );
}
