import { test, expect } from './fixtures';

/**
 * SEO assertions per page. NOTE: homepage (`app/[locale]/layout.tsx`) only sets
 * <title> + <meta name="description"> at the moment. canonical/hreflang/JSON-LD
 * are set on `/despre` Server Component (Faza A) — when homepage gets the same
 * treatment, expand the `withFullSeo` array below.
 *
 * Future work: add canonical + hreflang to root layout metadata (out of scope Faza C).
 */

const ALL_PAGES = [
  { path: '/ro',         title: /Oak Fantasy/i },
  { path: '/en',         title: /Oak Fantasy/i },
  { path: '/ro/despre',  title: /Despre Oak Fantasy/i },
  { path: '/en/about',   title: /About Oak Fantasy/i },
];

const PAGES_WITH_FULL_SEO = ['/ro/despre', '/en/about'] as const;

test.describe('SEO — title + description (all pages)', () => {
  for (const { path, title } of ALL_PAGES) {
    test(`${path} — <title> matches expected pattern`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
    });

    test(`${path} — has non-empty meta description (50–200 chars)`, async ({ page }) => {
      await page.goto(path);
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(desc).toBeTruthy();
      expect((desc ?? '').length).toBeGreaterThanOrEqual(50);
      expect((desc ?? '').length).toBeLessThanOrEqual(200);
    });
  }
});

test.describe('SEO — canonical + hreflang (only /despre routes for now)', () => {
  for (const path of PAGES_WITH_FULL_SEO) {
    test(`${path} — has canonical link with absolute URL`, async ({ page }) => {
      await page.goto(path);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);
      const href = await canonical.getAttribute('href');
      expect(href).toMatch(/^https?:\/\//);
    });

    test(`${path} — has hreflang alternates (ro, en, x-default)`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('link[rel="alternate"][hreflang="ro"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
    });
  }
});

test.describe('JSON-LD structured data on /despre pages', () => {
  for (const path of PAGES_WITH_FULL_SEO) {
    test(`${path} — AboutPage + BreadcrumbList JSON-LD scripts present`, async ({ page }) => {
      await page.goto(path);
      const scripts = page.locator('script[type="application/ld+json"]');
      const count = await scripts.count();
      expect(count).toBeGreaterThanOrEqual(2);

      const payloads = await scripts.allTextContents();
      const types = payloads
        .map((p) => {
          try { return JSON.parse(p)['@type']; } catch { return null; }
        })
        .filter(Boolean);
      expect(types).toContain('AboutPage');
      expect(types).toContain('BreadcrumbList');
    });
  }
});
