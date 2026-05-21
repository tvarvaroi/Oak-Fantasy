import { test, expect, maskCanvas } from './fixtures';

const PAGES = [
  { path: '/ro',         name: 'home-ro' },
  { path: '/en',         name: 'home-en' },
  { path: '/ro/despre',  name: 'despre-ro' },
  { path: '/en/about',   name: 'despre-en' },
];

test.describe('Visual regression', () => {
  for (const { path, name } of PAGES) {
    test(`${name} screenshot matches baseline`, async ({ page }) => {
      await page.goto(path);
      // Wait for fonts, SVG draws, GSAP ScrollTrigger animations to settle.
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage: true,
        mask: maskCanvas(page),
        timeout: 30_000,
      });
    });
  }
});
