import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

// On the mobile viewport the desktop nav has `hidden md:flex` and the mobile
// menu starts collapsed (`max-h-0 opacity-0`). The Atelier route link exists
// in both places; the visibility/click tests need the menu open on mobile.
async function openMobileMenuIfNeeded(page: Page) {
  await page.waitForLoadState('networkidle');
  const toggle = page.locator('button[aria-label="Toggle menu"]');
  if (await toggle.isVisible()) {
    // On Playwright's mobile-emulation projects, click() reports the
    // fixed-position hamburger as "outside the viewport" even after scroll.
    // Dispatching the click event directly on the DOM node bypasses the
    // viewport-coordinate check entirely and triggers the React onClick.
    await toggle.dispatchEvent('click');
    await page.waitForTimeout(450); // mobile menu has ~400ms expand transition
  }
}

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
    await openMobileMenuIfNeeded(page);
    const link = page.locator('header a[href="/ro/atelier"]:visible').first();
    await expect(link).toBeVisible();
    await expect(link).toContainText('Atelier');
  });

  test('EN Navbar has "Workshop" route link pointing to /en/workshop', async ({ page }) => {
    await page.goto('/en');
    await openMobileMenuIfNeeded(page);
    const link = page.locator('header a[href="/en/workshop"]:visible').first();
    await expect(link).toBeVisible();
    await expect(link).toContainText('Workshop');
  });

  test('Click Atelier on /ro navigates to /ro/atelier', async ({ page }) => {
    await page.goto('/ro');
    await openMobileMenuIfNeeded(page);
    await page.locator('header a[href="/ro/atelier"]:visible').first().click();
    await page.waitForURL('**/ro/atelier');
    expect(new URL(page.url()).pathname).toBe('/ro/atelier');
  });

  test('Atelier link has active state on /ro/atelier (oak-warm after scrolling past dark hero)', async ({ page }) => {
    await page.goto('/ro/atelier');
    // FIX 1 (2026-05-28): on /atelier, Navbar passes darkHero={true} so at
    // scroll 0 the active color is copper (--copper, on-dark accent). Once
    // scrolled past 100px the Navbar gets its own cream bg and the active
    // color reverts to oak-warm. We scroll first to assert the default
    // active-state mechanism (consistent across all routes).
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(400); // wait for 0.3s color transition
    await openMobileMenuIfNeeded(page);
    const link = page.locator('header a[href="/ro/atelier"]:visible').first();
    await expect(link).toBeVisible();
    // Active color after scroll is var(--oak-warm) = #8B5E3C → rgb(139, 94, 60)
    const color = await link.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(139, 94, 60)');
  });

  test('Atelier link is copper at scroll 0 on /ro/atelier (FIX 1 darkHero adaptive)', async ({ page, viewport }) => {
    // Mobile viewport: mobile menu is its own cream-bg context — active link
    // stays oak-warm there regardless of darkHero. This test targets the
    // VISIBLE desktop/tablet navbar where darkHero adapts.
    test.skip((viewport?.width ?? 0) < 768, 'darkHero adaptive only affects visible nav, not opened mobile menu');
    await page.goto('/ro/atelier');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    const link = page.locator('header nav a[href="/ro/atelier"]').first();
    await expect(link).toBeVisible();
    // FIX 1: at scroll 0 on /atelier, navAccent = var(--copper) → rgb(184,115,51)
    const color = await link.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(184, 115, 51)');
  });

  test('Navbar no longer has homepage #atelier anchor (D1 decision)', async ({ page }) => {
    await page.goto('/ro');
    const anchorLink = page.locator('header a[href="/ro#atelier"]');
    await expect(anchorLink).toHaveCount(0);
  });
});

test.describe('Navbar Tocătoare link (2026-05-23 — /tocatoare route)', () => {
  test('RO Navbar has "Tocătoare" route link pointing to /ro/tocatoare', async ({ page }) => {
    await page.goto('/ro');
    await openMobileMenuIfNeeded(page);
    const link = page.locator('header a[href="/ro/tocatoare"]:visible').first();
    await expect(link).toBeVisible();
    await expect(link).toContainText('Tocătoare');
  });

  test('EN Navbar has "Cutting Boards" route link pointing to /en/cutting-boards', async ({ page }) => {
    await page.goto('/en');
    await openMobileMenuIfNeeded(page);
    const link = page.locator('header a[href="/en/cutting-boards"]:visible').first();
    await expect(link).toBeVisible();
    await expect(link).toContainText('Cutting Boards');
  });

  test('Click Tocătoare on /ro navigates to /ro/tocatoare', async ({ page }) => {
    await page.goto('/ro');
    await openMobileMenuIfNeeded(page);
    await page.locator('header a[href="/ro/tocatoare"]:visible').first().click();
    await page.waitForURL('**/ro/tocatoare');
    expect(new URL(page.url()).pathname).toBe('/ro/tocatoare');
  });

  test('Navbar no longer has dead #tocatoare anchor (D5 decision)', async ({ page }) => {
    await page.goto('/ro');
    const anchorLink = page.locator('header a[href="/ro#tocatoare"]');
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
