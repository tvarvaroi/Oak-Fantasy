import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

// /la-comanda · /custom-orders (2026-11-18) + its navigation entry points.
// These tests NEVER submit a valid slip: a real submit writes to the live
// custom_orders table. The happy path (DB row, admin, delete) lives in
// scripts/smoke-custom-orders.mjs, which cleans up after itself.

const SITE = 'https://oakfantasy.ro';

/**
 * Primary-nav links from ONE container: the desktop <header> nav from lg up,
 * otherwise the drawer. (The drawer <aside> keeps an inline display:flex, so on
 * desktop it is still in the layout off-screen and would double the list.)
 */
async function primaryNavLinks(page: Page) {
  const desktop = page.locator('header nav');
  return (await desktop.isVisible()) ? desktop.locator('a') : page.locator('aside nav a');
}

async function openMobileMenuIfNeeded(page: Page) {
  await page.waitForLoadState('networkidle');
  const toggle = page.locator('header button[aria-expanded]');
  if (await toggle.isVisible()) {
    await toggle.dispatchEvent('click');
    await page.waitForTimeout(450);
  }
}

/** Server actions POST with a `next-action` header — none may fire on invalid input. */
function trackServerActions(page: Page) {
  const calls: string[] = [];
  page.on('request', (req) => {
    if (req.method() === 'POST' && req.headers()['next-action']) calls.push(req.url());
  });
  return calls;
}

test.describe('/la-comanda page', () => {
  test('RO: single H1, title + description, canonical + hreflang', async ({ page }) => {
    await page.goto('/ro/la-comanda');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText('Ai o idee?');
    await expect(page.locator('h1')).toContainText('în lemn.');
    await expect(page).toHaveTitle(/Tocătoare personalizate și lucrări din lemn la comandă/);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description ?? '').toMatch(/vestul României/);
    expect((description ?? '').length).toBeLessThanOrEqual(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/ro/la-comanda`);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', `${SITE}/en/custom-orders`);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', `${SITE}/ro/la-comanda`);
  });

  test('EN: renders in English, no Romanian diacritics', async ({ page }) => {
    await page.goto('/en/custom-orders');
    await expect(page.locator('h1')).toContainText('Have an idea?');
    await expect(page).toHaveTitle(/Custom Wooden Pieces/);
    const text = await page.evaluate(() => document.body.innerText);
    expect(text).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });

  test('wrong-locale slugs redirect to the localized URL', async ({ page }) => {
    await page.goto('/en/la-comanda');
    await expect(page).toHaveURL(/\/en\/custom-orders$/);
    await page.goto('/ro/custom-orders');
    await expect(page).toHaveURL(/\/ro\/la-comanda$/);
  });

  test('headings never skip a level', async ({ page }) => {
    await page.goto('/ro/la-comanda');
    const levels = await page.locator('main :is(h1,h2,h3,h4)').evaluateAll((els) =>
      els.map((el) => Number(el.tagName.slice(1))),
    );
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeLessThanOrEqual(levels[i - 1] + 1);
    }
  });

  test('the slip has exactly name, phone, idea — no WhatsApp button, no price, no cart CTA', async ({ page }) => {
    await page.goto('/ro/la-comanda');
    const form = page.getByTestId('custom-order-form');
    // The honeypot sits off-screen at 1px, which Playwright still counts as visible.
    await expect(form.locator('input:visible:not(#co-website), textarea:visible, select:visible')).toHaveCount(3);
    await expect(form.locator('#co-name')).toBeVisible();
    await expect(form.locator('#co-phone')).toHaveAttribute('type', 'tel');
    await expect(form.locator('#co-idea')).toBeVisible();
    // Honeypot exists but is not reachable by keyboard.
    await expect(form.locator('#co-website')).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('main a[href*="wa.me"]')).toHaveCount(0);
    const mainText = await page.locator('main').innerText();
    expect(mainText).not.toMatch(/\bRON\b|lei/i);
    await expect(page.locator('main').getByRole('button', { name: /coș|adaugă/i })).toHaveCount(0);
  });

  test('empty submit shows the three RO errors and sends nothing', async ({ page }) => {
    const calls = trackServerActions(page);
    await page.goto('/ro/la-comanda');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Trimite ideea' }).first().click();
    const form = page.getByTestId('custom-order-form');
    await expect(form.getByText('Scrie-ne numele tău (cel puțin 2 litere).')).toBeVisible();
    await expect(form.getByText('Lasă-ne un număr de telefon, ca să te putem contacta.')).toBeVisible();
    await expect(form.getByText('Spune-ne puțin mai mult despre idee (cel puțin 10 caractere).')).toBeVisible();
    await expect(form.locator('#co-name')).toHaveAttribute('aria-invalid', 'true');
    expect(calls).toHaveLength(0);
  });

  test('invalid phone is rejected client-side (RO + EN copy)', async ({ page }) => {
    const calls = trackServerActions(page);
    await page.goto('/ro/la-comanda');
    await page.waitForLoadState('networkidle');
    await page.fill('#co-name', 'Ana');
    await page.fill('#co-phone', '12345');
    await page.fill('#co-idea', 'Un tocător rotund cu numele nostru.');
    await page.getByTestId('custom-order-form').locator('button[type="submit"]').click();
    await expect(page.getByText('Număr de telefon invalid (ex: 0712 345 678).')).toBeVisible();

    await page.goto('/en/custom-orders');
    await page.waitForLoadState('networkidle');
    await page.fill('#co-name', 'Ana');
    await page.fill('#co-phone', '+44 7700 900123');
    await page.fill('#co-idea', 'A round board with our family name.');
    await page.getByTestId('custom-order-form').locator('button[type="submit"]').click();
    await expect(page.getByText('Please enter a Romanian phone number (e.g. 0712 345 678).')).toBeVisible();
    expect(calls).toHaveLength(0);
  });

  test('idea counter tracks length', async ({ page }) => {
    await page.goto('/ro/la-comanda');
    await page.waitForLoadState('networkidle');
    await page.fill('#co-idea', 'Ceas de perete');
    await expect(page.locator('#co-idea-count')).toHaveText('14 / 2000');
  });

  test('consent + returns notes link to the localized policies', async ({ page }) => {
    await page.goto('/ro/la-comanda');
    const slip = page.locator('#formular');
    await expect(slip.getByRole('link', { name: 'Politica de confidențialitate' })).toHaveAttribute('href', '/ro/confidentialitate');
    await expect(slip.getByRole('link', { name: 'Politica de retur' })).toHaveAttribute('href', '/ro/retur');
    await expect(slip).toContainText('OUG 34/2014, art. 16 lit. c');
    await page.goto('/en/custom-orders');
    const slipEn = page.locator('#formular');
    await expect(slipEn.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', '/en/privacy');
    await expect(slipEn.getByRole('link', { name: 'Returns policy' })).toHaveAttribute('href', '/en/returns');
  });

  test('closing CTA sends the visitor to the slip with the cursor in "Nume"', async ({ page }) => {
    await page.goto('/ro/la-comanda');
    await page.waitForLoadState('networkidle');
    const cta = page.locator('section[aria-labelledby="cta-heading"] a');
    await expect(cta).toHaveAttribute('href', '#formular');
    await cta.dispatchEvent('click');
    await expect(page.locator('#co-name')).toBeFocused();
    await expect(page).toHaveURL(/#formular$/);
  });

  test('steps read: leave the idea here → WhatsApp → we make and ship it', async ({ page }) => {
    await page.goto('/ro/la-comanda');
    const steps = page.locator('section[aria-labelledby="steps-heading"] li h3');
    await expect(steps).toHaveText(['Ne scrii ideea aici', 'Te contactăm pe WhatsApp', 'O lucrăm și ți-o trimitem']);
  });

  test('JSON-LD: WebPage + BreadcrumbList + Service tied to #organization', async ({ page }) => {
    await page.goto('/ro/la-comanda');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const nodes = blocks.map((b) => JSON.parse(b)).flatMap((n) => (n['@graph'] ? n['@graph'] : [n]));
    const crumbs = nodes.find((n) => n['@type'] === 'BreadcrumbList');
    expect(crumbs.itemListElement).toHaveLength(2);
    expect(crumbs.itemListElement[1]).toMatchObject({ position: 2, name: 'La comandă', item: `${SITE}/ro/la-comanda` });
    const webPage = nodes.find((n) => n['@type'] === 'WebPage');
    expect(webPage.publisher['@id']).toBe(`${SITE}/#organization`);
    const service = nodes.find((n) => n['@type'] === 'Service');
    expect(service.provider['@id']).toBe(`${SITE}/#organization`);
    expect(service.offers).toBeUndefined();
  });

  test('sitemap lists both locales with alternates', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).toContain(`${SITE}/ro/la-comanda`);
    expect(xml).toContain(`${SITE}/en/custom-orders`);
  });
});

test.describe('"La comandă" in navigation (2026-11-18)', () => {
  test('RO primary nav: Acasă · Tocătoare · La comandă · Atelier · Despre · Contact', async ({ page }) => {
    await page.goto('/ro');
    await openMobileMenuIfNeeded(page);
    const labels = await (await primaryNavLinks(page)).allInnerTexts();
    expect(labels.map((l) => l.trim())).toEqual(['Acasă', 'Tocătoare', 'La comandă', 'Atelier', 'Despre', 'Contact']);
  });

  test('EN primary nav has "Custom orders" → /en/custom-orders in third place', async ({ page }) => {
    await page.goto('/en');
    await openMobileMenuIfNeeded(page);
    const links = await primaryNavLinks(page);
    await expect(links).toHaveCount(6);
    await expect(links.nth(2)).toHaveText('Custom orders');
    await expect(links.nth(2)).toHaveAttribute('href', '/en/custom-orders');
  });

  test('active state on /ro/la-comanda', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < 1024, 'desktop nav only');
    await page.goto('/ro/la-comanda');
    const link = page.locator('header nav a[href="/ro/la-comanda"]');
    // Active link uses the oak accent (rgb(139, 94, 60)) on a cream hero.
    await expect(link).toHaveCSS('color', 'rgb(139, 94, 60)');
  });

  test('Footer "Navigare" links to the page', async ({ page }) => {
    await page.goto('/ro/atelier');
    await expect(page.locator('footer a[href="/ro/la-comanda"]')).toHaveCount(1);
    await page.goto('/en/workshop');
    await expect(page.locator('footer a[href="/en/custom-orders"]')).toHaveCount(1);
  });

  // `signedIn`: the sign-out control only renders for an authenticated user,
  // and e2e never logs in against the live DB — so we inject exactly what the
  // Navbar renders there (44px icon button below xl, "Sign out" label from xl)
  // into the right cluster before measuring. Verified against a real signed-in
  // session on 2026-11-18 (review finding: 1024px EN had 0px gaps).
  for (const width of [1024, 1280]) {
    for (const locale of ['ro', 'en'] as const) {
      for (const signedIn of [false, true]) {
        test(`desktop nav fits on one line at ${width}px (${locale.toUpperCase()}${signedIn ? ', signed in' : ''})`, async ({ page, viewport }) => {
        test.skip((viewport?.width ?? 0) < 1024, 'desktop project only');
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/${locale}`);
        await page.waitForLoadState('networkidle');
        if (signedIn) {
          await page.evaluate((w) => {
            const right = document.querySelector('header nav')!.nextElementSibling!;
            const stub = document.createElement('span');
            stub.className = 'label-caps text-xs font-caudex whitespace-nowrap';
            stub.style.cssText = 'display:flex;align-items:center;min-height:44px;letter-spacing:0.15em;';
            if (w < 1280) stub.style.minWidth = '44px';
            else stub.textContent = 'Sign out';
            right.insertBefore(stub, right.lastElementChild!.previousElementSibling);
          }, width);
        }
        const metrics = await page.evaluate(() => {
          const header = document.querySelector('header') as HTMLElement;
          const nav = header.querySelector('nav') as HTMLElement;
          const links = Array.from(nav.querySelectorAll('a')).map((a) => {
            const r = a.getBoundingClientRect();
            const lh = parseFloat(getComputedStyle(a).lineHeight) || 20;
            return { text: a.textContent, height: r.height, lineHeight: lh };
          });
          const navBox = nav.getBoundingClientRect();
          const right = nav.nextElementSibling?.getBoundingClientRect();
          const logo = nav.previousElementSibling?.getBoundingClientRect();
          return {
            overflow: header.scrollWidth - header.clientWidth,
            links,
            gapRight: right ? right.left - navBox.right : 999,
            gapLeft: logo ? navBox.left - logo.right : 999,
          };
        });
        expect(metrics.overflow).toBeLessThanOrEqual(0);
        for (const l of metrics.links) {
          expect(l.height, `"${l.text}" wraps`).toBeLessThan(l.lineHeight * 1.6);
        }
        expect(metrics.gapRight).toBeGreaterThanOrEqual(12);
        expect(metrics.gapLeft).toBeGreaterThanOrEqual(12);
        });
      }
    }
  }
});

test.describe('Homepage teaser (2026-11-18)', () => {
  // 2026-11-18: last band before the Footer (moved after NumbersStrip when
  // CraftVideoTease was hidden — keeps a light band between the two darks).
  test('sits between the numbers strip and the footer, links to the page', async ({ page }) => {
    await page.goto('/ro');
    const tease = page.getByTestId('custom-order-tease');
    await expect(tease).toBeVisible();
    await expect(tease.locator('h2')).toHaveText('Nu e în magazin? O putem face.');
    await expect(tease.getByRole('link')).toHaveAttribute('href', '/ro/la-comanda');
    const order = await page.evaluate(() => {
      const t = document.querySelector('[data-testid="custom-order-tease"]');
      return {
        prev: t?.previousElementSibling?.getAttribute('aria-label'),
        next: t?.nextElementSibling?.getAttribute('aria-label'),
      };
    });
    expect(order.prev).toBe('Cifre');
    expect(order.next).toBe('Footer');
  });

  test('EN teaser links to /en/custom-orders', async ({ page }) => {
    await page.goto('/en');
    const tease = page.getByTestId('custom-order-tease');
    await expect(tease.getByRole('link')).toHaveAttribute('href', '/en/custom-orders');
    await expect(tease.locator('h2')).toHaveText('Not in the shop? We can make it.');
  });
});
