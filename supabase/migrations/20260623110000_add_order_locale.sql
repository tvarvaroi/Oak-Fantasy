/*
  # orders.locale + create_order(p_locale) (Task 3.5)

  Adds a persistent `locale` ('ro' | 'en') to orders so transactional emails
  (and future re-sends / per-language reports) know which language to render —
  the customer's checkout language is no longer lost after placement (D1).

  Self-contained on top of the Task 3.4 create_order RPC: it DROPs the 12-arg
  signature (created by 20260623100000) and recreates the function with a new
  p_locale argument, plus adds the column. DROP IF EXISTS makes it safe whether
  or not 3.4 was already applied.

  Must be applied to the live Supabase project (founder hand-off), like the
  Storage / subscribers / create_order migrations. Regenerate types after:
  `npx supabase gen types typescript --linked > types/supabase.ts`.
*/

-- 1. Persistent locale on orders (default 'ro' for any pre-existing rows).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'ro'
  CHECK (locale IN ('ro', 'en'));

-- 2. Recreate create_order with p_locale. Drop the 3.4 signature first so we
-- replace it (a different arg list would otherwise create an overload).
DROP FUNCTION IF EXISTS public.create_order(
  uuid, text, text, text, text, integer, integer, integer, jsonb, jsonb, text, jsonb
);

CREATE OR REPLACE FUNCTION public.create_order(
  p_profile_id        uuid,
  p_guest_email       text,
  p_guest_phone       text,
  p_status            text,
  p_payment_method    text,
  p_subtotal_ron      integer,
  p_shipping_cost_ron integer,
  p_total_ron         integer,
  p_shipping_address  jsonb,
  p_billing_address   jsonb,
  p_customer_notes    text,
  p_items             jsonb,
  p_locale            text DEFAULT 'ro'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id     uuid;
  v_order_number text;
  v_item         jsonb;
BEGIN
  v_order_number := public.generate_order_number();

  INSERT INTO public.orders (
    order_number, profile_id, guest_email, guest_phone, status, payment_method,
    payment_status, subtotal_ron, shipping_cost_ron, total_ron, currency,
    shipping_address, billing_address, customer_notes, locale
  ) VALUES (
    v_order_number, p_profile_id, p_guest_email, p_guest_phone, p_status, p_payment_method,
    'pending', p_subtotal_ron, p_shipping_cost_ron, p_total_ron, 'RON',
    p_shipping_address, p_billing_address, p_customer_notes,
    CASE WHEN p_locale IN ('ro', 'en') THEN p_locale ELSE 'ro' END
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (
      order_id, product_id, product_snapshot, quantity, unit_price_ron,
      engraving_text, engraving_price_ron, line_total_ron
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->'product_snapshot',
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price_ron')::integer,
      NULLIF(v_item->>'engraving_text', ''),
      COALESCE((v_item->>'engraving_price_ron')::integer, 0),
      (v_item->>'line_total_ron')::integer
    );

    -- Strict (D4): raises on insufficient stock / missing inventory row →
    -- rolls back the entire order.
    PERFORM public.reserve_stock(
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::integer,
      v_order_id
    );
  END LOOP;

  INSERT INTO public.order_status_history (order_id, from_status, to_status, note)
  VALUES (v_order_id, NULL, p_status, 'Order created');

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
END;
$$;
