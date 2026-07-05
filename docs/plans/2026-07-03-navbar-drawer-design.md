# Navbar redesign — hamburger drawer (mobil + tabletă portrait)

> 2026-07-03 · ACT 3 din task-ul Design QA. Decizie founder LOCKED: mobil = hamburger
> clasic cu drawer lateral. Tabletă = propunerea de mai jos. Desktop = confirmat cu design-qa.

## Problema

Navbar-ul a acumulat elemente sprint după sprint: logo 100px + wordmark 2.4rem +
tagline Caveat + 4 nav links + language toggle + cart icon + Sign-out (autentificat) +
CTA „Cumpără". Breakpoint-ul actual e `md` (768px) — pe **tabletă portrait (768px)
nav-ul desktop complet se afișează exact la lățimea minimă** → înghesuit/suprapus.
Pe mobil (375px), bara ține logo mare + toggle limbă + cart + hamburger simultan.

## Decizii

### D1 — Mobil (<768): hamburger clasic cu drawer lateral (LOCKED founder)
Bara: **logo + cart + hamburger** (3 elemente, toate ≥44px).
În drawer: nav links, language toggle, CTA „Cumpără", Sign-out (dacă autentificat).

### D2 — Tabletă (propunerea mea): hamburger până sub `lg` (1024px)
Breakpoint-ul desktop-nav urcă de la `md` (768) la `lg` (1024):
- **768–1023 (tabletă portrait)** = același pattern ca mobilul (logo + cart + hamburger
  + drawer). Motiv: la 768 nav-ul desktop e fizic înghesuit (baseline-ul tablet o
  arată); un „condensat" intermediar ar fi un al treilea layout de întreținut pentru
  o singură lățime de tranziție. Drawer-ul e touch-friendly — exact ce e o tabletă.
- **≥1024 (tabletă landscape + desktop)** = nav-ul desktop actual, cu `gap` redus
  la `lg` și complet la `xl` dacă design-qa arată înghesuire la 1024.

### D3 — Drawer: pattern CartDrawer (consistență, zero dependențe noi)
- Panel fix dreapta, `width: min(340px, 85vw)`, `height: 100dvh`, bg `--cream-warm`,
  umbră stânga, `transform: translateX(100%)` → `0`, `transition 0.32s cubic-bezier(0.4,0,0.2,1)`
  (identic CartDrawer; suprimat la `prefers-reduced-motion`).
- Backdrop `rgba(31,24,16,0.4)` click-to-close.
- Header: „Meniu"/„Menu" (Caudex) + buton X 44×44.
- Nav links: Lora 1.05rem, `py` generos (≥44px), separatoare hairline oak, active state
  oak-warm + bold (pattern-ul existent).
- Language toggle: rând dedicat „RO | EN" (Caudex label-caps), target 44px.
- CTA „Cumpără"/„Shop": buton plin oak-warm full-width, la baza listei.
- Sign-out: sub CTA, discret (pattern-ul existent).

### D4 — Comportament & accesibilitate
- **Scroll-lock** pe body cât e deschis + **Esc** închide + **click-outside** închide
  (exact pattern-ul CartDrawer `useEffect`).
- Se închide la navigare (click pe link) și la schimbarea limbii.
- `aria-expanded` pe hamburger, `aria-label` localizat, `aria-hidden` pe panel închis.
- **Z-index disciplinat:** navbar `z-50` < menu drawer backdrop `55` / panel `56` <
  cart drawer backdrop `60` / panel `61`. Cart drawer câștigă întotdeauna (poți deschide
  coșul peste orice; meniul stă sub el).
- Reduced-motion: fără transition pe transform/opacity, starea funcțională identică
  (lecția 2026-05-28: RM suprimă animații, NU state).

### D5 — Bara mobilă: logo redus
Logo image `w-16` (în loc de 100px) + wordmark `1.6rem` + tagline ascuns pe mobil
(<768) — bara respiră, elementele nu se mai calcă. La scroll rămâne comportamentul
compact existent.

## Ce NU se schimbă
Desktop ≥1024 păstrează exact layout-ul actual (links + underline hover + CTA).
CartDrawer, CartIcon, darkHero logic — neatinse. Anchor-scroll logic homepage — păstrat.

## Verificare
design-qa pe Navbar: toate 4 viewport-urile × stări (deschis/închis, scrolled,
authed, badge 0/1/99, darkHero /atelier) → PASS. Apoi typecheck+lint+i18n+build,
hydration 0 pe prod, regen baselines afectate (mobile+tablet toate paginile).
