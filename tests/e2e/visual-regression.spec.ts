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
  { path: '/ro/login',             name: 'login-ro' },
  { path: '/en/login',             name: 'login-en' },
  { path: '/ro/inregistrare',      name: 'register-ro' },
  { path: '/en/register',          name: 'register-en' },
  { path: '/ro/parola-uitata',     name: 'forgot-password-ro' },
  { path: '/en/forgot-password',   name: 'forgot-password-en' },
  { path: '/ro/reset-parola',      name: 'reset-password-ro' },
  { path: '/en/reset-password',    name: 'reset-password-en' },
];

test.describe('Visual regression', () => {
  // 2026-08-10: 60s (was default 30s). The homepage now carries 5 photos +
  // a video poster; against the dev server every run cold-starts the
  // /_next/image optimizer, and first-hit optimization during the fullPage
  // stitch pushed home-{ro,en} past 30s on the tablet project. Verified the
  // captures themselves are stable (0-pixel diff between consecutive shots
  // against a prod build) — this is purely dev-server image-pipeline latency.
  test.setTimeout(60_000);
  for (const { path, name } of PAGES) {
    test(`${name} screenshot matches baseline`, async ({ page }) => {
      // Ambient <video> loops (CraftVideoTease) would capture a random frame
      // per run. Stub play() so videos never start — the static poster is the
      // only state screenshots ever see. Deterministic across runs.
      await page.addInitScript(() => {
        HTMLMediaElement.prototype.play = () => Promise.resolve();
      });
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
        // 2026-08-10: the pre-scroll now also triggers lazy stock photos
        // (tools + place). Wait for their decode or the capture races the
        // dev-server image optimizer and flakes (~3% diff on the place
        // images). Same decode-race pattern as scripts/design-qa-capture.mjs
        // — the hard timeout is mandatory (hidden lazy images never settle).
        await page
          .evaluate(() =>
            Promise.race([
              Promise.all(
                Array.from(document.images).map((img) =>
                  img.complete ? Promise.resolve() : img.decode().catch(() => {}),
                ),
              ),
              new Promise((resolve) => setTimeout(resolve, 6000)),
            ]),
          )
          .catch(() => {});
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
