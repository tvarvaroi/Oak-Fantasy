/*
  # create_order(...) RPC (Task 3.4)

  Atomic order placement: order_number + order + order_items + reserve_stock +
  status_history, ALL in one transaction (a function IS a transaction). If
  reserve_stock RAISEs (insufficient stock / no inventory row — D4 strict), the
  whole thing rolls back: no phantom order, no partial reservation. Caller (the
  'use server' action) catches the error and surfaces it.

  SECURITY DEFINER so it can write through RLS (called only from the service-role
  server action, never the client). Totals + per-line prices are computed
  server-side from CURRENT DB prices (D1) by the caller and passed in; this
  function trusts them (server-to-server) and does the atomic writes + stock.

  Must be applied to the live Supabase project (founder hand-off), like the
  Storage/subscribers migrations.

  p_items: jsonb array, each:
    { product_id, product_snapshot, quantity, unit_price_ron,
      engraving_text, engraving_price_ron, line_total_ron }
  Returns: { id, order_number }
*/

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
  p_items             jsonb
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
    shipping_address, billing_address, customer_notes
  ) VALUES (
    v_order_number, p_profile_id, p_guest_email, p_guest_phone, p_status, p_payment_method,
    'pending', p_subtotal_ron, p_shipping_cost_ron, p_total_ron, 'RON',
    p_shipping_address, p_billing_address, p_customer_notes
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
