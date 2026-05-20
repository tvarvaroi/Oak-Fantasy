# /despre Page Implementation Plan

> **For Claude:** Implement task-by-task. Founder makes the commits manually (project rule #1) — plan proposes commit points, founder executes them. Founder verifies on `localhost:3000`.

> Plan created 2026-05-18 (filename keeps the task-specified `2026-05-16` slug). Design source: Claude Design handoff `v2-timeline.html` (Variant B — Timeline), **approved, implement exactly**.

**Goal:** Build the `/despre` (RO) / `/about` (EN) page, a quiet reading-focused brand page, pixel-faithful to the approved `v2-timeline.html`, integrated into the existing Next.js 14 App Router + custom i18n project.

**Architecture:** A Server Component page (`app/[locale]/despre/page.tsx`) owns SEO (`generateMetadata` + JSON-LD). It renders one client wrapper (`components/about/AboutContent.tsx`) that hosts the existing `Navbar`/`Footer` and the new about sections. Path-localized routing (`/ro/despre`, `/en/about`) added to the existing custom `middleware.ts` via a pathnames map + a `localizedPath()` link helper — no new packages, no next-intl.

**Tech Stack:** Next.js 14.2.18 App Router · TypeScript · Tailwind 3.3.3 + CSS vars from `app/globals.css` · framer-motion 11.11.17 (NEVER `motion/react`) + `useReducedMotion` · `next/image` · existing `components/Navbar.tsx`, `components/Footer.tsx`, `PageTransition.tsx`.

---

## Design Fidelity Contract

Implement `v2-timeline.html` **exactly** — sections, order, copy, layout, colors, spacing, type scale per the prototype's inline `<style>` + `shared.css`. Allowed transformations only: HTML→React/TSX, inline style→Tailwind/CSS-var, `<img>`→`next/image`, IntersectionObserver→framer-motion `whileInView`+`useReducedMotion`, hardcoded RO text→bilingual content map, a11y attributes, responsive breakpoints (keep the prototype's: 820px timeline collapse, 900px philosophy/footer, 560px values).

DO NOT: change palette/fonts, restructure sections, add/remove sections, "improve" UX, implement the `variant-switch` pill (design-only artifact).

Token parity confirmed: `shared.css` `:root` == `app/globals.css` `:root` (same hex, same font vars). Reuse `globals.css` `.paper-texture`, `.svg-draw`/`@keyframes draw-stroke`, brand Tailwind tokens.

---

## Component Architecture

```
app/[locale]/despre/page.tsx        # SERVER: generateMetadata + JSON-LD + <AboutContent locale=.../>
components/about/AboutContent.tsx    # 'use client': Navbar + sections + Footer + PageTransition-compatible
components/about/AboutHero.tsx       # hero + decorative twig SVG (draw)
components/about/ProcessTimeline.tsx # 5-step alternating vertical timeline
components/about/PhilosophySection.tsx
components/about/WorkshopBanner.tsx  # full-bleed workshop.webp + overlay
components/about/ValuesGrid.tsx      # 4 vcards + hand-drawn SVG icons (draw)
components/about/AboutCTA.tsx
components/about/aboutContent.ts     # bilingual RO/EN content map (single source of truth)
lib/i18n-routes.ts                   # pathnames map + localizedPath() helper
```

Reused as-is: `components/Navbar.tsx` (props `language`, `onToggleLanguage`; add "Despre"/"About" link + active state — see Task 6), `components/Footer.tsx` (prop `language`), `app/[locale]/layout.tsx` (fonts + PageTransition wrapper already wrap all `[locale]` routes).

Server/client split rationale (senior-frontend): metadata only works in Server Components, so `page.tsx` stays server; all animation/interaction lives in `'use client'` children. `Navbar` needs `onToggleLanguage` → handled inside `AboutContent` via `useRouter`/`usePathname` mirroring `app/[locale]/page.tsx`.

---

## i18n Path Localization (infrastructure — touches live `middleware.ts`)

**Decision (also append to `_brain/notes/decisions.md`):** path-localized routes via the existing custom middleware (no next-intl). Canonical internal segment = `despre`. EN public URL `/en/about` is **rewritten** (not redirected) to internal `/en/despre`. RO public URL `/ro/despre` unchanged. `/ro/about` and `/en/despre` → redirect to the correct localized URL (avoid duplicate-content).

`lib/i18n-routes.ts`:
```ts
export const PATHNAMES = {
  despre: { ro: '/despre', en: '/about' },
} as const;
type RouteKey = keyof typeof PATHNAMES;
export type Locale = 'ro' | 'en';

export function localizedPath(key: RouteKey, locale: Locale): string {
  return `/${locale}${PATHNAMES[key][locale]}`;
}
// reverse map for middleware: localized slug -> canonical segment
export const SLUG_TO_CANONICAL: Record<string, string> = { despre: 'despre', about: 'despre' };
export const CANONICAL_TO_SLUG = { despre: { ro: 'despre', en: 'about' } } as const;
```

`middleware.ts` additions (preserve existing locale-prefix redirect + matcher; add BEFORE the final return):
- Parse `/{locale}/{seg}`. If `seg` is a localized slug for the wrong/other locale → 308 redirect to the correct localized URL.
- If `locale==='en'` and `seg==='about'` → `NextResponse.rewrite` to `/en/despre` (internal canonical the route folder serves).
- Leave homepage (`/`, `/ro`, `/en`) untouched.

**REGRESSION GUARD (mandatory in Iron Law):** after middleware changes, manually verify `/`, `/ro`, `/en` (homepage) still render and language toggle still works. The matcher `['/((?!_next|api|.*\\..*).*)']` stays.

Route folder: only `app/[locale]/despre/page.tsx` exists (canonical). `/en/about` resolves via rewrite. `generateStaticParams` in `[locale]/layout.tsx` already yields `ro`/`en` — fine; `despre/page.tsx` adds its own `generateStaticParams` returning `[{locale:'ro'},{locale:'en'}]`.

---

## Bilingual Content (single source — `components/about/aboutContent.ts`)

RO = EXACT verbatim from `v2-timeline.html` (do not alter, full diacritics). EN = faithful, natural, warm collective "we" (per PASUL 4 glossary).

| Key | RO (verbatim) | EN |
|---|---|---|
| nav.link | Despre | About |
| page.title | Despre noi | About us |
| hero.eyebrow | Despre noi | About us |
| hero.h1 | Tocătoare lucrate cu răbdare,<br/>pentru bucătării care nu se grăbesc. | Cutting boards made with patience,<br/>for kitchens that aren't in a hurry. |
| hero.sub | Atelier de tocătoare din stejar românesc · Făcute manual · Est. 2026 | Workshop for Romanian oak cutting boards · Handmade · Est. 2026 |
| process.eyebrow | Procesul | The process |
| process.h2 | Cinci pași între copac și bucătărie. | Five steps between the tree and your kitchen. |
| process.lead | De la stejarul nealtoit din Carpați până la tocătorul pe care îl primești acasă — fiecare etapă cere timp, atenție și mâinile aceluiași om. | From wild Carpathian oak to the board that arrives at your home — every stage takes time, attention, and the same pair of hands. |
| step1.title / .body | Alegerea lemnului / Cumpărăm stejar de la oameni din zona Carpaților, doar bucăți cu desen frumos și fără noduri în lemnul de muncă. Restul îl folosim pentru alte lucruri. | Choosing the wood / We buy oak from people in the Carpathian region — only pieces with beautiful grain and no knots in the working surface. The rest we use for other things. |
| step2.title / .body | Uscarea / Lemnul stă la uscat între 6 și 12 luni, până ajunge la umiditatea potrivită (8–10%). Fără asta, tocătorul ar plesni în primele luni de folosință. Nu sărim peste pas. | Drying / The wood dries for 6 to 12 months, until it reaches the right moisture (8–10%). Without this, the board would crack in its first months of use. We don't skip this step. |
| step3.title / .body | Tăierea și asamblarea / Tăiem la dimensiunile fiecărui SKU, apoi lipim cu adeziv alimentar Titebond III — același folosit în atelierele de mobilier din SUA și Europa de zeci de ani. Presăm și lăsăm să se odihnească 24 de ore. | Cutting and assembly / We cut to each SKU's dimensions, then glue with Titebond III food-safe adhesive — the same used in furniture workshops across the US and Europe for decades. We press and let it rest 24 hours. |
| step4.title / .body | Șlefuirea / Trecem prin patru-cinci graduri de șlefuit, de la 80 la 320. Trebuie să simți lemnul fără rugozități, dar și fără să fie lucios — un tocător prea neted nu îți «ține» cuțitul, alunecă. | Sanding / We work through four or five sanding grits, from 80 to 320. You should feel the wood with no roughness, yet not glossy — a board that's too smooth doesn't "grip" the knife — it slips. |
| step5.title / .body | Finisajul / Ungem cu ulei alimentar + ceară de albine — câteva straturi, fiecare lăsat să intre în lemn 24 de ore. Asta îți protejează tocătorul, hrănește lemnul, și-l face să arate mai bun cu vârsta. | The finish / We rub in food-safe oil + beeswax — a few coats, each left to soak into the wood for 24 hours. This protects your board, feeds the wood, and makes it look better with age. |
| philosophy.eyebrow | Filosofia noastră | Our philosophy |
| philosophy.h2 | Un atelier mic.<br/><em>Un singur copac.</em> | A small workshop.<br/><em>A single tree.</em> |
| philosophy.p1 | (verbatim §1 din v2-timeline) | In our workshop, every board begins as a piece of Romanian oak — dried slowly, for years, until the wood is stable and ready for a human hand. We cut, glue and finish each board ourselves, with no production line, no rush. It means we can't make thousands a month. It means, instead, that every board leaving our workshop carries the marks of a single pair of hands and a single tree. |
| philosophy.p2 | (verbatim §2) | Carpathian oak is dense, dark, with beautiful grain wherever you cut it. It's the right wood for something you'll use every day for the next ten, twenty, thirty years. That's what we make — objects that last as long as the kitchen. |
| philosophy.p3 | (verbatim §3) | We are not a factory. We are a small Romanian workshop that believes a wooden cutting board can be an object worth keeping. |
| workshop.eyebrow | Atelierul | The workshop |
| workshop.h2 | Cu rumeguș pe podele și ulei pe degete. | Sawdust on the floor, oil on our fingers. |
| workshop.p | Lucrăm într-un atelier mic, undeva în zona Carpaților, unde lumina e bună dimineața și liniștită seara. Aici tăiem, șlefuim și împachetăm fiecare tocător. Aici primim și mesajele voastre. Nu e showroom — e atelier. | We work in a small workshop, somewhere in the Carpathian region, where the light is good in the morning and quiet in the evening. Here we cut, sand and pack every board. Here we also receive your messages. It's not a showroom — it's a workshop. |
| values.eyebrow / .h2 / .lead | Valorile noastre / Ce nu negociem. / Patru principii pe care le purtăm cu noi din prima zi în atelier. | Our values / What we won't compromise. / Four principles we've carried with us since day one in the workshop. |
| val1 | Răbdare / Lemnul nu se grăbește, nici noi. Fiecare tocător primește timpul de care are nevoie. | Patience / Wood doesn't rush, and neither do we. Every board gets the time it needs. |
| val2 | Lemn local / Lucrăm doar cu stejar românesc din pădurile noastre, fără import, fără compromis. | Local wood / We work only with Romanian oak from our own forests — no imports, no compromise. |
| val3 | Durabil / Un tocător făcut cum trebuie ține zeci de ani. Asta e standardul nostru. | Built to last / A board made right lasts for decades. That's our standard. |
| val4 | Manual / Nicio linie de producție. Doar mâini, scule, și atenție. | By hand / No production line. Just hands, tools, and attention. |
| cta.h2 | Lansăm în octombrie. | We launch in October. |
| cta.p | Primii pe listă primesc 15% reducere și ghidul nostru de îngrijire a lemnului — gratuit. | The first on the list get 15% off and our free wood care guide. |
| cta.primary → /[locale]#waitlist | Înscrie-te pe lista de lansare | Join the launch list |
| cta.ghost → /[locale]#products | Vezi tocătoarele noastre | See our cutting boards |

Voice guard: zero emoji; max ONE "!" on the page (none present in copy — keep it that way); collective "noi"/"we".

**EN sign-off log (founder, 2026-05-18) — applied above; Task 3 uses this as authoritative:**
1. hero.sub: dropped article "A" → "Workshop for Romanian oak…" ✅ applied
2. step1: "working wood" → "working surface" ✅ applied
3. step4: `"hold" the knife, it slips` → `"grip" the knife — it slips` ✅ applied
4. CTA buttons: RO/EN are separate table rows (the "stuck together" was a chat-report formatting artifact, not a plan/content bug) — no change needed
5. **Workshop "Cu rumeguș pe podele și ulei pe degete." — RESOLVED 2026-05-18.** It is the workshop section **H2** in `v2-timeline.html:182` (not omitted). Founder confirmed: keep as H2, EN = "Sawdust on the floor, oil on our fingers." Design-faithful, no deviation, no duplication, no decisions.md deviation entry.
6. cta.p: "our wood-care guide — free." → "our free wood care guide." ✅ applied
7. philosophy.p2: plan already had "dense, dark," (no "in colour") — "in colour" was only in the chat report; ✅ compliant
Editorial: A) val3 = "Built to last" ✅ confirmed. B) **US spelling everywhere** (color/organize/center) — after #7 no "colour" remains; rule applies to all future EN. C) "wild Carpathian oak" ✅ confirmed. RO source verbatim from `v2-timeline.html` incl. exact word **"nealtoit"** (line 129) — never substitute.

---

## Assets

- Workshop banner → **BLOCKED, awaiting founder decision.** `public/workshop.webp` is (a) actually a 1.6MB **PNG** mislabeled `.webp` (content-type mismatch), and (b) a magazine-spread mockup composite (gray bg + book spine), NOT a usable full-bleed photo — inner scene matches mood (golden hour, sawdust, hands, no face) but framing is unusable. Default per Task 4.5: striped placeholder + `{/* TODO: replace with real workshop photo */}`. If founder supplies a real clean workshop photo → recompress per Task 4.5.
- 5 process side-images → NO real photos. Recreate the prototype's `.placeholder` (striped 135° gradient + monospace caption box) as a `<PlaceholderImage caption=.../>` component. Each marked `{/* TODO: replace with real workshop photo */}`. Captions kept from prototype (English shot directions, fine as design captions).
- Hero twig SVG + 4 value icon SVGs → inline SVG components, animated via `globals.css` `.svg-draw` + `.drawn` toggled by framer-motion `whileInView` (or `onViewportEnter`), gated by `useReducedMotion`.

---

## Tasks (bite-sized; founder commits at marked points)

### Task 1 — i18n route helper
- Create `lib/i18n-routes.ts` (code above).
- Verify: `npx tsc --noEmit` passes.
- **Commit point 1 (founder):** `feat(i18n): add path-localized routing helper and pathnames map`

### Task 2 — middleware path localization
- Modify `middleware.ts`: add slug redirect + `/en/about`→`/en/despre` rewrite, preserve existing logic + matcher.
- Verify: `npm run dev`, manual — `/` → `/ro`; `/ro` & `/en` homepage OK; `/ro/despre` OK; `/en/about` OK; `/en/despre`→redirects `/en/about`; `/ro/about`→redirects `/ro/despre`.
- **Commit point 2 (founder):** `feat(i18n): update middleware to handle localized paths for /despre`

### Task 3 — content map
- Create `components/about/aboutContent.ts` with the full bilingual table above as a typed object keyed by `Locale`. EN strings = founder-approved versions (verified word-by-word before Task 1).
- Verify: `npx tsc --noEmit`.
- **Commit point 3 (founder):** `feat(about): add bilingual content map for /despre page`

### Task 4 — about sections (one component at a time, verify build between)
Order: `PlaceholderImage` util → `AboutHero` → `ProcessTimeline` → `PhilosophySection` → `WorkshopBanner` → `ValuesGrid` → `AboutCTA` → `AboutContent` wrapper.
- Each: exact styles from `v2-timeline.html` inline `<style>` + `shared.css`, ported to Tailwind/CSS-vars; framer-motion `whileInView` reveal (`opacity 0→1`, `y 28→0`, `cubic-bezier(.16,1,.3,1)`, ~0.9s, threshold ~0.18) wrapped so `useReducedMotion()` disables transform/opacity.
- Reuse `Navbar`/`Footer` in `AboutContent`; language toggle via `useRouter().push(localizedPath('despre', other))`.
- Verify after each: `npm run build` compiles.
- Workshop banner image handled in Task 4.5 (use placeholder until decided).

### Task 4.5 — Workshop image — runs between Task 4 and Task 5
**DECIDED 2026-05-18: PLACEHOLDER path (founder chose default).** workshop.webp = mislabeled PNG + magazine-mockup composite, not used. Adjustment #1 (recompress in-task) is moot — no real photo exists to recompress; recompression branch retained below for when a real photo is supplied later.
- **ACTIVE PATH — no real photo:** `WorkshopBanner` uses the striped `PlaceholderImage` (caption: `workshop interior · golden hour · wide shot`) + `{/* TODO: replace with real workshop photo */}`. No recompression. Do NOT reference `public/workshop.webp` anywhere. Verify: `npm run build`.
- **DEFERRED BRANCH — if founder later supplies a real clean workshop photo:** save to `public/workshop.webp` as TRUE webp. Recompress with ffmpeg (only tool available; no cwebp/sharp): `ffmpeg -y -i <source> -c:v libwebp -quality 78 -compression_level 6 public/workshop.webp`. **Target <400KB.** If still over, drop quality stepwise 78→75→72 (not below 72) and/or cap width 1600px (`-vf scale=1600:-1`). Visual check on retina: open at 2× density, confirm no banding/mush in wood grain & shadows. Wire `<Image src="/workshop.webp" fill sizes="100vw" quality={80}>` into `WorkshopBanner`.
- **If no real photo (default):** `WorkshopBanner` keeps the striped `PlaceholderImage` (caption: `workshop interior · golden hour · wide shot`) + `{/* TODO: replace with real workshop photo */}`. No recompression. Remove/ignore the bad `workshop.webp` for the banner (do not reference it).
- Either way: fix any other code that referenced the misnamed asset.
- Verify: `npm run build`; if photo used, confirm served size <400KB (DevTools Network) + retina visual.
- **Commit point 4 (founder):** `feat(about): implement /despre sections` (covers Task 4 sections + Task 4.5 workshop image)

### Task 5 — server page + SEO
- Create `app/[locale]/despre/page.tsx` (Server): `generateStaticParams` `[{ro},{en}]`; `generateMetadata` per locale (titles below); `alternates.canonical` + `alternates.languages` (`ro`→`/ro/despre`, `en`→`/en/about`) for hreflang; OG (`/workshop.webp`); render `<AboutContent locale={params.locale}/>`; inject JSON-LD `AboutPage` + `BreadcrumbList` via `<script type="application/ld+json">`.
  - Title RO: `Despre Oak Fantasy — Atelier de tocătoare din stejar românesc`
  - Title EN: `About Oak Fantasy — Romanian oak cutting board workshop`
  - Description ≤155 chars per locale (draft in plan-exec).
- Verify: `npm run build`; view-source has correct `<title>`, `hreflang`, JSON-LD.
- (No separate commit — combined with Task 6 into Commit point 5.)

### Task 6 — Navbar link
- Read `components/Navbar.tsx` first. Add "Despre"/"About" nav item using `localizedPath('despre', language)`, active state when on the route (`usePathname`). Match existing nav link styling. Keep `onToggleLanguage` behavior consistent on the new page (toggle must swap `/ro/despre`↔`/en/about`).
- Verify: link appears + active state on `/ro/despre` & `/en/about`; homepage nav unaffected.
- **Commit point 5 (founder):** `feat(about): add server page with SEO metadata and Navbar link` (covers Task 5 + Task 6)

---

## Iron Law (before any "gata" — PASUL 5)

- [ ] `npm run build` exit 0, zero errors, zero warnings
- [ ] `/ro/despre` + `/en/about` render correctly on `localhost:3000`
- [ ] **REGRESSION:** `/`, `/ro`, `/en` homepage still work; nav language toggle works both there and on /despre
- [ ] `/en/despre`→`/en/about`, `/ro/about`→`/ro/despre` redirects
- [ ] Responsive 375 / 768 / 1024 (timeline collapses at 820, values 900→2col 560→1col)
- [ ] RO diacritics correct (Făcut, Stejar, Carpați, Răbdare, rumeguș…)
- [ ] No `motion/react` import; no raw `<img>`; no hardcoded hex (CSS vars only); fonts Caudex/Caveat/Lora only
- [ ] `useReducedMotion` honored (no motion when reduced)
- [ ] JSON-LD AboutPage + BreadcrumbList valid; hreflang + canonical present
- [ ] Lighthouse local: Perf 85+ / A11y 95+ / SEO 100 / BP 95+ (flag workshop.webp weight if Perf misses)
- [ ] Navbar link + active state; Footer renders; PageTransition works

---

## PASUL 6 — Brain updates (end of task)
- `MEMORY.md`: pattern entry (Claude Design handoff → implementation; path-localized i18n approach).
- `_brain/notes/decisions.md`: Variant B chosen; path-localized routing via custom middleware (no next-intl); process = central narrative reused on /atelier & product pages; handoff workflow.
- `_brain/notes/codebase-map.md`: new `components/about/`, `app/[locale]/despre/page.tsx`, `lib/i18n-routes.ts`, middleware change, bilingual content map.
- New gotchas → `_brain/notes/gotchas.md`.

## Risks & Rollback
- **Middleware regression** = highest risk (live homepage). Mitigation: Task 2 isolated + explicit regression checks; if homepage breaks → `systematic-debugging`, revert middleware diff only, report — NEVER alter the approved design to dodge a routing bug.
- Image weight may miss Lighthouse Perf 85 → report honestly, propose source recompression as follow-up (don't silently degrade design).
- No package installs anywhere. No commits by me — founder commits at the 5 marked points.

---

## Execution model
Executed in THIS session by me, task-by-task, reporting at each commit point so the founder commits + checks `localhost:3000` (project workflow §10 overrides the writing-plans default subagent/parallel choice). Founder approves THIS plan before Task 1.
