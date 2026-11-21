import type { RouteKey } from '../i18n-routes';

// Which routes are public content and which are private — ONE list each,
// shared by the sitemap (app/sitemap.ts), robots.txt (app/robots.ts) and the
// IndexNow notifier (lib/indexnow.ts), so a URL can never be listed in one
// place and blocked in another.
// (Relative imports on purpose: tests/e2e specs import this module directly.)

// Public, indexable, non-transactional pages. Product pages are added from the
// database (status = 'active').
export const PUBLIC_ROUTE_KEYS: RouteKey[] = [
  'despre',
  'atelier',
  'contact',
  'tocatoare',
  'laComanda',
  'terms',
  'privacy',
  'returns',
];

// Known-junk product slugs that must never be surfaced even if the row is
// status='active' (a live "test" SKU was found in the 2026-07-02 audit; the
// founder deactivates it in the admin — this guard survives regressions).
// Kept out of the sitemap AND out of IndexNow, so the two never disagree.
export const EXCLUDED_PRODUCT_SLUGS: ReadonlySet<string> = new Set(['test']);

// Transactional and account pages: no search value, some are per-customer.
// Disallowed in robots.txt, absent from the sitemap, never sent to IndexNow.
export const PRIVATE_ROUTES: RouteKey[] = [
  'cos',
  'checkout',
  'multumim',
  'login',
  'register',
  'forgotPassword',
  'resetPassword',
];
