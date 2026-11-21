// Product long descriptions are stored as plain text (products.long_description_*),
// written with blank lines between paragraphs and "label + bullet lines" for the
// spec and care sections:
//
//   Îngrijire
//   • Se spală cu mâna, nu în mașina de vase
//   • Nu se lasă scufundat în apă
//
// Rendered as one <p> with `white-space: pre-line`, those sections were just
// text: no heading, no list (GEO audit 2026-11-21). This turns the same text
// into blocks the page renders as real <h3> + <ul>. Nothing is added, removed
// or reworded — only the bullet character is dropped (the list draws its own).
//
// The rules are deliberately narrow, so ordinary prose is never restyled:
//   - a bullet is "• " or "- " at the start of a line (the two markers the
//     catalogue uses); a paragraph that opens with an em dash stays a paragraph
//   - a list needs at least two bullet lines
//   - the line above the bullets becomes the heading only if it reads like a
//     label (short, no sentence punctuation at the end)
// Anything else is rendered as the paragraph it was before.

export type DescriptionBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; heading: string | null; items: string[] };

// "• item" or "- item". The marker must be followed by whitespace, so a
// hyphenated word never counts.
const BULLET = /^[•-]\s+/;

// "Îngrijire", "Dimensiuni și detalii", "Care:" — not a sentence.
const isLabel = (line: string) => line.length <= 60 && !/[.!?;,]$/.test(line);

export function parseProductDescription(text: string | null | undefined): DescriptionBlock[] {
  if (!text) return [];
  const blocks: DescriptionBlock[] = [];

  // \s (not [ \t]): a "blank" line holding only a no-break space still splits.
  for (const raw of text.replace(/\r\n?/g, '\n').split(/\n\s*\n/)) {
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    const isBullet = lines.map((l) => BULLET.test(l));
    const strip = (l: string) => l.replace(BULLET, '');

    if (lines.length >= 2 && isBullet.every(Boolean)) {
      blocks.push({ type: 'list', heading: null, items: lines.map(strip) });
    } else if (lines.length >= 3 && !isBullet[0] && isLabel(lines[0]) && isBullet.slice(1).every(Boolean)) {
      blocks.push({ type: 'list', heading: lines[0], items: lines.slice(1).map(strip) });
    } else {
      // Anything else stays a paragraph, single line breaks kept as written.
      blocks.push({ type: 'paragraph', text: lines.join('\n') });
    }
  }

  return blocks;
}
