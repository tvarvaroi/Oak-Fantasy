# Etapa 2.1 — Supabase Foundation + 2.1.5 Catalog Public Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the complete e-commerce database foundation (9 tables + RLS + audit + helper functions + seed) for Etapa 2 & 3, then ship a read-only public catalog page `/tocatoare` that reads `status='active'` products from Supabase.

**Architecture:** Schema-first via versioned **Supabase SQL migrations** (`supabase/migrations/*.sql`), applied by the founder to a staging project first, then production. Money stored as integer bani (no float). Soft-delete via `status` enums (text + CHECK). Audit trails for stock & order status. Generated TypeScript types feed type-safe server-side reads. The `/tocatoare` page reuses the established Server Component + `content.ts` + module CSS + Reveal pattern from `/atelier`, fetching via an ISR-cached server helper that degrades gracefully.

**Tech Stack:** Postgres 15 (Supabase), `@supabase/supabase-js` (anon, existing) + `@supabase/ssr` (server/service, new), Next.js 14.2.18 App Router, TypeScript, Playwright. No ORM (raw SQL migrations + generated types). `zod` (already installed) for input validation in later sub-tasks.

---

## ⚠️ OPEN DECISION POINTS — confirm in approval (recommendations inline)

| # | Decision | Options | **Recommendation** | Why |
|---|---|---|---|---|
| **D1** | Migration tooling | (a) Supabase SQL migrations + generated types · (b) Drizzle ORM | **(a) Supabase SQL** | Existing `waitlist` is raw SQL; RLS + PL/pgSQL functions (atomic stock locks, order-number sequence) are SQL-native and Drizzle can't manage them; no new heavy dep / peer-deps risk; type-safety still via `supabase gen types`. **Conflict flag:** `.claude/rules/backend.md` says "Use Drizzle ORM only" + "React Query" + "Playfair/Inter fonts" — these are stale generic template rules that contradict the real project (uses `@supabase/supabase-js`, Tailwind, framer-motion, Caudex/Caveat/Lora). Recommend updating that rules file to match reality (separate micro-task). |
| **D2** | Enum representation | native `CREATE TYPE` enum vs `text + CHECK` | **text + CHECK** | Consistent with `waitlist`; far easier to add/remove values later (native enums can't drop values without table rewrite). |
| **D3** | `waitlist` → subscribers | rename+extend · new table+migrate · extend in place | **rename `waitlist` → `email_subscribers` + add columns** | Preserves live production data + active flow; one code touch (`lib/supabase.ts`). Adds `interested_product_ids uuid[]`, `unsubscribed_at`, extends `source` CHECK. |
| **D4** | EN slug for `/tocatoare` | `/en/boards` · `/en/cutting-boards` | **`/en/cutting-boards`** | Exact-match SEO keyword ("cutting board" = high volume; "boards" ambiguous: surfboards/forums). Nav label EN = "Cutting Boards". |
| **D5** | Navbar position-4 collision | keep dead `#tocatoare` anchor · replace with route | **replace with `/tocatoare` route** (D1-consistent) | The `#tocatoare` anchor is already a **dead link** (no `id="tocatoare"` exists). Replacing loses nothing. |
| **D6** | `/tocatoare` rendering | SSG · ISR · force-dynamic | **ISR `revalidate = 60`** + graceful empty-state | Build never fails on a Supabase hiccup; founder activating products in Studio reflects within ~60s without a redeploy. |
| **D7** | Helper fn placement | all DB · all TS · split | **split: stock + order-number = DB (PL/pgSQL, atomic); total calc = TS (pure, testable)** | Stock reservation needs `FOR UPDATE` row locks + audit insert in one transaction; order number needs a sequence. Totals are simple arithmetic best unit-tested in TS. |
| **D8** | DB application & test env | local Docker (`supabase start`) · separate staging project · prod-only | **staging Supabase project first, then prod (confirmed)** | Win10 Home + Docker is heavy. A free staging project lets us apply migrations + seed + activate products + generate visual baselines safely, then replay the same SQL on prod once reviewed. |

**Sequencing constraint (important):** Migrations apply in **filename-timestamp order**, independent of git commit order. So `profiles` (referenced by `orders`) gets the earliest timestamp even though it lands in commit #2. This lets us keep the founder's commit grouping while respecting FK dependencies.

---

## Packages to install (ASK CONFIRMATION before `npm install`)

| Package | Version target | Why | When used |
|---|---|---|---|
| `@supabase/ssr` | latest 0.x | Server Components + cookie-based auth client (Etapa 2.2) + a service-role client factory | `lib/supabase-server.ts`, used now by `/tocatoare` fetch |
| `supabase` (devDependency) | latest | Pinned CLI for `supabase gen types` + `db push`; reproducible vs ad-hoc `npx` | type generation, migration application |

Install command (after OK): `npm install @supabase/ssr --legacy-peer-deps` and `npm install -D supabase --legacy-peer-deps`.
`zod` already present (`^3.23.8`) — no install. **No Drizzle** (per D1=a).

---

# PART A — Database Schema (Task 2.1)

All migrations live in `supabase/migrations/`. Filenames use the `YYYYMMDDHHMMSS_name.sql` convention (matching the existing `20260515114129_create_waitlist_table.sql`). Indexes are declared **inline** per table (cleaner, no ordering hazard).

### Shared helpers migration — `20260522090000_shared_helpers.sql`  *(commit #2)*

```sql
/*
  Shared trigger helpers used across tables.
  - set_updated_at(): generic BEFORE UPDATE trigger to stamp updated_at.
  No extension dependency (avoids relying on moddatetime).
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
```

### Task A1 — `profiles` — `20260522090001_create_profiles.sql`  *(commit #2)*

```sql
/*
  profiles: 1:1 extension of auth.users. Auto-created on signup via trigger.
  role drives admin gating (is_admin()). text+CHECK enum (D2).
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

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Task A2 — `addresses` — `20260522090002_create_addresses.sql`  *(commit #2)*

```sql
CREATE TABLE IF NOT EXISTS public.addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            text NOT NULL CHECK (type IN ('shipping','billing')),
  recipient_name  text NOT NULL,
  street          text NOT NULL,
  city            text NOT NULL,
  county          text NOT NULL,            -- RO: județ
  postal_code     text NOT NULL,
  country         text NOT NULL DEFAULT 'Romania',
  phone           text,
  is_default      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_addresses_profile_id ON public.addresses(profile_id);

CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### Task A3 — `products` — `20260522090003_create_products.sql`  *(commit #1)*

```sql
/*
  products: bilingual catalog. Money in integer bani (price 180 RON => 18000).
  Soft-delete via status. dimensions jsonb supports both rectangular and round.
*/
CREATE TABLE IF NOT EXISTS public.products (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                     text UNIQUE NOT NULL,
  sku                      text UNIQUE NOT NULL,
  tier                     text NOT NULL CHECK (tier IN ('entry','core','premium','hero')),
  name_ro                  text NOT NULL,
  name_en                  text NOT NULL,
  short_description_ro     text,
  short_description_en     text,
  long_description_ro      text,
  long_description_en      text,
  dimensions               jsonb,           -- {"length":25,"width":18,"thickness":2,"unit":"cm"} or {"diameter":32,"thickness":2.5,"unit":"cm","shape":"round"}
  weight_kg                numeric,
  production_time_minutes  integer,
  price_ron                integer NOT NULL CHECK (price_ron >= 0),
  compare_at_price_ron     integer CHECK (compare_at_price_ron IS NULL OR compare_at_price_ron >= 0),
  hero_image_url           text,
  gallery_image_urls       text[] NOT NULL DEFAULT '{}',
  has_engraving_option     boolean NOT NULL DEFAULT false,
  engraving_price_ron      integer CHECK (engraving_price_ron IS NULL OR engraving_price_ron >= 0),
  status                   text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  sort_order               integer NOT NULL DEFAULT 0,
  meta_title_ro            text,
  meta_title_en            text,
  meta_description_ro      text,
  meta_description_en      text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_tier ON public.products(tier);
CREATE INDEX idx_products_sort_order ON public.products(sort_order);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### Task A4 — `inventory` — `20260522090004_create_inventory.sql`  *(commit #1)*

```sql
/*
  inventory: one row per product. quantity_available is a STORED generated column.
  CHECK constraints guard against negative / over-reservation.
*/
CREATE TABLE IF NOT EXISTS public.inventory (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           uuid NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_total       integer NOT NULL DEFAULT 0 CHECK (quantity_total >= 0),
  quantity_reserved    integer NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_available   integer GENERATED ALWAYS AS (quantity_total - quantity_reserved) STORED,
  low_stock_threshold  integer NOT NULL DEFAULT 3,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_reserved_lte_total CHECK (quantity_reserved <= quantity_total)
);
CREATE INDEX idx_inventory_product_id ON public.inventory(product_id);

CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### Task A5 — `orders` — `20260522090005_create_orders.sql`  *(commit #1)*

```sql
/*
  orders: guest checkout allowed (profile_id nullable; guest_email required if no profile).
  Address snapshots (jsonb) freeze the order for history immutability.
  Money in bani. Stripe ids reserved for Etapa 3.
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
CREATE INDEX idx_orders_profile_id ON public.orders(profile_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### Task A6 — `order_items` — `20260522090006_create_order_items.sql`  *(commit #1)*

```sql
CREATE TABLE IF NOT EXISTS public.order_items (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id           uuid NOT NULL REFERENCES public.products(id),
  product_snapshot     jsonb NOT NULL,        -- {name, slug, dimensions, price} frozen at order time
  quantity             integer NOT NULL CHECK (quantity > 0),
  unit_price_ron       integer NOT NULL CHECK (unit_price_ron >= 0),
  engraving_text       text,
  engraving_price_ron  integer NOT NULL DEFAULT 0 CHECK (engraving_price_ron >= 0),
  line_total_ron       integer NOT NULL CHECK (line_total_ron >= 0),
  created_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
```

### Task A7 — `order_status_history` — `20260522090007_create_order_status_history.sql`  *(commit #4)*

```sql
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status text,                          -- null for initial creation
  to_status   text NOT NULL,
  changed_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);
```

### Task A8 — `stock_movements` — `20260522090008_create_stock_movements.sql`  *(commit #4)*

```sql
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type             text NOT NULL CHECK (type IN ('restock','adjustment','order_reserved','order_fulfilled','order_cancelled','damaged','return')),
  quantity_change  integer NOT NULL,
  quantity_before  integer NOT NULL,
  quantity_after   integer NOT NULL,
  reason           text,
  order_id         uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at DESC);
```

### Task A9 — extend `waitlist` → `email_subscribers` — `20260522090009_extend_waitlist_to_email_subscribers.sql`  *(commit #3)*

```sql
/*
  D3: rename + extend. Preserves existing rows + the live INSERT policy.
  Adds per-product interest array, unsubscribe timestamp, broader source set.
*/
ALTER TABLE public.waitlist RENAME TO email_subscribers;

-- Broaden the source CHECK (old rows used 'hero'/'waitlist').
ALTER TABLE public.email_subscribers DROP CONSTRAINT IF EXISTS waitlist_source_check;
ALTER TABLE public.email_subscribers
  ADD CONSTRAINT email_subscribers_source_check
  CHECK (source IN ('hero','waitlist','homepage','product_page','about'));

ALTER TABLE public.email_subscribers
  ADD COLUMN IF NOT EXISTS interested_product_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_email_subscribers_active
  ON public.email_subscribers(email) WHERE unsubscribed_at IS NULL;

-- Rename the existing INSERT policy for clarity (body unchanged, still anon+auth).
ALTER POLICY "Anyone can join the waitlist" ON public.email_subscribers
  RENAME TO "Anyone can subscribe";
```

**Code change paired with A9** — `lib/supabase.ts`:
```ts
export type SubscriberSource = 'hero' | 'waitlist' | 'homepage' | 'product_page' | 'about';
export type WaitlistEntry = {
  email: string;
  language: 'ro' | 'en';
  source: SubscriberSource;
  interested_product_ids?: string[];
};
// addToWaitlist: change table 'waitlist' -> 'email_subscribers' (keep fn name; EmailForm untouched).
```

---

# PART B — RLS Policies — `20260522090010_rls_policies.sql`  *(commit #5)*

```sql
/*
  is_admin(): SECURITY DEFINER so it bypasses RLS on profiles -> no infinite
  recursion when used inside the profiles policy itself (known Supabase gotcha).
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

-- Enable RLS on every new table.
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- ── products: public can read ACTIVE; admin full control ───────────────────
CREATE POLICY "Public reads active products" ON public.products
  FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Admin full access products" ON public.products
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── profiles: user reads/updates own; admin full ──────────────────────────
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Admin full access profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── addresses: owner CRUD; admin full ─────────────────────────────────────
CREATE POLICY "Users manage own addresses" ON public.addresses
  FOR ALL TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Admin full access addresses" ON public.addresses
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── orders: owner reads own; admin full. Inserts via service role only. ───
CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "Admin full access orders" ON public.orders
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── order_items: owner reads via parent order; admin full ─────────────────
CREATE POLICY "Users read own order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.profile_id = auth.uid())
  );
CREATE POLICY "Admin full access order items" ON public.order_items
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── inventory / stock_movements / order_status_history: admin only ────────
CREATE POLICY "Admin full access inventory" ON public.inventory
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin full access stock_movements" ON public.stock_movements
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Users read own order history" ON public.order_status_history
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.profile_id = auth.uid())
  );
CREATE POLICY "Admin full access order_status_history" ON public.order_status_history
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
```

> **Server-side writes** (guest order creation, stock movements at fulfillment) use the **service-role key** in `'use server'` actions/route handlers, which bypasses RLS entirely. No anon INSERT policy on `orders` — guest checkout is mediated server-side (Etapa 3). `email_subscribers` keeps its anon INSERT policy from A9 (public subscribe).

---

# PART C — Helper Functions — `20260522090011_db_functions.sql`  *(commit #6)*

```sql
-- Order number: OF-YYYY-NNNN (global sequence, year prefix). Sortable + unique.
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text LANGUAGE sql AS $$
  SELECT 'OF-' || to_char(now(),'YYYY') || '-' ||
         lpad(nextval('public.order_number_seq')::text, 4, '0');
$$;

-- reserve_stock: atomic. Locks the inventory row, checks availability, bumps
-- reserved, logs an order_reserved movement (before/after on AVAILABLE).
CREATE OR REPLACE FUNCTION public.reserve_stock(p_product_id uuid, p_qty int, p_order_id uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_before int; v_after int;
BEGIN
  SELECT quantity_available INTO v_before FROM inventory WHERE product_id = p_product_id FOR UPDATE;
  IF v_before IS NULL THEN RAISE EXCEPTION 'No inventory row for product %', p_product_id; END IF;
  IF v_before < p_qty THEN RAISE EXCEPTION 'Insufficient stock for %: % available, % requested', p_product_id, v_before, p_qty; END IF;
  UPDATE inventory SET quantity_reserved = quantity_reserved + p_qty WHERE product_id = p_product_id;
  v_after := v_before - p_qty;
  INSERT INTO stock_movements(product_id, type, quantity_change, quantity_before, quantity_after, order_id)
  VALUES (p_product_id, 'order_reserved', -p_qty, v_before, v_after, p_order_id);
END; $$;

-- release_stock: cancel a reservation (reserved down, available up).
CREATE OR REPLACE FUNCTION public.release_stock(p_product_id uuid, p_qty int, p_order_id uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_before int; v_after int;
BEGIN
  SELECT quantity_available INTO v_before FROM inventory WHERE product_id = p_product_id FOR UPDATE;
  IF v_before IS NULL THEN RAISE EXCEPTION 'No inventory row for product %', p_product_id; END IF;
  UPDATE inventory SET quantity_reserved = GREATEST(quantity_reserved - p_qty, 0) WHERE product_id = p_product_id;
  v_after := v_before + p_qty;
  INSERT INTO stock_movements(product_id, type, quantity_change, quantity_before, quantity_after, order_id)
  VALUES (p_product_id, 'order_cancelled', p_qty, v_before, v_after, p_order_id);
END; $$;

-- fulfill_stock: item ships (physical total down AND reserved down; available unchanged).
CREATE OR REPLACE FUNCTION public.fulfill_stock(p_product_id uuid, p_qty int, p_order_id uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_before int; v_after int;
BEGIN
  SELECT quantity_total INTO v_before FROM inventory WHERE product_id = p_product_id FOR UPDATE;
  IF v_before IS NULL THEN RAISE EXCEPTION 'No inventory row for product %', p_product_id; END IF;
  UPDATE inventory
    SET quantity_total = quantity_total - p_qty,
        quantity_reserved = GREATEST(quantity_reserved - p_qty, 0)
    WHERE product_id = p_product_id;
  v_after := v_before - p_qty;
  INSERT INTO stock_movements(product_id, type, quantity_change, quantity_before, quantity_after, order_id)
  VALUES (p_product_id, 'order_fulfilled', -p_qty, v_before, v_after, p_order_id);
END; $$;
```

**TS-side total calc** — `lib/db/order-math.ts` (pure, unit-tested):
```ts
export interface OrderLineInput { unitPriceRon: number; quantity: number; engravingPriceRon?: number; }
export function lineTotalRon(l: OrderLineInput): number {
  return (l.unitPriceRon + (l.engravingPriceRon ?? 0)) * l.quantity;
}
export function calculateOrderTotal(lines: OrderLineInput[], shippingCostRon = 0) {
  const subtotalRon = lines.reduce((s, l) => s + lineTotalRon(l), 0);
  return { subtotalRon, shippingCostRon, totalRon: subtotalRon + shippingCostRon };
}
```
Test: `tests/unit/order-math.test.ts` — assert bani arithmetic (e.g. 180 RON board ×2 + 80 RON engraving each = 52000 bani). *(Note: no unit-test runner exists yet; add a minimal `node --test` script OR fold these assertions into an E2E-adjacent check. Decide at execution — simplest is `node:test`.)*

---

# PART D — Seed — `supabase/seeds/01_products.sql`  *(commit #7)*

Inserts the 10 SKUs from CLAUDE.md §8 (`status='draft'`, `sort_order` 1–10) + a matching `inventory` row each (`quantity_total = 0`). Engraving enabled on SKU 02–09. Prices in bani. Production time = upper bound of the stated range. Round board uses `shape:"round"` dimensions. SKU 09 stores the from-price (150000) with the 1500–2200 range noted in `long_description`.

```sql
INSERT INTO public.products
  (slug, sku, tier, name_ro, name_en, dimensions, production_time_minutes,
   price_ron, has_engraving_option, engraving_price_ron, status, sort_order,
   short_description_ro, short_description_en)
VALUES
 ('tocator-mic','OF-01','entry','Tocător Mic','Small Cutting Board',
   '{"length":25,"width":18,"thickness":2,"unit":"cm"}',90,18000,false,NULL,'draft',1,
   'Tocător mic din stejar masiv, lucrat manual.','Small solid-oak board, handmade.'),
 ('platou-serving','OF-02','entry','Platou Serving','Serving Platter',
   '{"length":30,"width":18,"thickness":2,"unit":"cm"}',90,24000,true,12000,'draft',2,
   'Platou de servire din stejar, finisat cu ulei alimentar.','Oak serving platter, food-safe oil finish.'),
 ('tocator-bucatarie-mediu','OF-03','core','Tocător Bucătărie Mediu','Medium Kitchen Board',
   '{"length":35,"width":25,"thickness":3,"unit":"cm"}',120,38000,true,12000,'draft',3,
   'Tocătorul de zi cu zi, gros de 3 cm.','The everyday board, 3 cm thick.'),
 ('tocator-bucatarie-mare','OF-04','core','Tocător Bucătărie Mare','Large Kitchen Board',
   '{"length":45,"width":30,"thickness":3,"unit":"cm"}',150,52000,true,12000,'draft',4,
   'Suprafață generoasă pentru gătit în serie.','Generous surface for batch cooking.'),
 ('platou-lung','OF-05','core','Platou Lung','Long Platter',
   '{"length":50,"width":20,"thickness":2.5,"unit":"cm"}',120,48000,true,12000,'draft',5,
   'Platou alungit pentru aperitive și brânzeturi.','Long platter for charcuterie and cheese.'),
 ('tocator-rotund','OF-06','core','Tocător Rotund','Round Board',
   '{"diameter":32,"thickness":2.5,"unit":"cm","shape":"round"}',150,45000,true,12000,'draft',6,
   'Tocător rotund, bun și ca platou de servire.','Round board, doubles as a serving platter.'),
 ('bloc-end-grain-mediu','OF-07','premium','Bloc End-Grain Mediu','Medium End-Grain Block',
   '{"length":35,"width":25,"thickness":5,"unit":"cm"}',360,85000,true,12000,'draft',7,
   'Bloc end-grain care menajează lama cuțitului.','End-grain block that spares your knife edge.'),
 ('bloc-end-grain-mare','OF-08','premium','Bloc End-Grain Mare','Large End-Grain Block',
   '{"length":45,"width":35,"thickness":6,"unit":"cm"}',480,125000,true,12000,'draft',8,
   'Bloc end-grain mare pentru bucătării serioase.','Large end-grain block for serious kitchens.'),
 ('bloc-heirloom','OF-09','hero','Bloc Heirloom','Heirloom Block',
   '{"length":50,"width":40,"thickness":8,"unit":"cm"}',900,150000,true,12000,'draft',9,
   'Piesă de moștenire, lucrată 12–15 ore. Preț 1.500–2.200 RON în funcție de finisaj.','Heirloom piece, 12–15 hours of work. 1,500–2,200 RON depending on finish.'),
 ('platou-statement','OF-10','hero','Platou Statement','Statement Platter',
   '{"length":80,"width":25,"thickness":4,"unit":"cm"}',480,180000,false,NULL,'draft',10,
   'Platou-statement de 80 cm pentru mese mari.','An 80 cm statement platter for big tables.');

INSERT INTO public.inventory (product_id, quantity_total, quantity_reserved)
SELECT id, 0, 0 FROM public.products
WHERE sku IN ('OF-01','OF-02','OF-03','OF-04','OF-05','OF-06','OF-07','OF-08','OF-09','OF-10')
ON CONFLICT (product_id) DO NOTHING;
```

**Admin user — founder does this manually (NO password in code):**
1. Supabase Studio → Authentication → Users → **Add user** → enter founder email + a strong password → Create.
2. Studio → Authentication → confirm the user is verified.
3. SQL Editor: `UPDATE public.profiles SET role = 'admin' WHERE email = 'tvarvaroi@gmail.com';`
   (the `handle_new_user` trigger already created the profile row on user creation).
4. (Etapa 2.2) enroll 2FA TOTP from the account page once auth UI exists.

---

# PART E — TypeScript Types  *(commit #8)*

Generate from the live schema (founder runs after migrations applied):
```bash
npx supabase login                       # one-time, access token from dashboard
npx supabase gen types typescript --project-id <PROJECT_ID> > types/supabase.ts
```
Then re-export a typed client helper. **Fallback** (if CLI auth is a blocker): hand-author `types/supabase.ts` mirroring the schema (Database interface with Row/Insert/Update per table). The generated file is preferred (stays in sync).

`lib/supabase.ts` gains the generic: `createClient<Database>(url, anonKey)`.

---

# PART F — Server Client + DB layer  *(folded into commit #1 / #7 as needed)*

`lib/supabase-server.ts` (NEW, requires `@supabase/ssr`):
```ts
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Cookie-bound client for authenticated server reads (Etapa 2.2+).
export function getServerSupabase() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(),
                 setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } },
  );
}

// Service-role client — SERVER ONLY. Bypasses RLS. Never import in client code.
export function getServiceSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
```
New env var: `SUPABASE_SERVICE_ROLE_KEY` (founder adds to `.env.local` + Vercel; never `NEXT_PUBLIC_`).

`lib/db/products.ts` (NEW) — graceful catalog fetch (used by `/tocatoare`):
```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export type CatalogProduct = Database['public']['Tables']['products']['Row'];

// Public read of active products. Anon client server-side (RLS allows it).
// Returns [] on any failure so the page renders an empty state instead of
// crashing the build/render (see gotcha: top-level client throws on missing env).
export async function getActiveProducts(): Promise<CatalogProduct[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const sb = createClient<Database>(url, key);
    const { data, error } = await sb
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}
```

---

# PART G — Task 2.1.5: Public Catalog `/tocatoare`

### G1 — routing — `lib/i18n-routes.ts`  *(commit 2.1.5-#3)*
Add to `PATHNAMES`: `tocatoare: { ro: 'tocatoare', en: 'cutting-boards' }`. Middleware needs **zero changes** (route-key generic). Redirects come for free: `/en/tocatoare → 308 → /en/cutting-boards`, `/ro/cutting-boards → 308 → /ro/tocatoare`.

### G2 — content map — `components/tocatoare/content.ts`  *(commit 2.1.5-#2)*
`Record<Locale, TocatoareContent>` with: `meta` (title/description, RO ≤155 chars, EN ≤155, no RO chars in EN), `nav.link` ("Tocătoare"/"Cutting Boards"), `hero` (eyebrow, title, lead), `tierLabels` ({all,entry,core,premium,hero} bilingual), `card` ({ photoBadge: "Foto în pregătire"/"Photo coming soon", priceFrom: "de la"/"from", ctaLabel: "Anunță-mă când e disponibil"/"Notify me when available", dimsRound: "Ø"/"Ø" }), `empty` (heading + body for when no active products). **All must pass `check:i18n`** (diacritics on RO, no RO chars in EN).

### G3 — page Server Component — `app/[locale]/tocatoare/page.tsx`  *(commit 2.1.5-#1)*
Replicate the `/atelier` pattern exactly:
- `generateStaticParams` (ro/en), `export const revalidate = 60` (D6 ISR).
- `generateMetadata`: title/description/canonical/`alternates.languages` (`/ro/tocatoare`, `/en/cutting-boards`, x-default `/ro/tocatoare`)/openGraph/twitter, `metadataBase`.
- `const products = await getActiveProducts()` → pass to client wrapper.
- JSON-LD via `ldSafe()` + `buildJsonLd()`: **BreadcrumbList** + **ItemList** of products + one **Product** schema per active product (`name`, `description`, `sku`, `offers` {priceCurrency RON, price = price_ron/100, availability}). If `products` empty → emit BreadcrumbList + empty ItemList only (no Product schemas).

### G4 — client wrapper — `components/tocatoare/TocatoareContent.tsx`  *(commit 2.1.5-#2)*
`'use client'`. Navbar (toggle via `router.push(localizedPath('tocatoare', next))`) + Hero + `ProductGrid` + Footer. Receives `locale` + `products`.

### G5 — grid + card — `components/tocatoare/ProductGrid.tsx` + `ProductCard.tsx`  *(commit 2.1.5-#2)*
- `ProductGrid` ('use client'): tier filter state (`all|entry|core|premium|hero`), responsive CSS grid, renders `empty` state when `products.length === 0`. Wrap cards in `Reveal` (reuse `@/components/about/Reveal`).
- `ProductCard`: placeholder image = circular brand logo (`/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg`, `borderRadius:50%`) on warm bg + `photoBadge` chip; `name_{locale}`; formatted dimensions (rect: `L×W×T cm`; round: `Ø D cm`); tier badge; price `de la {price_ron/100} RON`; CTA Link → **`/{locale}?interested_product=${slug}#waitlist`** (query before hash — correct URL form; param parked for Etapa 2.6 to prefill subscriber interest).

### G6 — styling — `components/tocatoare/tocatoare.module.css`  *(commit 2.1.5-#2)*
Brand vars only (`--oak-warm`, `--cream-warm`, `--copper`, `--ink`, `--paper-aged`). Card grid `repeat(auto-fill, minmax(280px, 1fr))`; tier-filter pills; placeholder circle styling; tier badge color-coded (entry/core/premium/hero subtle tints from palette). No hardcoded hex (decisions.md 2026-05-16).

### G7 — Navbar update — `components/Navbar.tsx`  *(commit 2.1.5-#4)*
D5: replace the dead `#tocatoare` anchor (position 4) with a **route link**. Extend `routeKey` union: `'despre' | 'atelier' | 'tocatoare'`. RO label "Tocătoare", EN "Cutting Boards". Position stays 4 (after Atelier, before Îngrijire). Active-state already generic (`pathname === href`). The `#ingrijire` anchor stays (its page is a future task).

---

# PART H — Tests  *(commit 2.1.5-#5)*

### H1 — `tests/e2e/tocatoare.spec.ts` (NEW)
- `/ro/tocatoare` + `/en/cutting-boards` return 200.
- Redirects: `/en/tocatoare → 308 → /en/cutting-boards`; `/ro/cutting-boards → 308 → /ro/tocatoare`.
- RO page contains RO diacritics (e.g. "Tocătoare"); EN page asserts **no** RO chars (`/[ăâîșțĂÂÎȘȚ]/` absent) and shows "Cutting Boards".
- Tier filter: click "Core" → only core cards visible (skip assertion gracefully if grid empty — see note).
- CTA link: each card's CTA `href` matches `/\?interested_product=[a-z0-9-]+#waitlist$/`.
- **Empty-state resilience:** because seeded products are `status='draft'`, assertions branch: *if* `[data-product-card]` count > 0 assert card structure; *else* assert empty-state heading present. After founder activates the 10 products, tighten to assert exactly 10 cards.

### H2 — `tests/e2e/seo.spec.ts` (MODIFY)
Add `/ro/tocatoare` + `/en/cutting-boards` to `ALL_PAGES` (titles) + `PAGES_WITH_FULL_SEO` (canonical/hreflang). Add an ItemList JSON-LD assertion for these two paths.

### H3 — `tests/e2e/shared-components.spec.ts` (MODIFY)
Add a "Navbar Tocătoare link" describe block (mirror the Atelier block): RO link → `/ro/tocatoare`, EN → `/en/cutting-boards`, click navigates, active-state color `rgb(139, 94, 60)`, and **no** `#tocatoare` anchor remains (`a[href="/ro#tocatoare"]` count 0).

### H4 — `tests/e2e/visual-regression.spec.ts` (MODIFY)
Add `{ '/ro/tocatoare','tocatoare-ro' }` + `{ '/en/cutting-boards','tocatoare-en' }` to `PAGES` (6 new baselines: 2 locales × 3 viewports). **Baselines generated AFTER founder activates the 10 products** (so the grid is populated), founder reviews, then commit — same protocol as `/atelier`. Pre-scroll loop not needed unless Reveal count is high; reuse the atelier-style guard if so.

### H5 — `tests/unit/order-math.test.ts` (NEW, optional in this pass)
`node --test` assertions for `lineTotalRon` / `calculateOrderTotal`. Add `"test:unit": "node --test tests/unit"` to package.json. (If we defer, mark as Etapa 2.4 follow-up.)

---

# PART I — Verification (Iron Law)

**Local code gate (must all be exit 0):**
1. `npm run typecheck`
2. `npm run lint`
3. `npm run check:i18n` (validates `tocatoare/content.ts`)
4. `npm run test:e2e` (non-visual) — requires dev server + a DB the page can read
5. `npm run test:e2e:visual` — after baselines regenerated & approved

**DB gate (founder-assisted, D8 staging first):**
6. Apply migrations to **staging** Supabase project (Studio SQL Editor, in filename order, or `npx supabase db push`). Confirm zero errors.
7. Run seed `01_products.sql`. Verify: `SELECT count(*) FROM products;` → **10**; `SELECT count(*) FROM inventory;` → **10**.
8. RLS smoke test: as anon, `SELECT * FROM products WHERE status='active'` works (returns 0 until activation, no error); anon `UPDATE products SET price_ron=1` is **rejected**.
9. Generate types: `supabase gen types ... > types/supabase.ts`; `npm run typecheck` still green.
10. Activate the 10 products in Studio (`UPDATE products SET status='active'`), founder reviews `/tocatoare` locally, then generate + approve visual baselines.
11. Replay the exact same SQL on **production** (founder-confirmed). Re-verify counts.

**Doc:** write `docs/etapa-2-1-supabase-foundation.md` with step-by-step founder runbook (apply order, env vars, type-gen, admin-user creation, activation).

> **Windows note:** do NOT run `npm run build` while `npm run dev` is running (`.next` corruption gotcha). Use `npm run typecheck` during iteration.

---

# PART J — Brain updates  *(commit #9)*

- **MEMORY.md** — `## 2026-05-22 — Etapa 2.1: Supabase foundation` (schema insights, money-in-bani, RLS recursion fix, ISR catalog pattern).
- **decisions.md** — append: migration tooling (D1), text+CHECK enums (D2), bani integers, soft-delete via status, guest checkout nullable profile, jsonb snapshots immutability, stock_movements audit, order_status_history, EN slug cutting-boards (D4), Navbar D5, ISR revalidate (D6).
- **codebase-map.md** — new section "Database layer (Etapa 2.1)" (tables + relations + RLS summary + helper fns + `lib/db/` + `lib/supabase-server.ts`) and "/tocatoare page (Etapa 2.1.5)".
- **gotchas.md** — RLS `is_admin()` SECURITY DEFINER avoids profiles-policy recursion; `getActiveProducts()` graceful empty-state vs top-level-client throw; generated column `quantity_available` is read-only (don't INSERT into it).

---

# Commit plan

**Task 2.1 (DB foundation):**
1. `chore(db): add product, inventory, orders, order_items schema migrations`
2. `chore(db): add profiles, addresses, shared trigger helper migrations`
3. `chore(db): rename waitlist to email_subscribers and extend for per-product interest`
4. `chore(db): add stock_movements + order_status_history audit tables`
5. `chore(db): add RLS policies + is_admin() for all tables`
6. `chore(db): add order-number sequence + atomic stock helper functions`
7. `chore(db): add product seed (10 SKUs) + inventory rows`
8. `chore(types): add @supabase/ssr server client + generated Supabase types`
9. `docs(brain): record Etapa 2.1 schema decisions + runbook`

**Task 2.1.5 (catalog):**
10. `feat(catalog): add Supabase active-products fetch helper for /tocatoare`
11. `feat(catalog): implement /tocatoare grid with placeholder cards + tier filters`
12. `feat(catalog): add i18n routing tocatoare<->cutting-boards`
13. `feat(navbar): replace dead #tocatoare anchor with /tocatoare route link`
14. `test(catalog): add E2E + SEO + visual baselines for /tocatoare`

**Push:** grouped after Task 2.1, then again after Task 2.1.5 (per founder).

---

## Execution handoff
After approval ("plan aprobat"), execute via **subagent-driven-development** (fresh subagent per task + review between), staying in this session — matches the established `/atelier` workflow. DB-application steps (PART I 6–11) are founder-gated and paused for confirmation.
