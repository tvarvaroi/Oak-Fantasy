import type { ReactNode } from 'react';

// Keep numeric ranges ("5–10", "1–3") on one line — browsers break after an
// en dash, which split "5–" / "10 zile" on narrow screens (design-qa 2026-11-19).
export function noBreakRanges(text: string): ReactNode[] {
  return text.split(/(\d+–\d+)/).map((part, i) =>
    /^\d+–\d+$/.test(part) ? (
      <span key={i} style={{ whiteSpace: 'nowrap' }}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
