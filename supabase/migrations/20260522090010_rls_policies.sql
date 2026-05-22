/*
  # RLS policies + admin helpers

  is_admin(): SECURITY DEFINER so it bypasses RLS on profiles -> no infinite
  recursion when used inside the profiles policy itself (known Supabase gotcha).

  guard_profile_role(): blocks an AUTHENTICATED non-admin from changing their own
  role, so the "users update own profile" policy can stay simple (id = auth.uid()).
  Trusted server contexts (SQL editor / service role / server actions) have a NULL
  auth.uid() and are exempt — otherwise the very first admin could never be set.

  Server-side writes (guest order creation, stock movements at fulfillment) use
  the service-role key inside 'use server' actions / route handlers, which
  bypasses RLS entirely. There is intentionally no anon INSERT policy on orders.
*/

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- auth.uid() is NULL in trusted server contexts (Supabase SQL editor, service
  -- role, server actions). Allow those so the FIRST admin can be set manually.
  -- Only block an authenticated, non-admin user from escalating their own role.
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change a profile role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_role ON public.profiles;
CREATE TRIGGER trg_guard_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

-- Enable RLS on every new table (email_subscribers already had it).
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- ── products: public reads ACTIVE; admin full control ──────────────────────
CREATE POLICY "Public reads active products" ON public.products
  FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Admin full access products" ON public.products
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── profiles: user reads/updates own; admin full ───────────────────────────
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admin full access profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── addresses: owner CRUD; admin full ──────────────────────────────────────
CREATE POLICY "Users manage own addresses" ON public.addresses
  FOR ALL TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Admin full access addresses" ON public.addresses
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── orders: owner reads own; admin full. Inserts via service role only. ─────
CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "Admin full access orders" ON public.orders
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── order_items: owner reads via parent order; admin full ──────────────────
CREATE POLICY "Users read own order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.profile_id = auth.uid())
  );
CREATE POLICY "Admin full access order items" ON public.order_items
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── inventory / stock_movements: admin only ────────────────────────────────
CREATE POLICY "Admin full access inventory" ON public.inventory
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full access stock_movements" ON public.stock_movements
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── order_status_history: owner reads via parent order; admin full ─────────
CREATE POLICY "Users read own order history" ON public.order_status_history
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.profile_id = auth.uid())
  );
CREATE POLICY "Admin full access order_status_history" ON public.order_status_history
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
