// Shipping config (D3). Money in bani. Single source of truth — change here.
// 25 RON flat, free over 500 RON. (COD courier fee deferred — not added at MVP.)

export const SHIPPING_FLAT_RON = 2500; // 25 RON in bani
export const FREE_SHIPPING_THRESHOLD_RON = 50000; // 500 RON in bani

// Shipping cost in bani for a given subtotal (bani).
export function shippingCost(subtotalBani: number): number {
  return subtotalBani >= FREE_SHIPPING_THRESHOLD_RON ? 0 : SHIPPING_FLAT_RON;
}
