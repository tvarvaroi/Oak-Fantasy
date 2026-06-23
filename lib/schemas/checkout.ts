import { z } from 'zod';

import { isCounty } from '@/lib/data/counties';

// Checkout validation (Task 3.3). One schema; the form validates field subsets
// per step (contact+address at step 1, payment at step 2, terms at step 3).

// RO phone: 0xxxxxxxxx (10 digits) or +40xxxxxxxxx; spaces/dots/dashes tolerated
// and stripped before the check (D5).
const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Telefonul este obligatoriu.')
  .refine((v) => /^(\+40\d{9}|0\d{9})$/.test(v.replace(/[\s.\-()]/g, '')), {
    message: 'Număr de telefon invalid (ex: 0712 345 678).',
  });

export const PAYMENT_METHODS = ['stripe_card', 'cod'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const checkoutSchema = z.object({
  // Step 1 — contact + shipping address
  email: z.string().trim().email('Adresa de email nu este validă.'),
  fullName: z.string().trim().min(2, 'Numele complet este obligatoriu.'),
  phone: phoneSchema,
  street: z.string().trim().min(3, 'Strada și numărul sunt obligatorii.'),
  city: z.string().trim().min(2, 'Orașul este obligatoriu.'),
  county: z.string().min(1, 'Alege județul.').refine(isCounty, 'Județ invalid.'),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Cod poștal invalid (6 cifre).'),
  notes: z.string().trim().max(500, 'Observațiile sunt prea lungi.').optional().or(z.literal('')),

  // Step 2 — payment
  paymentMethod: z.enum(PAYMENT_METHODS, { errorMap: () => ({ message: 'Alege metoda de plată.' }) }),

  // Step 3 — terms
  termsAccepted: z.boolean().refine((v) => v === true, {
    message: 'Trebuie să accepți termenii și condițiile.',
  }),
});

export type CheckoutData = z.infer<typeof checkoutSchema>;

// Field groups validated before advancing each step.
export const STEP_FIELDS: Record<1 | 2, (keyof CheckoutData)[]> = {
  1: ['email', 'fullName', 'phone', 'street', 'city', 'county', 'postalCode'],
  2: ['paymentMethod'],
};
