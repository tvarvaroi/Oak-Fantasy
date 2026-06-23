// SERVER ONLY. Order creation. Revalidates against CURRENT DB prices (D1 — never
// trusts client snapshot), computes totals server-side (order-math), then calls
// the atomic create_order RPC (order + items + reserve_stock STRICT + history in
// one transaction — D4). Uses the service-role client (bypasses RLS; called only
// from the 'use server' action, never the client).

import { getServiceSupabase } from '@/lib/supabase-server';
import { lineTotalRon, calculateOrderTotal } from '@/lib/db/order-math';
import { shippingCost } from '@/lib/config/shipping';
import type { PaymentMethod } from '@/lib/schemas/checkout';

export interface OrderLineInput {
  productId: string;
  quantity: number;
  engravingText?: string;
}

export interface OrderContactInput {
  email: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  county: string;
  postalCode: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}

export interface CreateOrderInput {
  contact: OrderContactInput;
  items: OrderLineInput[];
  profileId: string | null;
}

export interface OrderDisplayLine {
  nameRo: string;
  nameEn: string;
  unitAmountRon: number; // bani, incl. per-unit engraving
  quantity: number;
  engravingText: string | null;
}

export type CreateOrderResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      totalRon: number;
      shippingCostRon: number;
      lines: OrderDisplayLine[];
    }
  | { ok: false; error: 'empty' | 'unavailable' | 'out_of_stock' | 'failed' };

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!input.items.length) return { ok: false, error: 'empty' };

  const sb = getServiceSupabase();

  // 1. Refetch CURRENT product data (D1 — authoritative prices, not client).
  const ids = Array.from(new Set(input.items.map((i) => i.productId)));
  const { data: products, error: prodErr } = await sb
    .from('products')
    .select('id, slug, name_ro, name_en, price_ron, has_engraving_option, engraving_price_ron, status, dimensions, hero_image_url')
    .in('id', ids);
  if (prodErr) return { ok: false, error: 'failed' };

  const byId = new Map((products ?? []).map((p) => [p.id, p]));

  // 2. Build line items from DB prices; reject inactive/missing products.
  const mathLines = [];
  const rpcItems = [];
  const displayLines: OrderDisplayLine[] = [];
  for (const item of input.items) {
    const p = byId.get(item.productId);
    if (!p || p.status !== 'active') return { ok: false, error: 'unavailable' };

    const wantsEngraving = !!(p.has_engraving_option && item.engravingText && item.engravingText.trim());
    const engravingText = wantsEngraving ? item.engravingText!.trim() : null;
    const engravingPriceRon = wantsEngraving ? p.engraving_price_ron ?? 0 : 0;
    const lineTotal = lineTotalRon({ unitPriceRon: p.price_ron, quantity: item.quantity, engravingPriceRon });

    mathLines.push({ unitPriceRon: p.price_ron, quantity: item.quantity, engravingPriceRon });
    rpcItems.push({
      product_id: p.id,
      product_snapshot: {
        name_ro: p.name_ro,
        name_en: p.name_en,
        slug: p.slug,
        dimensions: p.dimensions,
        price_ron: p.price_ron,
        hero_image_url: p.hero_image_url,
      },
      quantity: item.quantity,
      unit_price_ron: p.price_ron,
      engraving_text: engravingText,
      engraving_price_ron: engravingPriceRon,
      line_total_ron: lineTotal,
    });
    displayLines.push({
      nameRo: p.name_ro,
      nameEn: p.name_en,
      unitAmountRon: p.price_ron + engravingPriceRon,
      quantity: item.quantity,
      engravingText,
    });
  }

  // 3. Totals server-side (bani).
  const { subtotalRon } = calculateOrderTotal(mathLines);
  const shippingCostRon = shippingCost(subtotalRon);
  const totalRon = subtotalRon + shippingCostRon;

  const isCard = input.contact.paymentMethod === 'stripe_card';
  const status = isCard ? 'pending_payment' : 'pending_cod';

  const shippingAddress = {
    recipient_name: input.contact.fullName,
    street: input.contact.street,
    city: input.contact.city,
    county: input.contact.county,
    postal_code: input.contact.postalCode,
    phone: input.contact.phone,
    country: 'Romania',
  };

  // 4. Atomic create (RPC). create_order isn't in the generated types yet
  // (migration 20260623100000; types regen deferred) — cast the rpc call.
  const { data, error } = await sb.rpc('create_order' as never, {
    p_profile_id: input.profileId,
    p_guest_email: input.contact.email,
    p_guest_phone: input.contact.phone,
    p_status: status,
    p_payment_method: input.contact.paymentMethod,
    p_subtotal_ron: subtotalRon,
    p_shipping_cost_ron: shippingCostRon,
    p_total_ron: totalRon,
    p_shipping_address: shippingAddress,
    p_billing_address: shippingAddress,
    p_customer_notes: input.contact.notes?.trim() || null,
    p_items: rpcItems,
  } as never);

  if (error) {
    const msg = (error as { message?: string }).message?.toLowerCase() ?? '';
    if (msg.includes('insufficient stock') || msg.includes('no inventory row')) {
      return { ok: false, error: 'out_of_stock' };
    }
    return { ok: false, error: 'failed' };
  }

  const result = data as unknown as { id: string; order_number: string } | null;
  if (!result?.id) return { ok: false, error: 'failed' };

  return {
    ok: true,
    orderId: result.id,
    orderNumber: result.order_number,
    totalRon,
    shippingCostRon,
    lines: displayLines,
  };
}
