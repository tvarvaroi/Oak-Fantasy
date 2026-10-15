// Design QA capture — full-site screenshot matrix (see ~/.claude/skills/design-qa).
// Runs against a PRODUCTION build (`next build` + `PORT=3001 next start`).
// Usage: BASE_URL=http://localhost:3001 OUT_DIR=<dir> node scripts/design-qa-capture.mjs
//
// Captures every public page (RO+EN) at 4 viewports, plus stateful scenarios:
// navbar menu open, cart drawer, cart empty/full, checkout steps + validation
// errors, contact form errors, PDP engraving toggle, 404, reduced-motion runs.
// Every capture is try/caught — one broken page never kills the run.

import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const OUT = process.env.OUT_DIR || 'design-qa-shots';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet-p', width: 768, height: 1024 },
  { name: 'tablet-l', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
];

// route key -> [ro slug, en slug]; '' = homepage
const STATIC_PAGES = [
  ['home', '', ''],
  ['despre', 'despre', 'about'],
  ['atelier', 'atelier', 'workshop'],
  ['contact', 'contact', 'contact'],
  ['tocatoare', 'tocatoare', 'cutting-boards'],
  ['cos-empty', 'cos', 'cart'],
  ['termeni', 'termeni', 'terms'],
  ['confidentialitate', 'confidentialitate', 'privacy'],
  ['retur', 'retur', 'returns'],
  ['login', 'login', 'login'],
  ['inregistrare', 'inregistrare', 'register'],
  ['parola-uitata', 'parola-uitata', 'forgot-password'],
];

const failures = [];
let captured = 0;

function log(msg) {
  console.log(`[design-qa] ${msg}`);
}

async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForTimeout(600);
}

// Scroll through the page to trigger whileInView / IntersectionObserver
// animations AND native lazy-image loads, then wait for every image to finish
// decoding before returning to top. Without the decode wait, the fullPage
// stitch captures lazy images mid-flight as blank rectangles — a false
// finding (Batch A root cause, 2026-07-05).
async function primeScroll(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 160));
    }
  });
  // NOTE: decode() on a hidden lazy image (display:none — e.g. the other
  // breakpoint's layout) never settles in Chromium, because the lazy-load
  // algorithm never starts for non-intersecting images. Race with a hard
  // timeout so one hidden <img> can't hang the whole capture run.
  await page
    .evaluate(() =>
      Promise.race([
        Promise.all(
          [...document.images].map((img) =>
            img.complete ? Promise.resolve() : img.decode().catch(() => {}),
          ),
        ),
        new Promise((resolve) => setTimeout(resolve, 6000)),
      ]),
    )
    .catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
}

async function shot(page, group, name, opts = {}) {
  const dir = join(OUT, group);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: opts.fullPage !== false, ...opts.shotOpts });
  captured++;
  log(`✓ ${group}/${name}.png`);
}

async function tryStep(label, fn) {
  try {
    await fn();
  } catch (err) {
    failures.push({ label, error: String(err).slice(0, 300) });
    log(`✗ FAILED ${label}: ${String(err).slice(0, 160)}`);
  }
}

async function newPage(browser, vp, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: opts.reducedMotion ? 'reduce' : 'no-preference',
    locale: 'ro-RO',
  });
  const page = await ctx.newPage();
  return { ctx, page };
}

async function main() {
  const browser = await chromium.launch();

  // ── discover product slugs from the sitemap ──────────────────────────────
  let productSlugs = [];
  await tryStep('sitemap product discovery', async () => {
    const { page, ctx } = await newPage(browser, VIEWPORTS[3]);
    const res = await page.goto(`${BASE}/sitemap.xml`);
    const xml = await res.text();
    productSlugs = [...xml.matchAll(/\/ro\/tocatoare\/([a-z0-9-]+)/g)]
      .map((m) => m[1])
      .filter((s, i, a) => a.indexOf(s) === i);
    log(`products in sitemap: ${productSlugs.join(', ') || 'NONE'}`);
    await ctx.close();
  });

  // ── 1. static pages, RO+EN × 4 viewports ─────────────────────────────────
  for (const vp of VIEWPORTS) {
    for (const [key, roSlug, enSlug] of STATIC_PAGES) {
      for (const [locale, slug] of [['ro', roSlug], ['en', enSlug]]) {
        await tryStep(`${key}-${locale}-${vp.name}`, async () => {
          const { page, ctx } = await newPage(browser, vp);
          await page.goto(`${BASE}/${locale}${slug ? `/${slug}` : ''}`);
          await settle(page);
          await primeScroll(page);
          await shot(page, 'pages', `${key}--${locale}--${vp.name}`);
          await ctx.close();
        });
      }
    }
    // 404 (RO only — same layout both locales)
    await tryStep(`404-${vp.name}`, async () => {
      const { page, ctx } = await newPage(browser, vp);
      await page.goto(`${BASE}/ro/pagina-inexistenta`);
      await settle(page);
      await shot(page, 'pages', `404--ro--${vp.name}`);
      await ctx.close();
    });
  }

  // ── 2. PDP: first 3 products, RO × 4 viewports + EN spot check ───────────
  const pdpSlugs = productSlugs.slice(0, 3);
  for (const [i, slug] of pdpSlugs.entries()) {
    const vps = i === 0 ? VIEWPORTS : [VIEWPORTS[0], VIEWPORTS[3]];
    for (const vp of vps) {
      await tryStep(`pdp-${slug}-${vp.name}`, async () => {
        const { page, ctx } = await newPage(browser, vp);
        await page.goto(`${BASE}/ro/tocatoare/${slug}`);
        await settle(page);
        await primeScroll(page);
        await shot(page, 'pdp', `pdp-${i + 1}-${slug}--ro--${vp.name}`);
        await ctx.close();
      });
    }
  }
  if (pdpSlugs[0]) {
    await tryStep('pdp-en + engraving toggle', async () => {
      const { page, ctx } = await newPage(browser, VIEWPORTS[0]);
      await page.goto(`${BASE}/en/cutting-boards/${pdpSlugs[0]}`);
      await settle(page);
      await primeScroll(page);
      await shot(page, 'pdp', `pdp-1-${pdpSlugs[0]}--en--mobile`);
      await ctx.close();
      // engraving toggle ON (RO, mobile + desktop)
      for (const vp of [VIEWPORTS[0], VIEWPORTS[3]]) {
        const { page: p2, ctx: c2 } = await newPage(browser, vp);
        await p2.goto(`${BASE}/ro/tocatoare/${pdpSlugs[0]}`);
        await settle(p2);
        const sw = p2.getByRole('switch').first();
        if (await sw.count()) {
          await sw.click();
          await p2.waitForTimeout(500);
          await shot(p2, 'pdp', `pdp-1-engraving-on--ro--${vp.name}`);
        }
        await c2.close();
      }
    });
  }

  // ── 3. navbar states ──────────────────────────────────────────────────────
  // drawer open (hamburger exists < lg/1024). The hamburger's aria-label is
  // localized ("Meniu"/"Menu"), so select by aria-expanded like the e2e
  // helper does; dispatchEvent bypasses the fixed-position "outside the
  // viewport" click check on mobile emulation (2026-10-15 fix).
  for (const vp of [VIEWPORTS[0], VIEWPORTS[1]]) {
    await tryStep(`navbar-menu-open-${vp.name}`, async () => {
      const { page, ctx } = await newPage(browser, vp);
      await page.goto(`${BASE}/ro`);
      await settle(page);
      await page.locator('header button[aria-expanded]').dispatchEvent('click');
      await page.waitForTimeout(600);
      await shot(page, 'navbar', `menu-open--ro--${vp.name}`, { fullPage: false });
      await ctx.close();
    });
  }
  // navbar closeup at every viewport (viewport-height shot = above the fold)
  for (const vp of VIEWPORTS) {
    await tryStep(`navbar-fold-${vp.name}`, async () => {
      const { page, ctx } = await newPage(browser, vp);
      await page.goto(`${BASE}/ro/tocatoare`);
      await settle(page);
      await shot(page, 'navbar', `fold-tocatoare--ro--${vp.name}`, { fullPage: false });
      await ctx.close();
    });
  }
  // scrolled state (compact navbar)
  await tryStep('navbar-scrolled', async () => {
    for (const vp of [VIEWPORTS[0], VIEWPORTS[1], VIEWPORTS[3]]) {
      const { page, ctx } = await newPage(browser, vp);
      await page.goto(`${BASE}/ro`);
      await settle(page);
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.waitForTimeout(700);
      await shot(page, 'navbar', `scrolled--ro--${vp.name}`, { fullPage: false });
      await ctx.close();
    }
  });
  // cart badge 99 (localStorage inject)
  await tryStep('navbar-badge-99', async () => {
    const { page, ctx } = await newPage(browser, VIEWPORTS[0]);
    await page.goto(`${BASE}/ro`);
    await page.evaluate(() => {
      localStorage.setItem('oak-cart', JSON.stringify({
        state: { items: [{ lineId: 'x', productId: 'x', slug: 'x', name: 'Tocător test', priceBani: 18000, quantity: 99, imageUrl: null, engravingText: null }] },
        version: 0,
      }));
    });
    await page.reload();
    await settle(page);
    await shot(page, 'navbar', 'badge-99--ro--mobile', { fullPage: false });
    await ctx.close();
  });

  // ── 4. cart + checkout flow (needs a product) ─────────────────────────────
  if (pdpSlugs[0]) {
    for (const vp of [VIEWPORTS[0], VIEWPORTS[3]]) {
      await tryStep(`cart-flow-${vp.name}`, async () => {
        const { page, ctx } = await newPage(browser, vp);
        // add to cart from PDP → drawer opens
        await page.goto(`${BASE}/ro/tocatoare/${pdpSlugs[0]}`);
        await settle(page);
        const addBtn = page.getByRole('button', { name: 'Adaugă în coș' });
        if (!(await addBtn.count())) {
          log(`add-to-cart button absent on ${pdpSlugs[0]} (out of stock?) — skipping flow at ${vp.name}`);
          await ctx.close();
          return;
        }
        await addBtn.click();
        await page.waitForTimeout(700);
        await shot(page, 'cart', `drawer-open--ro--${vp.name}`, { fullPage: false });

        // /cos with item
        await page.keyboard.press('Escape');
        await page.goto(`${BASE}/ro/cos`);
        await settle(page);
        await shot(page, 'cart', `cos-full--ro--${vp.name}`);

        // checkout step 1
        await page.goto(`${BASE}/ro/checkout`);
        await settle(page);
        await shot(page, 'checkout', `step1--ro--${vp.name}`);

        // step 1 validation errors
        await page.getByRole('button', { name: 'Continuă' }).click();
        await page.waitForTimeout(500);
        await shot(page, 'checkout', `step1-errors--ro--${vp.name}`);

        // fill step 1 → step 2
        await page.fill('#co-email', 'design-qa@example.com');
        await page.fill('#co-name', 'Test Design QA');
        await page.fill('#co-phone', '0712345678');
        await page.fill('#co-street', 'Str. Stejarului 12');
        await page.fill('#co-city', 'Cluj-Napoca');
        await page.selectOption('#co-county', { label: 'Cluj' });
        await page.fill('#co-postal', '400001');
        // step 1 → step 2 = Rezumat (2026-10-15: ramburs only, the payment
        // step is gone; the review step carries the cash-on-delivery panel).
        // DO NOT place the order.
        await page.getByRole('button', { name: 'Continuă' }).click();
        await page.waitForTimeout(700);
        await shot(page, 'checkout', `step2-review--ro--${vp.name}`);

        // terms validation error (order is NOT placed — checkbox unchecked)
        await page.getByRole('button', { name: 'Plasează comanda' }).click();
        await page.waitForTimeout(500);
        await shot(page, 'checkout', `step2-terms-error--ro--${vp.name}`);
        await ctx.close();
      });
    }
  }

  // multumim guard (fake UUID → whatever renders; no real order created)
  await tryStep('multumim-fake-uuid', async () => {
    const { page, ctx } = await newPage(browser, VIEWPORTS[0]);
    await page.goto(`${BASE}/ro/multumim/00000000-0000-0000-0000-000000000000`);
    await settle(page);
    await shot(page, 'checkout', 'multumim-fake-uuid--ro--mobile');
    await ctx.close();
  });

  // ── 5. contact form errors ────────────────────────────────────────────────
  for (const vp of [VIEWPORTS[0], VIEWPORTS[3]]) {
    await tryStep(`contact-errors-${vp.name}`, async () => {
      const { page, ctx } = await newPage(browser, vp);
      await page.goto(`${BASE}/ro/contact`);
      await settle(page);
      await primeScroll(page);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(600);
      await shot(page, 'forms', `contact-errors--ro--${vp.name}`);
      await ctx.close();
    });
  }

  // ── 6. reduced-motion runs — WITH scroll priming. RM verifies content is
  // visible without animations; it does not disable lazy loading, so a
  // no-scroll capture would show below-fold images blank (false finding).
  // Animation defects still surface: with RM emulated, anything stuck at
  // opacity 0 after priming is a real bug.
  for (const [key, slug] of [['home', ''], ['atelier', 'atelier'], ['tocatoare', 'tocatoare'], ['despre', 'despre']]) {
    for (const vp of [VIEWPORTS[0], VIEWPORTS[3]]) {
      await tryStep(`reduced-motion-${key}-${vp.name}`, async () => {
        const { page, ctx } = await newPage(browser, vp, { reducedMotion: true });
        await page.goto(`${BASE}/ro${slug ? `/${slug}` : ''}`);
        await settle(page);
        await primeScroll(page);
        await shot(page, 'reduced-motion', `${key}-rm--ro--${vp.name}`);
        await ctx.close();
      });
    }
  }

  await browser.close();
  log(`DONE: ${captured} screenshots, ${failures.length} failures`);
  if (failures.length) {
    console.log(JSON.stringify(failures, null, 2));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
