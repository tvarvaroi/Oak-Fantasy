/*
  # products

  Bilingual catalog. Money in integer bani (180 RON => 18000). Soft-delete via
  status (draft/active/archived). dimensions jsonb supports rectangular
  ({length,width,thickness,unit}) and round ({diameter,thickness,unit,shape}).
  meta_* columns allow per-product SEO overrides.
*/

CREATE TABLE IF NOT EXISTS public.products (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                     text UNIQUE NOT NULL,
  sku                      text UNIQUE NOT NULL,
  tier                     text NOT NULL CHECK (tier IN ('entry','core','premium','hero')),
  name_ro                  text NOT NULL,
  name_en                  text NOT NULL,
  short_description_ro     text,
  short_description_en     text,
  long_description_ro      text,
  long_description_en      text,
  dimensions               jsonb,
  weight_kg                numeric,
  production_time_minutes  integer,
  price_ron                integer NOT NULL CHECK (price_ron >= 0),
  compare_at_price_ron     integer CHECK (compare_at_price_ron IS NULL OR compare_at_price_ron >= 0),
  hero_image_url           text,
  gallery_image_urls       text[] NOT NULL DEFAULT '{}',
  has_engraving_option     boolean NOT NULL DEFAULT false,
  engraving_price_ron      integer CHECK (engraving_price_ron IS NULL OR engraving_price_ron >= 0),
  status                   text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  sort_order               integer NOT NULL DEFAULT 0,
  meta_title_ro            text,
  meta_title_en            text,
  meta_description_ro      text,
  meta_description_en      text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_status     ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_tier       ON public.products(tier);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON public.products(sort_order);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
