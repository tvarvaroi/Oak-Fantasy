// Privacy filter for Vercel Web Analytics (2026-11-20). Pure function, used by
// components/analytics/WebAnalytics.tsx as `beforeSend` and unit-tested in
// tests/e2e/analytics-redact.spec.ts.
//
// Contract:
//   - /admin and /auth (any depth)        → null (nothing is sent)
//   - query string and hash               → always removed (search terms,
//                                            tokens, emails, ?interested_product…)
//   - /{locale}/{known page}              → kept
//   - /{locale}/{known page}/{slug}       → kept only when the second segment
//                                            reads like a public slug
//                                            (product pages); otherwise "[id]"
//   - /{locale}/multumim|thank-you/{uuid} → /{locale}/multumim (order id dropped)
//   - anything else (404 junk, typos that may contain an email, deeper paths)
//                                          → /{locale}/[other] or /[other]
//
// It is an allow-list on purpose: a new kind of URL is reported as "[other]"
// until its first segment is registered in PATHNAMES, never leaked verbatim.

import { LOCALES, PATHNAMES } from '@/lib/i18n-routes';

const BLOCKED_PREFIXES = ['admin', 'auth', 'api'];

// First path segments of every public page, RO + EN.
const KNOWN_SEGMENTS: ReadonlySet<string> = new Set(
  Object.values(PATHNAMES)
    .flatMap((names) => [names.ro, names.en])
    .filter((segment) => !segment.includes('/')),
);

// Pages whose sub-path is always an identifier (order confirmation).
const ID_ONLY_PARENTS: ReadonlySet<string> = new Set([
  PATHNAMES.multumim.ro,
  PATHNAMES.multumim.en,
]);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORDER_NUMBER = /^of-\d{4}-\d+$/i;
const DIGITS_ONLY = /^\d+$/;
const LONG_HEX = /^[0-9a-f]{16,}$/i;
const MAX_SLUG_LENGTH = 80;

function isPublicSlug(segment: string): boolean {
  return (
    segment.length <= MAX_SLUG_LENGTH &&
    SLUG.test(segment) &&
    !UUID.test(segment) &&
    !ORDER_NUMBER.test(segment) &&
    !DIGITS_ONLY.test(segment) &&
    !LONG_HEX.test(segment)
  );
}

/** Returns the URL that may be reported, or null when nothing may be sent. */
export function redactAnalyticsUrl(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const segments = url.pathname.split('/').filter(Boolean);
  const first = (segments[0] ?? '').toLowerCase();
  if (BLOCKED_PREFIXES.includes(first)) return null;

  let path: string;
  if (!(LOCALES as readonly string[]).includes(first)) {
    path = segments.length === 0 ? '/' : '/[other]';
  } else if (segments.length === 1) {
    path = `/${first}`;
  } else {
    const page = segments[1];
    if (!KNOWN_SEGMENTS.has(page)) {
      path = `/${first}/[other]`;
    } else if (segments.length === 2 || ID_ONLY_PARENTS.has(page)) {
      path = `/${first}/${page}`;
    } else if (segments.length === 3 && isPublicSlug(segments[2])) {
      path = `/${first}/${page}/${segments[2]}`;
    } else {
      path = `/${first}/${page}/[id]`;
    }
  }

  return `${url.origin}${path}`;
}
