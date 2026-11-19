import type { ReactNode } from 'react';

// Keep numeric ranges ("5–10", "1–3") on one line — browsers break after an
// en dash, which split "5–" / "10 zile" on narrow screens (design-qa 2026-11-19).
// The range stays glued to the word after it too ("1–3 zile", "5–10 business"),
// so a line never ends on a bare range (design-qa 2026-11-20).
const RANGE = /(\d+–\d+(?:\s+[\p{L}]+)?)/u;

export function noBreakRanges(text: string): ReactNode[] {
  return text.split(RANGE).map((part, i) =>
    /^\d+–\d+/.test(part) ? (
      <span key={i} style={{ whiteSpace: 'nowrap' }}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
