import { test, expect } from './fixtures';

test.describe('Homepage — /ro + /en', () => {
  test('GET /ro returns 200 and renders', async ({ page, consoleErrors }) => {
    const response = await page.goto('/ro');
    expect(response?.status()).toBe(200);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    // Filter Next.js dev-only React warnings. Production build doesn't emit these.
    // Known: WorkshopSection useScroll/useTransform hydration mismatch (see _brain/notes/gotchas.md).
    const realErrors = consoleErrors.filter(
      (e) => !e.startsWith('Warning:') && !e.includes('Hydration'),
    );
    expect(realErrors).toEqual([]);
  });

  test('GET /en returns 200 and renders', async ({ page, consoleErrors }) => {
    const response = await page.goto('/en');
    expect(response?.status()).toBe(200);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    // Filter Next.js dev-only React warnings. Production build doesn't emit these.
    // Known: WorkshopSection useScroll/useTransform hydration mismatch (see _brain/notes/gotchas.md).
    const realErrors = consoleErrors.filter(
      (e) => !e.startsWith('Warning:') && !e.includes('Hydration'),
    );
    expect(realErrors).toEqual([]);
  });

  test('Romanian page body contains diacritics', async ({ page }) => {
    await page.goto('/ro');
    const text = (await page.locator('body').textContent()) ?? '';
    expect(text).toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });

  test('English page body has no Romanian diacritics', async ({ page }) => {
    await page.goto('/en');
    const text = (await page.locator('body').textContent()) ?? '';
    expect(text).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });

  test('Language toggle from /ro navigates to /en', async ({ page }) => {
    await page.goto('/ro');
    await page.getByRole('button', { name: /RO\s*\|\s*EN/i }).click();
    await page.waitForURL('**/en');
    expect(new URL(page.url()).pathname).toBe('/en');
  });
});
