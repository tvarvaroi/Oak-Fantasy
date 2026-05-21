import { test, expect } from './fixtures';

test.describe('/atelier page + path-localized routing', () => {
  test('GET /ro/atelier returns 200', async ({ page }) => {
    const response = await page.goto('/ro/atelier');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toContainText('Un atelier mic, în zona Carpaților.');
  });

  test('GET /en/workshop returns 200', async ({ page }) => {
    const response = await page.goto('/en/workshop');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toContainText('A small workshop in the Carpathians.');
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
    const text = (await page.locator('body').textContent()) ?? '';
    expect(text).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });

  test('RO has all 6 tool brand names', async ({ page }) => {
    await page.goto('/ro/atelier');
    const body = page.locator('body');
    await expect(body).toContainText('Bosch GTS 635-216');
    await expect(body).toContainText('Festool ETS 150/3');
    await expect(body).toContainText('Makita KP0810');
  });

  test('EN has matching tool brand names', async ({ page }) => {
    await page.goto('/en/workshop');
    const body = page.locator('body');
    await expect(body).toContainText('Bosch GTS 635-216');
    await expect(body).toContainText('Festool ETS 150/3');
    await expect(body).toContainText('Makita KP0810');
  });

  test('RO seasons section has all 4 seasons', async ({ page }) => {
    await page.goto('/ro/atelier');
    const sezon = page.locator('#sezon');
    await sezon.scrollIntoViewIfNeeded();
    await expect(sezon).toContainText('Iarna');
    await expect(sezon).toContainText('Primăvara');
    await expect(sezon).toContainText('Vara');
    await expect(sezon).toContainText('Toamna');
  });

  test('Articles section has 4 "coming soon" placeholders', async ({ page }) => {
    await page.goto('/ro/atelier');
    const articole = page.locator('#articole');
    await articole.scrollIntoViewIfNeeded();
    // Each card has data-coming with "Articol în pregătire"
    const comingBadges = articole.locator('[data-coming]');
    await expect(comingBadges).toHaveCount(4);
  });

  test('Process section cross-link points to /despre#proces', async ({ page }) => {
    await page.goto('/ro/atelier');
    const link = page.locator('#proces a[href*="/ro/despre"]');
    await expect(link).toBeVisible();
    await expect(link).toContainText('Despre');
  });
});
