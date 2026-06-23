'use server';

// Admin inventory mutation (Task 4.1, D6). Sets an absolute quantity_total via
// the atomic adjust_stock PL/pgSQL function (FOR UPDATE + audited movement). Same
// pattern as product-actions: requireAdminOrNotFound + getServerSupabase (RLS is
// the real gate). Revalidates the admin edit page + the public catalog/detail so
// the new availability reflects quickly.

import { revalidatePath } from 'next/cache';

import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { getServerSupabase } from '@/lib/supabase-server';

export type StockActionResult = { ok: true } | { ok: false; error: string };

export async function adjustStock(
  productId: string,
  newTotal: number,
  reason: string,
  slug?: string,
): Promise<StockActionResult> {
  const admin = await requireAdminOrNotFound();

  if (!Number.isInteger(newTotal) || newTotal < 0) {
    return { ok: false, error: 'Cantitatea trebuie să fie un număr întreg ≥ 0.' };
  }

  const sb = getServerSupabase();
  // adjust_stock isn't in the generated rpc types yet (migration 20260623120000;
  // types regen deferred to founder) — cast the call.
  const { error } = await sb.rpc('adjust_stock' as never, {
    p_product_id: productId,
    p_new_total: newTotal,
    p_reason: reason.trim() || null,
    p_by: admin.id,
  } as never);

  if (error) {
    const msg = (error as { message?: string }).message?.toLowerCase() ?? '';
    if (msg.includes('below reserved')) {
      return { ok: false, error: 'Nu poți seta stocul sub cantitatea rezervată pentru comenzi active.' };
    }
    if (msg.includes('no inventory row')) {
      return { ok: false, error: 'Acest produs nu are încă un rând de inventar.' };
    }
    return { ok: false, error: 'Nu am putut actualiza stocul.' };
  }

  revalidatePath(`/admin/produse/${productId}/edit`);
  revalidatePath('/admin/produse');
  revalidatePath('/tocatoare');
  if (slug) {
    revalidatePath(`/tocatoare/${slug}`);
    revalidatePath(`/cutting-boards/${slug}`);
  }
  return { ok: true };
}
