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
