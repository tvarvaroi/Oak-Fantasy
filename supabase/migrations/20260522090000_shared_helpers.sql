/*
  # Shared trigger helpers

  set_updated_at(): generic BEFORE UPDATE trigger to stamp updated_at on any
  table that has an updated_at column. No extension dependency (avoids relying
  on the moddatetime extension being present).
*/

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
