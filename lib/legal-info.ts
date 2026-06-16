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
  // Firma legală (parent SRL — woodworking)
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? '[DENUMIRE_SRL]',
  cui: process.env.NEXT_PUBLIC_COMPANY_CUI ?? '[CUI]',
  regCom: process.env.NEXT_PUBLIC_COMPANY_REG_COM ?? '[REG_COM]',
  capitalSocial: process.env.NEXT_PUBLIC_COMPANY_CAPITAL ?? '[CAPITAL_SOCIAL]',
  reprezentantLegal:
    process.env.NEXT_PUBLIC_COMPANY_LEGAL_REP ?? '[REPREZENTANT_LEGAL]',
  vatStatus: process.env.NEXT_PUBLIC_COMPANY_VAT_STATUS ?? '[TVA_STATUS]',
  caen: process.env.NEXT_PUBLIC_COMPANY_CAEN ?? '[CAEN_PRINCIPAL]',

  // Adrese
  hqAddress: process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? '[ADRESA_SEDIU]',
  workshopAddress:
    process.env.NEXT_PUBLIC_WORKSHOP_ADDRESS ?? '[ADRESA_ATELIER]',

  // Contact
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'info@oakfantasy.ro',
  contactPhone:
    process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '[TELEFON_CONTACT]',

  // Working hours — aligned with Footer (sprint 1 truth source).
  // Saturday is intentionally placeholder until founder decides post-launch.
  workingHours: {
    weekdays: 'Luni–Vineri: 9–17',
    saturday: 'Sâmbătă: [PROGRAM_SAMBATA]',
    sunday: 'Duminică: Închis',
  },
  workingHoursEn: {
    weekdays: 'Monday–Friday: 9–17',
    saturday: 'Saturday: [PROGRAM_SAMBATA]',
    sunday: 'Sunday: Closed',
  },

  // Brand info
  brandName: 'Oak Fantasy',
  brandDomain: 'oakfantasy.ro',

  // External regulatory links (no placeholder needed — public URLs).
  anpcUrl: 'https://anpc.ro',
  odrEuUrl: 'https://ec.europa.eu/consumers/odr',
} as const;

// True before launch — used to render a discreet placeholder banner in
// surfaces that show legal data (ContactInfo sidebar, footer, future legal
// pages). Pre-launch this flips to false once env vars are populated.
export const isPlaceholderMode = LEGAL_INFO.companyName === '[DENUMIRE_SRL]';
