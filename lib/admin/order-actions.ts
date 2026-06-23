'use server';

// Admin order management actions (Task 3.6). Same pattern as product-actions:
// re-assert admin (requireAdminOrNotFound) + write through the cookie-bound anon
// client so RLS "Admin full access orders" is the real gate (D4 — no service
// role). Every status change writes an order_status_history audit row.

import { revalidatePath } from 'next/cache';

import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { getServerSupabase } from '@/lib/supabase-server';
import { isOrderStatus, type OrderStatus } from '@/lib/orders/status';
import type { Database } from '@/types/supabase';

type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export type OrderActionResult = { ok: true } | { ok: false; error: string };

// Statuses where stock is still RESERVED (reserve_stock ran at creation, no
// fulfilment yet). Cancelling from one of these releases the hold (D7).
// shipped/delivered are excluded — those get fulfil_stock in Sprint 4 (courier
// flow), so releasing would be wrong.
const RESERVED_STATUSES = new Set<OrderStatus>([
  'pending_payment',
  'pending_cod',
  'confirmed',
  'in_production',
  'packed',
]);

// Maps a target status to the timestamp column it should stamp (D2).
const STATUS_TIMESTAMP: Partial<Record<OrderStatus, string>> = {
  shipped: 'shipped_at',
  delivered: 'delivered_at',
  cancelled: 'cancelled_at',
  refunded: 'refunded_at',
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
): Promise<OrderActionResult> {
  const admin = await requireAdminOrNotFound();

  if (!isOrderStatus(newStatus)) {
    return { ok: false, error: 'Status invalid.' };
  }

  const sb = getServerSupabase();

  const { data: order, error: fetchErr } = await sb
    .from('orders')
    .select('id, status, payment_status')
    .eq('id', orderId)
    .maybeSingle();
  if (fetchErr || !order) return { ok: false, error: 'Comanda nu a fost găsită.' };

  const fromStatus = order.status as OrderStatus;
  if (fromStatus === newStatus) return { ok: true }; // no-op

  // Build the update payload.
  const update: OrderUpdate = { status: newStatus };
  const tsCol = STATUS_TIMESTAMP[newStatus];
  if (tsCol) (update as Record<string, unknown>)[tsCol] = new Date().toISOString();
  // A refund implies the money went back (D5).
  if (newStatus === 'refunded') update.payment_status = 'refunded';

  // D7: release reserved stock on cancellation (only from a pre-shipment state).
  if (newStatus === 'cancelled' && RESERVED_STATUSES.has(fromStatus)) {
    const { data: items } = await sb
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);
    for (const it of items ?? []) {
      // release_stock isn't in the generated rpc types — cast.
      await sb.rpc('release_stock' as never, {
        p_product_id: it.product_id,
        p_qty: it.quantity,
        p_order_id: orderId,
      } as never);
    }
  }

  const { error: updErr } = await sb.from('orders').update(update).eq('id', orderId);
  if (updErr) return { ok: false, error: 'Nu am putut actualiza statusul.' };

  await sb.from('order_status_history').insert({
    order_id: orderId,
    from_status: fromStatus,
    to_status: newStatus,
    changed_by: admin.id,
    note: 'Status schimbat din panoul admin',
  });

  revalidatePath('/admin/comenzi');
  revalidatePath(`/admin/comenzi/${orderId}`);
  return { ok: true };
}

// D5: mark a (typically cash-on-delivery) order as paid once the courier
// confirms collection. Audited as a history row at the current status.
export async function markOrderPaid(orderId: string): Promise<OrderActionResult> {
  const admin = await requireAdminOrNotFound();

  const sb = getServerSupabase();

  const { data: order, error: fetchErr } = await sb
    .from('orders')
    .select('id, status, payment_status')
    .eq('id', orderId)
    .maybeSingle();
  if (fetchErr || !order) return { ok: false, error: 'Comanda nu a fost găsită.' };
  if (order.payment_status === 'paid') return { ok: true }; // no-op

  const { error: updErr } = await sb
    .from('orders')
    .update({ payment_status: 'paid' })
    .eq('id', orderId);
  if (updErr) return { ok: false, error: 'Nu am putut marca plata.' };

  await sb.from('order_status_history').insert({
    order_id: orderId,
    from_status: order.status,
    to_status: order.status,
    changed_by: admin.id,
    note: 'Plată marcată manual (încasare confirmată)',
  });

  revalidatePath('/admin/comenzi');
  revalidatePath(`/admin/comenzi/${orderId}`);
  return { ok: true };
}
