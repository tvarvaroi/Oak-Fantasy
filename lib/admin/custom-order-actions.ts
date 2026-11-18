'use server';

// Admin actions for custom-order requests (2026-11-18). Same pattern as
// order-actions: re-assert admin, then write through the cookie-bound client so
// RLS "Admin full access custom_orders" is the real gate (no service role).
// No stock, no order history — these requests live outside checkout.
// Hard DELETE is intentional here (founder decision 2026-11-18): cancelling is
// the 'cancelled' status; delete is for spam/duplicates and GDPR erasure.

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { getServerSupabase } from '@/lib/supabase-server';
import { customOrderUpdateSchema } from '@/lib/schemas/custom-order';

export type CustomOrderActionResult = { ok: true } | { ok: false; error: string };

const LIST_PATH = '/admin/comenzi-custom';

export async function updateCustomOrder(input: unknown): Promise<CustomOrderActionResult> {
  await requireAdminOrNotFound();

  const parsed = customOrderUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Date invalide.' };
  const { id, status, internalNotes } = parsed.data;

  const notes = internalNotes.trim();
  const { data, error } = await getServerSupabase()
    .from('custom_orders')
    .update({ status, internal_notes: notes === '' ? null : notes })
    .eq('id', id)
    .select('id');

  if (error) {
    console.error('[admin/custom-orders] update failed:', error);
    return { ok: false, error: 'Nu am putut salva. Încearcă din nou.' };
  }
  if (!data || data.length === 0) return { ok: false, error: 'Cererea nu a fost găsită.' };

  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/${id}`);
  return { ok: true };
}

export async function deleteCustomOrder(id: unknown): Promise<CustomOrderActionResult> {
  await requireAdminOrNotFound();

  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: 'Cerere invalidă.' };

  const { data, error } = await getServerSupabase()
    .from('custom_orders')
    .delete()
    .eq('id', parsed.data)
    .select('id');

  if (error) {
    console.error('[admin/custom-orders] delete failed:', error);
    return { ok: false, error: 'Nu am putut șterge. Încearcă din nou.' };
  }
  if (!data || data.length === 0) return { ok: false, error: 'Cererea nu a fost găsită.' };

  revalidatePath(LIST_PATH);
  return { ok: true };
}
