---
globs: ['app/**/*.tsx', 'app/**/*.ts', 'components/**/*.tsx', 'components/**/*.ts', 'components/**/*.css']
---

# Frontend Rules — Oak Fantasy (real stack)

> Rewritten 2026-11-18. The previous version described a different project
> (React Query, Playfair/Inter, `client/` folder) and contradicted CLAUDE.md.
> Source of truth for visuals: `_brain/notes/design-system.md`.

## Stack
- Next.js 14 App Router + TypeScript. Routes live in `app/[locale]/<ro-slug>/page.tsx`;
  new public routes get a key in `PATHNAMES` (`lib/i18n-routes.ts`) + sitemap + hreflang.
- **No React Query.** Data is read in Server Components (`lib/db/*`, `lib/admin/*`) and
  written through server actions (`'use server'`, Zod `safeParse` server-side) or route
  handlers. Client components never talk to privileged Supabase clients.
- Forms: react-hook-form + `zodResolver`; the same Zod schema validates on the server.
- Animations: `import { motion, useReducedMotion } from 'framer-motion'` — never
  `motion/react`. Every animation honours reduced motion.
- `'use client'` as the first line on anything with hooks, browser APIs or framer-motion.
- Images: `next/image`, never `<img>`.

## Visual system
- Fonts: **Caudex** (display/headings, labels via `.label-caps`), **Lora** (body),
  **Caveat** (rare handwritten accent). Not Playfair, not Inter.
- Colors: only the CSS variables from `app/globals.css` (`var(--oak-warm)`, …) or their
  Tailwind tokens. No hardcoded brand hex in components, no cold grey, no pure white/black.
- Styling: Tailwind utilities, CSS Modules for page-level editorial layouts
  (`components/atelier/atelier.module.css` pattern), inline `style` with CSS vars where
  the surrounding code already does so. Match the file you are in.
- shadcn/ui (`components/ui/`) is available; restyle anything that ships off-brand
  defaults (e.g. the alert-dialog overlay is `bg-black/80`).
- Mobile-first; touch targets ≥ 44px; visible keyboard focus.

## Page chrome
- Navbar + Footer are NOT in the global layout: every page's client wrapper mounts them
  and passes its own language toggle (`localizedPath(routeKey, nextLocale)`).

## Copy
- All visible text bilingual (RO with complete ș/ț comma diacritics + EN) in a
  `content.ts` map with symmetric keys — `npm run check:i18n` enforces it.
- Brand voice per `_brain/notes/design-system.md`: first person plural, concrete,
  no "premium/exclusiv/luxury", no emoji, no exclamation marks.
