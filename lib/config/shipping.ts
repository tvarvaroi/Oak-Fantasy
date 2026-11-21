// Shipping config (D3). Money in bani. Single source of truth — change here.
// 25 RON flat, free from 500 RON (subtotal >= threshold; the copy says "de la
// 500 RON" / "from 500 RON"). (COD courier fee deferred — not added at MVP.)

export const SHIPPING_FLAT_RON = 2500; // 25 RON in bani
export const FREE_SHIPPING_THRESHOLD_RON = 50000; // 500 RON in bani

// Shipping cost in bani for a given subtotal (bani).
export function shippingCost(subtotalBani: number): number {
  return subtotalBani >= FREE_SHIPPING_THRESHOLD_RON ? 0 : SHIPPING_FLAT_RON;
}

// Delivery promise (2026-11-20). Used by the Product JSON-LD (shippingDetails);
// the visible copy states the same numbers — dispatch "5–10" in
// components/{product,tocatoare,legal/terms}/content.ts, transit "1–3" in
// components/{tocatoare,legal/terms}/content.ts — and
// tests/e2e/product-jsonld.spec.ts fails if they drift apart.
//   - we ship only within Romania
//   - dispatch within 5–10 working days of confirmation at the latest (some
//     pieces are ready-made, others are made after the order). Google's
//     merchant listings require both a min and a max handling time; the
//     min is the "5" the site already shows, never a shorter promise.
//   - the courier then delivers in 1–3 working days
export const SHIPPING_COUNTRY = 'RO';
export const DISPATCH_WORKING_DAYS = { min: 5, max: 10 } as const;
export const TRANSIT_WORKING_DAYS = { min: 1, max: 3 } as const;
