import { test, expect } from './fixtures';

test.describe('/despre page + path-localized routing', () => {
  test('GET /ro/despre returns 200', async ({ page }) => {
    const response = await page.goto('/ro/despre');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toContainText('Cinci pași între copac și bucătărie.');
  });

  test('GET /en/about returns 200', async ({ page }) => {
    const response = await page.goto('/en/about');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toContainText('Five steps between the tree and your kitchen.');
  });

  test('GET /en/despre redirects 308 to /en/about', async ({ page }) => {
    const response = await page.goto('/en/despre');
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/en/about');
  });

  test('GET /ro/about redirects 308 to /ro/despre', async ({ page }) => {
    const response = await page.goto('/ro/about');
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/ro/despre');
  });

  test('RO /despre contains authenticity marker "nealtoit"', async ({ page }) => {
    await page.goto('/ro/despre');
    await expect(page.locator('body')).toContainText('nealtoit');
  });

  test('RO /despre body has Romanian diacritics', async ({ page }) => {
    await page.goto('/ro/despre');
    const text = (await page.locator('body').textContent()) ?? '';
    expect(text).toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });

  test('EN /about body has no Romanian diacritics', async ({ page }) => {
    await page.goto('/en/about');
    // innerText: the inline RSC payload carries the RO not-found boundary.
    const text = await page.evaluate(() => document.body.innerText);
    expect(text).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });
});

// 2026-11-19 (founder): no absolute origin claims ("100%", "doar…", "fără
// import", "din pădurile noastre") and no "certified forests" anywhere.
test.describe('Origin claims stay plain', () => {
  const ABSOLUTE_RO = /Lucrăm doar cu|fără import|100% stejar|păduri certificate/i;
  const ABSOLUTE_EN = /work only with|no imports|100% Romanian|certified forests/i;

  for (const path of ['/ro', '/ro/despre', '/ro/atelier']) {
    test(`${path}: no absolute origin claim`, async ({ page }) => {
      await page.goto(path);
      const text = await page.evaluate(() => document.body.innerText);
      expect(text).not.toMatch(ABSOLUTE_RO);
    });
  }
  for (const path of ['/en', '/en/about', '/en/workshop']) {
    test(`${path}: no absolute origin claim`, async ({ page }) => {
      await page.goto(path);
      const text = await page.evaluate(() => document.body.innerText);
      expect(text).not.toMatch(ABSOLUTE_EN);
    });
  }

  test('/despre process lead: "pădurile României", not "pădurile noastre"', async ({ page }) => {
    await page.goto('/ro/despre');
    const main = page.locator('main');
    await expect(main).toContainText('De la stejarul nealtoit din pădurile României');
    await expect(main).not.toContainText('pădurile noastre');
    await page.goto('/en/about');
    await expect(page.locator('main')).toContainText('From wild oak in Romania’s forests');
  });

  test('/despre values card: Romanian oak, solid wood, worked by hand', async ({ page }) => {
    await page.goto('/ro/despre');
    await expect(page.locator('main')).toContainText('Lucrăm cu stejar românesc: lemn masiv, lucrat manual, fără compromis.');
    await page.goto('/en/about');
    await expect(page.locator('main')).toContainText('We work with Romanian oak: solid wood, worked by hand, no compromise.');
  });
});
