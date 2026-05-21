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
