/*
  # custom_orders

  Custom-work requests ("La comandă" / "Custom orders", 2026-11-18). A visitor
  leaves name + phone + idea on /la-comanda; the founder follows up on WhatsApp
  and tracks the request in /admin/comenzi-custom.

  Notes
    - Deliberately minimal (founder decision): no price, deposit, address,
      email or due date. Add columns in a NEW migration when they are needed.
    - NOT connected to checkout or stock: no orders/order_items rows, no
      reserve/release/fulfill_stock, no order_status_history.
    - customer_phone is stored normalized (+40XXXXXXXXX) by the server action
      so the admin wa.me link is always valid.
    - locale = the page language the request came from (reply language +
      WhatsApp prefill language in admin). Not a form field.
    - Hard DELETE is allowed here (founder decision 2026-11-18): cancellation is
      the 'cancelled' status; DELETE is for spam/duplicates and GDPR erasure
      requests. The soft-delete rule for products/orders is unchanged.

  Security
    - RLS enabled. Single policy: admin full access via is_admin().
    - NO anon/public policy at all: the public form inserts through a
      'use server' action with the service-role client (no visitor session),
      after Zod validation + honeypot + timing check + rate limit.
*/

CREATE TABLE IF NOT EXISTS public.custom_orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name   text NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 80),
  customer_phone  text NOT NULL CHECK (customer_phone ~ '^\+40[0-9]{9}$'),
  description     text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 2000),
  status          text NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','contacted','in_progress','completed','cancelled')),
  locale          text NOT NULL DEFAULT 'ro' CHECK (locale IN ('ro','en')),
  internal_notes  text CHECK (internal_notes IS NULL OR char_length(internal_notes) <= 5000),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_orders_status     ON public.custom_orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_created_at ON public.custom_orders(created_at DESC);

CREATE TRIGGER trg_custom_orders_updated_at
  BEFORE UPDATE ON public.custom_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access custom_orders" ON public.custom_orders
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
