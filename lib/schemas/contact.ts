import { z } from 'zod';

// Subject taxonomy: keep keys stable (used in admin email + analytics later).
// Display labels are bilingual via SUBJECT_LABELS below.
export const CONTACT_SUBJECTS = [
  'product-question',
  'custom-order',
  'order-support',
  'b2b-corporate',
  'other',
] as const;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Numele este obligatoriu (min 2 caractere).'),
  email: z.string().trim().email('Adresa de email nu este validă.'),
  phone: z
    .string()
    .trim()
    .max(40, 'Numărul de telefon este prea lung.')
    .optional()
    .or(z.literal('')),
  subject: z.enum(CONTACT_SUBJECTS, {
    errorMap: () => ({ message: 'Selectează un subiect.' }),
  }),
  message: z
    .string()
    .trim()
    .min(20, 'Mesajul trebuie să aibă cel puțin 20 de caractere.')
    .max(2000, 'Mesajul nu poate depăși 2000 de caractere.'),
  // Honeypot — must stay empty. Filled = bot, we drop silently server-side.
  website: z.string().max(0).optional().or(z.literal('')),
  // Timing check (defense layer 2 alongside honeypot). Client sends the
  // milliseconds elapsed between page mount and form submit. Anything under
  // 2000 is treated as a bot signal and dropped silently. Optional because
  // older browsers / NoScript flows would never set it.
  elapsedMs: z.number().int().nonnegative().optional(),
  // Locale lets the API send the auto-reply in the user's language.
  locale: z.enum(['ro', 'en']).default('ro'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export const SUBJECT_LABELS: Record<
  'ro' | 'en',
  Record<ContactSubject, string>
> = {
  ro: {
    'product-question': 'Întrebare despre un produs',
    'custom-order': 'Comandă personalizată / Gravare custom',
    'order-support': 'Suport pentru o comandă existentă',
    'b2b-corporate': 'Colaborare / B2B / Cadouri corporate',
    other: 'Altele',
  },
  en: {
    'product-question': 'Product question',
    'custom-order': 'Custom order / Engraving',
    'order-support': 'Order support',
    'b2b-corporate': 'B2B / Corporate gifts',
    other: 'Other',
  },
};
