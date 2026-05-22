/*
  # waitlist -> email_subscribers (D3: rename + extend)

  Audit found a single code reference to the table name (lib/supabase.ts
  `.from('waitlist')`), so a direct rename is safe. The existing rows and the
  live INSERT policy are preserved. Adds per-product interest + unsubscribe.

  Paired code change: lib/supabase.ts `.from('waitlist')` -> `.from('email_subscribers')`.
  NOTE: apply this migration to a DB BEFORE deploying the paired code change.
*/

ALTER TABLE public.waitlist RENAME TO email_subscribers;

-- Broaden the source CHECK (old rows used 'hero'/'waitlist'; keep them valid).
ALTER TABLE public.email_subscribers DROP CONSTRAINT IF EXISTS waitlist_source_check;
ALTER TABLE public.email_subscribers
  ADD CONSTRAINT email_subscribers_source_check
  CHECK (source IN ('hero','waitlist','homepage','product_page','about'));

ALTER TABLE public.email_subscribers
  ADD COLUMN IF NOT EXISTS interested_product_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_email_subscribers_active
  ON public.email_subscribers(email) WHERE unsubscribed_at IS NULL;

-- Rename the existing INSERT policy for clarity (body unchanged: anon+auth insert).
ALTER POLICY "Anyone can join the waitlist" ON public.email_subscribers
  RENAME TO "Anyone can subscribe";
