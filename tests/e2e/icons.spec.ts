import { test, expect } from './fixtures';

// 2026-11-20 — favicon + app icons (Next App Router metadata files).
// Tab + Google: simplified cutting-board mark (app/favicon.ico 16/32/48,
// app/icon.png 96×96). iPhone + Android: full logo badge on cream
// (app/apple-icon.png 180×180, public/icon-192.png, public/icon-512.png).
test.describe('Icons + manifest', () => {
  for (const path of ['/ro', '/en', '/ro/tocatoare', '/en/about']) {
    test(`${path}: <head> links favicon, icon, apple icon and manifest`, async ({ page }) => {
      await page.goto(path);
      const links = await page.evaluate(() =>
        Array.from(document.querySelectorAll('link[rel]')).map((l) => ({
          rel: l.getAttribute('rel'),
          href: l.getAttribute('href') ?? '',
          sizes: l.getAttribute('sizes'),
          type: l.getAttribute('type'),
        })),
      );
      const has = (rel: string, re: RegExp) => links.find((l) => l.rel === rel && re.test(l.href));
      expect(has('icon', /^\/favicon\.ico/), 'favicon.ico').toBeTruthy();
      const png = has('icon', /^\/icon\.png/);
      expect(png, 'icon.png').toBeTruthy();
      expect(png?.sizes).toBe('96x96');
      expect(has('apple-touch-icon', /^\/apple-icon\.png/)?.sizes).toBe('180x180');
      expect(has('manifest', /^\/manifest\.webmanifest/), 'manifest').toBeTruthy();
    });
  }

  test('icon files respond 200 with image types; manifest lists 192 + 512', async ({ request }) => {
    const ico = await request.get('/favicon.ico');
    expect(ico.status()).toBe(200);
    expect(ico.headers()['content-type']).toMatch(/image\/(x-icon|vnd\.microsoft\.icon)/);
    for (const p of ['/icon.png', '/apple-icon.png', '/icon-192.png', '/icon-512.png']) {
      const r = await request.get(p);
      expect(r.status(), p).toBe(200);
      expect(r.headers()['content-type'], p).toContain('image/png');
    }
    const m = await request.get('/manifest.webmanifest');
    expect(m.status()).toBe(200);
    const json = await m.json();
    expect(json.name).toBe('Oak Fantasy');
    expect(json.icons.map((i: { sizes: string }) => i.sizes)).toEqual(['192x192', '512x512']);
  });
});
