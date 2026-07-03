import type { MetadataRoute } from 'next';

import { PATHNAMES, localizedPath, type RouteKey } from '@/lib/i18n-routes';
import { fetchActiveProducts } from '@/lib/db/products';

// Bilingual sitemap (SEO audit fix #2). Reuses lib/i18n-routes localizedPath()
// as the single slug source of truth (never a second hardcoded map) and
// fetchActiveProducts() (status='active' only, fails open to [] on a Supabase
// hiccup so the build never crashes). Not referenced by robots.ts until the
// Variant A → B flip at domain cutover, but built and valid now.

const SITE_URL = 'https://oakfantasy.ro';

// Public, indexable, non-transactional content only. Excluded on purpose:
// cos/checkout/multumim (transactional, noindex), login/register/password
// (auth), admin/api/auth handlers (not pages).
const PUBLIC_ROUTE_KEYS: RouteKey[] = [
  'despre',
  'atelier',
  'contact',
  'tocatoare',
  'terms',
  'privacy',
  'returns',
];

// Belt-and-suspenders: never surface known-junk slugs even if a test row
// leaks through status='active' (a live "test" SKU was found in the 2026-07-02
// audit; founder deactivates it in admin — this guard survives regressions).
const EXCLUDED_PRODUCT_SLUGS = new Set(['test']);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const homeAlternates = {
    languages: { ro: `${SITE_URL}/ro`, en: `${SITE_URL}/en` },
  };
  entries.push(
    { url: `${SITE_URL}/ro`, lastModified: now, alternates: homeAlternates },
    { url: `${SITE_URL}/en`, lastModified: now, alternates: homeAlternates },
  );

  for (const key of PUBLIC_ROUTE_KEYS) {
    const roUrl = `${SITE_URL}${localizedPath(key, 'ro')}`;
    const enUrl = `${SITE_URL}${localizedPath(key, 'en')}`;
    const alternates = { languages: { ro: roUrl, en: enUrl } };
    entries.push(
      { url: roUrl, lastModified: now, alternates },
      { url: enUrl, lastModified: now, alternates },
    );
  }

  const products = await fetchActiveProducts();
  for (const product of products) {
    if (EXCLUDED_PRODUCT_SLUGS.has(product.slug)) continue;

    const roUrl = `${SITE_URL}/ro/${PATHNAMES.tocatoare.ro}/${product.slug}`;
    const enUrl = `${SITE_URL}/en/${PATHNAMES.tocatoare.en}/${product.slug}`;
    const alternates = { languages: { ro: roUrl, en: enUrl } };
    const lastModified = product.updated_at ? new Date(product.updated_at) : now;

    entries.push(
      { url: roUrl, lastModified, alternates },
      { url: enUrl, lastModified, alternates },
    );
  }

  return entries;
}
