import type { MetadataRoute } from 'next';

import { PATHNAMES, localizedPath } from '@/lib/i18n-routes';
import { readActiveProducts } from '@/lib/db/products';
import { PAGE_LAST_MODIFIED, latest, type PageKey } from '@/lib/page-last-modified';
import { EXCLUDED_PRODUCT_SLUGS, PUBLIC_ROUTE_KEYS } from '@/lib/seo/public-routes';
import { SITE_URL } from '@/lib/site-url';

// Bilingual sitemap (SEO audit fix #2). Reuses lib/i18n-routes localizedPath()
// as the single slug source of truth (never a second hardcoded map) and
// readActiveProducts() (status='active' only). Not referenced by robots.ts
// until the Variant A → B flip at domain cutover, but built and valid now.

// Public, indexable, non-transactional content only (lib/seo/public-routes.ts).
// Excluded on purpose: cos/checkout/multumim (transactional, noindex),
// login/register/password (auth), admin/api/auth handlers (not pages).

// <lastmod> is the date the page's CONTENT last changed, never the build time
// (2026-11-21):
//   - static pages: the date recorded in lib/page-last-modified.ts, kept true
//     by tests/e2e/sitemap-lastmod.spec.ts
//   - the catalogue: that date, or the latest product change if newer (it
//     lists every product's name, price and description)
//   - a product page: products.updated_at (set by a DB trigger on every
//     change), or the date the product-page template changed if newer
// Regenerated hourly so a product edited in the admin is reflected without a
// deploy; the admin actions also revalidate it on every save.
export const revalidate = 3600;

// Known-junk slugs (EXCLUDED_PRODUCT_SLUGS) are never surfaced, even if a
// test row is status='active' — the same set IndexNow refuses.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // A failed read must not be cached as "no products": since the sitemap is
  // regenerated at runtime, one Supabase hiccup would publish a list without
  // any product page for an hour. Throwing makes Next keep the previous copy
  // (hourly refresh) or answer with an error that crawlers retry (right after
  // an admin save) — never a truncated list. At build time there is no
  // previous copy and the build must not crash, so the build fails open.
  const read = await readActiveProducts();
  if (read === null && process.env.NEXT_PHASE !== 'phase-production-build') {
    throw new Error('[sitemap] products could not be read — not publishing a list without them');
  }
  const products = (read ?? []).filter((p) => !EXCLUDED_PRODUCT_SLUGS.has(p.slug));
  const latestProductChange = products.reduce<string | null>(
    (max, p) => (p.updated_at && (!max || new Date(p.updated_at) > new Date(max)) ? p.updated_at : max),
    null,
  );

  const homeAlternates = {
    languages: { ro: `${SITE_URL}/ro`, en: `${SITE_URL}/en` },
  };
  entries.push(
    { url: `${SITE_URL}/ro`, lastModified: PAGE_LAST_MODIFIED.home, alternates: homeAlternates },
    { url: `${SITE_URL}/en`, lastModified: PAGE_LAST_MODIFIED.home, alternates: homeAlternates },
  );

  for (const key of PUBLIC_ROUTE_KEYS) {
    const roUrl = `${SITE_URL}${localizedPath(key, 'ro')}`;
    const enUrl = `${SITE_URL}${localizedPath(key, 'en')}`;
    const alternates = { languages: { ro: roUrl, en: enUrl } };
    const recorded = PAGE_LAST_MODIFIED[key as PageKey];
    const lastModified = key === 'tocatoare' ? latest(recorded, latestProductChange) : recorded;
    entries.push(
      { url: roUrl, lastModified, alternates },
      { url: enUrl, lastModified, alternates },
    );
  }

  for (const product of products) {

    const roUrl = `${SITE_URL}/ro/${PATHNAMES.tocatoare.ro}/${product.slug}`;
    const enUrl = `${SITE_URL}/en/${PATHNAMES.tocatoare.en}/${product.slug}`;
    const alternates = { languages: { ro: roUrl, en: enUrl } };
    const lastModified = latest(PAGE_LAST_MODIFIED.productTemplate, product.updated_at);

    entries.push(
      { url: roUrl, lastModified, alternates },
      { url: enUrl, lastModified, alternates },
    );
  }

  return entries;
}
