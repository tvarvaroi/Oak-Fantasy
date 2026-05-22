/*
  # addresses

  Shipping/billing addresses owned by a profile. county = RO județ.
  Default country Romania. is_default lets the UI preselect one per type.
*/

CREATE TABLE IF NOT EXISTS public.addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            text NOT NULL CHECK (type IN ('shipping','billing')),
  recipient_name  text NOT NULL,
  street          text NOT NULL,
  city            text NOT NULL,
  county          text NOT NULL,
  postal_code     text NOT NULL,
  country         text NOT NULL DEFAULT 'Romania',
  phone           text,
  is_default      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_profile_id ON public.addresses(profile_id);

CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
