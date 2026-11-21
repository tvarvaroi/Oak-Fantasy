import type { MetadataRoute } from 'next';

import { LOCALES, PATHNAMES } from '@/lib/i18n-routes';
import { PRIVATE_ROUTES } from '@/lib/seo/public-routes';
import { SITE_URL } from '@/lib/site-url';

// VARIANT B — LAUNCHED (founder's "lansăm", SEO audit fix #2).
//
// Crawlers may index the public site on https://oakfantasy.ro. Blocked:
// admin, API and auth route handlers, plus the transactional and account
// pages in both locales (cart, checkout, thank-you, login, register,
// password reset) — they carry no search value and some are per-customer.
// Every disallowed path is derived from PATHNAMES, so a renamed slug cannot
// silently become crawlable. The list of private routes is shared with the
// sitemap and the IndexNow notifier (lib/seo/public-routes.ts).

export default function robots(): MetadataRoute.Robots {
  const privatePaths = Array.from(
    new Set(PRIVATE_ROUTES.flatMap((key) => LOCALES.map((l) => `/${l}/${PATHNAMES[key][l]}`))),
  );
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/auth/', ...privatePaths],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
