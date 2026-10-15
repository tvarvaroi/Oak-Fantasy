import { test, expect } from './fixtures';

// /tocatoare (Task 2.1.5 catalog page).
// Notes:
// - Products are seeded on staging as status='draft'; until the founder
//   activates them via Studio, fetchActiveProducts() returns [] and the page
//   renders the empty state. Tests are branched to pass either way.
// - When .env.local is repointed at a DB with active products, the card-based
//   assertions tighten and the visual regression baselines can be generated.

test.describe('/tocatoare page', () => {
  test('RO route /ro/tocatoare returns 200 + correct title', async ({ page }) => {
    const res = await page.goto('/ro/tocatoare');
    expect(res?.status()).toBe(200);
    // 2026-07-02 SEO: keyword title "Tocătoare din Stejar Românesc — Oak Fantasy"
    await expect(page).toHaveTitle(/Tocătoare din Stejar Românesc/i);
  });

  test('EN route /en/cutting-boards returns 200 + correct title', async ({ page }) => {
    const res = await page.goto('/en/cutting-boards');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Romanian Oak Cutting Boards/i);
  });

  test('Wrong-locale slug /en/tocatoare redirects to /en/cutting-boards', async ({ page }) => {
    const res = await page.goto('/en/tocatoare');
    expect(res?.status()).toBe(200); // after redirect
    expect(new URL(page.url()).pathname).toBe('/en/cutting-boards');
  });

  test('Wrong-locale slug /ro/cutting-boards redirects to /ro/tocatoare', async ({ page }) => {
    const res = await page.goto('/ro/cutting-boards');
    expect(res?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/ro/tocatoare');
  });

  test('RO page contains Romanian diacritics in copy', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    const main = page.locator('main');
    await expect(main).toContainText('Tocătoarele');
    // 2026-10-15: pre-launch "Lansăm în octombrie" copy is gone site-wide;
    // the hero note carries the live-shop promise instead.
    await expect(main).toContainText('gata de folosit');
  });

  test('EN page has no Romanian-only characters in main content', async ({ page }) => {
    await page.goto('/en/cutting-boards');
    const main = page.locator('main');
    const text = (await main.textContent()) ?? '';
    // ă â î ș ț + uppercase variants — none should appear in EN main copy
    expect(text).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
    await expect(main).toContainText('Our');
    await expect(main).toContainText('ready to use');
  });

  test('Hero shows eyebrow + heading + sub on RO', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    await expect(page.locator('main')).toContainText('Catalog');
    await expect(page.locator('h1')).toContainText('Tocătoarele');
  });

  test('Filter bar has 5 pills (All + 4 tiers)', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    const pills = page.locator('[data-filter-bar] button[data-filter]');
    await expect(pills).toHaveCount(5);
    await expect(pills.first()).toContainText('Toate');
  });

  test('Sort dropdown opens on click and shows 3 options', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    const toggle = page.locator('[data-filter-bar] [aria-haspopup="listbox"]');
    await toggle.click();
    const options = page.locator('[role="listbox"] button');
    await expect(options).toHaveCount(3);
  });

  test('Bottom CTA renders with mailto link', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    // 2026-07-14: the public address is LEGAL_INFO.contactEmail (gmail), so
    // assert on the mailto scheme inside <main>, not on a hardcoded address.
    const mail = page.locator('main a[href^="mailto:"]');
    await expect(mail).toHaveCount(1);
    await expect(mail).toContainText(/Contactează-ne/i);
  });

  test('JSON-LD BreadcrumbList + ItemList scripts are present', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    const scripts = page.locator('script[type="application/ld+json"]');
    // 3 since 2026-07-02: Organization/WebSite @graph (layout) + Breadcrumb + ItemList
    await expect(scripts).toHaveCount(3);
    const payloads = await scripts.allTextContents();
    const types = payloads
      .map((p) => {
        try {
          return JSON.parse(p)['@type'];
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    expect(types).toContain('BreadcrumbList');
    expect(types).toContain('ItemList');
  });

  test('Page shows either product cards OR the empty state — never both', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    const cards = page.locator('[data-product]');
    const empty = page.locator('[data-empty-state]');
    const cardCount = await cards.count();
    const emptyCount = await empty.count();
    if (cardCount > 0) {
      expect(emptyCount).toBe(0);
      // Card structure sanity: the card links to its product detail page
      await expect(cards.first().locator('a[href^="/ro/tocatoare/"]').first()).toHaveCount(1);
    } else {
      expect(emptyCount).toBe(1);
      await expect(empty).toContainText(/Pădurea e liniștită|forest is quiet/i);
    }
  });

  test('If cards are visible, CTAs route to the PDP /ro/tocatoare/[slug] (no waitlist relics)', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    const cards = page.locator('[data-product]');
    const n = await cards.count();
    test.skip(n === 0, 'No active products on this DB yet — skipping CTA-href assertion');
    const href = await cards.first().locator('a[href^="/ro/tocatoare/"]').first().getAttribute('href');
    expect(href).toMatch(/^\/ro\/tocatoare\/[a-z0-9-]+$/);
    await expect(page.locator('a[href*="interested_product"], a[href*="#waitlist"]')).toHaveCount(0);
  });

  test('Hero has no subtitle paragraph anymore (2026-10-15 #12)', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    await expect(page.locator('main')).not.toContainText('Zece modele');
  });
});
