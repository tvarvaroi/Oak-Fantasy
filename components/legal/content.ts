// Shared types for the legal pages (/termeni, /confidentialitate, /retur).
// Each route exports a `Record<Locale, LegalContent>` built around them.
//
// Everything stays JSON-serializable — no functions cross the server ->
// client boundary (gotcha 2026-06-16). Dynamic values are TOKENS resolved at
// render time by LegalText (components/legal/LegalText.tsx):
//
//   {companyName} {cui} {regCom} {hqAddress} {capital}   → LEGAL_INFO
//   {email} {phone}                                       → LEGAL_INFO, as links
//   {hours}                                               → LEGAL_INFO working hours
//   {shippingFee} {freeShippingFrom}                      → lib/config/shipping
//   [label](route:returns)                                → internal link (RouteKey)
//   [label](https://…)                                    → external link
//   **bold**
//
// Merchant data is NEVER typed into the copy — it always comes from LEGAL_INFO.

export type LegalBlock =
  // Plain paragraph.
  | { kind: 'p'; text: string }
  // Bulleted or numbered list.
  | { kind: 'list'; ordered: boolean; items: string[] }
  // A key rule, set apart (oak rule on the left).
  | { kind: 'callout'; title: string; text: string }
  // One data-processing record (privacy): label → text rows.
  | { kind: 'record'; title: string; rows: { label: string; text: string }[] }
  // Fill-in form (the withdrawal form annex): `blank` adds a writing line.
  | { kind: 'form'; title: string; fields: { label: string; blank: boolean }[] };

export interface LegalSectionMeta {
  // Stable anchor id (kebab-case). Doubles as deep-link target.
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalContent {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    lastUpdated: string;
    lastUpdatedLabel: string;
  };
  // Short plain-language lead under the hero.
  intro: string;
  tocLabel: string;
  sections: LegalSectionMeta[];
  companyInfo: {
    sectionLabel: string;
    labels: {
      operator: string;
      cui: string;
      regCom: string;
      sediu: string;
      contact: string;
    };
    placeholderBanner: string;
  };
}

// Date the current texts took effect — one value for all three documents.
export const LEGAL_LAST_UPDATED = {
  ro: '20 noiembrie 2026',
  en: '20 November 2026',
} as const;
