'use server';

// Admin product CRUD — the project's first server actions (D3). Authorization:
// every action re-asserts admin (requireAdminOrNotFound) AND writes go through
// the cookie-bound anon client, so RLS's "Admin full access products" policy is
// the real gate (D4 — least privilege, no service role). Money in -> bani
// stored. Soft-delete only: toggleProductStatus flips active<->archived, never
// DELETE (backend rule).

import { revalidatePath } from 'next/cache';

import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import { getServerSupabase } from '@/lib/supabase-server';
import { productSchema, ronToBani, type ProductFormOutput } from '@/lib/schemas/product';
import { productChangeUrls, submitToIndexNow, type ProductState } from '@/lib/indexnow';
import type { Database } from '@/types/supabase';

type ProductInsert = Database['public']['Tables']['products']['Insert'];
type Json = Database['public']['Tables']['products']['Row']['dimensions'];

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function emptyToNull(v: string | undefined): string | null {
  return v && v.trim() !== '' ? v.trim() : null;
}

function buildDimensions(d: ProductFormOutput): Json {
  if (d.shape === 'round') {
    if (d.diameter_cm === undefined && d.thickness_cm === undefined) return null;
    return {
      shape: 'round',
      diameter: d.diameter_cm ?? null,
      thickness: d.thickness_cm ?? null,
      unit: 'cm',
    } as Json;
  }
  if (d.shape === 'rectangular') {
    if (
      d.length_cm === undefined &&
      d.width_cm === undefined &&
      d.thickness_cm === undefined
    ) {
      return null;
    }
    return {
      shape: 'rectangular',
      length: d.length_cm ?? null,
      width: d.width_cm ?? null,
      thickness: d.thickness_cm ?? null,
      unit: 'cm',
    } as Json;
  }
  return null;
}

// Maps validated form output to a DB row (RON -> bani, '' -> null, dims jsonb).
function toRow(d: ProductFormOutput): ProductInsert {
  return {
    name_ro: d.name_ro,
    name_en: d.name_en,
    slug: d.slug,
    sku: d.sku,
    tier: d.tier,
    status: d.status,
    price_ron: ronToBani(d.price_ron),
    compare_at_price_ron:
      d.compare_at_price_ron !== undefined ? ronToBani(d.compare_at_price_ron) : null,
    short_description_ro: emptyToNull(d.short_description_ro),
    short_description_en: emptyToNull(d.short_description_en),
    long_description_ro: emptyToNull(d.long_description_ro),
    long_description_en: emptyToNull(d.long_description_en),
    dimensions: buildDimensions(d),
    weight_kg: d.weight_kg ?? null,
    production_time_minutes: d.production_time_minutes ?? null,
    has_engraving_option: d.has_engraving_option,
    engraving_price_ron:
      d.has_engraving_option && d.engraving_price_ron !== undefined
        ? ronToBani(d.engraving_price_ron)
        : null,
    meta_title_ro: emptyToNull(d.meta_title_ro),
    meta_title_en: emptyToNull(d.meta_title_en),
    meta_description_ro: emptyToNull(d.meta_description_ro),
    meta_description_en: emptyToNull(d.meta_description_en),
    sort_order: d.sort_order ?? 0,
    hero_image_url: emptyToNull(d.hero_image_url),
    gallery_image_urls: d.gallery_image_urls ?? [],
  };
}

// Postgres unique_violation -> a message that points at the offending field.
function uniqueError(message: string): { error: string; fieldErrors?: Record<string, string> } {
  const lower = message.toLowerCase();
  if (lower.includes('slug')) {
    return { error: 'Există deja un produs cu acest slug.', fieldErrors: { slug: 'Slug deja folosit.' } };
  }
  if (lower.includes('sku')) {
    return { error: 'Există deja un produs cu acest SKU.', fieldErrors: { sku: 'SKU deja folosit.' } };
  }
  return { error: 'Slug sau SKU există deja.' };
}

function revalidate() {
  revalidatePath('/admin/produse');
  revalidatePath('/tocatoare');
  // The public pages a product change shows up on, by their route patterns
  // (the bare '/tocatoare' above never matched a localized page). Without
  // this, the first visitor after a save — often the crawler IndexNow just
  // invited — is served the page from before the change.
  // Guarded: the row is already saved at this point, and a cache refresh
  // that fails must not be reported to the admin as a failed save (the pages
  // still refresh on their own within the ISR window).
  try {
    revalidatePath('/[locale]/tocatoare', 'page');
    revalidatePath('/[locale]/tocatoare/[slug]', 'page');
    revalidatePath('/[locale]', 'page');
    revalidatePath('/sitemap.xml');
  } catch (err) {
    console.warn('[products] public revalidation failed', err);
  }
}

// Tell IndexNow which public URLs changed (lib/indexnow.ts). Runs AFTER the
// row is saved and can never undo or block that: submitToIndexNow never
// throws (it logs), and the extra try/catch covers even building the list.
// It is awaited, bounded by its own 4 s timeout, because a serverless function
// may be frozen as soon as the action returns.
async function notifySearchEngines(before: ProductState | null, after: ProductState | null) {
  try {
    await submitToIndexNow(productChangeUrls(before, after));
  } catch (err) {
    console.warn('[indexnow] notify failed', err);
  }
}

// The product's public state before a change. null when it cannot be read —
// then only what is public AFTER the change is notified.
async function readProductState(
  sb: ReturnType<typeof getServerSupabase>,
  id: string,
): Promise<ProductState | null> {
  try {
    const { data } = await sb.from('products').select('slug, status').eq('id', id).maybeSingle();
    return data ? { slug: data.slug, active: data.status === 'active' } : null;
  } catch {
    return null;
  }
}

export async function createProduct(input: unknown): Promise<ActionResult> {
  await requireAdminOrNotFound();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Verifică câmpurile evidențiate.' };
  }

  const sb = getServerSupabase();
  const { data, error } = await sb
    .from('products')
    .insert(toRow(parsed.data))
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return { ok: false, ...uniqueError(error.message) };
    return { ok: false, error: 'Nu am putut salva produsul. Încearcă din nou.' };
  }

  revalidate();
  await notifySearchEngines(null, { slug: parsed.data.slug, active: parsed.data.status === 'active' });
  return { ok: true, id: data.id };
}

export async function updateProduct(id: string, input: unknown): Promise<ActionResult> {
  await requireAdminOrNotFound();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Verifică câmpurile evidențiate.' };
  }

  const sb = getServerSupabase();
  const before = await readProductState(sb, id);
  const { error } = await sb.from('products').update(toRow(parsed.data)).eq('id', id);

  if (error) {
    if (error.code === '23505') return { ok: false, ...uniqueError(error.message) };
    return { ok: false, error: 'Nu am putut actualiza produsul. Încearcă din nou.' };
  }

  revalidate();
  revalidatePath(`/admin/produse/${id}/edit`);
  await notifySearchEngines(before, { slug: parsed.data.slug, active: parsed.data.status === 'active' });
  return { ok: true, id };
}

// Soft toggle (D-status): ON -> 'active', OFF -> 'archived'. Never DELETE.
export async function toggleProductStatus(id: string, active: boolean): Promise<ActionResult> {
  await requireAdminOrNotFound();

  const sb = getServerSupabase();
  const before = await readProductState(sb, id);
  const { error } = await sb
    .from('products')
    .update({ status: active ? 'active' : 'archived' })
    .eq('id', id);

  if (error) {
    return { ok: false, error: 'Nu am putut schimba statusul.' };
  }

  revalidate();
  if (before) await notifySearchEngines(before, { slug: before.slug, active });
  return { ok: true, id };
}
