import { readFileSync } from 'node:fs';

import { test, expect } from './fixtures';
import {
  DISPATCH_WORKING_DAYS,
  SHIPPING_COUNTRY,
  TRANSIT_WORKING_DAYS,
  shippingCost,
} from '../../lib/config/shipping';
import { RETURN_COUNTRY, RETURN_WINDOW_DAYS } from '../../lib/config/returns';

// 2026-11-20 — Google Rich Results flagged "Missing field 'image'" on
// /ro/tocatoare/ceas-custom-cerb. Two causes: every product photo URL was a
// Supabase Storage URL served with `X-Robots-Tag: none` (not indexable), and
// the catalog ItemList built its own Product items without image/brand. Now
// the catalog and every product page share lib/product-jsonld.ts and images
// go through our own /_next/image route. This spec walks EVERY active product
// in both locales and fails if a Product loses image, brand, price,
// availability, shipping or the return policy, if an image stops being
// indexable, or if the catalog copy drifts from the product page.

type Json = Record<string, any>;
const SCHEMA = 'https://schema.org';
const SITE = 'https://oakfantasy.ro';
const CATALOG = { ro: '/ro/tocatoare', en: '/en/cutting-boards' } as const;

/** Every JSON-LD object on a page (server HTML, no JS needed). */
function jsonLd(html: string): Json[] {
  const out: Json[] = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(JSON.parse(m[1]));
  return out;
}

/** The checks Google needs on one Product node (catalog item or product page). */
function expectCompleteProduct(p: Json, where: string) {
  expect(p['@type'], where).toBe('Product');
  expect(typeof p.name === 'string' && p.name.length > 0, `${where}: name`).toBe(true);

  // image: present, non-empty, absolute URLs on our own origin (never the
  // raw Supabase URL, which carries X-Robots-Tag: none)
  expect(Array.isArray(p.image) && p.image.length > 0, `${where}: image missing`).toBe(true);
  for (const src of p.image as string[]) {
    expect(src.startsWith(`${SITE}/`), `${where}: image not absolute on ${SITE}: ${src}`).toBe(true);
  }

  expect(p.brand, `${where}: brand missing`).toEqual({ '@type': 'Brand', name: 'Oak Fantasy' });

  const o = p.offers;
  expect(o?.['@type'], `${where}: offers`).toBe('Offer');
  expect(o.priceCurrency, `${where}: priceCurrency`).toBe('RON');
  expect(/^\d+(\.\d{1,2})?$/.test(String(o.price)) && Number(o.price) > 0, `${where}: price "${o.price}"`).toBe(true);
  expect([`${SCHEMA}/InStock`, `${SCHEMA}/OutOfStock`], `${where}: availability`).toContain(o.availability);
  expect(o.itemCondition, `${where}: itemCondition`).toBe(`${SCHEMA}/NewCondition`);

  // shippingDetails — from lib/config/shipping.ts, rate for this product bought alone
  const s = o.shippingDetails;
  expect(s?.['@type'], `${where}: shippingDetails`).toBe('OfferShippingDetails');
  expect(s.shippingRate, `${where}: shippingRate`).toEqual({
    '@type': 'MonetaryAmount',
    value: shippingCost(Math.round(Number(o.price) * 100)) / 100,
    currency: 'RON',
  });
  expect(s.shippingDestination, `${where}: shippingDestination`).toEqual({
    '@type': 'DefinedRegion',
    addressCountry: SHIPPING_COUNTRY,
  });
  expect(s.deliveryTime.handlingTime, `${where}: handlingTime`).toEqual({
    '@type': 'QuantitativeValue',
    minValue: DISPATCH_WORKING_DAYS.min,
    maxValue: DISPATCH_WORKING_DAYS.max,
    unitCode: 'DAY',
  });
  expect(s.deliveryTime.transitTime, `${where}: transitTime`).toEqual({
    '@type': 'QuantitativeValue',
    minValue: TRANSIT_WORKING_DAYS.min,
    maxValue: TRANSIT_WORKING_DAYS.max,
    unitCode: 'DAY',
  });

  // hasMerchantReturnPolicy — the /retur rules for a standard product
  expect(o.hasMerchantReturnPolicy, `${where}: hasMerchantReturnPolicy`).toEqual({
    '@type': 'MerchantReturnPolicy',
    applicableCountry: RETURN_COUNTRY,
    returnPolicyCategory: `${SCHEMA}/MerchantReturnFiniteReturnWindow`,
    merchantReturnDays: RETURN_WINDOW_DAYS,
    returnMethod: `${SCHEMA}/ReturnByMail`,
    returnFees: `${SCHEMA}/ReturnFeesCustomerResponsibility`,
  });
}

test.describe('Product JSON-LD — every product, RO + EN', () => {
  // Server-rendered data checks: viewport-independent, so one project is enough.
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'data check, runs once');
  });

  for (const locale of ['ro', 'en'] as const) {
    test(`${locale}: catalog + each product page carry a complete Product`, async ({ request }) => {
      test.setTimeout(240_000);
      const catalogHtml = await (await request.get(CATALOG[locale])).text();
      const list = jsonLd(catalogHtml).find((j) => j['@type'] === 'ItemList');
      expect(list, 'catalog ItemList').toBeTruthy();
      const items: Json[] = list!.itemListElement.map((e: Json) => e.item);
      test.skip(items.length === 0, 'no active products');
      expect(list!.numberOfItems).toBe(items.length);

      const skus = new Set<string>();
      for (const item of items) {
        expectCompleteProduct(item, `${CATALOG[locale]} → ${item.sku}`);
        skus.add(item.sku);

        const path = new URL(item.url).pathname;
        expect(path.startsWith(`${CATALOG[locale]}/`), item.url).toBe(true);
        const res = await request.get(path);
        expect(res.status(), path).toBe(200);
        const pdp = jsonLd(await res.text()).find((j) => j['@type'] === 'Product');
        expect(pdp, `${path}: Product JSON-LD`).toBeTruthy();
        expectCompleteProduct(pdp!, path);

        // Same builder → the catalog item IS the product page's Product.
        const { '@context': ctx, ...pdpProduct } = pdp!;
        expect(ctx).toBe(SCHEMA);
        expect(item, `${path}: catalog item differs from product page`).toEqual(pdpProduct);
      }
      expect(skus.size, 'unique SKUs').toBe(items.length);
    });
  }

  test('product images in the JSON-LD are crawlable AND indexable', async ({ request }) => {
    // `next dev` optimizes each photo on first request (~10 s each, cold cache).
    test.setTimeout(600_000);
    const list = jsonLd(await (await request.get(CATALOG.ro)).text()).find((j) => j['@type'] === 'ItemList');
    const urls = new Set<string>(list!.itemListElement.flatMap((e: Json) => e.item.image ?? []));
    test.skip(urls.size === 0, 'no active products');
    for (const u of Array.from(urls)) {
      // Same path on the server under test (the URL names the production origin).
      const { pathname, search } = new URL(u);
      const res = await request.get(pathname + search, { headers: { Accept: 'image/avif,image/webp,image/*' } });
      expect(res.status(), u).toBe(200);
      expect(res.headers()['content-type'] ?? '', u).toMatch(/^image\//);
      expect(res.headers()['x-robots-tag'] ?? '', `${u}: not indexable`).not.toMatch(/noindex|none/i);
    }
  });
});

test.describe('Product JSON-LD — visible copy matches the declared policy', () => {
  const read = (f: string) => readFileSync(f, 'utf8');

  test('delivery promise: copy states the configured dispatch + transit days', () => {
    const transit = `${TRANSIT_WORKING_DAYS.min}–${TRANSIT_WORKING_DAYS.max}`;
    const dispatch = `${DISPATCH_WORKING_DAYS.min}–${DISPATCH_WORKING_DAYS.max}`;
    const terms = read('components/legal/terms/content.ts');
    for (const f of ['components/product/content.ts', 'components/tocatoare/content.ts', 'components/legal/terms/content.ts']) {
      expect(read(f), f).toContain(`cel mult ${dispatch} zile lucrătoare`);
    }
    expect(read('components/tocatoare/content.ts')).toContain(`${transit} zile lucrătoare`);
    expect(terms).toContain(`${transit} zile lucrătoare`);
    expect(terms).toContain(`within ${dispatch} working days`);
    expect(terms).toContain(`${transit} working days`);
    for (const f of ['components/product/content.ts', 'components/tocatoare/content.ts']) {
      expect(read(f), f).toContain(`within ${dispatch} business days`);
    }
    expect(read('components/tocatoare/content.ts')).toContain(`${transit} business days`);
  });

  test('returns: /retur states the configured withdrawal window, return shipping paid by the customer', () => {
    const returns = read('components/legal/returns/content.ts');
    expect(returns).toContain(`Te poți retrage în ${RETURN_WINDOW_DAYS} zile de la primire`);
    expect(returns).toContain('Transportul de retur îl plătești tu.');
    expect(returns).toMatch(new RegExp(`withdraw[^']*within ${RETURN_WINDOW_DAYS} days`));
  });
});
