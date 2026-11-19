import { test, expect } from './fixtures';

test.describe('/atelier page + path-localized routing', () => {
  test('GET /ro/atelier returns 200', async ({ page }) => {
    const response = await page.goto('/ro/atelier');
    expect(response?.status()).toBe(200);
    // 2026-07-15: narrative moved from "zona Carpaților" to "vestul României".
    await expect(page.locator('body')).toContainText('Un atelier mic, în vestul României.');
  });

  test('GET /en/workshop returns 200', async ({ page }) => {
    const response = await page.goto('/en/workshop');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toContainText('A small workshop in western Romania.');
  });

  test('GET /en/atelier redirects 308 to /en/workshop', async ({ page }) => {
    const response = await page.goto('/en/atelier');
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/en/workshop');
  });

  test('GET /ro/workshop redirects 308 to /ro/atelier', async ({ page }) => {
    const response = await page.goto('/ro/workshop');
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/ro/atelier');
  });

  test('RO body has Romanian diacritics', async ({ page }) => {
    await page.goto('/ro/atelier');
    const text = (await page.locator('body').textContent()) ?? '';
    expect(text).toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });

  test('EN body has no Romanian diacritics', async ({ page }) => {
    await page.goto('/en/workshop');
    // innerText, not textContent: the RSC flight payload (inline <script>)
    // carries the global RO not-found boundary ("Pagina nu există") on every
    // page since 2026-07-02 — that is not visible copy.
    const text = await page.evaluate(() => document.body.innerText);
    expect(text).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });

  // 2026-11-19: tool names are generic tool types — no brand or model code
  // anywhere on the page (cards, alt texts, JSON-LD ItemList).
  const BRANDS = /Bosch|Makita|Festool|GTS ?635|KP ?0810|ETS ?150/i;
  for (const { path, names } of [
    {
      path: '/ro/atelier',
      names: ['Ferăstrău circular de masă', 'Freză verticală cu ghidaj', 'Presă manuală cu șuruburi (4 buc.)', 'Rindea electrică', 'Șlefuitor orbital'],
    },
    {
      path: '/en/workshop',
      names: ['Table saw', 'Plunge router with edge guide', 'Manual screw clamps (4 pcs.)', 'Electric hand planer', 'Orbital sander'],
    },
  ]) {
    test(`${path}: five generic tool names, no brand or model anywhere`, async ({ page }) => {
      await page.goto(path);
      const cards = page.locator('#unelte h3');
      await expect(cards).toHaveText(names);
      const html = await page.content();
      expect(html).not.toMatch(BRANDS);
    });
  }

  test('RO seasons section has all 4 seasons', async ({ page }) => {
    await page.goto('/ro/atelier');
    const sezon = page.locator('#sezon');
    await sezon.scrollIntoViewIfNeeded();
    await expect(sezon).toContainText('Iarna');
    await expect(sezon).toContainText('Primăvara');
    await expect(sezon).toContainText('Vara');
    await expect(sezon).toContainText('Toamna');
  });

  test('Articles placeholder section is hidden pre-launch (2026-10-15)', async ({ page }) => {
    await page.goto('/ro/atelier');
    await expect(page.locator('#articole')).toHaveCount(0);
    await expect(page.locator('[data-coming]')).toHaveCount(0);
  });

  test('Hero mosaic shows 9 product photos (no text labels)', async ({ page }) => {
    await page.goto('/ro/atelier');
    // next/image rewrites src to /_next/image?url=%2Fproducts%2Fatelier-… so
    // match the URL-encoded form (and not the /stock/atelier-tool-* photos).
    const mosaic = page.locator('img[src*="products%2Fatelier-"], img[src*="products/atelier-"]');
    await expect(mosaic).toHaveCount(9);
  });

  test('CTA has a single button → /ro/tocatoare (ghost waitlist removed)', async ({ page }) => {
    await page.goto('/ro/atelier');
    await expect(page.locator('a[href="/ro/tocatoare"]:has-text("Vezi tocătoarele noastre")')).toHaveCount(1);
    await expect(page.locator('a[href*="#waitlist"]')).toHaveCount(0);
  });

  test('Process section cross-link points to /despre#proces', async ({ page }) => {
    await page.goto('/ro/atelier');
    const link = page.locator('#proces a[href*="/ro/despre"]');
    await expect(link).toBeVisible();
    await expect(link).toContainText('Despre');
  });
});
