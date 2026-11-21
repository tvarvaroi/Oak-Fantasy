// Date each public page's CONTENT last changed — the sitemap's <lastmod>
// (GEO audit 2026-11-21, A10). Until now every static URL carried the build
// time, so each deploy told search engines that all pages had just changed;
// Google only trusts lastmod when it is consistently accurate.
//
// How it stays true: PAGE_CONTENT_SOURCES lists, per page, the files whose
// change IS a content change. tests/e2e/sitemap-lastmod.spec.ts reads git and
// fails when one of those files was committed (or is modified) after the date
// recorded here. So: you edit a page → the test tells you to bump its date.
// Shared chrome (Navbar, Footer, the layout) is not a page's content.
//
// Dates are YYYY-MM-DD (the day of the commit). No imports: specs load this file.

export type PageKey =
  | 'home'
  | 'despre'
  | 'atelier'
  | 'contact'
  | 'tocatoare'
  | 'laComanda'
  | 'terms'
  | 'privacy'
  | 'returns'
  /** Everything on a product page that does not come from the product row. */
  | 'productTemplate';

export const PAGE_LAST_MODIFIED: Record<PageKey, string> = {
  home: '2026-11-21',
  despre: '2026-11-20',
  atelier: '2026-11-19',
  contact: '2026-11-20',
  tocatoare: '2026-11-21',
  laComanda: '2026-11-21',
  terms: '2026-11-20',
  privacy: '2026-11-20',
  returns: '2026-11-20',
  productTemplate: '2026-11-21',
};

export const PAGE_CONTENT_SOURCES: Record<PageKey, string[]> = {
  home: [
    'app/[locale]/page.tsx',
    'components/HomeClient.tsx',
    'components/Hero.tsx',
    'components/StoryStrip.tsx',
    'components/WorkshopSection.tsx',
    'components/ProductTease.tsx',
    'components/NumbersStrip.tsx',
    'components/numbers-strip-content.ts',
    'components/CustomOrderTease.tsx',
    'components/CraftVideoTease.tsx',
    'components/WaitlistSection.tsx',
  ],
  despre: ['app/[locale]/despre', 'components/about'],
  atelier: ['app/[locale]/atelier', 'components/atelier'],
  contact: ['app/[locale]/contact', 'components/contact'],
  // The catalogue also repeats every product's schema node (lib/product-jsonld.ts).
  tocatoare: ['app/[locale]/tocatoare/page.tsx', 'components/tocatoare', 'lib/product-jsonld.ts'],
  laComanda: ['app/[locale]/la-comanda', 'components/la-comanda'],
  terms: ['app/[locale]/termeni', 'components/legal/terms'],
  privacy: ['app/[locale]/confidentialitate', 'components/legal/privacy'],
  returns: ['app/[locale]/retur', 'components/legal/returns'],
  productTemplate: [
    'app/[locale]/tocatoare/[slug]',
    'components/product',
    'lib/product-description.ts',
    'lib/product-jsonld.ts',
    'lib/config/shipping.ts',
    'lib/config/returns.ts',
  ],
};

/** The later of two moments; a date-only string is kept as written. */
export function latest(a: string | Date, b: string | Date | null | undefined): string | Date {
  if (!b) return a;
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}
