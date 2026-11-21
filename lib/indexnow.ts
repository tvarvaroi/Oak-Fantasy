import { LOCALES, PATHNAMES, localizedPath } from './i18n-routes';
import { SITE_URL } from './site-url';
import { EXCLUDED_PRODUCT_SLUGS, PUBLIC_ROUTE_KEYS } from './seo/public-routes';

// IndexNow (https://www.indexnow.org/documentation, read 2026-11-21 — notes in
// _brain/resources/indexnow.md): tell the participating search engines (Bing
// and the others it shares with) that a URL was added, updated or deleted,
// instead of waiting for the next crawl.
//
// Rules of this project (founder, 2026-11-21):
//   - sent ONLY from the server, when a product is published, changed or taken
//     off sale in the admin (lib/admin/product-actions.ts), plus one manual
//     run over the sitemap (scripts/indexnow-submit-sitemap.mjs)
//   - a failure here must never block saving the product: submitToIndexNow
//     never throws, it logs
//   - private URLs are never sent: only the homepage, the public pages and
//     product pages pass isSubmittable (an allowlist, not a blocklist)
//   - production only: local, preview and test runs send nothing
//
// The key proves we own the host: search engines fetch
// https://oakfantasy.ro/<key>.txt (public/<key>.txt) and expect the key inside.
// It is public by design; tests/e2e/indexnow.spec.ts fails if the file and
// this constant ever differ.
// (Relative imports on purpose: the spec imports this module directly.)

export const INDEXNOW_KEY = 'e4e765ef2cfe8620de2435b03d0dc955';
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
/** The protocol accepts up to 10,000 URLs per POST. */
export const INDEXNOW_MAX_URLS = 10000;

const ORIGIN = new URL(SITE_URL).origin;

function publicPagePaths(): Set<string> {
  const paths = new Set<string>();
  for (const locale of LOCALES) {
    paths.add(`/${locale}`);
    for (const key of PUBLIC_ROUTE_KEYS) paths.add(localizedPath(key, locale));
  }
  return paths;
}

/** A URL we may send: our origin, no query or fragment, a public page or a product page. */
export function isSubmittable(url: string): boolean {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.origin !== ORIGIN || u.search || u.hash) return false;
  const path = u.pathname.replace(/\/$/, '');
  if (publicPagePaths().has(path)) return true;
  // Product page: /<locale>/<catalogue slug>/<product slug>, nothing deeper,
  // and never a slug the sitemap leaves out on purpose.
  return LOCALES.some((locale) => {
    const prefix = `${localizedPath('tocatoare', locale)}/`;
    if (!path.startsWith(prefix)) return false;
    const slug = path.slice(prefix.length);
    return /^[a-z0-9-]+$/.test(slug) && !EXCLUDED_PRODUCT_SLUGS.has(slug);
  });
}

export interface ProductState {
  slug: string;
  /** status === 'active', i.e. the product page exists for visitors. */
  active: boolean;
}

/**
 * URLs whose content changed when a product went from `before` to `after`
 * (null = the product did not exist / the previous state could not be read).
 *   - nothing public changed (a draft was edited) → no URL
 *   - the product page, RO + EN: the new one, and the old one when it stopped
 *     existing (taken off sale, or its slug changed) — a deleted URL is a
 *     valid IndexNow notification
 *   - the catalogue, RO + EN: it lists every product
 *   - the homepage, RO + EN: only when the NUMBER of products on sale changed
 *     (the "modele" figure)
 */
export function productChangeUrls(before: ProductState | null, after: ProductState | null): string[] {
  const wasPublic = !!before?.active;
  const isPublic = !!after?.active;
  if (!wasPublic && !isPublic) return [];

  const slugs = new Set<string>();
  if (wasPublic) slugs.add(before!.slug);
  if (isPublic) slugs.add(after!.slug);

  const urls: string[] = [];
  for (const slug of Array.from(slugs)) {
    for (const locale of LOCALES) urls.push(`${SITE_URL}/${locale}/${PATHNAMES.tocatoare[locale]}/${slug}`);
  }
  for (const locale of LOCALES) urls.push(`${SITE_URL}${localizedPath('tocatoare', locale)}`);
  if (wasPublic !== isPublic) {
    for (const locale of LOCALES) urls.push(`${SITE_URL}/${locale}`);
  }
  return Array.from(new Set(urls));
}

export interface IndexNowResult {
  /** URLs that passed the filter (sent, or that would have been sent). */
  urls: string[];
  /** HTTP status from IndexNow; null when nothing was sent or the request failed. */
  status: number | null;
  skipped?: 'not-production' | 'no-urls' | 'not-server';
  error?: string;
}

export interface IndexNowDeps {
  fetchImpl?: typeof fetch;
  /** Defaults to the Vercel production deployment only. */
  isProduction?: boolean;
  log?: Pick<Console, 'info' | 'warn'>;
  timeoutMs?: number;
}

/**
 * POST the URLs to IndexNow. NEVER throws and never rejects: every failure
 * (network, timeout, 4xx, 5xx) is logged and returned. Bounded by a timeout so
 * a slow endpoint cannot hold an admin save for long.
 */
export async function submitToIndexNow(urls: string[], deps: IndexNowDeps = {}): Promise<IndexNowResult> {
  const log = deps.log ?? console;
  const unique = Array.from(new Set(urls));
  const list = unique.filter(isSubmittable).slice(0, INDEXNOW_MAX_URLS);

  try {
    // A URL that does not pass the allowlist is dropped — safe, but it must
    // leave a trace (e.g. a slug typed by hand in the database with characters
    // the admin form would refuse). Counts only, like every line here.
    if (list.length < unique.length) {
      try {
        log.warn(`[indexnow] ${unique.length - list.length} URL(s) not on the allowlist — dropped`);
      } catch {
        // A broken logger must not stop the URLs that did pass from being sent.
      }
    }
    if (list.length === 0) return { urls: list, status: null, skipped: 'no-urls' };
    if (typeof window !== 'undefined') return { urls: list, status: null, skipped: 'not-server' };

    const isProduction = deps.isProduction ?? process.env.VERCEL_ENV === 'production';
    if (!isProduction) {
      log.info(`[indexnow] not production — ${list.length} URL(s) not sent`);
      return { urls: list, status: null, skipped: 'not-production' };
    }

    const res = await (deps.fetchImpl ?? fetch)(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      // Key file at the site root (the protocol's "Option 1"): no keyLocation.
      body: JSON.stringify({ host: new URL(SITE_URL).host, key: INDEXNOW_KEY, urlList: list }),
      signal: AbortSignal.timeout(deps.timeoutMs ?? 4000),
      cache: 'no-store',
    });

    // 200 = received; 202 = received, key validation pending. Anything else is
    // a problem to look at (403 key file, 422 URL/host mismatch, 429 too often).
    if (res.status === 200 || res.status === 202) {
      log.info(`[indexnow] ${res.status} — ${list.length} URL(s) sent`);
    } else {
      log.warn(`[indexnow] unexpected status ${res.status} for ${list.length} URL(s)`);
    }
    return { urls: list, status: res.status };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    try {
      log.warn(`[indexnow] request failed: ${error}`);
    } catch {
      // A broken logger must not turn into a thrown error either.
    }
    return { urls: list, status: null, error };
  }
}
