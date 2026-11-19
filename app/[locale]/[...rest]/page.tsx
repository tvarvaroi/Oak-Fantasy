import { notFound } from 'next/navigation';

// Catch-all for unknown paths under a locale (2026-11-19). Without it, Next
// renders the root app/not-found.tsx for unmatched URLs — outside the [locale]
// layout, so without brand fonts and without knowing the language. Static
// routes always win over this segment.
export default function UnknownLocalePath() {
  notFound();
}
