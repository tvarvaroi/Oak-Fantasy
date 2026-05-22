/*
  # orders

  Guest checkout allowed: profile_id is nullable; chk_owner_present requires
  either a profile_id or a guest_email. Address snapshots (jsonb) freeze the
  order for history immutability. Money in bani. Stripe ids reserved for Etapa 3.
  Lifecycle timestamps (shipped/delivered/cancelled/refunded) filled as status moves.
*/

CREATE TABLE IF NOT EXISTS public.orders (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number                text UNIQUE NOT NULL,
  profile_id                  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_email                 text,
  guest_phone                 text,
  status                      text NOT NULL DEFAULT 'pending_payment'
                                CHECK (status IN ('pending_payment','pending_cod','confirmed','in_production','packed','shipped','delivered','cancelled','refunded')),
  payment_method              text CHECK (payment_method IN ('stripe_card','cod')),
  payment_status              text NOT NULL DEFAULT 'pending'
                                CHECK (payment_status IN ('pending','paid','failed','refunded')),
  subtotal_ron                integer NOT NULL CHECK (subtotal_ron >= 0),
  shipping_cost_ron           integer NOT NULL DEFAULT 0 CHECK (shipping_cost_ron >= 0),
  total_ron                   integer NOT NULL CHECK (total_ron >= 0),
  currency                    text NOT NULL DEFAULT 'RON',
  shipping_address            jsonb,
  billing_address             jsonb,
  customer_notes              text,
  admin_notes                 text,
  stripe_payment_intent_id    text,
  stripe_checkout_session_id  text,
  expected_delivery_at        timestamptz,
  shipped_at                  timestamptz,
  delivered_at                timestamptz,
  cancelled_at                timestamptz,
  refunded_at                 timestamptz,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_owner_present CHECK (profile_id IS NOT NULL OR guest_email IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_orders_profile_id     ON public.orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at     ON public.orders(created_at DESC);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
