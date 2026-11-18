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
    // innerText: the inline RSC payload carries the RO not-found boundary.
    const text = await page.evaluate(() => document.body.innerText);
    expect(text).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });

  // 2026-11-18: CraftVideoTease is hidden (SHOW_CRAFT_VIEW = false) until we
  // have our own workshop photos — neither the section nor its stock stills
  // may reach the homepage in either locale.
  for (const { path, label } of [
    { path: '/ro', label: 'Vedere din atelier' },
    { path: '/en', label: 'Workshop view' },
  ]) {
    test(`${path}: the workshop-view slideshow is hidden`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('footer')).toBeVisible();
      await expect(page.locator(`section[aria-label="${label}"]`)).toHaveCount(0);
      await expect(page.locator('img[src*="atelier-tool-planer"]')).toHaveCount(0);
    });
  }

  test('Language toggle from /ro navigates to /en', async ({ page }) => {
    await page.goto('/ro');
    // Below lg the toggle lives inside the hamburger drawer (2026-07-03).
    const hamburger = page.locator('header button[aria-expanded]');
    if (await hamburger.isVisible()) {
      await hamburger.dispatchEvent('click');
      await page.waitForTimeout(450);
    }
    await page.getByRole('button', { name: /RO\s*\|\s*EN/i }).first().dispatchEvent('click');
    await page.waitForURL('**/en');
    expect(new URL(page.url()).pathname).toBe('/en');
  });
});
