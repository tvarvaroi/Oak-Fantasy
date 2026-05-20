# Stack Frontend — detalii

> Sursă: `package.json`, `tailwind.config.ts`, `app/[locale]/layout.tsx`. Versiuni reale.

## Core

- **Next.js** `14.2.18` — App Router (`app/`), nu Pages Router
- **React** `18.3.1` / React DOM `18.3.1` (PINNED — R3F depinde de 18)
- **TypeScript** `5.2.2`
- **Tailwind CSS** `3.3.3` + `tailwindcss-animate` + `tailwind-merge` + `clsx`

## Animații (toate prezente)

- **framer-motion** `11.11.17` — import **mereu** `from 'framer-motion'`, NICIODATĂ `from 'motion/react'`. `useReducedMotion()` folosit peste tot.
- **gsap** `^3.15` + `ScrollTrigger` — folosit în `Navbar`, `ProductTease`
- 3D: **@react-three/fiber** `8.18.0`, **@react-three/drei** `9.122.0`, **three** `0.169.0` — **PINNED, nu schimba**. 3D se importă cu `next/dynamic` `{ ssr: false }`.

## UI

- **shadcn/ui** peste **Radix UI** — ~47 componente în `components/ui/`
- **lucide-react** `^0.446` — iconițe
- **sonner** — toasts; `next-themes` — folosit doar de `ui/sonner.tsx`

## Forms & State

- **react-hook-form** `^7.53` + **@hookform/resolvers** + **zod** `^3.23`
- **zustand** `4.5.5` — state management (neutilizat încă în landing)

## Data

- **@supabase/supabase-js** `^2.58` — client în `lib/supabase.ts`

## Tipografie (next/font/google, în `app/[locale]/layout.tsx`)

- **Caudex** 400/700 → `--font-caudex` (display / headings)
- **Caveat** 400/600 → `--font-caveat` (script, RAR — „semnături")
- **Lora** 400/500 → `--font-lora` (body)
- `display: 'swap'`, fallback-uri în `tailwind.config.ts` (Cormorant Garamond / Kalam / Georgia)

## Tailwind tokens custom (`tailwind.config.ts`)

- `darkMode: ['class']`
- Culori brand ca tokens (`oak-warm`, `forest-deep`, ...) + shadcn HSL vars
- `fontSize`: `display-lg` `clamp(2.5rem,6vw,5.5rem)`, `display-md`, `display-sm`
- `spacing`: `section: 120px`, `section-sm: 80px`
- `borderRadius`: `card: 10px`, `btn: 6px`
- Keyframes: `draw-stroke`, `float`, `count-up`, accordion

## Build & scripts

```
npm run dev        # next dev
npm run build      # next build (Iron Law înainte de "done")
npm run lint       # next lint
npm run typecheck  # tsc --noEmit
npm install X --legacy-peer-deps   # obligatoriu flag-ul (R3F)
```

## Hosting

Vercel — auto-deploy din `main`. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` în `.env.local` (gitignored) ȘI pe Vercel. (Notă: există și `netlify.toml` + `@netlify/plugin-nextjs` în deps — config Netlify rezidual; sursă de adevăr = Vercel per CLAUDE.md.)
