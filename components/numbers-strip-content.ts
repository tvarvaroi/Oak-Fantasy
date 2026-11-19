import type { Locale } from '@/lib/i18n-routes';

export interface Stat {
  from: number;
  to: number;
  prefix: string;
  suffix: string;
  label: string;
  caption: string;
  /** Text shown instead of a counter (no count-up), e.g. "Lemn masiv". */
  display?: string;
  /** `to` comes from the live active-product count (NumbersStrip prop);
      the stat is hidden when the count is unavailable. */
  live?: 'productCount';
}

export interface NumbersStripContent {
  ariaLabel: string;
  numberLocale: string;
  stats: Stat[];
}

// Every figure here must be TRUE and checkable (founder rule 2026-11-19):
//   N       → active products in the catalogue, read live from the DB
//             (products.status='active'; `live: 'productCount'`, 2026-11-19)
//   Lemn masiv, lucrat manual → founder fact (Terms §4). Replaced
//           "100% stejar românesc" on 2026-11-19: no absolute origin claims.
//   5–10    → working days to make an order (founder fact; Terms §4/§7)
//   320     → final sanding grit, 80 → 320 (the /atelier process copy)
// Removed 2026-11-19: '1.200+ pe listă' (2 test rows in the DB, false),
// '8h per tocător' (catalogue range is 1–15 h) and '20+ ani' (no source).
// A stat with from === to renders static (no count-up), e.g. the 5–10 range.
export const numbersStripContent: Record<Locale, NumbersStripContent> = {
  ro: {
    ariaLabel: 'Cifre',
    numberLocale: 'ro-RO',
    stats: [
      { from: 0,  to: 0,   prefix: '',   suffix: '',  label: 'modele',            caption: 'În catalogul nostru', live: 'productCount' },
      { from: 0,  to: 0,   prefix: '',   suffix: '',  label: 'lucrat manual',     caption: 'Din stejar românesc', display: 'Lemn masiv' },
      { from: 10, to: 10,  prefix: '5–', suffix: '',  label: 'zile lucrătoare',   caption: 'Cât lucrăm o comandă' },
      { from: 0,  to: 320, prefix: '',   suffix: '',  label: 'granulație finală', caption: 'Șlefuit de la 80 la 320' },
    ],
  },
  en: {
    ariaLabel: 'Numbers',
    numberLocale: 'en-US',
    stats: [
      { from: 0,  to: 0,   prefix: '',   suffix: '',  label: 'models',          caption: 'In our catalogue', live: 'productCount' },
      { from: 0,  to: 0,   prefix: '',   suffix: '',  label: 'handcrafted',     caption: 'From Romanian oak', display: 'Solid wood' },
      { from: 10, to: 10,  prefix: '5–', suffix: '',  label: 'business days',   caption: 'To make an order' },
      { from: 0,  to: 320, prefix: '',   suffix: '',  label: 'final grit',      caption: 'Sanded from 80 to 320' },
    ],
  },
};
