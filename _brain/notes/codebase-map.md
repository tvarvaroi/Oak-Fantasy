# Codebase Map — starea reală (2026-05-16)

> Mapare din cod, nu presupuneri. La sesiune nouă, asta îți dă context în 30s.

## Structură top-level

```
app/
  layout.tsx              # RootLayout — doar `return children` (passthrough)
  page.tsx                # RootPage — redirect('/ro')
  globals.css             # CSS variables brand + base styles + utilities
  [locale]/
    layout.tsx            # LocaleLayout — fonturi, <html lang>, metadata, PageTransition
    page.tsx              # LocalePage — compune toate secțiunile landing
components/               # 13 componente landing + ui/ (shadcn)
  ui/                     # ~47 componente shadcn/Radix (button, dialog, form, ...)
lib/
  supabase.ts             # client Supabase + addToWaitlist()
  utils.ts                # cn() helper (clsx + tailwind-merge)
hooks/
  use-toast.ts            # shadcn toast hook
middleware.ts             # locale routing (RO default, EN)
supabase/migrations/      # 1 migration: waitlist table
```

## Pattern global al componentelor landing

- **Toate** au `'use client'` pe prima linie (hooks + framer-motion + browser APIs).
- **Toate** primesc prop `{ language: 'ro' | 'en' }` (excepții notate mai jos).
- **Toate** folosesc `framer-motion` cu `useReducedMotion()` → respectă accesibilitatea (prefers-reduced-motion).
- i18n: textele sunt inline în componentă, comutate pe `language`.

## Componente landing (`components/`)

| Componentă | Props | Dependențe cheie | Ce face |
|---|---|---|---|
| `Navbar.tsx` | `{ language, onToggleLanguage }` (interface `NavbarProps`) | gsap + ScrollTrigger, next/image, useReducedMotion | Nav sticky, toggle limbă RO/EN, hide/show la scroll |
| `Hero.tsx` | `{ language }` (interface `HeroProps`) | next/dynamic (3D `ssr:false`), next/image, framer-motion, `EmailForm` | Hero editorial + board 3D, email capture (source `hero`) |
| `CuttingBoard3D.tsx` | **fără props** | @react-three/fiber `Canvas`/`useFrame`, drei `RoundedBox`, three | Tocător 3D rotativ, material stejar procedural. Importat dinamic de Hero cu `ssr:false` |
| `StoryStrip.tsx` | `{ language }` | framer-motion, SVG ornamente | 3 coloane cu ornamente SVG animate (svg-draw) |
| `WorkshopSection.tsx` | `{ language }` | framer-motion `useScroll`/`useTransform`, next/image | Layout asimetric cu parallax |
| `ProductTease.tsx` | `{ language }` | gsap ScrollTrigger, next/image, framer-motion | Galerie orizontală scroll-driven |
| `NumbersStrip.tsx` | `{ language: Locale }` | framer-motion `animate`, `./numbers-strip-content` | Countere animate (count-up). Conținut + sufixe + ariaLabel + `numberLocale` pentru `toLocaleString` în content map separat (Faza B refactor) |
| `CraftVideoTease.tsx` | `{ language }` | framer-motion, useRef video | Placeholder video proces atelier |
| `WaitlistSection.tsx` | `{ language }` | framer-motion, SVG (`BranchProps`), `EmailForm` | Email capture (source `waitlist`) + ornament ramură |
| `Footer.tsx` | `{ language }` (`FooterLinkProps` intern) | next/image, framer-motion | Footer dark, 3 coloane |
| `FloatingCTA.tsx` | `{ language }` | framer-motion `AnimatePresence` | Buton flotant care apare la scroll |
| `EmailForm.tsx` | `{ source: 'hero'|'waitlist', language, large? }` (interface `EmailFormProps`) | framer-motion, `addToWaitlist` din `@/lib/supabase` | Form email → Supabase `waitlist` |
| `PageTransition.tsx` | `{ children }` | framer-motion `AnimatePresence` + `usePathname` | Tranziții între rute |

## Backend / Data

- **`lib/supabase.ts`**: `createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)`. `addToWaitlist(entry)` — tratează codul `23505` (unique violation) ca succes idempotent (`alreadyExists: true`), aruncă orice altă eroare. Tip `WaitlistEntry = { email, language, source }`.
- **Schema `supabase/migrations/...create_waitlist_table.sql`**: tabel `waitlist` (`id uuid PK`, `email text UNIQUE NOT NULL`, `language` CHECK ro/en default ro, `source` CHECK hero/waitlist default hero, `created_at timestamptz`). **RLS activ**: policy doar INSERT pentru `anon, authenticated` cu validare email (`length>3 AND LIKE '%@%'`). Fără read policy public (doar service role citește).

## i18n (`middleware.ts`)

- Locale valide: `['ro', 'en']`. Skip `/_next`, `/api`, fișiere statice (`.`).
- Path fără locale → redirect la `/ro<path>`. `matcher: ['/((?!_next|api|.*\\..*).*)']`.
- `app/[locale]/layout.tsx`: `generateStaticParams` = `[{ro},{en}]`; `generateMetadata` per locale (title/description/OG RO și EN); fonturi `next/font/google` (Caudex/Caveat/Lora) injectate ca CSS variables pe `<html>`.

## Rute noi — convenție

`app/[locale]/numele-rutei/page.tsx`. NU `pages/`. Componente cu hooks/animații → `'use client'`. Imagini → `next/image`. 3D → `next/dynamic` cu `ssr:false`.

## i18n content map pattern (Faza B)

Componente shared cu conținut multilingv > ~5 string-uri: extras în fișier sibling `components/[name]-content.ts` cu shape `Record<Locale, ContentInterface>`. Component primește `language: Locale` și face `const { ... } = content[language]`. Exemple: `components/numbers-strip-content.ts`. Pattern paralel cu `components/about/content.ts` (route-scoped).

Componente cu 1-2 string-uri hardcodate: ternar inline `language === 'ro' ? 'X' : 'Y'`. Exemplu: Navbar tagline `stejar · manual` / `oak · handmade`.

Componente cu obj `nav = { ro:{}, en:{} }[language]` existent: adăugare cheie nouă în ambele obj. Exemplu: Footer `microTagline`.

## Testing infrastructure (Faza C)

```
playwright.config.ts                              # Root config — chromium-only, 3 projects, workers: 3
tests/e2e/
  fixtures.ts                                     # disableAnimations + reducedMotion + consoleErrors + maskCanvas
  homepage.spec.ts                                # /ro + /en — 5 tests
  despre.spec.ts                                  # /ro/despre + /en/about + redirects — 7 tests
  shared-components.spec.ts                       # Navbar + Footer + NumbersStrip Faza B fixes — 9 tests
  seo.spec.ts                                     # title/desc all, canonical+hreflang+JSON-LD doar /despre — 14 tests
  visual-regression.spec.ts                       # 4 pages × 3 viewports = 12 screenshots
  __screenshots__/                                # Baselines committed (12 PNG, ~22MB)
scripts/
  check-i18n.mjs                                  # Zero-dep Node ES module, 169 linii
lighthouserc.desktop.json                         # Preset desktop + 4 URLs + thresholds 80/95/95/90
lighthouserc.mobile.json                          # Preset mobile + same URLs/thresholds
docs/verification.md                              # Workflow docs pentru verify pipeline
```

**Npm scripts noi:**
- `verify` (gate principal — typecheck → lint → check:i18n → test:e2e → test:e2e:visual, ~4min)
- `test:e2e` (non-visual, 3 paralel workers, ~1.5min)
- `test:e2e:visual` (only visual regression, `--workers=1` sequential, ~2.5min)
- `test:e2e:headed` / `test:e2e:update` (refresh baselines)
- `check:i18n` (cu opțional `-- --json` pentru output mașină)
- `lighthouse` / `lighthouse:mobile` (audit separat, 1-2min)

## /atelier page (Faza 2026-05-27)

```
app/[locale]/atelier/
  page.tsx                       Server Component + 3 JSON-LD (AboutPage + BreadcrumbList + ItemList tools) + generateMetadata
components/atelier/
  content.ts                     Record<Locale, AtelierContent> (RO verbatim v3-catalog, EN founder-approved glossary)
  atelier.module.css             Port v3-catalog.html bespoke CSS + reuse brand vars
  AtelierContent.tsx             Client wrapper (Navbar + 10 sections + Footer)
  AtelierHero.tsx                Dark hero + 3×3 rotated cell grid
  ToolsSection.tsx               6 tool cards în grid 12-col asimetric (centerpiece)
  WorkshopPlace.tsx              2-col text + 2-image stack
  DayInAtelier.tsx               4 day-moments compact strip
  PullQuoteBridge.tsx            Caveat pull-quote bridge
  ProcessSummary.tsx             5-step compact + cross-ref Link → /despre#proces
  Conditions.tsx                 2 cond-cards cu **markdown bold** parser inline
  Seasonality.tsx                4 season-cards (text-only, no SVG icons în Variant C)
  RelatedArticles.tsx            4 placeholder articles cu "Articol în pregătire" badge
  AtelierCTA.tsx                 Dark CTA
```

**Reuse din /despre:** `components/about/Reveal.tsx`, `components/about/PlaceholderImage.tsx` (import direct via @/components/about/...).

**URL routes:**
- RO: `/ro/atelier`
- EN: `/en/workshop` (PATHNAMES extension)
- Cross-redirects: `/en/atelier` → 308 → `/en/workshop`, `/ro/workshop` → 308 → `/ro/atelier`

## /despre refactor (Faza 2026-05-27)

`components/about/ProcessTimeline.tsx`:
- Layout NOU: vertical centered cards max-width 760px, fără alternating, fără placeholder images per step
- Renderează `step.bodyCompact` (2-3 propoziții) în loc de `step.body` (long-form, păstrat pentru reference)
- Cross-ref link la final: `Vezi cum lucrăm în atelier → /{locale}/atelier#proces`

`components/about/WorkshopBanner.tsx`:
- Adăugat în overlay cross-ref Link: `Vezi atelierul în detaliu → /{locale}/atelier`

`components/about/content.ts` shape extins:
- `ProcessStep.bodyCompact: string` — versiune compact rendered
- `process.subHeading: string` — "De la copac la bucătărie" sub h2
- `process.crossLinkLabel: string`
- `workshop.crossLinkLabel: string`

## Navbar update (Faza 2026-05-27)

`components/Navbar.tsx`:
- `NavLink` route key extended: `'despre' | 'atelier'`
- 5 link-uri în ambele locale: Povestea (anchor) → Despre (route) → Atelier (route) → Tocătoare (anchor) → Îngrijire (anchor)
- Dropped: anchor `Atelier #atelier` (decizie D1 — homepage WorkshopSection rămâne content, nu navigare)
- Active state per-link: `pathname === localizedPath(link.routeKey, language)`

## Database layer (Etapa 2.1) [2026-05-23]

**Schema files** — `supabase/migrations/`:
- `20260515114129_create_waitlist_table.sql` (original, Etapa 1)
- `20260522090000_shared_helpers.sql` — `set_updated_at()` trigger generic
- `20260522090001_create_profiles.sql` — profiles (1:1 cu auth.users) + `handle_new_user` trigger (auto-profil la signup)
- `20260522090002_create_addresses.sql` — addresses (shipping/billing per profile)
- `20260522090003_create_products.sql` — products bilingv (bani integer, soft-delete via status)
- `20260522090004_create_inventory.sql` — inventory 1:1 products, `quantity_available` STORED generated column
- `20260522090005_create_orders.sql` — orders (guest checkout supported, jsonb address snapshots)
- `20260522090006_create_order_items.sql` — line items cu `product_snapshot` jsonb
- `20260522090007_create_order_status_history.sql` — audit status
- `20260522090008_create_stock_movements.sql` — audit stoc
- `20260522090009_extend_waitlist_to_email_subscribers.sql` — rename + extend (interested_product_ids[], unsubscribed_at)
- `20260522090010_rls_policies.sql` — RLS + `is_admin()` + `guard_profile_role` trigger
- `20260522090011_db_functions.sql` — `generate_order_number` + reserve/release/fulfill stock atomice

**Tabele publice (9):** addresses, email_subscribers (was waitlist), inventory, order_items, order_status_history, orders, products, profiles, stock_movements.

**RLS pe scurt:**
- `products`: public reads `status='active'`; admin full
- `profiles`: user reads/updates own; admin full; `guard_profile_role` trigger blochează escaladare rol (excepție `auth.uid() IS NULL` = trusted server context)
- `addresses`: owner CRUD; admin full
- `orders` / `order_items` / `order_status_history`: owner reads own via parent; admin full; INSERT-uri doar via service role
- `inventory` / `stock_movements`: admin only; scrieri via DB functions SECURITY DEFINER
- `email_subscribers`: anon+auth INSERT (existing policy renamed); read = service role only

**Funcții DB:**
- `is_admin()` SECURITY DEFINER (anti-recursie RLS pe profiles)
- `generate_order_number()` (`OF-YYYY-NNNN`, sequence globală fără reset anual)
- `reserve_stock(product_id, qty, order_id)` — `FOR UPDATE` lock + audit `order_reserved`
- `release_stock(product_id, qty, order_id)` — audit `order_cancelled`
- `fulfill_stock(product_id, qty, order_id)` — audit `order_fulfilled` (scade fizic + reserved)

**Seed** — `supabase/seeds/01_products.sql`: 10 SKU (status=draft) + 10 inventory rows (qty=0). Aplicat pe staging via Studio SQL Editor.

**Types** — `types/supabase.ts` (generated): 20KB, toate 9 tabele cu Row/Insert/Update + Functions + Enums. Sursă: `npx supabase gen types typescript --project-id juuozsjvuikdtjqhdylw`.

**Client code (`lib/`):**
- `lib/supabase.ts` — anon browser client (existing, `EmailForm` consumer). Tabela = `'waitlist'` **TEMPORAR** până migrarea aplicată pe prod (atunci swap la `'email_subscribers'` + adăugare `Database` generic).
- `lib/supabase-server.ts` (NEW) — `getServerSupabase()` cookie-bound (next/headers) + `getServiceSupabase()` service-role. SERVER ONLY (next/headers throws în client). Ambele cu `Database` generic.
- `lib/db/products.ts` (NEW) — `fetchActiveProducts(): Promise<CatalogProduct[]>`. Anon client server-side; RLS permite SELECT pe active. Graceful empty-state pe missing env / fetch error.
- `lib/db/order-math.ts` (existing) — `lineTotalRon` + `calculateOrderTotal`, TS pur.

**Env vars** — `.env.example` documentează: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only, never NEXT_PUBLIC_).

**Runbook** — `docs/etapa-2-1-supabase-setup.md` (8 pași pentru replay pe prod).

**Status apply:**
- Staging (`juuozsjvuikdtjqhdylw`): 13 migrări aplicate clean ✓ · seed 10 produse ✓ · 9 tabele confirmate ✓ · produse `draft` (NU active încă)
- Production: NU aplicat încă; runbook ready pentru replay.
