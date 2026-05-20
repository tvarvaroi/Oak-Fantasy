# Design System — imutabil

> Sursă: `CLAUDE.md` §6 + extracție reală din `app/globals.css` și `tailwind.config.ts`.
> Regulă absolută: orice pagină nouă trebuie să fie indistinctibilă ca stil de landing page.

## Poziționare

Brand artisan românesc — cald, hand-made, countryside-heritage cu polish modern.
**NU** corporate minimal. **NU** Aesop-clean. Inspirație: „premium Etsy artisan" + „Apartamento magazine".
Trei adjective: **CALD. LUCRAT MANUAL. ÎNRĂDĂCINAT.**

- Tagline RO (primar): „Făcut cu drag în România."
- Tagline EN: "From Carpathian oak, by hand."

## Paleta — CSS variables exacte (`app/globals.css` `:root`)

Toate sunt și tokens Tailwind în `tailwind.config.ts` (ex. `bg-oak-warm`, `text-ink`).

**Primare:**
| Variabilă | Hex |
|---|---|
| `--forest-deep` | `#2D3A1F` |
| `--forest-mid` | `#5A6B3C` |
| `--moss` | `#8FA068` |
| `--oak-warm` | `#8B5E3C` |
| `--oak-deep` | `#5C3A20` |
| `--copper` | `#B87333` |

**Background:**
| `--cream-warm` | `#F5EBD8` | (fundal body default) |
|---|---|---|
| `--paper-aged` | `#EDE0C5` | |
| `--bark` | `#1F1810` | (dark sections) |

**Text:**
| `--ink` | `#2A2218` | text principal — NICIODATĂ negru pur |
|---|---|---|
| `--ink-soft` | `#5D4E3A` | text secundar |
| `--highlight` | `#C9A66B` | accent cald |

Alte: `--radius: 0.5rem`. shadcn compat = aceleași culori mapate în HSL (`--background`, `--primary`, etc.).

**Regulă absolută:** toate culorile au căldură. **Zero gri rece. Zero alb pur. Zero negru pur.** Niciodată hex hardcodat în componente — doar token/var.

## Tipografie

| Rol | Font | Weights | Utilitar |
|---|---|---|---|
| Display / headings | **Caudex** | 400, 700 | `.font-caudex`, `h1..h6` automat |
| Script / „semnături" (RAR) | **Caveat** | 400, 600 | `.font-caveat`, `.hero-headline span.handwritten` |
| Body | **Lora** | 400, 500 | `.font-lora`, `body` default |
| Labels uppercase | Caudex | — | `.label-caps` (uppercase, letter-spacing `0.18em`, `0.75rem`) |

Scale Tailwind: `text-display-lg` `clamp(2.5rem,6vw,5.5rem)` (lh 1.1, ls -0.01em) · `text-display-md` `clamp(2rem,4vw,3.25rem)` (lh 1.15) · `text-display-sm` `clamp(1.5rem,3vw,2.5rem)`.
Ex.: titlu mare = Caudex 700 cu `text-display-lg`. Accent scris de mână = `span.handwritten` (Caveat, `--oak-warm`, rotit -1deg).

## Spacing & layout

- Secțiuni: `py-section` (120px) sau `py-section-sm` (80px).
- `borderRadius`: carduri `rounded-card` (10px), butoane `rounded-btn` (6px).
- `box-sizing: border-box` global; `overflow-x: hidden` pe body; `scroll-behavior: smooth`.

## Texturi & efecte semnătură

- `.paper-texture` — overlay zgomot SVG fractal, `opacity 0.07` (senzație hârtie).
- `.svg-draw` + `.drawn` → animația `draw-stroke` 1.2s (ornamente SVG care „se desenează").
- Scrollbar custom: track `--paper-aged`, thumb `--oak-warm` → hover `--oak-deep`.
- Keyframes disponibile: `float` (4s loop), `count-up`, `draw-stroke`.

## Voice & copy (reguli)

- Persoana întâi plural: „noi facem", „atelierul nostru".
- Concret peste abstract: „stejar din Bucegi" NU „lemn premium".
- **Diacritice complete și corecte** (ă â î ș ț) — semnal de calitate brand, niciodată stripate.
- Zero emoji. Maximum **un** semn de exclamare pe tot site-ul.
- Evită: „premium", „exclusiv", „luxury", „rafinat".
- Folosește des: „lucrat", „făcut", „atelier", „manual", „mâini", „stejar", „moștenire".

**Good:** „Fiecare tocător e tăiat și finisat manual în atelierul nostru, din stejar românesc."
**Bad:** „Produse premium din lemn de cea mai înaltă calitate!"

## Componente standard (construiește-le mereu la fel)

- Butoane: `components/ui/button.tsx` (variants via CVA), `rounded-btn`, culori token.
- Inputs/forms: `components/ui/` + react-hook-form + zod resolver.
- Secțiuni noi: wrapper cu `py-section`, fundal `bg-cream-warm`/`bg-paper-aged`/`bg-bark`, heading Caudex.
- Animații de intrare: framer-motion + `useReducedMotion()` obligatoriu (a11y).
