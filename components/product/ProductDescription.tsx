import { parseProductDescription } from '@/lib/product-description';
import { keepUnits } from '@/lib/typography';

// Long description of a product: paragraphs, plus the "label + bullets"
// sections (Dimensiuni și detalii, Îngrijire) as real headings and lists.
// Same text as stored — see lib/product-description.ts.

const TEXT_STYLE = {
  fontSize: '1.02rem',
  color: 'var(--ink-soft)',
  lineHeight: 1.8,
} as const;

// One blank line of body text between blocks, as the pre-line paragraph had.
const BLOCK_GAP = '1.8em';

export default function ProductDescription({ text }: { text: string }) {
  const blocks = parseProductDescription(text);

  return (
    <div className="font-lora" style={TEXT_STYLE}>
      {blocks.map((block, i) => {
        const marginTop = i === 0 ? 0 : BLOCK_GAP;

        if (block.type === 'paragraph') {
          return (
            <p key={i} style={{ marginTop, whiteSpace: 'pre-line' }}>
              {keepUnits(block.text)}
            </p>
          );
        }

        return (
          <div key={i} style={{ marginTop }}>
            {block.heading ? (
              <h3
                className="font-caudex"
                style={{ fontSize: '1.12rem', color: 'var(--oak-deep)', fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}
              >
                {keepUnits(block.heading)}
              </h3>
            ) : null}
            <ul className="list-disc marker:text-[color:var(--oak-warm)]" style={{ paddingLeft: '1.25em' }}>
              {block.items.map((item, j) => (
                <li key={j} style={{ paddingLeft: 4 }}>
                  {keepUnits(item)}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
