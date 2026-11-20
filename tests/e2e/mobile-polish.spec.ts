import { test, expect } from './fixtures';

// 2026-11-19 — old mobile issues from design-qa, fixed together:
// sub-44px targets (catalog filters, cart), product name glued to the price
// at checkout, the closed cart drawer's shadow on the right edge, cold grey
// placeholders, and the 404 page (brand fonts, one language per page).

async function box(locator: import('@playwright/test').Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error('element not visible');
  return b;
}

async function addFirstProductToCart(page: import('@playwright/test').Page) {
  await page.goto('/ro/tocatoare');
  const href = await page.locator('a[href^="/ro/tocatoare/"]').first().getAttribute('href');
  test.skip(!href, 'no active product in the catalog');
  await page.goto(href!);
  await page.getByRole('button', { name: 'Adaugă în coș' }).click();
}

test.describe('Mobile polish — touch targets', () => {
  test('catalog filters, sort and card links are ≥ 44px tall', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    const pills = page.locator('[data-filter]');
    expect(await pills.count()).toBeGreaterThan(0);
    for (const pill of await pills.all()) expect((await box(pill)).height).toBeGreaterThanOrEqual(44);
    expect((await box(page.locator('button[aria-haspopup="listbox"]'))).height).toBeGreaterThanOrEqual(44);
    expect((await box(page.locator('[data-card-cta]').first())).height).toBeGreaterThanOrEqual(44);
  });

  test('cart drawer + cart page controls are ≥ 44×44', async ({ page }) => {
    await addFirstProductToCart(page);
    const drawer = page.getByRole('complementary', { name: 'Coș de cumpărături' });
    await expect(drawer).toBeVisible();
    for (const name of ['Închide', 'Elimină', 'Scade cantitatea', 'Crește cantitatea']) {
      const b = await box(drawer.getByRole('button', { name }));
      expect(b.width, name).toBeGreaterThanOrEqual(44);
      expect(b.height, name).toBeGreaterThanOrEqual(44);
    }
    expect((await box(drawer.getByRole('link', { name: 'Vezi coșul' }))).height).toBeGreaterThanOrEqual(44);

    await page.goto('/ro/cos');
    for (const name of ['Elimină', 'Scade cantitatea', 'Crește cantitatea']) {
      const b = await box(page.locator('main').getByRole('button', { name }));
      expect(b.height, name).toBeGreaterThanOrEqual(44);
    }
    const cartIcon = page.getByRole('button', { name: /^Coș de cumpărături/ }).first();
    const ib = await box(cartIcon);
    expect(ib.width).toBeGreaterThanOrEqual(44);
    expect(ib.height).toBeGreaterThanOrEqual(44);
  });

  test('closed cart drawer casts no shadow and is out of the tab order', async ({ page }) => {
    await page.goto('/ro');
    const panel = page.locator('aside[aria-label="Coș de cumpărături"]');
    const style = await panel.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { shadow: cs.boxShadow, visibility: cs.visibility };
    });
    expect(style.shadow).toBe('none');
    expect(style.visibility).toBe('hidden');
  });
});

test.describe('Mobile polish — checkout + forms', () => {
  test('review step: long product name never pushes the price onto two lines', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto('/ro/checkout');
    await page.fill('#co-email', 'test@example.com');
    await page.fill('#co-name', 'Test Nume');
    await page.fill('#co-phone', '0712345678');
    await page.fill('#co-street', 'Str. Test 1');
    await page.fill('#co-city', 'Arad');
    await page.selectOption('#co-county', { label: 'Arad' });
    await page.fill('#co-postal', '310001');
    await page.getByRole('button', { name: 'Continuă' }).click();
    await page.getByTestId('cod-info').waitFor();
    const price = page.locator('main').getByText(/^\d[\d.]* RON$/).first();
    const pb = await box(price);
    expect(pb.height, 'price stays on one line').toBeLessThan(30);
    const checkbox = page.locator('input[type="checkbox"]');
    const cb = await box(checkbox);
    expect(cb.width).toBeGreaterThanOrEqual(20);
    const label = await box(page.locator('label:has(input[type="checkbox"])'));
    expect(label.height).toBeGreaterThanOrEqual(44);
    expect((await box(page.getByRole('button', { name: /Înapoi/ }))).height).toBeGreaterThanOrEqual(44);
  });

  test('placeholders use the warm ink, not Tailwind grey', async ({ page }) => {
    await page.goto('/ro/contact');
    const color = await page.locator('input[placeholder]').first().evaluate(
      (el) => getComputedStyle(el, '::placeholder').color,
    );
    expect(color).not.toBe('rgb(156, 163, 175)');
    expect(color).toBe('rgb(93, 78, 58)'); // --ink-soft
  });
});

test.describe('404 — brand fonts, one language per page', () => {
  test('/ro/<unknown>: Romanian only, Caudex heading, 404 status', async ({ page }) => {
    const res = await page.goto('/ro/pagina-care-nu-exista');
    expect(res?.status()).toBe(404);
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveText('Pagina asta nu există.');
    expect(await h1.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Caudex/i);
    const main = await page.locator('main').innerText();
    expect(main).not.toMatch(/does not exist|Back to home/);
    await expect(page.locator('main').getByRole('link', { name: 'Vezi tocătoarele' })).toHaveAttribute('href', '/ro/tocatoare');
  });

  test('/en/<unknown>: English only', async ({ page }) => {
    const res = await page.goto('/en/page-that-does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist.');
    expect(await page.locator('main').innerText()).not.toMatch(/există|Înapoi/);
    expect(await page.locator('html').getAttribute('lang')).toBe('en');
  });

  test('unknown product slug uses the same 404', async ({ page }) => {
    const res = await page.goto('/ro/tocatoare/nu-exista-acest-model');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pagina asta nu există.');
  });

  // Dotted junk paths skip the middleware; the afterFiles rewrite in
  // next.config.js sends them to the branded RO 404 instead of Next's
  // unstyled error shell.
  for (const path of ['/.env', '/wp-admin/setup.php', '/x.php']) {
    test(`${path}: branded 404 with stylesheet and Caudex`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toHaveText('Pagina asta nu există.');
      expect(await h1.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Caudex/i);
      expect(await page.evaluate(() => document.styleSheets.length)).toBeGreaterThan(0);
    });
  }

  test('the junk-path rewrite leaves real routes and files alone', async ({ request }) => {
    for (const path of ['/ro', '/en', '/en/about', '/en/cutting-boards', '/ro/despre', '/admin/login']) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
    for (const path of ['/robots.txt', '/sitemap.xml', '/llms.txt', '/og/oak-fantasy-og.png']) {
      const r = await request.get(path);
      expect(r.status(), path).toBe(200);
      expect(r.headers()['content-type'], path).not.toContain('text/html');
    }
  });
});

// 2026-11-19 — pre-launch touches (founder list).
test.describe('Pre-launch touches', () => {
  test('footer links are ≥ 44px tall on phones', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 1440) >= 768, 'mobile-only requirement');
    await page.goto('/ro/contact');
    const small = await page.locator('footer a').evaluateAll((els) =>
      els
        .map((el) => ({ t: (el.textContent || el.getAttribute('aria-label') || '').trim(), r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44))
        .map(({ t, r }) => `${t} ${Math.round(r.width)}×${Math.round(r.height)}`),
    );
    expect(small).toEqual([]);
  });

  test('EN footer labels the CUI as Company ID, never VAT ID', async ({ page }) => {
    await page.goto('/en/contact');
    const footer = page.locator('footer');
    await expect(footer).toContainText('Company ID (CUI)');
    await expect(footer).not.toContainText('VAT ID');
  });

  test('Terms: no double period after the company name (RO + EN)', async ({ page }) => {
    for (const path of ['/ro/termeni', '/en/terms']) {
      await page.goto(path);
      const text = await page.locator('main').innerText();
      expect(text, path).toContain('ROOBO PELLETS S.R.L.');
      expect(text, path).not.toContain('S.R.L..');
    }
  });

  test('product titles keep the number and its unit together', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    const titles = await page.locator('[data-product] h3').allInnerTexts();
    const withUnit = titles.filter((t) => /\d\s?mm/.test(t));
    test.skip(withUnit.length === 0, 'no title with a size');
    for (const t of withUnit) expect(t, t).toMatch(/\d mm/);
  });

  test('checkout review: quantity sits on its own line, not glued to the name', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    const href = await page.locator('a[href^="/ro/tocatoare/"]').first().getAttribute('href');
    test.skip(!href, 'no active product');
    await page.goto(href!);
    await page.getByRole('button', { name: 'Adaugă în coș' }).click();
    await page.goto('/ro/checkout');
    await page.fill('#co-email', 'test@example.com');
    await page.fill('#co-name', 'Test Nume');
    await page.fill('#co-phone', '0712345678');
    await page.fill('#co-street', 'Str. Test 1');
    await page.fill('#co-city', 'Arad');
    await page.selectOption('#co-county', { label: 'Arad' });
    await page.fill('#co-postal', '310001');
    await page.getByRole('button', { name: 'Continuă' }).click();
    await page.getByTestId('cod-info').waitFor();
    const main = page.locator('main');
    await expect(main).toContainText('Cantitate: 1');
    expect(await main.innerText()).not.toMatch(/ × \d/);
  });
});

// 2026-11-20 — small touches before launch.
test.describe('Small touches', () => {
  test('homepage quote uses „ ” in RO and “ ” in EN, no straight quotes', async ({ page }) => {
    await page.goto('/ro');
    const ro = await page.locator('main').innerText();
    expect(ro).toContain('„Un obiect bun nu se termină când iese din atelier — începe.”');
    expect(ro).not.toContain('"Un obiect bun');
    await page.goto('/en');
    const en = await page.locator('main').innerText();
    expect(en).toContain('“A good object doesn’t end when it leaves the workshop — it begins.”');
  });

  test('legal pages: the phone link never wraps', async ({ page }) => {
    for (const path of ['/en/privacy', '/en/returns', '/ro/confidentialitate']) {
      await page.goto(path);
      const link = page.locator('main a[href^="tel:"]').first();
      expect(await link.evaluate((el) => getComputedStyle(el).whiteSpace), path).toBe('nowrap');
      const rects = await link.evaluate((el) => el.getClientRects().length);
      expect(rects, `${path}: one line box`).toBe(1);
    }
  });

  test('phone fields: the hint fits inside the input', async ({ page }) => {
    for (const [path, sel] of [['/ro/inregistrare', '#reg-phone'], ['/ro/contact', 'input[type="tel"]']] as const) {
      await page.goto(path);
      const input = page.locator(sel).first();
      await expect(input).toHaveAttribute('placeholder', '0712 345 678');
      const fits = await input.evaluate((el: HTMLInputElement) => {
        const cs = getComputedStyle(el);
        const ctx = document.createElement('canvas').getContext('2d')!;
        ctx.font = `${cs.fontSize} ${cs.fontFamily}`;
        const inner = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        return ctx.measureText(el.placeholder).width <= inner;
      });
      expect(fits, path).toBe(true);
    }
  });
});
