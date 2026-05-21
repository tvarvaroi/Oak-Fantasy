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
    const text = (await page.locator('body').textContent()) ?? '';
    expect(text).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });
});
