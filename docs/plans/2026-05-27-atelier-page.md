# Faza /atelier — implementation plan

> **Status:** approved & implemented 2026-05-27 (Q1=C, Q2=D1, Q3=Translated lead, Q4=Yes)
> **Author:** Claude Code (Opus 4.7)
> **Date:** 2026-05-27
> **Handoff:** v3-catalog.html (Variant C, Tool-Forward Catalog) — provided inline in this session
> **Predecessor:** Faza A (commits + push), Faza B (shared i18n), Faza C (automation), `/despre` implementation (2026-05-18)

## Goal

Implement the approved `/atelier` page (Variant C, Tool-Forward Catalog) as a Next.js route. Page must be visually indistinguishable from `v3-catalog.html`. Bilingual (RO `/ro/atelier`, EN `/en/workshop`). Refactor `/despre` to summarize process+workshop with cross-links. Add Atelier link to Navbar. Iron Law: `npm run verify` clean.

## Open contradiction — needs founder pick

v3-catalog says "process details on /despre". Task 2 spec says /despre process should also become compact. If both apply, the detailed version disappears from the site entirely until the blog launches.

**3 options:**

| # | Approach | Pros | Cons |
|---|---|---|---|
| A | Task 2 fidel: both compact | Cleanest cross-page narrative, narrative parity between pages, less duplication | Detailed process content disappears until blog (~Q3 2026) |
| B | /despre stays detailed (defy Task 2 process refactor) | Preserves valuable content, /atelier's cross-ref to "details on /despre" is honest | /despre stays long, less "summary" experience |
| C **(Recommended)** | Compromise: /despre process becomes medium-compact (h3 + 2-3 line body, NO placeholder images, NO alternating sidebar layout) | Keeps useful detail; trims fat (the images add visual chrome but no info value pre-launch); honest cross-ref still works | Slightly more work than (A); /despre stays moderately long |

**My recommendation:** **C**. Reason: founder's intent in Task 2 is summarization without losing information. Removing placeholder images (no real photos yet anyway) and alternating layout shrinks /despre's process section by ~60% without sacrificing content. v3-catalog's "Details on /despre" cross-ref remains accurate.

**Until founder picks** I'll plan as **C**; trivial to flip to A or B if founder overrides.

## Architecture

### Routing

Extend [lib/i18n-routes.ts](../../lib/i18n-routes.ts) `PATHNAMES`:

```ts
export const PATHNAMES = {
  despre:  { ro: 'despre',  en: 'about'    },
  atelier: { ro: 'atelier', en: 'workshop' },  // ← NEW
} as const;
```

Middleware [middleware.ts](../../middleware.ts) **needs no change** — its handling is route-key generic (it walks `PATHNAMES`). It automatically:
- `/en/atelier` → 308 redirect to `/en/workshop`
- `/ro/workshop` → 308 redirect to `/ro/atelier`
- `/en/workshop` → rewrite (URL unchanged) to `/en/atelier` (canonical folder)

Next.js route folder: `app/[locale]/atelier/page.tsx` (one folder, serves both locales via path rewrite).

### File layout

```
app/[locale]/atelier/
  page.tsx                      Server Component (generateMetadata + JSON-LD + isLocale guard)

components/atelier/
  content.ts                    Bilingual map (Record<Locale, AtelierContent>)
  atelier.module.css            Bespoke CSS ported from v3-catalog.html + shared.css
  AtelierContent.tsx            Client wrapper (Navbar + sections + Footer + language toggle)
  AtelierHero.tsx               Dark hero with 3×3 rotated tool-grid
  ToolsSection.tsx              6 tool cards in 12-col asymmetric grid (the centerpiece)
  WorkshopPlace.tsx             "Locul unde se face treaba" — 2-col (text + 2-img stack)
  DayInAtelier.tsx              4-moment compact strip (no timeline visual in Variant C)
  PullQuoteBridge.tsx           Lightweight wrapper for the paper-aged pull-quote bridge
  ProcessSummary.tsx            5-step compact grid + cross-ref to /despre#proces
  Conditions.tsx                2 cond-cards (Hygrometer & Storage zones)
  Seasonality.tsx               4 season-cards (no SVG icons in Variant C — text-only)
  RelatedArticles.tsx           4 "Articol în pregătire" placeholder cards
  AtelierCTA.tsx                Dark CTA with 2 buttons
```

**Reuse without duplication** from `components/about/`:
- `Reveal.tsx` — same scroll-triggered wrapper (`import Reveal from '@/components/about/Reveal'`)
- `PlaceholderImage.tsx` — `.placeholder` styling matches the design's striped pattern (verified via `_brain/notes/codebase-map.md`)

Existing top-level components stay as-is: `Navbar.tsx` (modified in Task 3), `Footer.tsx`.

### Sections mapping from v3-catalog.html → React components

| Section in v3-catalog | id | Component | Notes |
|---|---|---|---|
| `<section class="hero">` (dark bg, 2-col with rotated tool-grid) | — | `AtelierHero` | Dark `--bark` background, 3×3 cell grid rotated -2deg with 9 cell labels (tools+sensors+light), read-time pill |
| `<section class="tools-hero" id="unelte">` | `#unelte` | `ToolsSection` | The centerpiece. 12-col asymmetric: cards 1-2 span-6, 3-4 span-4 (wait → fixing), 5 span-4, 6 span-8. Tool-tag absolute positioned. Hover lift. |
| `<section class="place" id="loc">` | `#loc` | `WorkshopPlace` | 1.2fr/1fr 2-col; left=text (eyebrow + h2 + 2 paragraphs), right=2 stacked striped placeholders |
| `<section class="day" id="zi">` | `#zi` | `DayInAtelier` | 1fr/1.6fr head, 4-col strip below the top-border, each day-moment = time + h3 + p |
| `<div class="pullquote">` (between #zi and #proces) | — | `PullQuoteBridge` | Paper-aged background, font-caveat |
| `<section class="proc" id="proces">` | `#proces` | `ProcessSummary` | 1fr/2fr 2-col with eyebrow+h2+intro+cross-ref on left, 5-col proc-steps on right |
| `<section class="cond" id="conditii">` | `#conditii` | `Conditions` | 1fr/1.6fr head, 2-col cond-cards (each has label + paragraph with **strong** highlights) |
| `<section class="season" id="sezon">` | `#sezon` | `Seasonality` | Centered head, 4-col season-cards with top-border accent (no SVG icons in C, unlike B) |
| `<section class="articles" id="articole">` | `#articole` | `RelatedArticles` | Centered head, 4-col article-cards with `coming` class showing "Articol în pregătire" badge |
| `<section class="cta">` (dark bg) | — | `AtelierCTA` | Dark `--bark` background, h2 italic-em + 2 buttons |

### CSS strategy

**Bespoke patterns go into `components/atelier/atelier.module.css`:**

- Hero dark with paper-texture overlay + 3×3 rotated grid (`hero`, `hero-wrap`, `hero-grid-vis`, `cell`)
- 12-col asymmetric tools grid (`tools-feature`, `tool-card`, `tool-tag` positioned absolute, hover lift)
- Tool image striped placeholder (matches `.placeholder` from `/despre`'s about.module.css — same brown-green stripe pattern)
- Day strip (`day-wrap`, `day-strip`, `day-moment`)
- Process dark band (`proc`, `proc-wrap`, `proc-steps` with top-border accent — but Variant C uses paper-aged not bark for proc)
- Conditions (`cond-card` with label + content)
- Seasons (`season-card` with top-border accent)
- Articles grid (reuse `.article-card` styling pattern from shared.css)
- Dark CTA (`cta-wrap` with `--bark` bg + paper-texture overlay)
- Pull quote (reuse `.pullquote` styling — already exists in /despre's about.module.css; will duplicate inline within atelier.module.css for module isolation, NO global promotion at this stage)

**Pattern promotion (rejected for now):** founder spec says "dacă pattern apare DOAR pe /atelier → atelier.module.css. Dacă apare pe ambele → propune-mi promovare la shared (eu confirm înainte)". `.pullquote`, `.article-card`, `.fact`/`.cond-card`, `.cross-ref` appear on both /despre and /atelier. **I propose to NOT promote yet** — better to wait until 3rd page (`/ingrijire` or `/contact`) confirms the patterns are actually stable. Duplication within 2 CSS modules is cheap (~80 lines total); premature shared module is expensive to refactor. **Re-evaluate at page 3.**

**Brand CSS vars** (--oak-warm, --cream-warm, --bark, etc.) used directly via `var(...)` — already defined in `app/globals.css`. Zero hex hardcoded.

### Animations

- **Reveal wrapping** for major sections (whileInView opacity 0→1, y 28→0, ease [0.16, 1, 0.3, 1], 0.9s).
- **Tool cards hover** — pure CSS `transform: translateY(-4px)` + shadow on `:hover`. NO framer-motion (cheaper, smoother).
- **Day strip** — Reveal on each day-moment, staggered 0.1s.
- **Pull-quote, CTA** — Reveal on parent wrapper.
- `useReducedMotion()` respected via Reveal component (already supports it from /despre implementation).

### SEO setup (Server Component `page.tsx`)

`generateMetadata` per locale:
- **Title RO:** `Atelierul Oak Fantasy — Cum se face fiecare tocător din stejar`
- **Title EN:** `Oak Fantasy Workshop — How every oak cutting board is made`
- **Description RO** (~145 chars): `Atelier mic în Carpați. Stejar românesc, uscat 6–12 luni, șase unelte. Cum lucrăm manual fiecare tocător — de la lemn la ceară de albine.`
- **Description EN** (~140 chars): `Small workshop in the Carpathians. Romanian oak, dried 6–12 months, six tools. How we handcraft every cutting board — from wood to beeswax.`
- `alternates.canonical: path` (`/ro/atelier` or `/en/workshop`)
- `alternates.languages`: `{ ro: '/ro/atelier', en: '/en/workshop', 'x-default': '/ro/atelier' }`
- `openGraph`: title + description + url + siteName + locale + type=website + reused OG image (`/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg` — same TODO note as /despre for dedicated atelier OG)
- `twitter`: same

**JSON-LD scripts (3 total — Schema.org):**
1. **AboutPage** (`@type: 'AboutPage'`, `mainEntity: Organization`) — same shape as /despre, just `url` and `name` differ
2. **BreadcrumbList** — Home → Atelier
3. **ItemList** — the 6 tools as structured data:
   ```json
   {
     "@context": "https://schema.org",
     "@type": "ItemList",
     "name": "Atelier tools",
     "itemListElement": [
       { "@type": "ListItem", "position": 1, "name": "Planou circular Bosch GTS 635-216", ... },
       ...
     ]
   }
   ```
   This is a bonus for SEO — Google may show tool list in rich results.

Use the same `ldSafe()` helper from /despre to escape `<` → `<`.

### Content bilingv

**RO** — verbatim from v3-catalog.html (text-only, all diacritics preserved). The texts are already approved (used in v2-timeline.html for /despre with the same wording, where applicable).

**EN** — fresh translations with founder-approved glossary:

| RO | EN |
|---|---|
| "Atelierul" | "The Workshop" |
| "Documentar · Atelier" | "Documentary · Workshop" |
| "Citește în ~7 minute" | "Read in ~7 minutes" |
| "Cu ce lucrăm" | "What we work with" |
| "Catalogul uneltelor noastre" | "The catalog of our tools" |
| "Featured · Tăiere" | "Featured · Cutting" |
| "Featured · Margine" | "Featured · Edge" |
| "Asamblare" | "Assembly" |
| "Aplatizare" | "Flattening" |
| "Șlefuit" | "Sanding" |
| "Detalii" | "Details" |
| "Locul unde se face treaba" | "The place where the work gets done" |
| "Atelierul ca loc" | "The workshop as a place" |
| "O zi în atelier" | "A day in the workshop" |
| "Ritmul unei zile" | "The rhythm of a day" |
| "Dimineața / Pauză / După-amiaza / Seara" | "Morning / Break / Afternoon / Evening" |
| "Verificări și muncă grea" | "Checks and heavy work" |
| "O cafea, o respirație" | "A coffee, a breath" |
| "Lucrări de finețe" | "Fine work" |
| "Finisaj și închidere" | "Finishing and closing" |
| "Procesul în sumar" | "The process in summary" |
| "Cinci pași, foarte pe scurt" | "Five steps, very briefly" |
| "Detalii complete pe pagina Despre" | "Full details on the About page" |
| "Condițiile" | "The conditions" |
| "Lucruri pe care nu le vezi, dar contează" | "Things you don't see, but matter" |
| "Higrometru & termometru" | "Hygrometer & thermometer" |
| "Două zone de depozitare" | "Two storage zones" |
| "Sezonalitatea" | "The seasons" |
| "Vremea schimbă munca" | "The weather changes the work" |
| "Iarna / Primăvara / Vara / Toamna" | "Winter / Spring / Summer / Autumn" |
| "Articole conexe" | "Related articles" |
| "Mai multe despre meserie" | "More about the craft" |
| "Articol în pregătire" | "Article coming soon" |
| "Tehnică · Uscare" | "Technique · Drying" |
| "Tehnică · Construcție" | "Technique · Construction" |
| "Finisaj" | "Finishing" |
| "Ghid" | "Guide" |
| "Ai văzut uneltele. Hai să vezi și tocătoarele." | "You've seen the tools. Now let's see the boards." |
| "Vezi tocătoarele noastre" | "See our cutting boards" |
| "Înscrie-te pe lista de lansare" | "Join the launch waitlist" |

**Product names preserved verbatim across locales** (per founder spec):
- "Planou circular Bosch GTS 635-216" RO / "Bosch GTS 635-216 table saw" EN (light translation of "Planou circular" → "table saw" since "Planou" is a Romanian colloquialism)
- "Freză verticală cu ghidaj" RO / "Vertical router with guide" EN
- "Presă manuală cu șuruburi" RO / "Manual screw clamps" EN
- "Rindeluitor electric Makita KP0810" RO / "Makita KP0810 electric planer" EN
- "Șlefuitor orbital Festool ETS 150/3" RO / "Festool ETS 150/3 random orbital sander" EN
- "Set unelte de mână" RO / "Hand tools set" EN

(Open question: should brand names like "Bosch GTS 635-216" lead the EN translation, or trail it like RO? My draft trails them. Founder can flip if preferred.)

### Animations & a11y

- `useReducedMotion` from framer-motion (via existing Reveal component)
- Tool cards hover state via CSS only (no framer-motion needed)
- aria labels: `aria-label` on hero/footer/main; each tool card semantic `<article>` with `<h3>`
- Striped placeholders use `role="img" aria-label={caption}` (existing PlaceholderImage pattern)

### Anchors (kept exact from v3-catalog)

`#unelte`, `#loc`, `#zi`, `#proces`, `#conditii`, `#sezon`, `#articole` — for deep links and (future) Navbar mobile dropdown.

## Task 1 commits (planned)

1. `feat(i18n): add atelier↔workshop pathname mapping`
2. `feat(atelier): add bilingual content map for /atelier page`
3. `feat(atelier): implement /atelier sections (Hero, Tools, Place, Day, Process, Conditions, Seasonality, Articles, CTA)`
4. `feat(atelier): add server page with SEO metadata and JSON-LD`

(4 commits total for Task 1.)

## Task 2 — /despre refactor (after /atelier verified)

**Per Option C above** (recommended):

### Process section — medium-compact

Replace [components/about/ProcessTimeline.tsx](../../components/about/ProcessTimeline.tsx):
- Keep: eyebrow `process.eyebrow`, h2 `process.h2`, lead `process.lead`
- 5 steps: same h3 title + body (existing content), keep step number bubble + tick
- **Remove:** alternating left/right grid layout, side placeholder image per step (`step.placeholder` field stops being rendered; data kept for future restoration)
- New layout: vertical centered grid, all rows aligned, no images
- Add at end: `<Link href={localizedPath('atelier', locale) + '#proces'}>Vezi cum lucrăm în atelier →` (RO) / `See how we work in the workshop →` (EN)

Update [components/about/content.ts](../../components/about/content.ts) RO+EN sections:
- Add `process.crossLinkLabel`: `'Vezi cum lucrăm în atelier'` / `'See how we work in the workshop'`

CSS: update `.timeline` related classes in [components/about/about.module.css](../../components/about/about.module.css) — drop `.sideImg` rendering, simplify `.step` to single column flow.

### Workshop banner — add cross-link

Modify [components/about/WorkshopBanner.tsx](../../components/about/WorkshopBanner.tsx):
- Keep current placeholder + h2 + paragraph
- Add at end of overlay: `<Link href={localizedPath('atelier', locale)}>Vezi atelierul în detaliu →` (RO) / `See the workshop in detail →` (EN)

Update content.ts:
- Add `workshop.crossLinkLabel`: `'Vezi atelierul în detaliu'` / `'See the workshop in detail'`

### Task 2 commit (planned)

5. `refactor(about): summarize process and workshop sections, add cross-page links to /atelier`

## Task 3 — Navbar update

[components/Navbar.tsx](../../components/Navbar.tsx) — add `Atelier`/`Workshop` link at position 4 (after `Despre`/`About`):

```ts
const NAV_LINKS_RO: NavLink[] = [
  { label: 'Povestea noastră', type: 'anchor', anchor: '#poveste' },
  { label: 'Atelier', type: 'anchor', anchor: '#atelier' },   // ← existing homepage anchor
  { label: 'Despre',  type: 'route',  routeKey: 'despre'  },
  { label: 'Atelier', type: 'route',  routeKey: 'atelier' },  // ← NEW (NAMING COLLISION — see below)
  { label: 'Tocătoare', type: 'anchor', anchor: '#tocatoare' },
  { label: 'Îngrijire', type: 'anchor', anchor: '#ingrijire' },
];
```

**⚠️ Naming collision detected:** Navbar already has an anchor `'Atelier'` at position 2 (linking to `#atelier` on homepage = WorkshopSection). Now adding a route `'Atelier'` at position 4 = `/ro/atelier`. **Two items labeled "Atelier" in same Navbar** is confusing.

**Resolution options:**
- **D1 (Recommended):** Remove the homepage anchor `#atelier` from Navbar (anchor 2 above) since `/atelier` route is now the dedicated page. Homepage WorkshopSection still exists, just no longer in nav.
- **D2:** Rename the route link to "Atelier" stays, anchor becomes "Atelier (homepage)" — awkward.
- **D3:** Rename anchor `#atelier` to `#workshop-glimpse` or similar, label "Sneak Peek" — too cute.

**My recommendation: D1.** Drop the anchor link; the route is the source of truth for "Atelier" content. Founder confirms.

### Task 3 commit (planned)

6. `feat(navbar): add Atelier/Workshop link at position 4 (replaces homepage anchor)`

## Task 4 — E2E test coverage

Create [tests/e2e/atelier.spec.ts](../../tests/e2e/atelier.spec.ts):
- `/ro/atelier` and `/en/workshop` return 200
- `/en/atelier` → 308 redirect to `/en/workshop`
- `/ro/workshop` → 308 redirect to `/ro/atelier`
- RO content checks: "Atelier mic", "Bosch GTS", "Festool", "Iarna", "Carpați"
- EN body has no Romanian diacritics
- Anchor navigation: `/ro/atelier#unelte` scrolls to tools section
- All 6 tool cards visible with `<h3>` headings

Update [tests/e2e/shared-components.spec.ts](../../tests/e2e/shared-components.spec.ts):
- Navbar has "Atelier" link on RO and "Workshop" on EN at position 4
- Click → navigates to `/ro/atelier` / `/en/workshop`
- Active state when on the page

Update [tests/e2e/visual-regression.spec.ts](../../tests/e2e/visual-regression.spec.ts):
- Add `home-ro`, `home-en`, `atelier-ro`, `atelier-en` → already have home, add `atelier-ro` + `atelier-en` for 3 viewports = +6 baselines
- **Wait for founder approval on baselines before committing them** (Faza C protocol)

Update [tests/e2e/seo.spec.ts](../../tests/e2e/seo.spec.ts):
- Add `/ro/atelier` and `/en/workshop` to `ALL_PAGES` and `PAGES_WITH_FULL_SEO`
- Test for JSON-LD scripts (AboutPage + BreadcrumbList + ItemList ≥3)

### Task 4 commits (planned)

7. `test(atelier): add E2E specs, SEO tests, and shared-components updates for /atelier`
8. `test(atelier): commit visual regression screenshot baselines for /atelier` (after founder review)

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| `useReducedMotion` from framer-motion produces SSR mismatch (Hero animations) | Low | Already mitigated globally — `Reveal` wraps client components; hero stays mostly CSS |
| Tool-card 12-col grid breaks on weird tablet widths | Medium | Test on 768px viewport (chromium-tablet project); spec calls for span-6 fallback at <1024px |
| JSON-LD ItemList trips Schema.org validator | Low | Test live URL with [schema.org validator](https://validator.schema.org/) post-deploy |
| Translation glossary disputes — e.g. "Planou circular" → "table saw" vs "circular planer" | Medium | Translation: founder reviews translations table above before commit 2 (content map) |
| /despre process refactor breaks visual regression (Faza C baselines) | High | Visual regression on /despre will fail intentionally → `--update-snapshots` after refactor; baselines re-committed |
| Atelier visual baselines need ~36MB git pack delta | Low | PNG compresses well in git pack; same protocol as Faza C |

## Total expected commits

- Task 1 (atelier): 4
- Task 2 (despre refactor): 1
- Task 3 (Navbar): 1
- Task 4 (tests): 2 (specs + baselines)
- Brain updates: 1

**Total: 9 commits.**

## Open questions for founder (pre-implementation)

| # | Question | My recommendation |
|---|---|---|
| Q1 | Reconcile process-detail contradiction (Option A / B / C) | **C** — medium-compact /despre, very-short /atelier |
| Q2 | Navbar collision: remove homepage `#atelier` anchor (D1) or keep both (D2/D3)? | **D1** — drop anchor; /atelier route is canonical |
| Q3 | Tool names in EN — "Planou circular Bosch GTS" → "Bosch GTS table saw" (translated lead) or "Bosch GTS — table saw" (parallel)? | **Translated lead** (more natural English) |
| Q4 | EN "atelier" → "workshop" route slug (per founder spec) | Confirmed, no question |
| Q5 | Visual regression baselines for /atelier — wait for founder review before commit? | **Wait** — per Faza C protocol |

## Anti-patterns to avoid

- ❌ No reinterpretation of v3-catalog.html (founder's spec: "Implementezi exact ce e acolo")
- ❌ No `npm run build` (gotcha `.next` cache Windows)
- ❌ No silent shared CSS promotion (founder pre-approval required if any pattern moves to `shared.module.css`)
- ❌ No new packages without founder confirm
- ❌ No design changes to dodge tech issues — root cause first
- ❌ No auto-commit baselines on first run — founder review

## Implementation order

1. Plan approved → start Task 1
2. Task 1 commits 1–4 in order; typecheck after each component
3. Verify on localhost: `/ro/atelier`, `/en/workshop`, redirects working, SEO source view OK
4. Pause for founder verdict on /atelier visuals
5. Task 2 commits (despre refactor) — pause for verdict
6. Task 3 commit (Navbar)
7. Task 4 commits — generate baselines, **WAIT for founder review**, then commit
8. Iron Law: `npm run verify` — must pass clean
9. Brain updates (1 commit)
10. Push all
11. Final report
