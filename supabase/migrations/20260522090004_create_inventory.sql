/*
  # inventory

  One row per product. quantity_available is a STORED generated column
  (total - reserved) — read-only, never INSERT/UPDATE it directly.
  CHECK constraints prevent negatives and over-reservation.
*/

CREATE TABLE IF NOT EXISTS public.inventory (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           uuid NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_total       integer NOT NULL DEFAULT 0 CHECK (quantity_total >= 0),
  quantity_reserved    integer NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_available   integer GENERATED ALWAYS AS (quantity_total - quantity_reserved) STORED,
  low_stock_threshold  integer NOT NULL DEFAULT 3,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_reserved_lte_total CHECK (quantity_reserved <= quantity_total)
);

CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory(product_id);

CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
