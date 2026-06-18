// Shared types for legal page content maps. Each route (/termeni,
// /confidentialitate, /retur) imports these and exports a
// `Record<Locale, LegalContent>` built around them.
//
// All fields are JSON-serializable strings — no functions cross the
// server -> client component boundary (see gotcha 2026-06-16). Dynamic
// substitution (e.g. {contactEmail}) is done at render time inside
// LegalBanner.

export interface LegalSectionMeta {
  // Stable anchor id (kebab-case). Doubles as deep-link target.
  id: string;
  title: string;
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
  banner: {
    eyebrow: string;
    bodyTemplate: string;
  };
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
