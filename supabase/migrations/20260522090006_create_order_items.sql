/*
  # order_items

  Line items for an order. product_snapshot (jsonb) freezes name/slug/dimensions/
  price at order time so historical orders stay accurate even if the product
  later changes. line_total_ron = (unit_price + engraving) * quantity (computed
  app-side via lib/db/order-math.ts and stored here).
*/

CREATE TABLE IF NOT EXISTS public.order_items (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id           uuid NOT NULL REFERENCES public.products(id),
  product_snapshot     jsonb NOT NULL,
  quantity             integer NOT NULL CHECK (quantity > 0),
  unit_price_ron       integer NOT NULL CHECK (unit_price_ron >= 0),
  engraving_text       text,
  engraving_price_ron  integer NOT NULL DEFAULT 0 CHECK (engraving_price_ron >= 0),
  line_total_ron       integer NOT NULL CHECK (line_total_ron >= 0),
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
