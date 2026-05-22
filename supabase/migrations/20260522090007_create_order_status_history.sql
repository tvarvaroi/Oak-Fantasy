/*
  # order_status_history

  Audit trail of status transitions for an order. from_status is null for the
  initial creation row. Powers the customer/admin order timeline.
*/

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status text,
  to_status   text NOT NULL,
  changed_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
