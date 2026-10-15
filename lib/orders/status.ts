// Single source of truth for the 9 order statuses (Task 3.6). Mirrors the DB
// CHECK constraint on orders.status (migration 20260522090005). Used by the
// admin list filter, the status dropdown, the status-change action, and the
// status badge — so a status added in one place can't drift from another.

import { CARD_PAYMENTS_ENABLED } from '@/lib/config/payments';

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

// 2026-10-15 (ramburs only, manual confirmation): every new order lands in
// pending_cod and waits for the founder's confirmation in /admin (engraving
// check before production). Label reflects that — it is "the inbox".
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Așteaptă plata',
  pending_cod: 'Nouă, de confirmat',
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

/** English labels (customer-facing contexts, e.g. future account pages). */
export const ORDER_STATUS_LABELS_EN: Record<OrderStatus, string> = {
  pending_payment: 'Awaiting payment',
  pending_cod: 'New, to be confirmed',
  confirmed: 'Confirmed',
  in_production: 'In production',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

/** The status every new order starts in while card payments are dormant. */
export const NEW_ORDER_STATUS: OrderStatus = 'pending_cod';

// Statuses the admin UI offers (dropdown + filter pills). `pending_payment`
// only exists for the Stripe path, so it is hidden while cards are dormant —
// it stays in ORDER_STATUSES (DB CHECK mirror) and historic orders still render.
export const ADMIN_ORDER_STATUSES: readonly OrderStatus[] = CARD_PAYMENTS_ENABLED
  ? ORDER_STATUSES
  : ORDER_STATUSES.filter((s) => s !== 'pending_payment');

// payment_status values (orders.payment_status CHECK).
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'În așteptare',
  paid: 'Plătit',
  failed: 'Eșuat',
  refunded: 'Rambursat',
};
