# Oak Fantasy — Session Learning Log

> Cross-session knowledge persistence. Append la finalul fiecărei sesiuni.
> Format per entry: `## YYYY-MM-DD — topic` + Pattern / Aplicat la / De ce contează.

---

## 2026-05-16 — Bootstrap

**Pattern descoperit:** Proiectul folosește Second Brain pattern (Zettelkasten + Obsidian) adaptat din proiectul `gym-gurus`. Cunoașterea persistă în `_brain/` + `MEMORY.md`, nu se reface la fiecare sesiune.
**Aplicat la:** `_brain/` system (maps/notes/resources/inbox) + `MEMORY.md` + pre-task ritual obligatoriu din `CLAUDE.md`.
**De ce contează:** Cross-session knowledge persistence — citește `MEMORY.md` + `_brain/notes/gotchas.md` la fiecare început de task. Evită repetarea aceleiași greșeli.

**Pattern descoperit:** Infra de skills era deja instalată în sesiunea de setup (nu re-clona `gym-gurus`, nu rula `install-claude-skills.ps1`). Global `~/.claude/skills/` = 30 packs; `.agents/skills/` = 7 skills; `skills-lock.json` = 6 entries; `ui-ux-pro-max` hidratat real v2.5.0.
**Aplicat la:** PASUL ZERO din kickoff — verificare, nu reinstalare.
**De ce contează:** La sesiuni viitoare, verifică întâi cu `ls`, nu reinstala orbește.

**Gotcha bootstrap:** Folderul `Oak-Fantasy` nu provine dintr-un `git clone` clasic — a fost `git init` + fetch + `git checkout -B main origin/main`. Funcțional urmărește `origin/main`. Infra de skills (`.agents/`, `.claude/`, `skills/`, `SKILLS.md`, `skills-lock.json`) e **untracked** intenționat — commit-urile le face fondatorul manual (regula #1).

**Iron Law — eșec de mediu, NU de cod:** `npm run build` → `✓ Compiled successfully` (TypeScript/lint OK) dar prerender `/ro` + `/en` pică: `Error: supabaseUrl is required`. Cauză: `.env.local` lipsește în checkout-ul ăsta + `lib/supabase.ts` instanțiază clientul la import cu `!`. Bootstrap-ul NU a atins cod (doar `.md` + `.agents/skills/`). Detalii + fix în [[_brain/notes/gotchas]]. De reținut: pentru build/dev local e nevoie de `.env.local` cu cheile Supabase reale.

**REZOLVAT (2026-05-16):** fondatorul a furnizat cheile → `.env.local` creat (gitignored, confirmat cu `git check-ignore`). `npm run build` → **exit 0, zero erori, zero warnings**, `/ro`+`/en` prerendered SSG. Iron Law validat. `.env.local` NU se comite niciodată (e în `.gitignore` linia 29 `.env*.local`).

---

## 2026-05-21 — Faza B: shared components i18n cleanup

**Pattern descoperit:** Bolt landing-ul a lăsat două antipattern-uri i18n pe shared components: (a) string-uri hardcodate inline în JSX care nu trec prin obiectul `nav = { ro:{}, en:{} }[language]` (ex Footer linia 224 `stejar · manual · România`); (b) interface-uri "half-localized" cu sufixe paralele (`labelRo`/`labelEn`/`captionRo`/`captionEn`) care obligă componentele să facă `language === 'ro' ? stat.labelRo : stat.labelEn` la fiecare câmp. NumbersStrip a fost exemplul tipic.

**Aplicat la:** Navbar (1 string `stejar · manual` → ternar), Footer (cheie nouă `microTagline` în nav obj + logo swap SVG→real brand jpeg la 100px cu `borderRadius: '50%'` pentru a masca marginile albe ale jpeg-ului), NumbersStrip (refactor complet — extras în `components/numbers-strip-content.ts` cu `Record<Locale, NumbersStripContent>`, sufix `+ ani`/`+ years` localizat, `numberLocale` per locale pentru `toLocaleString` corect, ariaLabel extrasă din inline).

**De ce contează:** (1) Pattern reutilizabil pentru orice altă componentă shared cu i18n incomplet — verifică Hero, StoryStrip, WorkshopSection, ProductTease, CraftVideoTease, WaitlistSection, FloatingCTA, EmailForm la următoarea ocazie. (2) Verificare false-positive: founder credea că 4 string-uri Footer sunt hardcodate; doar 1 era (restul erau deja în obj `[language]` selector). Mereu verifică sursa înainte de "fix everywhere" — `git diff` minimal e mai bun decât refactor global. (3) Diacritice cedilla turcească (ş/ţ) vs virgulă românească standard (ș/ț) — Unicode codepoints diferite, vizual ~identice. Bolt a folosit cedilla în NumbersStrip (`aşteaptă`, `Experienţă`, `meşteşug`). Per CLAUDE.md §6 = fix obligatoriu. Voi face scan global la următorul refactor de componente shared.

---

## 2026-05-23 — Faza C: Automation infrastructure (Playwright + Lighthouse + i18n checker + verify)

**Pattern descoperit:** Fără gate automat, fiecare task se termina cu un checklist manual de 20+ puncte pe localhost. Asta a dus la regresii ascunse (e.g. cedilla legacy în `CraftVideoTease.tsx` line 161 prezent în cod de săptămâni — detectat instant de `check:i18n` la prima rulare). Single command `npm run verify` la finalul fiecărui task elimină pasul "uită să verifici X". Layered gate (typecheck → lint → i18n → e2e) fail-fast — feedback rapid pe erorile cele mai cheap înainte de teste E2E lente.

**Aplicat la:** `tests/e2e/` (5 spec files + fixtures + 12 PNG baselines), `scripts/check-i18n.mjs` (zero-deps Node, 169 linii), `playwright.config.ts` (chromium-only, 3 projects mobile/tablet/desktop, `workers: 3` paralel pe projects), `lighthouserc.{desktop,mobile}.json` (thresholds 80/95/95/90), `docs/verification.md`. Package.json scripts: `verify`, `test:e2e`, `test:e2e:headed`, `test:e2e:update`, `check:i18n`, `lighthouse`, `lighthouse:mobile`.

**De ce contează:** (1) **Productivity multiplier**: înainte = 20min checklist manual, acum = 3min single command. Per task viitor (`/atelier`, `/ingrijire`, `/contact`, `/tocatoare`, `/blog`), economisesc minim 15min per pagină în verificare. (2) **Discovery bonus**: i18n checker a găsit pre-existing cedilla bug în CraftVideoTease.tsx într-o singură rulare — manual găsire ar fi durat ore. Sistemul are valoare imediată, nu doar long-term. (3) **Architecture decision precedent**: chromium-only Playwright + 3 projects paralel + workers=3 + screenshots committed = pattern documentat în `_brain/notes/decisions.md` (4 decizii noi). (4) **Risk known**: `<90s` aspirational target ratat (real ~3min); root cause = 114 tests × 3 viewports × visual regression overhead inerent. Alternative care ar reduce timp = elimina visual regression din verify default. Decizie: păstrez visual regression în verify (gate complet), accept 3min.
