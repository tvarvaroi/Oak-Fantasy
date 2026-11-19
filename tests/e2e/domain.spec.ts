import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { test, expect } from './fixtures';

// 2026-11-19 — domain switch to https://oakfantasy.ro (apex, no www).
// Every absolute URL the site emits must use this origin, from one source
// (lib/site-url.ts). The old Vercel alias must not appear anywhere.
const SITE = 'https://oakfantasy.ro';
const LEGACY = /oak-fantasy\.vercel\.app|www\.oakfantasy\.ro/;

const PAGES = [
  '/ro', '/en',
  '/ro/despre', '/en/about',
  '/ro/atelier', '/en/workshop',
  '/ro/tocatoare', '/en/cutting-boards',
  '/ro/la-comanda', '/en/custom-orders',
  '/ro/contact', '/en/contact',
  '/ro/termeni', '/en/terms',
  '/ro/retur', '/en/returns',
  '/ro/confidentialitate', '/en/privacy',
];

/** Every absolute http(s) URL in head metadata + JSON-LD. */
async function headUrls(page: import('@playwright/test').Page): Promise<string[]> {
  return page.evaluate(() => {
    const urls: string[] = [];
    document.querySelectorAll('link[rel="canonical"], link[rel="alternate"]').forEach((el) => {
      const href = el.getAttribute('href');
      if (href) urls.push(href);
    });
    document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]').forEach((el) => {
      const c = el.getAttribute('content') ?? '';
      if (/^https?:\/\//.test(c)) urls.push(c);
    });
    document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
      const found = (el.textContent ?? '').match(/https?:\/\/[^"\s]+/g) ?? [];
      urls.push(...found);
    });
    return urls;
  });
}

// Own-site URLs only (by hostname): social profiles, ANPC, schema.org are third-party.
const isOwn = (u: string) => {
  try {
    return /(^|\.)oakfantasy\.ro$|vercel\.app$|^localhost$/.test(new URL(u).hostname);
  } catch {
    return false;
  }
};

test.describe('Domain — one origin everywhere', () => {
  for (const path of PAGES) {
    test(`${path}: head + JSON-LD use ${SITE}`, async ({ page }) => {
      await page.goto(path);
      const urls = (await headUrls(page)).filter(isOwn);
      expect(urls.length, 'page emits absolute own-site URLs').toBeGreaterThan(0);
      // `next dev` resolves og:image/twitter:image against the local server
      // (production resolves them against metadataBase = SITE_URL — checked
      // live after deploy); every other URL must be on the apex domain.
      const local = new URL(page.url()).origin;
      for (const u of urls) {
        const ok = u.startsWith(`${SITE}/`) || u === SITE || (/\.(png|jpe?g|webp)$/.test(u) && u.startsWith(`${local}/`));
        expect(ok, u).toBe(true);
      }
      expect(await page.content()).not.toMatch(LEGACY);
    });
  }

  test('canonical + hreflang point at the apex domain', async ({ page }) => {
    await page.goto('/en/about');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/en/about`);
    await expect(page.locator('link[rel="alternate"][hreflang="ro"]')).toHaveAttribute('href', `${SITE}/ro/despre`);
  });

  test('product detail page: head + JSON-LD use the apex domain', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    const href = await page.locator('a[href^="/ro/tocatoare/"]').first().getAttribute('href');
    test.skip(!href, 'no active product in the catalog');
    await page.goto(href!);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${href}`);
    const urls = (await headUrls(page)).filter(isOwn);
    for (const u of urls) {
      const local = new URL(page.url()).origin;
      const ok = u.startsWith(`${SITE}/`) || u === SITE || (/\.(png|jpe?g|webp)$/.test(u) && u.startsWith(`${local}/`));
      expect(ok, u).toBe(true);
    }
    expect(await page.content()).not.toMatch(LEGACY);
  });

  test('old Vercel alias 308s to the apex domain, path + query kept', async ({ request }) => {
    const res = await request.get('/ro/despre?x=1', {
      headers: { Host: 'oak-fantasy.vercel.app' },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(308);
    expect(res.headers()['location']).toBe(`${SITE}/ro/despre?x=1`);
  });

  test('sitemap.xml: every <loc> on the apex domain', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const locs = (xml.match(/<loc>[^<]+<\/loc>/g) ?? []).map((m) => m.slice(5, -6));
    expect(locs.length).toBeGreaterThan(10);
    for (const l of locs) expect(l.startsWith(`${SITE}/`), l).toBe(true);
    expect(xml).not.toMatch(LEGACY);
  });

  test('llms.txt: links on the apex domain', async ({ request }) => {
    const txt = await (await request.get('/llms.txt')).text();
    const links = txt.match(/https?:\/\/[^\s)]+/g) ?? [];
    expect(links.length).toBeGreaterThan(5);
    for (const l of links.filter(isOwn)) expect(l.startsWith(`${SITE}/`), l).toBe(true);
    expect(txt).not.toMatch(LEGACY);
  });

  // Pre-launch lockdown: robots stays Disallow until the founder says "lansăm".
  // The launch commit flips this test together with app/robots.ts.
  test('robots.txt is still the pre-launch lockdown', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text();
    expect(txt).toMatch(/Disallow: \/\s*$/m);
    expect(txt).not.toMatch(/^Allow:/m);
    expect(txt).not.toMatch(/Sitemap:/i);
  });
});

test.describe('Domain — static source guards', () => {
  const ROOTS = ['app', 'lib', 'components', 'emails', 'public'];
  const EXT = /\.(tsx?|mjs|js|txt|xml|json)$/;

  function walk(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p, out);
      else if (EXT.test(name)) out.push(p);
    }
    return out;
  }

  test('no source file references the old Vercel alias or www', () => {
    const offenders = ROOTS.flatMap((r) => walk(r)).filter((f) => LEGACY.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  test('origin literals live only in lib/legal-info.ts and next.config.js', () => {
    const literal = /['"`]https:\/\/oakfantasy\.ro/;
    const offenders = ROOTS.flatMap((r) => walk(r))
      .filter((f) => !f.startsWith('public'))
      .filter((f) => literal.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
    expect(readFileSync('lib/legal-info.ts', 'utf8')).toContain("brandDomain: 'oakfantasy.ro'");
  });

  test('legacy-alias redirect in next.config.js targets SITE_URL', () => {
    const cfg = readFileSync('next.config.js', 'utf8');
    expect(cfg).toContain(`const CANONICAL_ORIGIN = '${SITE}';`);
    expect(cfg).toContain("const LEGACY_HOST = 'oak-fantasy.vercel.app';");
  });

  test('customer-facing emails set Reply-To to the contact inbox', () => {
    for (const f of ['lib/orders/send-order-emails.ts', 'app/api/contact/route.ts']) {
      expect(readFileSync(f, 'utf8'), f).toContain('replyTo: customerReplyTo');
    }
    expect(readFileSync('lib/email/resend-config.ts', 'utf8')).toContain(
      'customerReplyTo: LEGAL_INFO.contactEmail',
    );
  });
});
