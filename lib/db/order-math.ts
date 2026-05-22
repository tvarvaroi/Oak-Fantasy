// Pure order-total arithmetic in integer bani (D7: TS-side, no DB round-trip).
// Money is always integer bani (180 RON => 18000). Never floats for currency.

export interface OrderLineInput {
  /** unit price in bani */
  unitPriceRon: number;
  quantity: number;
  /** per-unit engraving surcharge in bani (0 if none) */
  engravingPriceRon?: number;
}

/** Line total = (unit + engraving) * quantity, in bani. */
export function lineTotalRon(line: OrderLineInput): number {
  return (line.unitPriceRon + (line.engravingPriceRon ?? 0)) * line.quantity;
}

export interface OrderTotals {
  subtotalRon: number;
  shippingCostRon: number;
  totalRon: number;
}

/** Sum line totals + shipping, all in bani. */
export function calculateOrderTotal(
  lines: OrderLineInput[],
  shippingCostRon = 0,
): OrderTotals {
  const subtotalRon = lines.reduce((sum, line) => sum + lineTotalRon(line), 0);
  return { subtotalRon, shippingCostRon, totalRon: subtotalRon + shippingCostRon };
}
