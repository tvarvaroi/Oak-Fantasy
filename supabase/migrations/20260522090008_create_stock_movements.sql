/*
  # stock_movements

  Append-only audit trail of every inventory change. Written by the
  reserve_stock / release_stock / fulfill_stock functions and by admin
  restock/adjustment actions. quantity_before/after capture the affected metric
  at the time of the movement (see db_functions migration for semantics).
*/

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type             text NOT NULL CHECK (type IN ('restock','adjustment','order_reserved','order_fulfilled','order_cancelled','damaged','return')),
  quantity_change  integer NOT NULL,
  quantity_before  integer NOT NULL,
  quantity_after   integer NOT NULL,
  reason           text,
  order_id         uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements(created_at DESC);
