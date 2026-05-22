---
globs: ['supabase/**/*.sql', 'lib/db/**/*.ts', 'lib/supabase*.ts', 'app/**/route.ts', 'app/**/actions.ts']
---

# Backend Rules — Oak Fantasy (real stack)

> Updated 2026-05-22 (Etapa 2.1). These rules describe how this project actually
> works. We use Supabase (Postgres) directly — NOT Drizzle, NOT React Query.

## Data layer
- **Supabase Postgres** accessed via `@supabase/supabase-js` (anon, client + public reads)
  and `@supabase/ssr` (cookie-bound server client + service-role client).
  **No ORM.** Do NOT add Drizzle/Prisma without a brainstorming + decision entry.
- **Schema lives in versioned SQL migrations** under `supabase/migrations/` named
  `YYYYMMDDHHMMSS_name.sql`. Migrations apply in filename order. Never edit an
  applied migration — add a new one.
- **Row Level Security (RLS) is the primary authorization layer.** Every table has
  RLS enabled. Public read is opt-in per table (e.g. `products` where `status='active'`).
  Admin gating uses the `public.is_admin()` SECURITY DEFINER helper.

## Secrets & clients
- **`SUPABASE_SERVICE_ROLE_KEY` is server-only.** Never prefix `NEXT_PUBLIC_`, never
  import a service-role client into client components. Use it only inside `'use server'`
  actions or route handlers (`app/**/route.ts`).
- Public catalog reads use the anon client server-side (RLS allows them) and must
  degrade gracefully (return empty, never throw at module top-level — see the
  `supabaseUrl is required` gotcha).

## Money, time, ids
- **Money is integer bani** (180 RON → `18000`). Never floats for currency.
- **Timestamps are `timestamptz` (UTC).** Not locale-naive.
- **Primary keys are `uuid`** (`gen_random_uuid()`), never auto-increment integers.

## Integrity & audit
- **Soft-delete via `status` enums** (text + CHECK), never `DELETE` rows for
  products/orders.
- **Audit trails are mandatory:** stock changes go through `stock_movements`
  (via `reserve_stock` / `release_stock` / `fulfill_stock`), order status changes
  through `order_status_history`. Never mutate stock/status without the audit row.
- Validate all external input with **Zod** before it reaches the DB.
- Atomic stock operations live in **PL/pgSQL functions** with `FOR UPDATE` locks.

## Conventions
- Enums = `text + CHECK (col IN (...))`, not native Postgres enums (easier to evolve).
- Generated columns (e.g. `inventory.quantity_available`) are read-only — never INSERT/UPDATE them.
- Comments in code/SQL in English (project convention); user-visible text bilingual RO/EN.
