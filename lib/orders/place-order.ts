'use server';

import { getUser } from '@/lib/auth/get-user';
import { getServiceSupabase } from '@/lib/supabase-server';
import { checkoutSchema } from '@/lib/schemas/checkout';
import { localizedPath, isLocale, type Locale } from '@/lib/i18n-routes';
import { getStripe, isStripeConfigured } from '@/lib/stripe/server';
import { createOrder } from './create-order';
import { sendOrderEmails } from './send-order-emails';

export interface PlaceOrderInput {
  checkout: unknown; // CheckoutData — re-validated here, never trusted from the client
  items: { productId: string; quantity: number; engravingText?: string }[];
  locale: string;
}

export type PlaceOrderResult =
  | { ok: true; mode: 'stripe'; url: string }
  | { ok: true; mode: 'thankyou'; path: string }
  | { ok: false; error: string };

function appOrigin(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  return (env || 'https://oak-fantasy.vercel.app').replace(/\/$/, '');
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input.checkout);
  if (!parsed.success) return { ok: false, error: 'invalid' };
  if (!input.items?.length) return { ok: false, error: 'empty' };
  const locale: Locale = isLocale(input.locale) ? input.locale : 'ro';
  const data = parsed.data;

  const user = await getUser();

  const created = await createOrder({
    contact: {
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      street: data.street,
      city: data.city,
      county: data.county,
      postalCode: data.postalCode,
      notes: data.notes || undefined,
      paymentMethod: data.paymentMethod,
    },
    items: input.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      engravingText: i.engravingText,
    })),
    profileId: user?.id ?? null,
    locale,
  });

  if (!created.ok) {
    return { ok: false, error: created.error };
  }

  const thankYouPath = `${localizedPath('multumim', locale)}/${created.orderId}`;

  // Ramburs — no online payment, the order is placed now (pending_cod). Send
  // both emails here (best-effort, D5 — never blocks the confirmation). The
  // card path emails fire later from the webhook, on payment confirmation.
  if (data.paymentMethod === 'cod') {
    await sendOrderEmails(created.orderId);
    return { ok: true, mode: 'thankyou', path: thankYouPath };
  }

  // Card — Stripe Checkout (hosted).
  if (!isStripeConfigured()) {
    return { ok: false, error: 'stripe_unconfigured' };
  }

  const origin = appOrigin();
  const stripe = getStripe();

  const lineItems = created.lines.map((l) => ({
    price_data: {
      currency: 'ron',
      product_data: {
        name: locale === 'ro' ? l.nameRo : l.nameEn,
        ...(l.engravingText ? { description: `Gravare: ${l.engravingText}` } : {}),
      },
      unit_amount: l.unitAmountRon, // bani — already the smallest RON unit (D7)
    },
    quantity: l.quantity,
  }));

  if (created.shippingCostRon > 0) {
    lineItems.push({
      price_data: {
        currency: 'ron',
        product_data: { name: locale === 'ro' ? 'Transport' : 'Shipping' },
        unit_amount: created.shippingCostRon,
      },
      quantity: 1,
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: locale === 'ro' ? 'ro' : 'en',
      customer_email: data.email,
      client_reference_id: created.orderId,
      metadata: { orderId: created.orderId, orderNumber: created.orderNumber },
      line_items: lineItems,
      success_url: `${origin}${thankYouPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${localizedPath('checkout', locale)}`,
    });

    if (!session.url) return { ok: false, error: 'stripe_no_url' };

    // Link the session to the order for webhook reconciliation.
    await getServiceSupabase()
      .from('orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', created.orderId);

    return { ok: true, mode: 'stripe', url: session.url };
  } catch {
    return { ok: false, error: 'stripe_failed' };
  }
}
