'use server';

// Public server action behind the /la-comanda form (2026-11-18).
//
// custom_orders has NO anon policy: a visitor has no session, so the insert
// goes through the service-role client — allowed by the backend rules only in
// 'use server' code, after every check below has passed:
//   1. Zod (same rules as the client form; errors are codes, not copy)
//   2. rate limit 5/hour/IP (in-memory — see lib/rate-limit.ts threat model)
//   3. honeypot `website` filled  -> silent success, nothing stored
//   4. submitted < 2s after mount -> silent success, nothing stored
// Same defence layers as /api/contact. The admin email is best-effort and
// never affects the result.

import { headers } from 'next/headers';

import { getServiceSupabase } from '@/lib/supabase-server';
import { getClientIpFromHeaders, rateLimit } from '@/lib/rate-limit';
import { normalizeRoPhone } from '@/lib/whatsapp';
import {
  customOrderPayloadSchema,
  type CustomOrderErrorCode,
  type CustomOrderField,
} from '@/lib/schemas/custom-order';
import { notifyAdminOfCustomOrder } from './notify-admin';

const MAX_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;
const MIN_FORM_FILL_MS = 2000;

export type SubmitCustomOrderResult =
  | { ok: true }
  | {
      ok: false;
      error: 'validation' | 'rate_limited' | 'server';
      fieldErrors?: Partial<Record<CustomOrderField, CustomOrderErrorCode>>;
    };

export async function submitCustomOrder(input: unknown): Promise<SubmitCustomOrderResult> {
  const ip = getClientIpFromHeaders(headers());

  const rl = rateLimit(`custom-order:${ip}`, MAX_PER_HOUR, HOUR_MS);
  if (!rl.success) {
    console.warn(`[custom-order] rate limited ip=${ip}`);
    return { ok: false, error: 'rate_limited' };
  }

  const parsed = customOrderPayloadSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<CustomOrderField, CustomOrderErrorCode>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if ((key === 'name' || key === 'phone' || key === 'idea') && !fieldErrors[key]) {
        fieldErrors[key] = issue.message as CustomOrderErrorCode;
      }
    }
    return { ok: false, error: 'validation', fieldErrors };
  }
  const data = parsed.data;

  if (data.website && data.website.length > 0) {
    console.warn(`[custom-order] honeypot triggered ip=${ip}`);
    return { ok: true };
  }
  if (typeof data.elapsedMs === 'number' && data.elapsedMs < MIN_FORM_FILL_MS) {
    console.warn(`[custom-order] timing-check triggered ip=${ip} elapsedMs=${data.elapsedMs}`);
    return { ok: true };
  }

  // Validated above, so normalization cannot fail here.
  const phone = normalizeRoPhone(data.phone) as string;

  const { data: row, error } = await getServiceSupabase()
    .from('custom_orders')
    .insert({
      customer_name: data.name,
      customer_phone: phone,
      description: data.idea,
      locale: data.locale,
    })
    .select('id, created_at')
    .single();

  if (error || !row) {
    console.error('[custom-order] insert failed:', error);
    return { ok: false, error: 'server' };
  }

  await notifyAdminOfCustomOrder({
    id: row.id,
    name: data.name,
    phone,
    idea: data.idea,
    locale: data.locale,
    createdAt: row.created_at,
  });

  return { ok: true };
}
