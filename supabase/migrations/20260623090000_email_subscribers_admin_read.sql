/*
  # email_subscribers — admin read access (Task 2.5)

  The table previously had ONLY an INSERT policy ("Anyone can subscribe", anon +
  authenticated). There was no SELECT policy, so an admin reading via the
  cookie-bound client got 0 rows (RLS silently filters). This adds the admin
  SELECT policy, mirroring the "Admin full access" SELECT pattern on
  products/orders (D4 — least privilege via is_admin(), NOT the service role).

  is_admin() is SECURITY DEFINER (no recursion on profiles). Anonymous public
  reads stay disallowed — subscribers are never exposed publicly.

  Must be applied to the live Supabase project (founder hand-off), like the
  Task 2.4 Storage migration. Idempotent.
*/

DROP POLICY IF EXISTS "Admin reads subscribers" ON public.email_subscribers;
CREATE POLICY "Admin reads subscribers" ON public.email_subscribers
  FOR SELECT TO authenticated
  USING (public.is_admin());
