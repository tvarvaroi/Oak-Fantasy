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
  return { ok: true, id: data.id };
}

export async function updateProduct(id: string, input: unknown): Promise<ActionResult> {
  await requireAdminOrNotFound();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Verifică câmpurile evidențiate.' };
  }

  const sb = getServerSupabase();
  const { error } = await sb.from('products').update(toRow(parsed.data)).eq('id', id);

  if (error) {
    if (error.code === '23505') return { ok: false, ...uniqueError(error.message) };
    return { ok: false, error: 'Nu am putut actualiza produsul. Încearcă din nou.' };
  }

  revalidate();
  revalidatePath(`/admin/produse/${id}/edit`);
  return { ok: true, id };
}

// Soft toggle (D-status): ON -> 'active', OFF -> 'archived'. Never DELETE.
export async function toggleProductStatus(id: string, active: boolean): Promise<ActionResult> {
  await requireAdminOrNotFound();

  const sb = getServerSupabase();
  const { error } = await sb
    .from('products')
    .update({ status: active ? 'active' : 'archived' })
    .eq('id', id);

  if (error) {
    return { ok: false, error: 'Nu am putut schimba statusul.' };
  }

  revalidate();
  return { ok: true, id };
}
