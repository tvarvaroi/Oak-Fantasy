import type { Locale } from '@/lib/i18n-routes';

import type { LegalBlock } from './content';
import { renderLegalInline } from './LegalText';

// Block renderer for the legal pages (server component). Body copy is Lora at
// 1rem / 1.75 so long documents stay readable on a 375px screen.

const bodyStyle: React.CSSProperties = {
  margin: 0,
  color: 'var(--ink)',
  fontSize: '1rem',
  lineHeight: 1.75,
};

function Paragraph({ text, locale }: { text: string; locale: Locale }) {
  return (
    <p className="font-lora" style={bodyStyle}>
      {renderLegalInline(text, locale)}
    </p>
  );
}

function List({ ordered, items, locale }: { ordered: boolean; items: string[]; locale: Locale }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className="font-lora flex flex-col gap-2" style={{ ...bodyStyle, paddingLeft: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[1.6rem_minmax(0,1fr)] items-baseline">
          <span
            aria-hidden
            className={ordered ? 'font-caudex' : undefined}
            style={{ color: 'var(--copper)', fontWeight: ordered ? 700 : 400, fontSize: ordered ? '0.9rem' : '1rem' }}
          >
            {ordered ? `${i + 1}.` : '–'}
          </span>
          <span>{renderLegalInline(item, locale)}</span>
        </li>
      ))}
    </Tag>
  );
}

function Callout({ title, text, locale }: { title: string; text: string; locale: Locale }) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderLeft: '3px solid var(--oak-warm)',
        backgroundColor: 'rgba(139,94,60,0.07)',
        borderRadius: '0 6px 6px 0',
      }}
    >
      <p className="font-caudex" style={{ margin: 0, color: 'var(--oak-deep)', fontWeight: 700, fontSize: '1.02rem', lineHeight: 1.4 }}>
        {title}
      </p>
      <p className="font-lora" style={{ ...bodyStyle, marginTop: 4 }}>
        {renderLegalInline(text, locale)}
      </p>
    </div>
  );
}

function RecordCard({
  title,
  rows,
  locale,
}: {
  title: string;
  rows: { label: string; text: string }[];
  locale: Locale;
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--paper-aged)',
        border: '1px solid rgba(139,94,60,0.2)',
        borderRadius: 6,
        padding: 'clamp(16px, 3vw, 22px)',
      }}
    >
      <h3 className="font-caudex" style={{ margin: 0, color: 'var(--oak-deep)', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.35 }}>
        {title}
      </h3>
      <dl className="flex flex-col gap-3" style={{ margin: '12px 0 0' }}>
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-4">
            <dt className="label-caps" style={{ color: 'var(--copper)', fontSize: '0.62rem', paddingTop: 5 }}>
              {row.label}
            </dt>
            <dd className="font-lora" style={{ ...bodyStyle, fontSize: '0.97rem', lineHeight: 1.7 }}>
              {renderLegalInline(row.text, locale)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FormSlip({
  title,
  fields,
  locale,
}: {
  title: string;
  fields: { label: string; blank: boolean }[];
  locale: Locale;
}) {
  return (
    <div
      className="relative"
      data-testid="withdrawal-form"
      style={{
        backgroundColor: 'var(--paper-aged)',
        border: '1px solid rgba(139,94,60,0.28)',
        borderRadius: 4,
        padding: 'clamp(18px, 4vw, 30px)',
        boxShadow: '0 10px 24px rgba(31,24,16,0.08)',
      }}
    >
      <div className="paper-texture absolute inset-0 pointer-events-none rounded-[4px]" aria-hidden />
      <div className="relative">
        <p className="font-caudex" style={{ margin: 0, color: 'var(--oak-deep)', fontWeight: 700, fontSize: '1.15rem', textAlign: 'center' }}>
          {title}
        </p>
        <div className="flex flex-col gap-4" style={{ marginTop: 18 }}>
          {fields.map((field, i) => (
            <div key={i}>
              <p className="font-lora" style={{ ...bodyStyle, fontSize: '0.97rem', lineHeight: 1.65 }}>
                {renderLegalInline(field.label, locale)}
              </p>
              {field.blank ? (
                <div aria-hidden style={{ height: 26, borderBottom: '1px dashed rgba(92,58,32,0.45)' }} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LegalBlocks({ blocks, locale }: { blocks: LegalBlock[]; locale: Locale }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case 'p':
            return <Paragraph key={i} text={block.text} locale={locale} />;
          case 'list':
            return <List key={i} ordered={block.ordered} items={block.items} locale={locale} />;
          case 'callout':
            return <Callout key={i} title={block.title} text={block.text} locale={locale} />;
          case 'record':
            return <RecordCard key={i} title={block.title} rows={block.rows} locale={locale} />;
          case 'form':
            return <FormSlip key={i} title={block.title} fields={block.fields} locale={locale} />;
        }
      })}
    </>
  );
}
