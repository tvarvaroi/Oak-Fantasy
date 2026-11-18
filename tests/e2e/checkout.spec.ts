import { test, expect, type Page } from '@playwright/test';

// Checkout — ramburs only (2026-10-15 founder decision, card payments dormant).
// Runs against the dev server with the live catalog; it never places an order
// (the terms checkbox stays unchecked), so no DB writes.
//
// Not using ./fixtures: the reduced-motion emulation there keeps the cart
// drawer's framer-motion state in flux for this flow; plain Playwright is enough.

async function addFirstProductToCart(page: Page, locale: 'ro' | 'en') {
  await page.goto(locale === 'ro' ? '/ro/tocatoare' : '/en/cutting-boards');
  const first = page.locator('[data-product] a[href*="/tocatoare/"], [data-product] a[href*="/cutting-boards/"]').first();
  test.skip((await first.count()) === 0, 'No active products on this DB — skipping checkout flow');
  await first.click();
  await page.waitForURL(/\/(tocatoare|cutting-boards)\/[a-z0-9-]+$/);
  const add = page.getByRole('button', { name: locale === 'ro' ? 'Adaugă în coș' : 'Add to cart' });
  test.skip((await add.count()) === 0, 'First product is out of stock — skipping checkout flow');
  await add.click();
  await page.waitForTimeout(600);
  await page.keyboard.press('Escape');
}

// First catalogue product whose page offers engraving (the switch). Scans the
// live catalogue instead of hard-coding a slug, so the legally required notice
// stays tested when products change; skips only if NO product is engravable.
async function openEngravablePdp(page: Page, locale: 'ro' | 'en', toggle: string): Promise<boolean> {
  await page.goto(locale === 'ro' ? '/ro/tocatoare' : '/en/cutting-boards');
  const hrefs = await page
    .locator('[data-product] a[href*="/tocatoare/"], [data-product] a[href*="/cutting-boards/"]')
    .evaluateAll((els) => Array.from(new Set(els.map((e) => e.getAttribute('href') ?? ''))).filter(Boolean));
  for (const href of hrefs) {
    await page.goto(href);
    if ((await page.getByRole('switch', { name: toggle }).count()) > 0) return true;
  }
  return false;
}

async function fillShipping(page: Page) {
  await page.fill('#co-email', 'e2e-checkout@example.com');
  await page.fill('#co-name', 'Test E2E Ramburs');
  await page.fill('#co-phone', '0712345678');
  await page.fill('#co-street', 'Str. Stejarului 12');
  await page.fill('#co-city', 'Arad');
  await page.selectOption('#co-county', { label: 'Arad' });
  await page.fill('#co-postal', '310001');
}

test.describe('Checkout — ramburs only', () => {
  // Dev server cold-compiles PDP + /checkout on the first project; 30s is not
  // enough on the mobile run (same reason visual-regression uses 60s).
  test.setTimeout(90_000);

  test('RO: 2 steps (Livrare · Rezumat), no payment choice, cash-on-delivery panel, terms gate', async ({ page }) => {
    await addFirstProductToCart(page, 'ro');
    await page.goto('/ro/checkout');
    await expect(page.locator('h1')).toContainText('Finalizare comandă');

    // Step indicator: exactly 2 steps, and none of them is "Plată".
    const steps = page.locator('ol li');
    await expect(steps).toHaveCount(2);
    await expect(page.locator('ol')).not.toContainText('Plată');

    // Step 1 → Rezumat directly.
    await fillShipping(page);
    await page.getByRole('button', { name: 'Continuă' }).click();
    await expect(page.locator('h2')).toContainText('Rezumat comandă');

    // No card/ramburs radio anywhere; the info panel replaces the choice.
    await expect(page.locator('input[type="radio"]')).toHaveCount(0);
    const cod = page.getByTestId('cod-info');
    await expect(cod).toBeVisible();
    await expect(cod).toContainText('Ramburs la livrare');
    await expect(cod).toContainText('Plătești curierului, în numerar');
    await expect(page.locator('main')).not.toContainText('Card bancar');

    // Lead time moved into the review step.
    await expect(page.locator('main')).toContainText('5–10 zile lucrătoare');

    // Terms gate: no order without the checkbox (nothing is written to the DB).
    await page.getByRole('button', { name: 'Plasează comanda' }).click();
    await expect(page.locator('main')).toContainText('Trebuie să accepți termenii');
    expect(new URL(page.url()).pathname).toBe('/ro/checkout');
  });

  test('EN: Shipping · Review, cash on delivery panel', async ({ page }) => {
    await addFirstProductToCart(page, 'en');
    await page.goto('/en/checkout');
    await expect(page.locator('ol li')).toHaveCount(2);
    await expect(page.locator('ol')).not.toContainText('Payment');
    await fillShipping(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    const cod = page.getByTestId('cod-info');
    await expect(cod).toContainText('Cash on delivery');
    await expect(cod).toContainText('pay the courier in cash');
    await expect(page.locator('input[type="radio"]')).toHaveCount(0);
  });

  // 2026-11-19: the art. 16 lit. c exception only holds if the customer is
  // told before ordering — the notice must sit next to the terms checkbox
  // whenever the cart holds an engraved line, and only then.
  for (const locale of ['ro', 'en'] as const) {
    test(`${locale.toUpperCase()}: engraved item → no-withdrawal notice next to the terms checkbox`, async ({ page }) => {
      const L = {
        ro: {
          toggle: 'Adaugă gravare personalizată',
          placeholder: 'Textul gravării (ex: un nume, o dată)',
          add: 'Adaugă în coș',
          cont: 'Continuă',
          notice: 'Produsele personalizate (gravate) nu beneficiază de dreptul de retragere de 14 zile.',
          link: 'Detalii în politica de retur',
          href: '/ro/retur#exceptions',
          privacyHref: '/ro/confidentialitate',
        },
        en: {
          toggle: 'Add custom engraving',
          placeholder: 'Engraving text (e.g. a name, a date)',
          add: 'Add to cart',
          cont: 'Continue',
          notice: 'Personalised (engraved) products are not covered by the 14-day right of withdrawal.',
          link: 'Details in our returns policy',
          href: '/en/returns#exceptions',
          privacyHref: '/en/privacy',
        },
      }[locale];

      const found = await openEngravablePdp(page, locale, L.toggle);
      test.skip(!found, 'No engravable product in the catalogue');
      const toggle = page.getByRole('switch', { name: L.toggle });
      const add = page.getByRole('button', { name: L.add });
      test.skip((await add.count()) === 0, 'Engravable product is out of stock');
      await toggle.click();
      await page.getByPlaceholder(L.placeholder).fill('Pentru Ana');
      await add.click();
      await page.waitForTimeout(600);
      await page.keyboard.press('Escape');

      await page.goto(`/${locale}/checkout`);
      await fillShipping(page);
      await page.getByRole('button', { name: L.cont }).click();

      const notice = page.getByTestId('engraving-withdrawal-notice');
      await expect(notice).toBeVisible();
      await expect(notice).toContainText(L.notice);
      await expect(notice.getByRole('link', { name: L.link })).toHaveAttribute('href', L.href);
      await expect(page.getByTestId('checkout-privacy-note').getByRole('link')).toHaveAttribute('href', L.privacyHref);
    });
  }

  test('RO: no engraving in the cart → no withdrawal notice, privacy note still there', async ({ page }) => {
    await addFirstProductToCart(page, 'ro');
    await page.goto('/ro/checkout');
    await fillShipping(page);
    await page.getByRole('button', { name: 'Continuă' }).click();
    await expect(page.locator('h2')).toContainText('Rezumat comandă');
    await expect(page.getByTestId('engraving-withdrawal-notice')).toHaveCount(0);
    await expect(page.getByTestId('checkout-privacy-note')).toBeVisible();
  });

  test('Stripe webhook is dormant: POST answers 410 without touching Stripe', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', { data: '{}', headers: { 'content-type': 'application/json' } });
    expect(res.status()).toBe(410);
  });

  test('Terms mention cash on delivery as the only payment method', async ({ page }) => {
    await page.goto('/ro/termeni');
    await expect(page.locator('main')).toContainText('exclusiv ramburs');
    await page.goto('/en/terms');
    await expect(page.locator('main')).toContainText('Payment is cash on delivery only');
  });
});
