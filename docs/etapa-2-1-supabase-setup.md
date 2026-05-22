# Etapa 2.1 — Supabase Foundation: Setup Runbook

> Step-by-step for the founder. Order matters. We apply to a **staging** project
> first, verify, then replay the exact same SQL on **production**.

## What this delivers

A complete e-commerce schema (9 tables) ready for Etapa 2 (Auth + Admin) and
Etapa 3 (Stripe + COD): `profiles`, `addresses`, `products`, `inventory`,
`stock_movements`, `orders`, `order_items`, `order_status_history`, and the
renamed `email_subscribers` (was `waitlist`). Plus RLS policies, audit triggers,
atomic stock functions, and a 10-SKU seed.

Files:
- Migrations: `supabase/migrations/20260522090000_*.sql` … `_090011_db_functions.sql` (12 files)
- Seed: `supabase/seeds/01_products.sql`
- Types (generated later): `types/supabase.ts`

---

## Step 0 — Create a staging Supabase project

1. https://supabase.com/dashboard → **New project** → name it `oak-fantasy-staging`.
2. Pick a strong DB password (save it). Region: closest to you (e.g. Frankfurt).
3. Wait for provisioning (~2 min).
4. Project Settings → **API** → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`
5. Note the **Project Ref** (the `xxxx` in `xxxx.supabase.co`) — needed for type gen.

> Keep production keys in a separate note. For building + visual baselines we
> point local `.env.local` at **staging**.

---

## Step 1 — Point local env at staging

Edit `.env.local` (gitignored) using `.env.example` as the template:

```
NEXT_PUBLIC_SUPABASE_URL=https://<staging-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging anon key>
SUPABASE_SERVICE_ROLE_KEY=<staging service role key>
```

Also add all three to **Vercel → Project Settings → Environment Variables**
(production values, not staging) before the prod deploy — otherwise the build fails.

---

## Step 2 — Apply migrations to staging

**Option A — Supabase Studio SQL Editor (simplest, no CLI auth):**
Open staging → SQL Editor. Paste and run each migration **in filename order**:

```
20260522090000_shared_helpers.sql
20260522090001_create_profiles.sql
20260522090002_create_addresses.sql
20260522090003_create_products.sql
20260522090004_create_inventory.sql
20260522090005_create_orders.sql
20260522090006_create_order_items.sql
20260522090007_create_order_status_history.sql
20260522090008_create_stock_movements.sql
20260522090009_extend_waitlist_to_email_subscribers.sql   ← see note below
20260522090010_rls_policies.sql
20260522090011_db_functions.sql
```

> **Note on migration 09 (waitlist → email_subscribers):** it assumes a
> `waitlist` table already exists (from the original `20260515114129_create_waitlist_table.sql`).
> A brand-new staging project will NOT have it. So on staging, FIRST run the
> original waitlist migration (`supabase/migrations/20260515114129_create_waitlist_table.sql`),
> then migration 09 renames it. (Production already has `waitlist`, so there 09 just renames.)

**Option B — Supabase CLI (`npx supabase db push`):**
```bash
npx supabase login                 # paste access token from dashboard
npx supabase link --project-ref <staging-ref>
npx supabase db push               # applies all migrations in supabase/migrations/
```

Confirm zero errors.

---

## Step 3 — Seed the 10 products

SQL Editor → run `supabase/seeds/01_products.sql`. Then verify:

```sql
SELECT count(*) FROM products;   -- expect 10
SELECT count(*) FROM inventory;  -- expect 10
SELECT slug, status FROM products ORDER BY sort_order;  -- all 'draft'
```

---

## Step 4 — RLS smoke test

In the SQL Editor (runs as service role → bypasses RLS), and via the anon key:

```sql
-- As service role this returns 10; the public anon read sees only active (0 now).
SELECT count(*) FROM products WHERE status = 'active';   -- 0 until activation
```

The page `/tocatoare` will show the empty state until you activate products.

---

## Step 5 — Generate TypeScript types

```bash
npx supabase login          # if not already
npx supabase gen types typescript --project-id <staging-ref> > types/supabase.ts
```

Then locally: `npm run typecheck` must stay green. (If CLI auth is a blocker,
tell me and I'll hand-author `types/supabase.ts` from the schema.)

---

## Step 6 — Create the admin user (manual — no password in code)

1. Staging → Authentication → Users → **Add user** → your email + a strong password → Create.
2. SQL Editor:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'tvarvaroi@gmail.com';
   ```
   (the `handle_new_user` trigger already created the profile row).
3. 2FA TOTP enrollment comes in Etapa 2.2 once the auth UI exists.

---

## Step 7 — Activation + visual baselines (catalog, Task 2.1.5)

This is the agreed protocol:
1. I tell you when the `/tocatoare` page + tests are ready.
2. You activate the 10 products on **staging**:
   ```sql
   UPDATE public.products SET status = 'active';
   ```
3. I confirm `/tocatoare` is populated locally (dev points at staging).
4. I generate visual regression baselines (`npm run test:e2e:update`).
5. You review the 6 new baselines (3 viewports × RO/EN) → you approve → I commit.

---

## Step 8 — Production rollout (after 2.1 + 2.1.5 reviewed)

1. Apply the **same migrations in the same order** to production (Studio or CLI).
   Production already has `waitlist`, so migration 09 renames it in place.
2. **Apply migration 09 BEFORE deploying the new code** — the code now reads
   `.from('email_subscribers')`; if the table is still named `waitlist` the live
   subscribe form breaks.
3. Run the seed on production.
4. Add the three Supabase env vars (prod values) to Vercel.
5. Push → Vercel deploys.
6. Activate products on production when ready (`UPDATE products SET status='active'`).
7. ISR (`revalidate = 60`) reflects activation within ~60s without a redeploy.

---

## Rollback notes

- Migrations are additive; to undo on staging, drop the new tables (`DROP TABLE ... CASCADE`)
  and `ALTER TABLE email_subscribers RENAME TO waitlist` + restore the source CHECK.
- Never edit an already-applied migration file — add a new one.
