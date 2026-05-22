/*
  # profiles

  1:1 extension of auth.users. Auto-created on signup via the handle_new_user
  trigger. `role` (text + CHECK) drives admin gating through is_admin().

  Notes
    - id references auth.users(id); cascade delete cleans up on user removal.
    - email mirrored here (unique) for convenient joins/lookups.
    - updated_at maintained by the shared set_updated_at() trigger.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text UNIQUE NOT NULL,
  role        text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  full_name   text,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create a profile row whenever a new auth user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
