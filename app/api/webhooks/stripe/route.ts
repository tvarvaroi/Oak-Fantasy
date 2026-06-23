import type Stripe from 'stripe';

import { getStripe } from '@/lib/stripe/server';
import { getServiceSupabase } from '@/lib/supabase-server';

// Stripe webhook (Task 3.4). Lives under /api (excluded from middleware). Must
// read the RAW body for signature verification. Handles:
//   checkout.session.completed → order confirmed + paid (idempotent)
//   checkout.session.expired   → release reserved stock + cancel (D4)
// Founder hand-off: add the endpoint in the Stripe Dashboard with BOTH events
// and put the signing secret in STRIPE_WEBHOOK_SECRET.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function orderIdOf(session: Stripe.Checkout.Session): string | null {
  return (session.metadata?.orderId as string | undefined) || session.client_reference_id || null;
}

async function handleCompleted(session: Stripe.Checkout.Session) {
  const orderId = orderIdOf(session);
  if (!orderId) return;
  const sb = getServiceSupabase();
  const { data: order } = await sb
    .from('orders')
    .select('id, status, payment_status')
    .eq('id', orderId)
    .maybeSingle();
  if (!order || order.payment_status === 'paid') return; // idempotent

  await sb
    .from('orders')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    })
    .eq('id', orderId);

  await sb.from('order_status_history').insert({
    order_id: orderId,
    from_status: order.status,
    to_status: 'confirmed',
    note: 'Payment received (Stripe)',
  });
}

async function handleExpired(session: Stripe.Checkout.Session) {
  const orderId = orderIdOf(session);
  if (!orderId) return;
  const sb = getServiceSupabase();
  const { data: order } = await sb
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .maybeSingle();
  if (!order || order.status !== 'pending_payment') return; // only unpaid orders

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

  await sb
    .from('orders')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', orderId);

  await sb.from('order_status_history').insert({
    order_id: orderId,
    from_status: order.status,
    to_status: 'cancelled',
    note: 'Checkout session expired',
  });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response('Webhook not configured', { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await handleCompleted(event.data.object as Stripe.Checkout.Session);
    } else if (event.type === 'checkout.session.expired') {
      await handleExpired(event.data.object as Stripe.Checkout.Session);
    }
  } catch {
    // Let Stripe retry on a processing error.
    return new Response('Handler error', { status: 500 });
  }

  return new Response('ok', { status: 200 });
}
