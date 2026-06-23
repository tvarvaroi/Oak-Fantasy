/*
  # adjust_stock(...) — manual admin stock adjustment (Task 4.1, D6)

  Sets quantity_total to an absolute value (the admin enters "I now have N"),
  computes the delta internally, and records an audited stock_movements row in
  the SAME transaction — same invariant as reserve/release/fulfill (backend rule:
  stock mutations go through atomic PL/pgSQL functions with FOR UPDATE locks).

  Guards: row must exist, new total >= 0, and new total >= quantity_reserved
  (can't drop physical stock below what's already reserved for live orders).
  No-op (delta = 0) writes nothing.

  Movement type: 'restock' when adding, 'adjustment' when reducing.
  before/after capture quantity_TOTAL (physical count), like fulfill_stock.

  SECURITY DEFINER so it can write the audit row regardless of caller RLS;
  called only from the admin 'use server' action (which re-asserts admin).

  Founder hand-off: apply to the live Supabase project, then regenerate types.
*/

CREATE OR REPLACE FUNCTION public.adjust_stock(
  p_product_id uuid,
  p_new_total  int,
  p_reason     text DEFAULT NULL,
  p_by         uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total    int;
  v_reserved int;
  v_delta    int;
  v_type     text;
BEGIN
  IF p_new_total < 0 THEN
    RAISE EXCEPTION 'New total must be >= 0, got %', p_new_total;
  END IF;

  SELECT quantity_total, quantity_reserved
    INTO v_total, v_reserved
    FROM inventory
    WHERE product_id = p_product_id
    FOR UPDATE;

  IF v_total IS NULL THEN
    RAISE EXCEPTION 'No inventory row for product %', p_product_id;
  END IF;

  IF p_new_total < v_reserved THEN
    RAISE EXCEPTION 'New total % is below reserved % for product %', p_new_total, v_reserved, p_product_id;
  END IF;

  v_delta := p_new_total - v_total;
  IF v_delta = 0 THEN
    RETURN; -- no-op, nothing to audit
  END IF;

  UPDATE inventory SET quantity_total = p_new_total WHERE product_id = p_product_id;

  v_type := CASE WHEN v_delta > 0 THEN 'restock' ELSE 'adjustment' END;

  INSERT INTO stock_movements(
    product_id, type, quantity_change, quantity_before, quantity_after, reason, created_by
  ) VALUES (
    p_product_id, v_type, v_delta, v_total, p_new_total, NULLIF(p_reason, ''), p_by
  );
END;
$$;
