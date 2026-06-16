-- Idempotent restore of canonical email_subscribers RLS state.
--
-- Context: On 2026-06-15 a debug spiral introduced 5 migrations
-- (20260615180000 + 4 unnamed debug migrations 190000..220000) chasing a
-- phantom "42501 RLS regression" on staging. The "regression" turned out to
-- be a smoke test methodology bug: the failing test used
-- .insert(entry).select() which requires anon SELECT (intentionally absent
-- on email_subscribers — only service_role reads subscribers). The
-- production code path lib/supabase.ts addToWaitlist() uses .insert(entry)
-- without .select() and was never broken.
--
-- Net damage from the spiral on the staging DB:
--   - "Anyone can subscribe" lost its email format WITH CHECK
--   - "Allow anon subscribe" added as redundant policy with WITH CHECK (true)
--   - 4 debug migrations applied remote with no local files (tracking
--     desync, repaired via `supabase migration repair --status reverted`
--     alongside this commit)
--
-- This migration restores the canonical state idempotently:
--   - RLS enabled (safeguard, no-op if already on)
--   - Drop any policy the spiral may have left
--   - Recreate the single canonical "Anyone can subscribe" policy with
--     email format validation as defense-in-depth alongside Zod
--
-- Safe to re-run; safe to apply as the first email_subscribers policy
-- migration on a fresh prod project.

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon subscribe" ON public.email_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscribers;

CREATE POLICY "Anyone can subscribe"
  ON public.email_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) > 3
    AND email LIKE '%@%'
  );
