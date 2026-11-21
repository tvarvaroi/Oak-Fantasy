import { execFileSync } from 'node:child_process';
import { test, expect } from './fixtures';
import { PAGE_CONTENT_SOURCES, PAGE_LAST_MODIFIED, latest, type PageKey } from '../../lib/page-last-modified';
import { PUBLIC_ROUTE_KEYS } from '../../lib/seo/public-routes';

// Sitemap <lastmod> = the date a page's content really changed, never the
// build time (GEO audit 2026-11-21). The dates are recorded by hand in
// lib/page-last-modified.ts; this spec is what keeps them honest.

const git = (...args: string[]): string | null => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
};
// `:(literal)` — app/[locale]/… would otherwise be read as a glob.
const literal = (files: string[]) => files.map((f) => `:(literal)${f}`);
const today = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const KEYS = Object.keys(PAGE_LAST_MODIFIED) as PageKey[];

test.describe('Sitemap lastmod', () => {
  test('every public page has a recorded date, and the dates are plausible', () => {
    for (const key of ['home', 'productTemplate', ...PUBLIC_ROUTE_KEYS]) {
      expect(PAGE_LAST_MODIFIED[key as PageKey], `no date recorded for "${key}"`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(PAGE_CONTENT_SOURCES[key as PageKey]?.length, `no sources listed for "${key}"`).toBeGreaterThan(0);
    }
    for (const key of KEYS) {
      expect(PAGE_LAST_MODIFIED[key] <= today(), `${key} is dated in the future`).toBe(true);
    }
  });

  test('a recorded date is never older than the last change to the page’s content files', () => {
    test.skip(git('rev-parse', '--is-inside-work-tree') !== 'true', 'not a git checkout');
    test.skip(git('rev-parse', '--is-shallow-repository') === 'true', 'shallow clone: history incomplete');

    for (const key of KEYS) {
      const sources = literal(PAGE_CONTENT_SOURCES[key]);
      const committed = git('log', '-1', '--format=%cs', '--', ...sources);
      expect(committed, `no commit found for the sources of "${key}"`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(
        PAGE_LAST_MODIFIED[key] >= committed!,
        `"${key}" content was committed on ${committed}, but lib/page-last-modified.ts says ${PAGE_LAST_MODIFIED[key]} — bump it`,
      ).toBe(true);

      // Edited but not committed yet: the change ships today.
      const dirty = git('status', '--porcelain', '--', ...sources);
      if (dirty) {
        expect(
          PAGE_LAST_MODIFIED[key] >= today(),
          `"${key}" has uncommitted content changes — set its date to ${today()} in lib/page-last-modified.ts`,
        ).toBe(true);
      }
    }
  });

  test('latest(): the later of a recorded date and a product timestamp', () => {
    expect(latest('2026-11-21', '2026-11-19T13:21:00.385+00:00')).toBe('2026-11-21');
    expect(latest('2026-11-19', '2026-11-21T08:00:00+00:00')).toBe('2026-11-21T08:00:00+00:00');
    expect(latest('2026-11-19', null)).toBe('2026-11-19');
    expect(latest('2026-11-19', undefined)).toBe('2026-11-19');
  });

  test('the served sitemap carries those dates, not one build timestamp for everything', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    const entries = new Map(
      Array.from(xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(.*?)<\/url>/gs)).map((m) => [
        new URL(m[1]).pathname,
        m[2].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null,
      ]),
    );

    const expected: Array<[string, PageKey]> = [
      ['/ro', 'home'], ['/en', 'home'],
      ['/ro/despre', 'despre'], ['/en/about', 'despre'],
      ['/ro/atelier', 'atelier'], ['/en/workshop', 'atelier'],
      ['/ro/contact', 'contact'], ['/en/contact', 'contact'],
      ['/ro/la-comanda', 'laComanda'], ['/en/custom-orders', 'laComanda'],
      ['/ro/termeni', 'terms'], ['/en/terms', 'terms'],
      ['/ro/confidentialitate', 'privacy'], ['/en/privacy', 'privacy'],
      ['/ro/retur', 'returns'], ['/en/returns', 'returns'],
    ];
    for (const [path, key] of expected) {
      expect(entries.get(path), path).toBe(PAGE_LAST_MODIFIED[key]);
    }

    // The catalogue and the product pages: never older than their recorded date.
    const notOlder = (value: string | null | undefined, floor: string) =>
      !!value && new Date(value).getTime() >= new Date(floor).getTime();
    for (const path of ['/ro/tocatoare', '/en/cutting-boards']) {
      expect(notOlder(entries.get(path), PAGE_LAST_MODIFIED.tocatoare), path).toBe(true);
    }
    const products = Array.from(entries.entries()).filter(([path]) => /^\/(ro\/tocatoare|en\/cutting-boards)\/[^/]+$/.test(path));
    for (const [path, lastmod] of products) {
      expect(notOlder(lastmod, PAGE_LAST_MODIFIED.productTemplate), path).toBe(true);
    }

    // No lastmod is in the future (a build-time stamp taken "now" would be
    // fine, but a date-only value for tomorrow would not).
    for (const [path, lastmod] of Array.from(entries.entries())) {
      expect(lastmod, path).toBeTruthy();
      expect(new Date(lastmod!).getTime(), path).toBeLessThanOrEqual(Date.now() + 24 * 3600 * 1000);
    }
  });
});
