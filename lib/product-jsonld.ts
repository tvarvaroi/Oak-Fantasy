// Product JSON-LD (schema.org Product + Offer), one builder for every place
// the site describes a product to search engines (2026-11-20):
//   - the product page (/tocatoare/[slug]): the Product rich result
//   - the catalog ItemList (/tocatoare): nested Product items
//
// Why (Google Rich Results: "Missing field 'image'" on /ro/tocatoare/ceas-custom-cerb):
//   1. Every product photo lives in Supabase Storage, which serves public
//      objects with `X-Robots-Tag: none` (noindex, nofollow). The product
//      pages did list the photos, but Google may not index a single one of
//      them — so no usable image, on all 10 products, RO and EN. The JSON-LD
//      now points at the same photo through our own /_next/image route
//      (same origin, no robots header).
//   2. The catalog built its own Product items without `image` or `brand`
//      (20 nodes: 10 products x RO/EN). It now uses this builder too, so the
//      catalog and the product page can no longer drift apart.
//
// Values come from their single sources: images from the product row,
// shipping from lib/config/shipping.ts, returns from lib/config/returns.ts,
// brand from LEGAL_INFO. Google reference (fetched 2026-11-20):
// developers.google.com/search/docs/appearance/structured-data/merchant-listing

import type { CatalogProduct } from '@/lib/db/products';
import type { Locale } from '@/lib/i18n-routes';
import { LEGAL_INFO } from '@/lib/legal-info';
import { SITE_URL } from '@/lib/site-url';
import {
  DISPATCH_WORKING_DAYS,
  SHIPPING_COUNTRY,
  TRANSIT_WORKING_DAYS,
  shippingCost,
} from '@/lib/config/shipping';
import { RETURN_COUNTRY, RETURN_WINDOW_DAYS } from '@/lib/config/returns';

const SCHEMA = 'https://schema.org';

/** Hero first, then the gallery; nulls dropped, duplicates removed. */
export function productImageUrls(product: Pick<CatalogProduct, 'hero_image_url' | 'gallery_image_urls'>): string[] {
  return Array.from(
    new Set(
      [product.hero_image_url, ...(product.gallery_image_urls ?? [])].filter(
        (x): x is string => !!x && x.trim() !== '',
      ),
    ),
  );
}

/**
 * Width requested from the image optimizer. Must be one of Next's
 * deviceSizes/imageSizes (defaults; next.config.js sets none) or the route
 * answers 400. 1200 px: well above Google's 50K-pixel minimum, never upscaled.
 */
export const LD_IMAGE_WIDTH = 1200;

/**
 * An absolute image URL Google may crawl AND index. Photos on another host
 * (Supabase Storage, sent with `X-Robots-Tag: none`) go through our own
 * /_next/image route — the same optimizer the product gallery already uses,
 * allowed by images.remotePatterns, served from oakfantasy.ro without that
 * header. Files on our own origin (public/) are linked directly.
 */
export function indexableImageUrl(src: string): string {
  const abs = new URL(src, SITE_URL);
  if (abs.origin === new URL(SITE_URL).origin) return abs.href;
  return `${SITE_URL}/_next/image?url=${encodeURIComponent(abs.href)}&w=${LD_IMAGE_WIDTH}&q=75`;
}

/** Price in RON as schema.org expects it: "180", "1250" (bani → RON). */
function ron(bani: number): string {
  return (bani / 100).toString();
}

const WORKING_DAYS = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => `${SCHEMA}/${d}`),
};

/**
 * Shipping for one unit of this product, bought on its own: the flat fee,
 * or free when the product alone reaches the free-shipping threshold.
 * (An order-value threshold can only be declared on Organization-level
 * markup in Google's model, so the Offer states the single-item price.)
 */
function shippingDetails(priceBani: number) {
  return {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: shippingCost(priceBani) / 100,
      currency: 'RON',
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: SHIPPING_COUNTRY,
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      businessDays: WORKING_DAYS,
      // Merchant listings need both bounds: "5–10 working days", as the site says.
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: DISPATCH_WORKING_DAYS.min,
        maxValue: DISPATCH_WORKING_DAYS.max,
        unitCode: 'DAY',
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: TRANSIT_WORKING_DAYS.min,
        maxValue: TRANSIT_WORKING_DAYS.max,
        unitCode: 'DAY',
      },
    },
  };
}

/** The /retur policy for a standard (un-engraved) catalog product. */
const RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: RETURN_COUNTRY,
  returnPolicyCategory: `${SCHEMA}/MerchantReturnFiniteReturnWindow`,
  merchantReturnDays: RETURN_WINDOW_DAYS,
  returnMethod: `${SCHEMA}/ReturnByMail`,
  returnFees: `${SCHEMA}/ReturnFeesCustomerResponsibility`,
};

export interface ProductLdInput {
  product: CatalogProduct;
  locale: Locale;
  inStock: boolean;
  /** Absolute canonical URL of the product page in this locale. */
  url: string;
}

/** schema.org Product (without @context, so it can be nested in an ItemList). */
export function buildProductLd({ product, locale, inStock, url }: ProductLdInput) {
  const name = locale === 'ro' ? product.name_ro : product.name_en;
  const description = (locale === 'ro' ? product.short_description_ro : product.short_description_en) ?? '';
  const images = productImageUrls(product).map(indexableImageUrl);

  return {
    '@type': 'Product',
    name,
    description,
    sku: product.sku,
    url,
    // A product row without any photo emits no `image` here; the e2e test
    // (tests/e2e/product-jsonld.spec.ts) fails on it, so it can't ship silently.
    ...(images.length ? { image: images } : {}),
    brand: { '@type': 'Brand', name: LEGAL_INFO.brandName },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'RON',
      price: ron(product.price_ron),
      availability: inStock ? `${SCHEMA}/InStock` : `${SCHEMA}/OutOfStock`,
      itemCondition: `${SCHEMA}/NewCondition`,
      shippingDetails: shippingDetails(product.price_ron),
      hasMerchantReturnPolicy: RETURN_POLICY,
    },
  };
}
