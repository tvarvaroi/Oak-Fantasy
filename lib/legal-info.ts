// Single source of truth for legal entity + contact data displayed across
// the site. All `[PLACEHOLDER]` defaults exist so the build never breaks on
// missing env vars; they get swapped for real values pre-launch via Vercel
// Environment Variables (per _brain/notes/SECURITY_CHECKLIST.md §4.2).
//
// Convention: any value that may become a public legal disclosure
// (CUI, regCom, sediu, capital social) lives here so that one PR pre-launch
// flips the entire surface area at once. Templates, sidebars and footers
// MUST read from LEGAL_INFO, never hard-code strings.

export const LEGAL_INFO = {
  // Firma legală (final data 2026-07-11 — values live in Vercel env, see
  // .env.example for the canonical set; placeholders remain the fallback so
  // a missing env never renders wrong data, it renders nothing).
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? '[DENUMIRE_SRL]',
  cui: process.env.NEXT_PUBLIC_COMPANY_CUI ?? '[CUI]',
  regCom: process.env.NEXT_PUBLIC_COMPANY_REG_COM ?? '[REG_COM]',
  capitalSocial: process.env.NEXT_PUBLIC_COMPANY_CAPITAL ?? '[CAPITAL_SOCIAL]',
  vatStatus: process.env.NEXT_PUBLIC_COMPANY_VAT_STATUS ?? '[TVA_STATUS]',
  caen: process.env.NEXT_PUBLIC_COMPANY_CAEN ?? '[CAEN_PRINCIPAL]',

  // Adrese. Sediul social e informație de registru public (afișată în legal).
  // ⚠ Adresa ATELIERULUI e OMISĂ PERMANENT din public (decizie founder
  // 2026-07-11) — nu e env-driven ca să nu poată apărea din greșeală;
  // hasPlaceholder() o ascunde structural peste tot. Narativ: „vestul României".
  hqAddress: process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? '[ADRESA_SEDIU]',
  workshopAddress: '[NEAFISAT_PUBLIC]',

  // Contact. Emailul public e date publice — default real, env poate suprascrie.
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'oakfantasy2026@gmail.com',
  contactPhone:
    process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '[TELEFON_CONTACT]',

  // Working hours — final (founder 2026-07-11): Mon–Fri 09:00–17:00.
  workingHours: {
    weekdays: 'Luni–Vineri: 09:00–17:00',
    saturday: 'Sâmbătă: Închis',
    sunday: 'Duminică: Închis',
  },
  workingHoursEn: {
    weekdays: 'Monday–Friday: 09:00–17:00',
    saturday: 'Saturday: Closed',
    sunday: 'Sunday: Closed',
  },

  // Brand info
  brandName: 'Oak Fantasy',
  brandDomain: 'oakfantasy.ro',

  // Social — real, live profiles (2026-07-11). Public constants, no env.
  // Displayed handle: @oakfantasy (Instagram), @oak_fantasy (TikTok).
  social: {
    instagram: 'https://www.instagram.com/oakfantasy',
    facebook: 'https://www.facebook.com/share/1Cqy62SdUd/',
    tiktok: 'https://www.tiktok.com/@oak_fantasy',
  },

  // External regulatory links (no placeholder needed — public URLs).
  anpcUrl: 'https://anpc.ro',
  odrEuUrl: 'https://ec.europa.eu/consumers/odr',
} as const;

// True before launch — used to render a discreet placeholder banner in
// surfaces that show legal data (ContactInfo sidebar, footer, future legal
// pages). Pre-launch this flips to false once env vars are populated.
export const isPlaceholderMode = LEGAL_INFO.companyName === '[DENUMIRE_SRL]';

// Per-field placeholder detection (design-qa Batch A, 2026-07-05). Rows whose
// value still holds a `[TOKEN]` default must NOT render publicly — the row
// appears automatically once the real value lands in env, zero code changes.
// `includes` (not startsWith) because composite strings embed the token
// mid-string (e.g. 'Sâmbătă: [PROGRAM_SAMBATA]').
export function hasPlaceholder(value: string): boolean {
  return value.includes('[');
}
