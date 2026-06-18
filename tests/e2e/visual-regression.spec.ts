import { test, expect, maskCanvas } from './fixtures';

const PAGES = [
  { path: '/ro',                   name: 'home-ro' },
  { path: '/en',                   name: 'home-en' },
  { path: '/ro/despre',            name: 'despre-ro' },
  { path: '/en/about',             name: 'despre-en' },
  { path: '/ro/atelier',           name: 'atelier-ro' },
  { path: '/en/workshop',          name: 'atelier-en' },
  { path: '/ro/tocatoare',         name: 'tocatoare-ro' },
  { path: '/en/cutting-boards',    name: 'tocatoare-en' },
  { path: '/ro/contact',           name: 'contact-ro' },
  { path: '/en/contact',           name: 'contact-en' },
  { path: '/ro/termeni',           name: 'termeni-ro' },
  { path: '/en/terms',             name: 'termeni-en' },
  { path: '/ro/confidentialitate', name: 'confidentialitate-ro' },
  { path: '/en/privacy',           name: 'confidentialitate-en' },
  { path: '/ro/retur',             name: 'retur-ro' },
  { path: '/en/returns',           name: 'retur-en' },
];

test.describe('Visual regression', () => {
  for (const { path, name } of PAGES) {
    test(`${name} screenshot matches baseline`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      // Atelier has 10 Reveal sections — fullPage screenshot scrolls during
      // capture, triggering whileInView mid-stitch. Pre-scroll once with
      // `once: true` reveals so they're all settled before capture. Homepage
      // uses GSAP ScrollTrigger which re-fires on every scroll position,
      // so we leave it alone (its sections animate but stabilize naturally).
      if (name.startsWith('atelier-')) {
        await page.evaluate(async () => {
          const step = 600;
          const h = document.body.scrollHeight;
          for (let y = 0; y <= h; y += step) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 80));
          }
          window.scrollTo(0, 0);
        });
      }
      await page.waitForTimeout(1500);
      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage: true,
        mask: maskCanvas(page),
        timeout: 30_000,
      });
    });
  }
});
