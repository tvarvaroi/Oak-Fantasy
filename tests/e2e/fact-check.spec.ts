import { test, expect } from './fixtures';

// 2026-11-19 — founder fact-check of every factual claim on the site
// (artifact „Verificarea afirmațiilor”, rounds 1 + 2). These claims were
// marked false or "to correct" and removed; they must not come back.
// The workshop location is never named; the registered HQ (legal data in the
// Organization JSON-LD) is, so Arad is checked on visible text only.
const ARAD = /Arad/;
const REMOVED_RO = [
  /Bucegi|Apuseni/,
  /6–12 luni/,
  /8–10\s?%/,
  /Titebond/,
  /ceară de albine/,
  /ani de zile/,
  /fără noduri/,
  /Un singur copac/,
  /aceluiași om|aceleași mâini/,
  /linie de producție|linii de producție|produse în serie/,
  /atelier mic|Atelier mic|Un atelier mic/,
  /șaizeci de metri/,
  /18–22\s?°C|45–55\s?%/,
  /higrometru|dezumidificator/i,
  /cinci unelte/,
  /end-grain|blocul de moștenire/i,
  // Anchored to the removed social-proof claim, not to prices (a price
  // update is coming — a 1.200 RON product must not fail this).
  /1\.200\s*\+|1\.200 de (oameni|abonați)/,
  ARAD,
  /capacitate maximă/,
  /Cel mai mult timp lucrăm cu unelte de mână/,
];
const REMOVED_EN = [
  /Bucegi|Apuseni/,
  /6–12 months/,
  /8–10\s?%/,
  /Titebond/,
  /beeswax/i,
  /over years/,
  /no knots/,
  /single tree/i,
  /same pair of hands|same hands/,
  /production line|mass-produced/i,
  /small workshop/i,
  /sixty square/,
  /18–22\s?°C|45–55\s?%/,
  /hygrometer|dehumidifier/i,
  /five tools/i,
  // "Heirloom" alone is the catalogue's top tier filter label, not a claim.
  /end-grain|heirloom block/i,
  /1,200\s*\+|1,200 (people|subscribers)/,
  ARAD,
  /full capacity/,
  /Most of the time we work with hand tools/,
];

// Visible text AND the head: the fact-check also changed <title>, meta
// descriptions and JSON-LD, which crawlers read. Not page.content(): the RSC
// payload carries unrelated strings (e.g. the RO not-found boundary on EN).
async function pageText(page: import('@playwright/test').Page) {
  return page.evaluate(() => ({
    visible: document.body.innerText,
    head: [
      document.title,
      ...Array.from(document.querySelectorAll('meta[content]')).map((m) => m.getAttribute('content') ?? ''),
      ...Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent ?? ''),
    ].join('\n'),
  }));
}

function expectNone(text: { visible: string; head: string }, res: RegExp[]) {
  for (const re of res) {
    expect(text.visible, String(re)).not.toMatch(re);
    if (re !== ARAD) expect(text.head, `head: ${re}`).not.toMatch(re);
  }
}

const RO_PAGES = ['/ro', '/ro/despre', '/ro/atelier', '/ro/tocatoare', '/ro/la-comanda'];
const EN_PAGES = ['/en', '/en/about', '/en/workshop', '/en/cutting-boards', '/en/custom-orders'];

test.describe('Fact-check: removed claims stay removed', () => {
  for (const path of RO_PAGES) {
    test(`${path}: none of the removed RO claims`, async ({ page }) => {
      await page.goto(path);
      const text = await pageText(page);
      expectNone(text, REMOVED_RO);
    });
  }
  for (const path of EN_PAGES) {
    test(`${path}: none of the removed EN claims`, async ({ page }) => {
      await page.goto(path);
      const text = await pageText(page);
      expectNone(text, REMOVED_EN);
    });
  }

  test('llms.txt: none of the removed claims, no price range, no model count', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('# Oak Fantasy');
    for (const re of REMOVED_EN) expect(body, String(re)).not.toMatch(re);
    expect(body).not.toMatch(/~?2,200 RON|180 RON|10 models|all 10/);
    expect(body).not.toMatch(/No lacquer|~60 sqm/);
  });

  test('/despre + homepage: stock photos labelled as illustrative', async ({ page }) => {
    await page.goto('/ro/despre');
    await expect(page.locator('main')).toContainText('Fotografie ilustrativă.');
    await page.goto('/ro');
    await expect(page.locator('main')).toContainText('Fotografie ilustrativă.');
  });

  test('/despre states openly that the designs are CNC-carved', async ({ page }) => {
    await page.goto('/ro/despre');
    await expect(page.locator('main')).toContainText('Desenele le frezăm pe CNC');
    await page.goto('/en/about');
    await expect(page.locator('main')).toContainText('The designs are CNC-carved');
  });

  test('/tocatoare: catalogue is in stock, lead time matches checkout', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    await expect(page.locator('main')).toContainText('Ce vezi în catalog e în stoc.');
    await expect(page.locator('main')).toContainText('5–10 zile lucrătoare de la confirmare');
    await expect(page.locator('main')).not.toContainText('Comanzi azi');
  });

  test('NumbersStrip model count equals the live catalogue (never hard-coded)', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    const n = await page.locator('[data-product]').count();
    test.skip(n === 0, 'No active products on this database');
    await page.goto('/ro');
    const numbers = page.locator('section[aria-label="Cifre"]');
    await numbers.scrollIntoViewIfNeeded();
    await expect(numbers).toContainText('modele', { timeout: 5000 });
    // Retrying matcher: the count-up (instant under reduced motion) must land on n.
    await expect(numbers.locator('.font-caudex').first()).toHaveText(String(n));
  });

  // The figure is wired to the DB, not written in the content map.
  // Read as text: the content module is ESM and not loadable from the spec.
  test('numbers-strip-content has no literal model count', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'components', 'numbers-strip-content.ts'), 'utf8');
    const live = src
      .split(/\r?\n/)
      .filter((l) => l.trim().startsWith('{') && l.includes("live: 'productCount'"));
    expect(live).toHaveLength(2); // RO + EN
    for (const line of live) expect(line, line).toMatch(/\bto:\s*0\b/);
  });
});
