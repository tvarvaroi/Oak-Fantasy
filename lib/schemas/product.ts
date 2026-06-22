import { z } from 'zod';

// Product form schema (Task 2.4). Authoritative validation for the admin CRUD —
// the server action re-parses with this; the client form uses it via
// zodResolver too. Money is entered in RON here (D5) and converted to integer
// bani in the action (backend rule: never floats for currency). Numbers arrive
// from <input> as strings, so numeric fields .transform() string -> number and
// keep '' as "not provided" for optionals (z.input stays a usable string union
// for react-hook-form; z.output is the coerced number).

export const TIERS = ['entry', 'core', 'premium', 'hero'] as const;
export const STATUSES = ['draft', 'active', 'archived'] as const;
export const SHAPES = ['rectangular', 'round'] as const;

export type Tier = (typeof TIERS)[number];
export type Status = (typeof STATUSES)[number];

// kebab-case: lowercase letters, digits, single hyphens between groups.
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalNumber = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => (v === '' || v === null || v === undefined ? undefined : Number(v)))
  .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0), 'Trebuie să fie un număr pozitiv.');

const optionalInt = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => (v === '' || v === null || v === undefined ? undefined : Math.trunc(Number(v))))
  .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0), 'Trebuie să fie un întreg pozitiv.');

const requiredPrice = z
  .union([z.string(), z.number()])
  .transform((v) => (v === '' ? NaN : Number(v)))
  .refine((v) => !Number.isNaN(v) && v >= 0, 'Introdu un preț valid (RON).');

const optionalText = z.string().trim().optional().or(z.literal(''));

export const productSchema = z
  .object({
    // Identity
    name_ro: z.string().trim().min(1, 'Numele (RO) este obligatoriu.'),
    name_en: z.string().trim().min(1, 'Numele (EN) este obligatoriu.'),
    slug: z
      .string()
      .trim()
      .min(1, 'Slug obligatoriu.')
      .regex(slugRegex, 'Slug invalid — doar litere mici, cifre și cratime.'),
    sku: z.string().trim().min(1, 'SKU obligatoriu.'),
    tier: z.enum(TIERS, { errorMap: () => ({ message: 'Alege un tier.' }) }),
    status: z.enum(STATUSES, { errorMap: () => ({ message: 'Alege un status.' }) }),

    // Pricing (RON in the UI -> bani in the action)
    price_ron: requiredPrice,
    compare_at_price_ron: optionalNumber,

    // Descriptions
    short_description_ro: optionalText,
    short_description_en: optionalText,
    long_description_ro: optionalText,
    long_description_en: optionalText,

    // Dimensions (assembled into jsonb in the action)
    shape: z.enum(SHAPES).optional().or(z.literal('')),
    length_cm: optionalNumber,
    width_cm: optionalNumber,
    thickness_cm: optionalNumber,
    diameter_cm: optionalNumber,

    // Physical / production
    weight_kg: optionalNumber,
    production_time_minutes: optionalInt,

    // Engraving
    has_engraving_option: z.boolean(),
    engraving_price_ron: optionalNumber,

    // SEO
    meta_title_ro: optionalText,
    meta_title_en: optionalText,
    meta_description_ro: optionalText,
    meta_description_en: optionalText,

    // Ordering + media
    sort_order: optionalInt,
    hero_image_url: optionalText,
    gallery_image_urls: z.array(z.string()).optional().default([]),
  })
  .refine((d) => !d.has_engraving_option || d.engraving_price_ron !== undefined, {
    message: 'Setează prețul gravării.',
    path: ['engraving_price_ron'],
  });

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormOutput = z.output<typeof productSchema>;

// Currency conversion — RON (may carry 2 decimals) <-> integer bani.
export function ronToBani(ron: number): number {
  return Math.round(ron * 100);
}

export function baniToRon(bani: number): number {
  return bani / 100;
}
