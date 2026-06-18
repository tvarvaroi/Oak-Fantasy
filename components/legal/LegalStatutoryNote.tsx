// Small inline-note block for citing a specific statutory article that
// constrains a section's eventual copy (e.g. OUG 34/2014 Art. 16 lit. c
// on /retur for personalised goods). We render only the CITATION + the
// structural consequence — not lawyer-grade prose. Distinct visual
// language (warm ochre tint + small "NOTĂ LEGALĂ" eyebrow) signals this
// is a factual marker, not provisional copy.

interface LegalStatutoryNoteProps {
  eyebrow: string;
  citation: string;
  body: string;
}

export default function LegalStatutoryNote({
  eyebrow,
  citation,
  body,
}: LegalStatutoryNoteProps) {
  return (
    <div
      style={{
        marginTop: 4,
        padding: '14px 16px',
        backgroundColor: 'rgba(184,115,51,0.07)',
        borderLeft: '3px solid var(--copper)',
        borderRadius: '0 4px 4px 0',
      }}
    >
      <p
        className="label-caps"
        style={{ color: 'var(--copper)', fontSize: '0.62rem', margin: 0 }}
      >
        {eyebrow}
      </p>
      <p
        className="font-caudex"
        style={{
          marginTop: 6,
          marginBottom: 6,
          color: 'var(--oak-deep)',
          fontSize: '0.95rem',
          fontWeight: 700,
        }}
      >
        {citation}
      </p>
      <p
        className="font-lora"
        style={{
          margin: 0,
          color: 'var(--ink)',
          fontSize: '0.92rem',
          lineHeight: 1.65,
        }}
      >
        {body}
      </p>
    </div>
  );
}
