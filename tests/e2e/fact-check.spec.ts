import { readFileSync } from 'node:fs';
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
  // 2026-11-19 (founder): stock is mixed — some pieces ready-made, others
  // made to order; 5–10 working days is the maximum until dispatch.
  /Ce vezi în catalog e (în stoc|gata de trimis)/,
  /Lucrăm (fiecare )?comanda în 5–10/i,
  /Cât lucrăm o comandă/,
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
  /What you see in the catalog(ue)? is/,
  /We make (your|each) order in/,
  /orders are made in 5–10/,
  /To make an order/,
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

  // 2026-11-19 (founder): mixed stock; 5–10 working days = maximum until
  // dispatch, said the same way on every surface.
  test('/tocatoare + /despre + product page: mixed stock, max 5–10 days to ship', async ({ page }) => {
    await page.goto('/ro/tocatoare');
    const main = page.locator('main');
    await expect(main).toContainText('Unele piese sunt gata făcute, altele le lucrăm după comandă.');
    await expect(main).toContainText('Expediem în cel mult 5–10 zile lucrătoare de la confirmare');
    await expect(main).not.toContainText('Comanzi azi');
    const href = await page.locator('a[href^="/ro/tocatoare/"]').first().getAttribute('href');

    await page.goto('/en/cutting-boards');
    await expect(page.locator('main')).toContainText('Some pieces are ready-made, others we make once you order.');
    await expect(page.locator('main')).toContainText('We ship within 5–10 business days of confirmation at the latest');

    await page.goto('/ro/despre');
    await expect(page.locator('main')).toContainText('Unele sunt gata făcute, altele le lucrăm după comandă. Expediem în cel mult 5–10 zile lucrătoare.');
    await page.goto('/en/about');
    await expect(page.locator('main')).toContainText('Some are ready-made, others we make once you order.');

    test.skip(!href, 'no active product');
    await page.goto(href!);
    await expect(page.locator('main')).toContainText('Disponibil');
    await expect(page.locator('main')).toContainText('Expediem în cel mult 5–10 zile lucrătoare.');
    await expect(page.locator('main')).not.toContainText('În stoc');
  });

  test('order confirmation email: same dispatch wording (static source check)', () => {
    // emails/*.tsx are rendered server-side by Resend, not reachable by URL.
    const src = readFileSync('emails/OrderConfirmationClient.tsx', 'utf8');
    expect(src).toContain('Expediem comanda în cel mult 5–10 zile lucrătoare de la confirmare');
    expect(src).toContain('We ship your order within 5–10 business days of confirmation at the latest');
    expect(src).not.toMatch(/lucrăm comanda în 5–10|we make your order in 5–10/i);
  });

  test('Terms + llms.txt: 5–10 working days is the maximum until dispatch', async ({ page, request }) => {
    await page.goto('/ro/termeni');
    await expect(page.locator('main')).toContainText('expediem comanda în cel mult 5–10 zile lucrătoare de la confirmare');
    await expect(page.locator('main')).toContainText('Expediem comanda în cel mult 5–10 zile lucrătoare de la confirmare.');
    await page.goto('/en/terms');
    await expect(page.locator('main')).toContainText('within 5–10 working days of confirmation at the latest');
    const llms = await (await request.get('/llms.txt')).text();
    expect(llms).toContain('ships within 5–10 business days');
    expect(llms).not.toMatch(/catalog is\s+in stock|orders are made in/);
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
