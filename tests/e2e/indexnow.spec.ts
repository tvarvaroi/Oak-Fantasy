import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from './fixtures';
import {
  INDEXNOW_ENDPOINT,
  INDEXNOW_KEY,
  isSubmittable,
  productChangeUrls,
  submitToIndexNow,
} from '../../lib/indexnow';

// IndexNow (2026-11-21, _brain/resources/indexnow.md). These tests never touch
// the real endpoint: submitToIndexNow takes its fetch as a parameter.
// Founder's rules: server only; a failure never blocks saving a product;
// private URLs are never sent; nothing is sent outside production.

const SITE = 'https://oakfantasy.ro';
const quiet = { info: () => {}, warn: () => {} };

test.describe('IndexNow', () => {
  test('key: valid format, key file in the site root with exactly the key, served as text', async ({ request }) => {
    // Protocol: 8–128 characters, a-z A-Z 0-9 and dashes; a UTF-8 file
    // {key}.txt at the root of the host, containing the key.
    expect(INDEXNOW_KEY).toMatch(/^[A-Za-z0-9-]{8,128}$/);
    const file = join('public', `${INDEXNOW_KEY}.txt`);
    expect(existsSync(file), file).toBe(true);
    expect(readFileSync(file, 'utf8')).toBe(INDEXNOW_KEY);

    const res = await request.get(`/${INDEXNOW_KEY}.txt`, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('text/plain');
    expect((await res.text()).trim()).toBe(INDEXNOW_KEY);
  });

  test('isSubmittable: only the homepage, public pages and product pages', () => {
    for (const ok of [
      `${SITE}/ro`,
      `${SITE}/en`,
      `${SITE}/ro/tocatoare`,
      `${SITE}/en/cutting-boards`,
      `${SITE}/ro/tocatoare/tocator-taur-alb`,
      `${SITE}/en/cutting-boards/tocator-taur-alb`,
      `${SITE}/ro/la-comanda`,
      `${SITE}/ro/despre`,
      `${SITE}/en/workshop`,
      `${SITE}/ro/retur`,
      `${SITE}/en/terms`,
    ]) {
      expect(isSubmittable(ok), ok).toBe(true);
    }
    for (const no of [
      `${SITE}/admin`,
      `${SITE}/admin/produse`,
      `${SITE}/api/contact`,
      `${SITE}/auth/callback`,
      `${SITE}/ro/cos`,
      `${SITE}/en/cart`,
      `${SITE}/ro/checkout`,
      `${SITE}/en/checkout`,
      `${SITE}/ro/multumim/3f2c`,
      `${SITE}/en/thank-you/3f2c`,
      `${SITE}/ro/login`,
      `${SITE}/ro/inregistrare`,
      `${SITE}/en/register`,
      `${SITE}/ro/parola-uitata`,
      `${SITE}/ro/reset-parola`,
      `${SITE}/ro/la-comanda/sent`,
      `${SITE}/ro/tocatoare/x/y`,
      `${SITE}/ro/tocatoare?sort=price`,
      `${SITE}/ro/tocatoare/tocator-taur-alb#top`,
      `${SITE}/sitemap.xml`,
      `${SITE}/`,
      'http://oakfantasy.ro/ro',
      'https://www.oakfantasy.ro/ro',
      'https://example.com/ro',
      'not a url',
    ]) {
      expect(isSubmittable(no), no).toBe(false);
    }
  });

  test('productChangeUrls: what is public before or after the change, nothing for drafts', () => {
    const page = (slug: string) => [`${SITE}/ro/tocatoare/${slug}`, `${SITE}/en/cutting-boards/${slug}`];
    const catalogue = [`${SITE}/ro/tocatoare`, `${SITE}/en/cutting-boards`];
    const home = [`${SITE}/ro`, `${SITE}/en`];

    // Published (new, or draft → active): page + catalogue + homepage count.
    expect(productChangeUrls(null, { slug: 'a', active: true })).toEqual([...page('a'), ...catalogue, ...home]);
    expect(productChangeUrls({ slug: 'a', active: false }, { slug: 'a', active: true })).toEqual([
      ...page('a'), ...catalogue, ...home,
    ]);
    // Changed while on sale: page + catalogue (the count did not change).
    expect(productChangeUrls({ slug: 'a', active: true }, { slug: 'a', active: true })).toEqual([...page('a'), ...catalogue]);
    // Taken off sale: the page that now answers 404 + catalogue + homepage count.
    expect(productChangeUrls({ slug: 'a', active: true }, { slug: 'a', active: false })).toEqual([
      ...page('a'), ...catalogue, ...home,
    ]);
    // Slug changed while on sale: the old page (now 404) and the new one.
    expect(productChangeUrls({ slug: 'a', active: true }, { slug: 'b', active: true })).toEqual([
      ...page('a'), ...page('b'), ...catalogue,
    ]);
    // Nothing public changed.
    expect(productChangeUrls(null, { slug: 'a', active: false })).toEqual([]);
    expect(productChangeUrls({ slug: 'a', active: false }, { slug: 'a', active: false })).toEqual([]);
    expect(productChangeUrls(null, null)).toEqual([]);

    for (const url of productChangeUrls({ slug: 'a', active: true }, { slug: 'b', active: false })) {
      expect(isSubmittable(url), url).toBe(true);
    }
  });

  test('submitToIndexNow: one POST in production, with the protocol payload and no private URL', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fetchImpl = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response('', { status: 200 });
    }) as unknown as typeof fetch;

    const result = await submitToIndexNow(
      [`${SITE}/ro/tocatoare/a`, `${SITE}/ro/tocatoare/a`, `${SITE}/admin/produse`, `${SITE}/ro/checkout`, 'https://example.com/x'],
      { fetchImpl, isProduction: true, log: quiet },
    );

    expect(result).toEqual({ urls: [`${SITE}/ro/tocatoare/a`], status: 200 });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(INDEXNOW_ENDPOINT);
    expect(calls[0].url).toBe('https://api.indexnow.org/indexnow');
    expect(calls[0].init.method).toBe('POST');
    expect((calls[0].init.headers as Record<string, string>)['Content-Type']).toBe('application/json; charset=utf-8');
    expect(JSON.parse(calls[0].init.body as string)).toEqual({
      host: 'oakfantasy.ro',
      key: INDEXNOW_KEY,
      urlList: [`${SITE}/ro/tocatoare/a`],
    });
  });

  test('submitToIndexNow: sends nothing outside production, or when no URL is left', async () => {
    let called = 0;
    const fetchImpl = (async () => {
      called += 1;
      return new Response('', { status: 200 });
    }) as unknown as typeof fetch;

    expect(await submitToIndexNow([`${SITE}/ro`], { fetchImpl, isProduction: false, log: quiet })).toEqual({
      urls: [`${SITE}/ro`], status: null, skipped: 'not-production',
    });
    expect(await submitToIndexNow([`${SITE}/admin`], { fetchImpl, isProduction: true, log: quiet })).toEqual({
      urls: [], status: null, skipped: 'no-urls',
    });
    // Default: VERCEL_ENV is not "production" on a developer machine or in tests.
    expect((await submitToIndexNow([`${SITE}/ro`], { fetchImpl, log: quiet })).skipped).toBe('not-production');
    expect(called).toBe(0);
  });

  test('submitToIndexNow: a failing endpoint never throws — it is logged and returned', async () => {
    const warnings: string[] = [];
    const log = { info: () => {}, warn: (m: string) => { warnings.push(m); } };

    const down = (async () => { throw new Error('network down'); }) as unknown as typeof fetch;
    const r1 = await submitToIndexNow([`${SITE}/ro`], { fetchImpl: down, isProduction: true, log });
    expect(r1.status).toBeNull();
    expect(r1.error).toBe('network down');

    const forbidden = (async () => new Response('', { status: 403 })) as unknown as typeof fetch;
    const r2 = await submitToIndexNow([`${SITE}/ro`], { fetchImpl: forbidden, isProduction: true, log });
    expect(r2.status).toBe(403);

    const hangs = ((_: string, init: RequestInit) =>
      new Promise((_, reject) => init.signal!.addEventListener('abort', () => reject(new Error('timed out'))))) as unknown as typeof fetch;
    const r3 = await submitToIndexNow([`${SITE}/ro`], { fetchImpl: hangs, isProduction: true, log, timeoutMs: 50 });
    expect(r3.status).toBeNull();
    expect(r3.error).toBeTruthy();

    // Even a logger that throws cannot make it reject.
    const badLog = { info: () => {}, warn: () => { throw new Error('logger broke'); } };
    await expect(submitToIndexNow([`${SITE}/ro`], { fetchImpl: down, isProduction: true, log: badLog })).resolves.toBeTruthy();

    expect(warnings.length).toBe(3);
  });

  test('wiring: only the admin product actions send, after the save, and never in a client file', () => {
    const actions = readFileSync('lib/admin/product-actions.ts', 'utf8');
    expect(actions.startsWith("'use server'")).toBe(true);
    // create, update, toggle — each notifies once, after its own error return.
    expect(actions.match(/await notifySearchEngines\(/g)).toHaveLength(3);
    for (const fn of ['createProduct', 'updateProduct', 'toggleProductStatus']) {
      const body = actions.slice(actions.indexOf(`export async function ${fn}`));
      const end = body.indexOf('\nexport async function', 10);
      const own = end === -1 ? body : body.slice(0, end);
      expect(own.indexOf('if (error)'), fn).toBeGreaterThan(-1);
      expect(own.indexOf('notifySearchEngines('), fn).toBeGreaterThan(own.indexOf('if (error)'));
    }

    // No other file imports the notifier.
    const importers: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (['node_modules', '.next', '__screenshots__'].includes(entry.name)) continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(entry.name) && /from ['"]@\/lib\/indexnow['"]/.test(readFileSync(full, 'utf8'))) {
          importers.push(full.replace(/\\/g, '/'));
        }
      }
    };
    for (const dir of ['app', 'components', 'lib', 'emails']) walk(dir);
    expect(importers).toEqual(['lib/admin/product-actions.ts']);
  });

  test('the manual script reads the same key, checks the key file and filters by robots.txt', () => {
    const src = readFileSync('scripts/indexnow-submit-sitemap.mjs', 'utf8');
    expect(src).toContain("readFileSync('lib/indexnow.ts'");
    expect(src).toContain('https://api.indexnow.org/indexnow');
    expect(src).toContain('/robots.txt');
    expect(src).toContain('--dry-run');
    expect(src).not.toContain(INDEXNOW_KEY); // one source for the key
  });
});
