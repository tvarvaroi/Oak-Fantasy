// Payment configuration (2026-10-15 — founder decision: cash on delivery only).
//
// CARD_PAYMENTS_ENABLED is THE single switch for the whole Stripe path. Default
// OFF. Everything Stripe-related stays in the repo, dormant:
//   - checkout: no payment step / no card radio (PaymentStep is not rendered)
//   - placeOrder: paymentMethod is forced to 'cod' server-side
//   - /api/webhooks/stripe: answers 410 before touching Stripe
//   - admin: 'pending_payment' is hidden from the status dropdown + filters
//
// Reactivation = set NEXT_PUBLIC_ENABLE_CARD_PAYMENTS=true + STRIPE_SECRET_KEY +
// STRIPE_WEBHOOK_SECRET (+ the webhook endpoint in the Stripe Dashboard). Zero
// code changes. Full checklist: _brain/notes/payments-dormant-stripe.md.
//
// NEXT_PUBLIC_ on purpose: the checkout UI (client) needs the same answer as
// the server. It is a boolean feature flag, not a secret.
export const CARD_PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CARD_PAYMENTS === 'true';

/** The only payment method accepted while card payments are dormant. */
export const DEFAULT_PAYMENT_METHOD = 'cod' as const;
