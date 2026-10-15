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

  test('Stripe webhook is dormant: POST answers 410 without touching Stripe', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', { data: '{}', headers: { 'content-type': 'application/json' } });
    expect(res.status()).toBe(410);
  });

  test('Terms mention cash on delivery as the only payment method', async ({ page }) => {
    await page.goto('/ro/termeni');
    await expect(page.locator('main')).toContainText('exclusiv ramburs');
    await page.goto('/en/terms');
    await expect(page.locator('main')).toContainText('exclusively by cash on delivery');
  });
});
