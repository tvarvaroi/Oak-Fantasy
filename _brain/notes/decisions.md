# Architectural Decisions

> Decizii arhitecturale + motivul lor. Nu re-litigăm ce e aici fără motiv nou.
> Format: `## YYYY-MM-DD — decizie` + Context / Decizie / Motiv / Alternative respinse.

---

## 2026-05-16 — i18n custom prin middleware, nu next-intl

**Context:** Proiectul are nevoie de RO (default) + EN.
**Decizie:** Routing pe locale via `middleware.ts` + `app/[locale]/` + `generateStaticParams`. Limba se pasează ca prop `language: 'ro' | 'en'` în jos prin componente.
**Motiv:** Setup minim, zero dependențe noi, SSG-friendly. Moștenit din build-ul existent.
**Alternative respinse:** `next-intl` (overhead pentru un site mic cu texte inline).

## 2026-05-16 — Paletă brand prin CSS variables + Tailwind tokens

**Context:** Design system imutabil, consistență obligatorie pe tot site-ul.
**Decizie:** Culorile sunt CSS vars în `app/globals.css` (`--oak-warm` etc.) ȘI tokens Tailwind în `tailwind.config.ts`. Niciodată hex hardcodat în componente.
**Motiv:** O singură sursă de adevăr; orice pagină nouă rămâne consistentă cu landing-ul.
**Alternative respinse:** Hex direct în componente (duce la drift de brand).

## 2026-05-21 — Navbar tagline EN: "oak · handmade"

**Context:** Navbar avea `stejar · manual` hardcodat fără localizare (linia 159).
**Decizie:** EN devine `oak · handmade`. Stocare prin ternar inline `language === 'ro' ? 'stejar · manual' : 'oak · handmade'` — pattern consistent cu `Pre-comandă/Pre-order` din același fișier.
**Motiv:** Preservează ritm vizual "1 word · 1 word" (alternativele "oak · by hand" / "oak · craft" rupeau simetria sau pierdeau semnificația "manual"). "Handmade" = traducere directă brand glossary CLAUDE.md §6.
**Alternative respinse:** "oak · by hand" (asimetric), "oak · craft" (prea abstract), content map separat (overkill pentru 1 string).

## 2026-05-21 — Footer logo: brand jpeg real la 100px cu border-radius

**Context:** Footer afișa `/3D_Cutting_Board_Model_Design.svg` la 52×52 cu filter copper agresiv (decorativ, nu logo real). Brand-ul avea logo real `WhatsApp_Image_2026-05-14_at_20.59.06.jpeg` în public/ (circular, hand-drawn, paleta forest+copper).
**Decizie:** Înlocuire SVG → jpeg, 100×100 (max range 80-100 propus de founder, pentru brand-forward), `borderRadius: '50%' + overflow: 'hidden'` pe container (mască pentru marginile albe ale jpeg-ului peste `--bark` background dark).
**Motiv:** SVG-ul era render 3D mockup, nu logo brand. Jpeg-ul e logo-ul real cu identitate completă (tocător + frunze stejar + cuțit/satâr + ghindă). Layout vertical (logo sus → "Oak Fantasy" → microTagline) păstrat — doar size+source schimbate.
**Alternative respinse:** Păstrare SVG (pierdea brand identity), filtru copper pe jpeg (ar fi distors culorile fidele ale logo-ului).

## 2026-05-21 — Footer microTagline localizat ca cheie i18n

**Context:** Footer avea `stejar · manual · România` hardcodat la linia 224, în afara obj `nav = { ro:{}, en:{} }[language]`.
**Decizie:** Adăugat cheie `microTagline` în ambele obj (ro/en). EN = `oak · handmade · Romania` — consistent cu Navbar tagline (`oak · handmade`).
**Motiv:** Footer avea deja arhitectură i18n corectă (selector `[language]`), doar 1 string scăpase prin gardă. Fix minimal — adăugare cheie, înlocuire JSX. Zero refactor.
**Alternative respinse:** Ternar inline (rupea pattern-ul Footer existent — toate string-urile trec prin `nav.X`), content map separat (overkill pentru 1 string).

## 2026-05-21 — NumbersStrip refactor complet (vs quick fix pentru "20+ ani")

**Context:** Suffix `'+ ani'` hardcodat pe RO apărea și pe EN ca "20+ ani" — bug raportat. Componentă avea pattern half-localized (4 câmpuri `labelRo`/`labelEn`/`captionRo`/`captionEn` per Stat).
**Decizie:** Refactor COMPLET — extras `components/numbers-strip-content.ts` cu `Record<Locale, NumbersStripContent>`, sufix localizat per-Stat, `numberLocale` separat pentru `toLocaleString` (RO: `1.200`, EN: `1,200`), `ariaLabel` extrasă din ternar inline. Quick fix RESPINS.
**Motiv:** Quick fix pe suffix doar n-ar fi rezolvat datoria tehnică — la următoarea ediție de cifre, ai re-întâlni același bug. Pattern `Record<Locale, ...>` e deja folosit pe `/despre content.ts`; standardizare cross-componentă. Reusable pentru următoarele componente shared cu pattern similar (Hero, StoryStrip, etc.)
**Alternative respinse:** Quick fix sufix-only (datorie tehnică nerezolvată), `useTranslations` hook custom (overhead pentru un site mic — vezi decizia din 2026-05-16 împotriva next-intl).

## 2026-05-21 — Workshop H2 EN păstrată cu virgulă (NU em-dash)

**Context:** Workshop banner EN H2 = `Sawdust on the floor, oil on our fingers.` Discuție dacă virgula trebuie schimbată în em-dash.
**Decizie:** Păstrare CU VIRGULĂ. NU em-dash.
**Motiv:** Founder a decis în chat-ul strategic. Virgula respiră natural în structura paralelă (sawdust on X, oil on Y); em-dash ar fi accentuat ruptura. Voice editorial Apartamento-style, nu corporate punctuație.
**Alternative respinse:** Em-dash (`Sawdust on the floor — oil on our fingers.`), punct intermediar (rupe ritmul).
