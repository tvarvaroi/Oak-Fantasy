import Stripe from 'stripe';

// SERVER ONLY. Lazy Stripe singleton. The instance is created on first use (not
// at module load) so a missing key never crashes the build / prerender — it
// only throws when a payment action actually runs without the key configured.
// apiVersion is left to the SDK's pinned default (stripe@22) to avoid drift.

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
