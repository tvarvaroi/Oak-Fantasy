import { readFileSync } from 'node:fs';
import type { APIRequestContext } from '@playwright/test';
import { test, expect } from './fixtures';
// A plain TS module with no imports: loadable from a spec (content maps are not).
import { parseProductDescription } from '../../lib/product-description';

// GEO audit 2026-11-21 (_brain/notes/geo-audit-2026-11-21.md): what a crawler or
// an assistant reads is the SERVED HTML, without JavaScript. These tests read
// that HTML (the `request` fixture runs no scripts) and guard the seven fixes:
// real figures in the numbers strip, no glued words in headings, the
// "Livrare, plată și retur" block on product pages, real headings and lists in
// product descriptions, one wording for the free-shipping threshold, no street
// address in any schema, and an llms.txt that says only what the site says.

const html = async (request: APIRequestContext, path: string) => {
  const res = await request.get(path);
  expect(res.status(), path).toBe(200);
  return res.text();
};

/** Tags → spaces, entities for the few characters we assert on, collapsed. */
const textOf = (markup: string) =>
  markup
    .replace(/<!--.*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;| /g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const jsonLdBlocks = (markup: string): unknown[] =>
  Array.from(markup.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)).map((m) =>
    JSON.parse(m[1]),
  );

async function productPaths(request: APIRequestContext, catalog: string): Promise<string[]> {
  const markup = await html(request, catalog);
  return Array.from(new Set(Array.from(markup.matchAll(new RegExp(`href="(${catalog}/[^"/]+)"`, 'g'))).map((m) => m[1])));
}

const firstProductPath = async (request: APIRequestContext, catalog: string): Promise<string | null> =>
  (await productPaths(request, catalog))[0] ?? null;

test.describe('GEO: the served HTML carries the answers', () => {
  // ── 1. Numbers strip ──────────────────────────────────────────────
  for (const [path, label, models, grit] of [
    ['/ro', 'Cifre', 'modele', 'granulație finală'],
    ['/en', 'Numbers', 'models', 'final grit'],
  ] as const) {
    test(`${path}: numbers strip is served with the real figures, not the count-up start`, async ({ request }) => {
      const markup = await html(request, path);
      const section = markup.match(new RegExp(`<section[^>]*aria-label="${label}"[^>]*>.*?</section>`, 's'))?.[0];
      expect(section, 'numbers strip section').toBeTruthy();
      const text = textOf(section!);

      // 320 = the final sanding grit (80 → 320), a fixed figure.
      expect(text).toMatch(new RegExp(`\\b320 ${grit}`));
      expect(text).not.toMatch(new RegExp(`\\b0 ${grit}`));

      // The model count is read live from the DB. The stat may be missing from
      // the served HTML only when the catalogue itself is empty.
      const catalog = await html(request, path === '/ro' ? '/ro/tocatoare' : '/en/cutting-boards');
      const active = (catalog.match(/data-product="true"/g) ?? []).length;
      const served = text.match(new RegExp(`(\\d+) ${models}`))?.[1];
      if (active === 0) {
        expect(served, 'stat is hidden when there is no active product').toBeUndefined();
        return;
      }
      expect(served, `"${models}" stat missing from the served HTML`).toBeTruthy();
      expect(Number(served)).toBe(active);
    });
  }

  test('numbers strip still counts up in the browser (no reduced motion)', async ({ browser }) => {
    // The shared fixture emulates reduced motion; this test needs the animation.
    const context = await browser.newContext({ reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.goto('/ro');
    const grit = page.locator('section[aria-label="Cifre"] .tabular-nums').last();
    // Hydrated and still off-screen: rewound to the start value.
    await expect(grit).toHaveText('0');
    await page.locator('section[aria-label="Cifre"]').scrollIntoViewIfNeeded();
    await expect(grit).toHaveText('320', { timeout: 8000 });
    await context.close();
  });

  // ── 4. Headings split into <span>s ────────────────────────────────
  const PUBLIC_PAGES = [
    '/ro', '/en',
    '/ro/la-comanda', '/en/custom-orders',
    '/ro/despre', '/en/about',
    '/ro/atelier', '/en/workshop',
    '/ro/tocatoare', '/en/cutting-boards',
    '/ro/contact', '/en/contact',
    '/ro/retur', '/en/returns',
    '/ro/termeni', '/en/terms',
  ];
  // A letter (or sentence punctuation) glued to the next letter across an
  // inline tag boundary: "Tocătoare</span><span>lucrate". <br> is a line break
  // for every HTML-to-text reader, so it is not a boundary here.
  // (React's `<!-- -->` text separators are matched exactly: a lazy `<!--.*?-->`
  // would run on to a LATER comment and report a false glue.)
  const GLUED = /[\p{L}\p{N}.,;:!?](?:<\/?(?:span|em|strong|b|i)\b[^>]*>|<!--\s*-->)+[\p{L}\p{N}]/u;
  for (const path of PUBLIC_PAGES) {
    test(`${path}: no heading has words glued together in the served HTML`, async ({ request }) => {
      const markup = await html(request, path);
      const headings = Array.from(markup.matchAll(/<h([1-4])\b[^>]*>(.*?)<\/h\1>/gs)).map((m) => m[2]);
      expect(headings.length).toBeGreaterThan(0);
      for (const inner of headings) {
        // Inline closing tags directly before a letter are fine when a space
        // precedes them inside the tag ("cu </span><span>mâinile"), so test the
        // raw markup: the boundary must have no whitespace on either side.
        expect(inner.match(GLUED)?.[0] ?? null, `glued words in: ${textOf(inner)}`).toBeNull();
      }
    });
  }

  test('homepage + La comandă headings read as sentences', async ({ request }) => {
    // Tags are removed WITHOUT inserting a space (textOf would hide the bug:
    // it turns "Tocătoare</span><span>lucrate" into two words by itself).
    const flat = (markup: string) =>
      markup
        .replace(/<!--\s*-->/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;| /g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const h = async (path: string, level: number) =>
      Array.from((await html(request, path)).matchAll(new RegExp(`<h${level}\\b[^>]*>(.*?)</h${level}>`, 'gs'))).map(
        (m) => flat(m[1]),
      );
    expect(await h('/ro', 1)).toContain('Tocătoare lucrate cu mâinile noastre.');
    const h2 = await h('/ro', 2);
    expect(h2).toContain('Un loc unde lemnul capătă suflet.');
    expect(h2).toContain('Fiecare bucată, unică.');
    expect(await h('/ro/la-comanda', 1)).toContain('Ai o idee? O facem în lemn.');
    expect(await h('/en/custom-orders', 1)).not.toContainEqual(expect.stringMatching(/\?\S/));
  });

  // ── 2 + 3 + 5. Product page ───────────────────────────────────────
  for (const loc of [
    {
      catalog: '/ro/tocatoare',
      title: 'Livrare, plată și retur',
      has: [
        'Plătești ramburs: în numerar, curierului, când primești coletul.',
        'Livrăm doar în România, prin curier.',
        'Transportul costă 25 RON; pentru comenzile de la 500 RON în sus e gratuit.',
        'Expediem comanda în cel mult 5–10 zile lucrătoare de la confirmare.',
        'curierul o livrează de regulă în 1–3 zile lucrătoare',
        'în 14 zile de la primire',
        'Produsele gravate și lucrările la comandă sunt făcute pentru tine',
      ],
      returns: ['/ro/retur', 'Politica de retur'],
      terms: ['/ro/termeni', 'Termeni și condiții'],
      threshold: 'gratuit de la 500 RON',
      oldThreshold: /peste 500/,
      specs: 'Dimensiuni și detalii',
      care: 'Îngrijire',
      addToCart: 'Adaugă în coș',
    },
    {
      catalog: '/en/cutting-boards',
      title: 'Delivery, payment and returns',
      has: [
        'You pay cash on delivery: in cash, to the courier, when the parcel arrives.',
        'We deliver only within Romania, by courier.',
        'Delivery costs 25 RON; orders of 500 RON or more ship free.',
        'We ship your order within 5–10 business days of confirmation at the latest.',
        'usually delivers it in 1–3 business days',
        'within 14 days of receiving it',
        'Engraved products and custom work are made for you',
      ],
      returns: ['/en/returns', 'Returns policy'],
      terms: ['/en/terms', 'Terms and conditions'],
      threshold: 'free from 500 RON',
      oldThreshold: /over 500/,
      specs: 'Dimensions & details',
      care: 'Care',
      addToCart: 'Add to cart',
    },
  ]) {
    test(`${loc.catalog} product page: "${loc.title}" block, served and visible`, async ({ page, request }) => {
      const path = await firstProductPath(request, loc.catalog);
      test.skip(!path, 'no active product');

      // Served HTML first: the block is there without JavaScript.
      const served = textOf(await html(request, path!));
      expect(served).toContain(loc.title);
      for (const s of loc.has) expect(served, s).toContain(s);

      await page.goto(path!);
      const block = page.getByTestId('buying-info');
      await expect(block.getByRole('heading', { level: 2, name: loc.title })).toBeVisible();
      for (const s of loc.has) await expect(block).toContainText(s);
      await expect(block.getByRole('link', { name: loc.returns[1] })).toHaveAttribute('href', loc.returns[0]);
      await expect(block.getByRole('link', { name: loc.terms[1] })).toHaveAttribute('href', loc.terms[0]);

      // One wording for the threshold, the one the checkout code applies (>= 500 RON).
      await expect(page.locator('main')).toContainText(loc.threshold);
      await expect(page.locator('main')).not.toContainText(loc.oldThreshold);

      // The block comes AFTER the buy button in the document, so on a phone or
      // a portrait tablet (one column) it never pushes the button down. From
      // 1024px it sits in the left column, under the gallery.
      const button = page.getByRole('button', { name: loc.addToCart });
      if (await button.count()) {
        const follows = await button.evaluate(
          (btn, id) =>
            !!(btn.compareDocumentPosition(document.querySelector(`[data-testid="${id}"]`)!) &
              Node.DOCUMENT_POSITION_FOLLOWING),
          'buying-info',
        );
        expect(follows).toBe(true);
        const b = await button.boundingBox();
        const s = await block.boundingBox();
        if ((page.viewportSize()?.width ?? 0) < 1024) {
          expect(s!.y).toBeGreaterThan(b!.y + b!.height - 1);
        } else {
          expect(s!.x + s!.width).toBeLessThanOrEqual(b!.x); // left column
        }
      }

      // Links inside the sentence are still 44px-tall touch targets.
      for (const name of [loc.returns[1], loc.terms[1]]) {
        const box = await block.getByRole('link', { name }).boundingBox();
        expect(box!.height, name).toBeGreaterThanOrEqual(44);
      }
    });

    test(`${loc.catalog} product page: "${loc.care}" and "${loc.specs}" are real headings with lists`, async ({ page, request }) => {
      const path = await firstProductPath(request, loc.catalog);
      test.skip(!path, 'no active product');
      await page.goto(path!);
      const main = page.locator('main');
      for (const name of [loc.specs, loc.care]) {
        const heading = main.getByRole('heading', { level: 3, name, exact: true });
        await expect(heading).toBeVisible();
        const items = heading.locator('xpath=following-sibling::ul[1]/li');
        expect(await items.count(), name).toBeGreaterThanOrEqual(3);
      }
      // The bullet character from the stored text is gone — the list draws its own.
      expect(await main.innerText()).not.toMatch(/^\s*[•-]\s/m);
    });
  }

  test('the block figures are the ones in the Terms and on /retur', async ({ page }) => {
    await page.goto('/ro/termeni');
    const terms = page.locator('main');
    await expect(terms).toContainText('Transportul costă 25 RON. Pentru comenzile de la 500 RON în sus, transportul e gratuit.');
    await expect(terms).toContainText('Plătești în numerar, curierului, când primești coletul.');
    await expect(terms).toContainText('curierul o livrează de regulă în 1–3 zile lucrătoare');
    await page.goto('/ro/retur');
    await expect(page.locator('main')).toContainText('Te poți retrage în 14 zile de la primire, fără să ne spui de ce. Transportul de retur îl plătești tu.');
    await expect(page.locator('main')).toContainText('Sunt făcute pentru tine, așa că nu le putem primi înapoi doar pentru că te-ai răzgândit.');
  });

  test('the block copy holds no literal figure (values come from lib/config)', () => {
    // Content modules are ESM and not loadable from a spec: read as text.
    const src = readFileSync('components/product/content.ts', 'utf8');
    const blocks = Array.from(src.matchAll(/buyingInfo: \{(.*?)\n    \},/gs)).map((m) => m[1]);
    expect(blocks).toHaveLength(2); // RO + EN
    for (const b of blocks) {
      expect(b).not.toMatch(/\d/);
      for (const token of ['{fee}', '{free}', '{dispatch}', '{transit}', '{returnDays}']) expect(b).toContain(token);
    }
  });

  // ── 6. Structured data ────────────────────────────────────────────
  test('no schema carries a street address or a postal code; locality + country stay', async ({ request }) => {
    // Many pages in one test: on a cold dev server each route compiles first.
    test.setTimeout(120_000);
    const product = await firstProductPath(request, '/ro/tocatoare');
    const paths = ['/ro', '/en', '/ro/tocatoare', '/ro/la-comanda', '/ro/despre', '/ro/atelier', '/ro/contact', '/ro/termeni', '/ro/retur'];
    if (product) paths.push(product);
    for (const path of paths) {
      const markup = await html(request, path);
      const blocks = jsonLdBlocks(markup);
      expect(blocks.length, path).toBeGreaterThan(0);
      const all = JSON.stringify(blocks);
      expect(all, path).not.toContain('streetAddress');
      expect(all, path).not.toContain('postalCode');
      expect(all, path).not.toContain('Str. Orion');
    }
    const graph = (jsonLdBlocks(await html(request, '/ro'))[0] as { '@graph': Array<Record<string, unknown>> })['@graph'];
    const org = graph.find((n) => n['@type'] === 'Organization') as { address: Record<string, string> };
    expect(org.address).toMatchObject({ '@type': 'PostalAddress', addressLocality: 'Arad', addressCountry: 'RO' });
  });

  test('the visible legal text still shows the registered address', async ({ page }) => {
    await page.goto('/ro/termeni');
    await expect(page.locator('main')).toContainText('Str. Orion nr. 24, Arad, jud. Arad');
  });

  test('Organization schema names the company behind the brand, exactly as the footer does', async ({ page, request }) => {
    const graph = (jsonLdBlocks(await html(request, '/ro'))[0] as { '@graph': Array<Record<string, unknown>> })['@graph'];
    const org = graph.find((n) => n['@type'] === 'Organization') as Record<string, unknown>;
    expect(typeof org.legalName).toBe('string');
    expect(typeof org.taxID).toBe('string');
    // The CUI is a fiscal code; the company is not a VAT payer.
    expect(org.vatID).toBeUndefined();
    // No person is named in the schema: no legal representative, founder or employee.
    for (const key of ['founder', 'founders', 'employee', 'employees', 'member', 'contactPoint']) {
      expect(org[key], key).toBeUndefined();
    }
    expect(JSON.stringify(org)).not.toContain('"Person"');

    await page.goto('/ro');
    const footer = page.locator('footer');
    await expect(footer).toContainText(org.legalName as string);
    await expect(footer).toContainText(org.taxID as string);
  });

  // Founder, 2026-11-21: the permanent profile addresses, the same everywhere —
  // never a "share" link (it answers 400 to machines and is not the profile).
  test('social profiles: sameAs, the footer and llms.txt carry exactly the same three addresses', async ({ page, request }) => {
    const profiles = [
      'https://www.facebook.com/fantasyoak',
      'https://www.instagram.com/oakfantasy',
      'https://www.tiktok.com/@oak_fantasy',
    ];
    const social = /https?:\/\/[^\s"'<>)]*(?:facebook|instagram|tiktok|fb)\.[a-z]+[^\s"'<>)]*/gi;
    const sorted = (list: string[]) => Array.from(new Set(list)).sort();

    for (const path of ['/ro', '/en']) {
      const graph = (jsonLdBlocks(await html(request, path))[0] as { '@graph': Array<Record<string, unknown>> })['@graph'];
      const org = graph.find((n) => n['@type'] === 'Organization') as Record<string, unknown>;
      expect(sorted(org.sameAs as string[]), `${path} sameAs`).toEqual(sorted(profiles));
    }

    expect(sorted((await html(request, '/llms.txt')).match(social) ?? []), 'llms.txt').toEqual(sorted(profiles));

    // The contact page has no social links of its own: they come with the footer.
    for (const path of ['/ro', '/ro/contact', '/en/contact']) {
      await page.goto(path);
      const hrefs = await page
        .locator('a[href*="facebook."], a[href*="instagram."], a[href*="tiktok."], a[href*="fb."]')
        .evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''));
      expect(sorted(hrefs), `${path} links`).toEqual(sorted(profiles));
    }
  });

  test('Product schema: material and dimensions are the product’s own data, or absent', async ({ request }) => {
    // Many pages in one test: on a cold dev server each route compiles first.
    test.setTimeout(120_000);
    const decode = (s: string) =>
      s.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;| /g, ' ').trim();
    const cases: Array<[string, string]> = [
      ['/ro/tocatoare', 'Dimensiuni'],
      ['/en/cutting-boards', 'Dimensions'],
    ];
    let withMaterial = 0;
    let withDimensions = 0;
    for (const [catalog, dimsLabel] of cases) {
      const paths = await productPaths(request, catalog);
      test.skip(paths.length === 0, 'no active product');
      for (const path of paths) {
        const markup = await html(request, path);
        const node = jsonLdBlocks(markup).find((b) => (b as Record<string, unknown>)['@type'] === 'Product') as Record<string, unknown>;
        expect(node, path).toBeTruthy();

        // Material = the "Material: …" bullet of the description, word for word.
        const written = markup.match(/<li[^>]*>Material:\s*(.*?)<\/li>/s)?.[1];
        if (written) {
          expect(node.material, path).toBe(decode(written.replace(/<[^>]+>/g, '')));
          withMaterial += 1;
        } else {
          expect(node.material, path).toBeUndefined();
        }

        // Dimensions = the numbers of the spec row ("48 × 22 × 1,7 cm"), in order.
        const row = markup.match(new RegExp(`${dimsLabel}</dt><dd[^>]*>([^<]+)</dd>`))?.[1];
        const props = node.additionalProperty as Array<Record<string, unknown>> | undefined;
        if (row) {
          const shown = decode(row);
          const numbers = shown.replace(/[Ø]/g, '').split('×').map((part) => parseFloat(part.replace(',', '.')));
          expect(props?.map((p) => p.value), `${path}: ${shown}`).toEqual(numbers);
          for (const p of props!) {
            expect(p['@type']).toBe('PropertyValue');
            expect(shown.endsWith(` ${p.unitText as string}`), `${path}: unit`).toBe(true);
            expect(typeof p.name).toBe('string');
          }
          withDimensions += 1;
        } else {
          expect(props, path).toBeUndefined();
        }
        // Not mapped onto width/height/depth: that would be our guess.
        for (const key of ['width', 'height', 'depth']) expect(node[key], `${path}: ${key}`).toBeUndefined();
      }
    }
    // The check is not vacuous on this catalogue.
    expect(withMaterial).toBeGreaterThan(0);
    expect(withDimensions).toBeGreaterThan(0);
  });

  // ── 7. llms.txt ───────────────────────────────────────────────────
  test('llms.txt: care, phone and hours — each one already shown on the site', async ({ page, request }) => {
    const llms = await html(request, '/llms.txt');
    expect(llms).toContain('Phone: +40 774 905 182');
    expect(llms).toContain('Hours: Monday–Friday 09:00–17:00');
    expect(llms).toMatch(/hand wash only, never in the\s+dishwasher/);
    expect(llms).toMatch(/don't leave the board soaking/);
    expect(llms).toContain('"Made with love in Romania."');
    expect(llms).toContain('free from 500 RON');

    // Phone, hours and the EN tagline: the footer of every page.
    await page.goto('/en');
    const footer = page.locator('footer');
    await expect(footer).toContainText('+40 774 905 182');
    await expect(footer).toContainText('Monday–Friday: 09:00–17:00');
    await expect(footer).toContainText('Saturday: Closed');
    await expect(footer).toContainText('Made with love in Romania.');

    // Care: the three lines on the board pages. Not every product is a board
    // (the wall clock has its own care lines), so look for a page that has them
    // instead of trusting the catalogue order.
    const products = await productPaths(request, '/en/cutting-boards');
    test.skip(products.length === 0, 'no active product');
    let served: string | undefined;
    for (const path of products) {
      const text = textOf(await html(request, path));
      if (text.includes('Hand wash only, never in the dishwasher')) {
        served = text;
        break;
      }
    }
    expect(served, 'no product page states the care lines quoted in llms.txt').toBeTruthy();
    expect(served!).toMatch(/Don(?:'|&#x27;|’)t leave it soaking/);
    expect(served!).toContain('a coat of food-safe wood oil keeps it in good shape for years');
  });

  // ── 3. The description parser, on text an admin could type later ──
  test('parseProductDescription: only real "label + bullets" sections become lists', () => {
    const para = (text: string) => ({ type: 'paragraph', text });

    // The catalogue's two shapes.
    expect(parseProductDescription('Un tocător.\n\nÎngrijire\n• Se spală cu mâna\n• Nu se lasă în apă')).toEqual([
      para('Un tocător.'),
      { type: 'list', heading: 'Îngrijire', items: ['Se spală cu mâna', 'Nu se lasă în apă'] },
    ]);
    expect(parseProductDescription('Care\r\n- Hand wash only\r\n- Don’t leave it soaking')).toEqual([
      { type: 'list', heading: 'Care', items: ['Hand wash only', 'Don’t leave it soaking'] },
    ]);
    expect(parseProductDescription('• unu\n• doi')).toEqual([{ type: 'list', heading: null, items: ['unu', 'doi'] }]);

    // Prose is never restyled, and no character is dropped from it.
    for (const text of [
      '— Un tocător bun ține zeci de ani.',
      '- 20% mai gros decât de obicei.',
      '* Notă: se spală cu mâna.',
      'Stejarul e tare\n— și frumos.',
      'Titlu\n• un singur rând',
      '•Se spală cu mâna\n•Nu se lasă în apă',
      'Acesta e un rând lung, o propoziție întreagă, care se termină cu punct.\n• unu\n• doi',
    ]) {
      expect(parseProductDescription(text), text).toEqual([para(text)]);
    }

    // A "blank" line that holds only a no-break space still separates blocks.
    expect(parseProductDescription('Unu.\n \nDoi.')).toEqual([para('Unu.'), para('Doi.')]);
    expect(parseProductDescription(null)).toEqual([]);
    expect(parseProductDescription('  \n\n ')).toEqual([]);
  });
});
