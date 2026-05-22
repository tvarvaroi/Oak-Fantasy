/*
  # Database helper functions (D7: stock + order-number in DB)

  - generate_order_number(): OF-YYYY-NNNN, global sequence (no yearly reset).
  - reserve_stock / release_stock / fulfill_stock: atomic, lock the inventory
    row FOR UPDATE, mutate, and append a stock_movements audit row in the same
    transaction. SECURITY DEFINER so they can be called from server actions and
    write the audit row regardless of the caller's RLS.

  Audit before/after semantics:
    - reserve / release  -> before/after of quantity_AVAILABLE (physical total
      unchanged; reservation just moves the available figure).
    - fulfill            -> before/after of quantity_TOTAL (item physically
      leaves stock; reserved is also decremented).
*/

-- ── order number ───────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'OF-' || to_char(now(),'YYYY') || '-' ||
         lpad(nextval('public.order_number_seq')::text, 4, '0');
$$;

-- ── reserve_stock ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.reserve_stock(p_product_id uuid, p_qty int, p_order_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_before int; v_after int;
BEGIN
  IF p_qty <= 0 THEN RAISE EXCEPTION 'Quantity must be positive, got %', p_qty; END IF;
  SELECT quantity_available INTO v_before FROM inventory WHERE product_id = p_product_id FOR UPDATE;
  IF v_before IS NULL THEN RAISE EXCEPTION 'No inventory row for product %', p_product_id; END IF;
  IF v_before < p_qty THEN
    RAISE EXCEPTION 'Insufficient stock for %: % available, % requested', p_product_id, v_before, p_qty;
  END IF;
  UPDATE inventory SET quantity_reserved = quantity_reserved + p_qty WHERE product_id = p_product_id;
  v_after := v_before - p_qty;
  INSERT INTO stock_movements(product_id, type, quantity_change, quantity_before, quantity_after, order_id)
  VALUES (p_product_id, 'order_reserved', -p_qty, v_before, v_after, p_order_id);
END;
$$;

-- ── release_stock (cancel a reservation) ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.release_stock(p_product_id uuid, p_qty int, p_order_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_before int; v_after int;
BEGIN
  IF p_qty <= 0 THEN RAISE EXCEPTION 'Quantity must be positive, got %', p_qty; END IF;
  SELECT quantity_available INTO v_before FROM inventory WHERE product_id = p_product_id FOR UPDATE;
  IF v_before IS NULL THEN RAISE EXCEPTION 'No inventory row for product %', p_product_id; END IF;
  UPDATE inventory SET quantity_reserved = GREATEST(quantity_reserved - p_qty, 0) WHERE product_id = p_product_id;
  v_after := v_before + p_qty;
  INSERT INTO stock_movements(product_id, type, quantity_change, quantity_before, quantity_after, order_id)
  VALUES (p_product_id, 'order_cancelled', p_qty, v_before, v_after, p_order_id);
END;
$$;

-- ── fulfill_stock (item ships) ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fulfill_stock(p_product_id uuid, p_qty int, p_order_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_before int; v_after int;
BEGIN
  IF p_qty <= 0 THEN RAISE EXCEPTION 'Quantity must be positive, got %', p_qty; END IF;
  SELECT quantity_total INTO v_before FROM inventory WHERE product_id = p_product_id FOR UPDATE;
  IF v_before IS NULL THEN RAISE EXCEPTION 'No inventory row for product %', p_product_id; END IF;
  IF v_before < p_qty THEN
    RAISE EXCEPTION 'Cannot fulfill % for %: only % in stock', p_qty, p_product_id, v_before;
  END IF;
  UPDATE inventory
    SET quantity_total    = quantity_total - p_qty,
        quantity_reserved = GREATEST(quantity_reserved - p_qty, 0)
    WHERE product_id = p_product_id;
  v_after := v_before - p_qty;
  INSERT INTO stock_movements(product_id, type, quantity_change, quantity_before, quantity_after, order_id)
  VALUES (p_product_id, 'order_fulfilled', -p_qty, v_before, v_after, p_order_id);
END;
$$;
