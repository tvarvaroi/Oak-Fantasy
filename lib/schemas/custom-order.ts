import { z } from 'zod';

import { normalizeRoPhone } from '@/lib/whatsapp';

// Custom-order requests (2026-11-18). Single source of truth for the status
// set — mirrors the DB CHECK on custom_orders.status (migration
// 20261118090000) — and for the public form's validation rules.

export const CUSTOM_ORDER_STATUSES = [
  'new',
  'contacted',
  'in_progress',
  'completed',
  'cancelled',
] as const;

export type CustomOrderStatus = (typeof CUSTOM_ORDER_STATUSES)[number];

export const CUSTOM_ORDER_STATUS_LABELS: Record<CustomOrderStatus, string> = {
  new: 'Nouă',
  contacted: 'Contactat',
  in_progress: 'În lucru',
  completed: 'Finalizată',
  cancelled: 'Anulată',
};

/** Status every request starts in — the admin badge counts these. */
export const NEW_CUSTOM_ORDER_STATUS: CustomOrderStatus = 'new';

export function isCustomOrderStatus(value: string): value is CustomOrderStatus {
  return (CUSTOM_ORDER_STATUSES as readonly string[]).includes(value);
}

export const CUSTOM_ORDER_LIMITS = {
  nameMin: 2,
  nameMax: 80,
  ideaMin: 10,
  ideaMax: 2000,
  notesMax: 5000,
} as const;

// Messages are ERROR CODES, not copy: the form maps them to RO/EN text from
// components/la-comanda/content.ts, so one schema serves both locales and the
// server action can return the same codes.
// Lengths are counted in code points (Array.from(v).length), like Postgres
// char_length() in the table CHECKs — JS .length counts UTF-16 units, so five
// emoji would pass min(10) here and then fail the DB constraint.
const codePoints = (v: string) => Array.from(v).length;
const noNul = (v: string) => !v.includes(String.fromCharCode(0));

export const customOrderFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .refine((v) => codePoints(v) >= CUSTOM_ORDER_LIMITS.nameMin, 'name_short')
    .refine((v) => codePoints(v) <= CUSTOM_ORDER_LIMITS.nameMax, 'name_long')
    .refine(noNul, 'name_short'),
  phone: z
    .string()
    .trim()
    .min(1, 'phone_required')
    .refine((v) => normalizeRoPhone(v) !== null, 'phone_invalid'),
  idea: z
    .string()
    .trim()
    .refine((v) => codePoints(v) >= CUSTOM_ORDER_LIMITS.ideaMin, 'idea_short')
    .refine((v) => codePoints(v) <= CUSTOM_ORDER_LIMITS.ideaMax, 'idea_long')
    .refine(noNul, 'idea_short'),
});

export type CustomOrderFields = z.infer<typeof customOrderFieldsSchema>;
export type CustomOrderField = keyof CustomOrderFields;
export type CustomOrderErrorCode =
  | 'name_short'
  | 'name_long'
  | 'phone_required'
  | 'phone_invalid'
  | 'idea_short'
  | 'idea_long';

// What the server action receives. The honeypot is deliberately NOT
// constrained here (unlike the contact schema's max(0)): a filled honeypot
// must reach the silent-success branch, not leak a validation error to a bot.
export const customOrderPayloadSchema = customOrderFieldsSchema.extend({
  website: z.string().max(500).optional(),
  elapsedMs: z.number().int().nonnegative().optional(),
  locale: z.enum(['ro', 'en']),
});

export type CustomOrderPayload = z.infer<typeof customOrderPayloadSchema>;

// Admin edit (status + internal notes).
export const customOrderUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(CUSTOM_ORDER_STATUSES),
  internalNotes: z.string().max(CUSTOM_ORDER_LIMITS.notesMax),
});
