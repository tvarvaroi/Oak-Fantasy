import { test, expect } from './fixtures';

test.describe('Navbar tagline (Faza B fix)', () => {
  test('RO shows "stejar · manual"', async ({ page }) => {
    await page.goto('/ro');
    await expect(page.locator('header')).toContainText('stejar · manual');
  });

  test('EN shows "oak · handmade", not "stejar"', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('header')).toContainText('oak · handmade');
    await expect(page.locator('header')).not.toContainText('stejar');
  });
});

test.describe('Navbar Atelier link (2026-05-27 — /atelier route)', () => {
  test('RO Navbar has "Atelier" route link pointing to /ro/atelier', async ({ page }) => {
    await page.goto('/ro');
    const link = page.locator('header a[href="/ro/atelier"]').first();
    await expect(link).toBeVisible();
    await expect(link).toContainText('Atelier');
  });

  test('EN Navbar has "Workshop" route link pointing to /en/workshop', async ({ page }) => {
    await page.goto('/en');
    const link = page.locator('header a[href="/en/workshop"]').first();
    await expect(link).toBeVisible();
    await expect(link).toContainText('Workshop');
  });

  test('Click Atelier on /ro navigates to /ro/atelier', async ({ page }) => {
    await page.goto('/ro');
    await page.locator('header a[href="/ro/atelier"]').first().click();
    await page.waitForURL('**/ro/atelier');
    expect(new URL(page.url()).pathname).toBe('/ro/atelier');
  });

  test('Atelier link has active state on /ro/atelier (oak-warm color)', async ({ page }) => {
    await page.goto('/ro/atelier');
    const link = page.locator('header a[href="/ro/atelier"]').first();
    await expect(link).toBeVisible();
    // Active color is var(--oak-warm) = #8B5E3C → rgb(139, 94, 60)
    const color = await link.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(139, 94, 60)');
  });

  test('Navbar no longer has homepage #atelier anchor (D1 decision)', async ({ page }) => {
    await page.goto('/ro');
    const anchorLink = page.locator('header a[href="/ro#atelier"]');
    await expect(anchorLink).toHaveCount(0);
  });
});

test.describe('Footer microTagline (Faza B fix)', () => {
  test('RO footer shows "stejar · manual · România"', async ({ page }) => {
    await page.goto('/ro');
    await expect(page.locator('footer')).toContainText('stejar · manual · România');
  });

  test('EN footer shows "oak · handmade · Romania", not "stejar"', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('footer')).toContainText('oak · handmade · Romania');
    await expect(page.locator('footer')).not.toContainText('stejar');
  });

  test('Footer logo image is from brand jpeg', async ({ page }) => {
    await page.goto('/ro');
    const logo = page.locator('footer img[alt*="Oak Fantasy logo"]').first();
    await expect(logo).toBeVisible();
    const src = await logo.getAttribute('src');
    expect(src).toContain('WhatsApp_Image_2026-05-14');
  });
});

test.describe('NumbersStrip (Faza B refactor)', () => {
  // NumbersStrip is below the fold — counter starts on IntersectionObserver trigger.
  // Scroll into view + reduced-motion (set in fixtures) makes Counter jump to final value.

  test('RO shows "20+ ani" and "1.200+"', async ({ page }) => {
    await page.goto('/ro');
    const numbers = page.locator('section[aria-label="Cifre"]');
    await numbers.scrollIntoViewIfNeeded();
    await expect(numbers).toContainText('+ ani');
    await expect(numbers).toContainText('1.200', { timeout: 5000 });
  });

  test('EN shows "20+ years" and "1,200+", not "ani"', async ({ page }) => {
    await page.goto('/en');
    const numbers = page.locator('section[aria-label="Numbers"]');
    await numbers.scrollIntoViewIfNeeded();
    await expect(numbers).toContainText('+ years');
    await expect(numbers).toContainText('1,200', { timeout: 5000 });
    // Use precise suffix match — " ani" alone matches "Romanian" (Rom-ani-an)
    await expect(numbers).not.toContainText('+ ani');
  });

  test('RO captions use modern Romanian diacritics (no cedilla)', async ({ page }) => {
    await page.goto('/ro');
    const numbers = page.locator('section[aria-label="Cifre"]');
    await numbers.scrollIntoViewIfNeeded();
    const numbersText = (await numbers.textContent()) ?? '';
    expect(numbersText).not.toMatch(/[şţ]/);
  });
});
