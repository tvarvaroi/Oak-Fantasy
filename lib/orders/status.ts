// Single source of truth for the 9 order statuses (Task 3.6). Mirrors the DB
// CHECK constraint on orders.status (migration 20260522090005). Used by the
// admin list filter, the status dropdown, the status-change action, and the
// status badge — so a status added in one place can't drift from another.

export const ORDER_STATUSES = [
  'pending_payment',
  'pending_cod',
  'confirmed',
  'in_production',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Așteaptă plata',
  pending_cod: 'Ramburs în așteptare',
  confirmed: 'Confirmată',
  in_production: 'În producție',
  packed: 'Împachetată',
  shipped: 'Expediată',
  delivered: 'Livrată',
  cancelled: 'Anulată',
  refunded: 'Rambursată',
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

// payment_status values (orders.payment_status CHECK).
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'În așteptare',
  paid: 'Plătit',
  failed: 'Eșuat',
  refunded: 'Rambursat',
};
