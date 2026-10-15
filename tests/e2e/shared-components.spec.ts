import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

// Below lg (1024px — 2026-07-03 Navbar redesign) the desktop nav is hidden and
// the nav links live in a side drawer opened by the hamburger. The drawer is
// an <aside> SIBLING of <header> (not inside it), so link locators must look
// in both: `navLink(page, href)` below. The visibility/click tests need the
// drawer open on mobile AND tablet.
async function openMobileMenuIfNeeded(page: Page) {
  await page.waitForLoadState('networkidle');
  // Hamburger is the only header button with aria-expanded.
  const toggle = page.locator('header button[aria-expanded]');
  if (await toggle.isVisible()) {
    // On Playwright's mobile-emulation projects, click() reports the
    // fixed-position hamburger as "outside the viewport" even after scroll.
    // Dispatching the click event directly on the DOM node bypasses the
    // viewport-coordinate check entirely and triggers the React onClick.
    await toggle.dispatchEvent('click');
    await page.waitForTimeout(450); // drawer has a 320ms slide transition
  }
}

/** Visible primary-nav link for `href`, whether in the desktop nav or the drawer. */
function navLink(page: Page, href: string) {
  return page.locator(`header a[href="${href}"]:visible, aside a[href="${href}"]:visible`).first();
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

test.describe('Navbar "Acasă" link (2026-10-15 — explicit home as first link)', () => {
  test('RO primary nav starts with Acasă → /ro, then Tocătoare', async ({ page }) => {
    await page.goto('/ro/despre');
    await openMobileMenuIfNeeded(page);
    const links = page.locator('header nav a:visible, aside nav a:visible');
    await expect(links.first()).toContainText('Acasă');
    await expect(links.first()).toHaveAttribute('href', '/ro');
    await expect(links.nth(1)).toContainText('Tocătoare');
    // No "Cadouri" yet — the landing does not exist.
    await expect(page.locator('header a[href*="personalizate"]')).toHaveCount(0);
  });

  test('EN primary nav starts with Home → /en', async ({ page }) => {
    await page.goto('/en/about');
    await openMobileMenuIfNeeded(page);
    const first = page.locator('header nav a:visible, aside nav a:visible').first();
    await expect(first).toContainText('Home');
    await expect(first).toHaveAttribute('href', '/en');
  });

  test('Footer account column links to login + register (no "În curând")', async ({ page }) => {
    await page.goto('/ro');
    const footer = page.locator('footer');
    await expect(footer.locator('a[href="/ro/login"]')).toHaveCount(1);
    await expect(footer.locator('a[href="/ro/inregistrare"]')).toHaveCount(1);
    await expect(footer).not.toContainText('În curând');
    await expect(footer.locator('a[href="/ro"]')).toHaveCount(1);
  });
});

test.describe('Navbar Atelier link (2026-05-27 — /atelier route)', () => {
  test('RO Navbar has "Atelier" route link pointing to /ro/atelier', async ({ page }) => {
    await page.goto('/ro');
    await openMobileMenuIfNeeded(page);
    const link = navLink(page, '/ro/atelier');
    await expect(link).toBeVisible();
    await expect(link).toContainText('Atelier');
  });

  test('EN Navbar has "Workshop" route link pointing to /en/workshop', async ({ page }) => {
    await page.goto('/en');
    await openMobileMenuIfNeeded(page);
    const link = navLink(page, '/en/workshop');
    await expect(link).toBeVisible();
    await expect(link).toContainText('Workshop');
  });

  test('Click Atelier on /ro navigates to /ro/atelier', async ({ page }) => {
    await page.goto('/ro');
    await openMobileMenuIfNeeded(page);
    await navLink(page, '/ro/atelier').dispatchEvent('click');
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
    const link = navLink(page, '/ro/atelier');
    await expect(link).toBeVisible();
    // Active color after scroll is var(--oak-warm) = #8B5E3C → rgb(139, 94, 60)
    const color = await link.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(139, 94, 60)');
  });

  test('Atelier link is copper at scroll 0 on /ro/atelier (FIX 1 darkHero adaptive)', async ({ page, viewport }) => {
    // Mobile/tablet viewports: the menu drawer is its own cream-bg context —
    // active link stays oak-warm there regardless of darkHero. This test
    // targets the VISIBLE desktop navbar (lg+, 2026-07-03 redesign) where
    // darkHero adapts.
    test.skip((viewport?.width ?? 0) < 1024, 'darkHero adaptive only affects the visible desktop nav, not the menu drawer');
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
    const link = navLink(page, '/ro/tocatoare');
    await expect(link).toBeVisible();
    await expect(link).toContainText('Tocătoare');
  });

  test('EN Navbar has "Cutting Boards" route link pointing to /en/cutting-boards', async ({ page }) => {
    await page.goto('/en');
    await openMobileMenuIfNeeded(page);
    const link = navLink(page, '/en/cutting-boards');
    await expect(link).toBeVisible();
    await expect(link).toContainText('Cutting Boards');
  });

  test('Click Tocătoare on /ro navigates to /ro/tocatoare', async ({ page }) => {
    await page.goto('/ro');
    await openMobileMenuIfNeeded(page);
    await navLink(page, '/ro/tocatoare').dispatchEvent('click');
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

  test('Footer logo coin renders the brand SVG', async ({ page }) => {
    await page.goto('/ro');
    const logo = page.locator('footer img[alt*="Oak Fantasy logo"]').first();
    await expect(logo).toBeVisible();
    const src = await logo.getAttribute('src');
    // 2026-05-21 decision: the Footer coin uses the SVG brand file.
    expect(src).toContain('3D_Cutting_Board_Model_Design');
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
