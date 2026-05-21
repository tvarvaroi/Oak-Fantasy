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

## 2026-05-23 — Playwright Chromium-only (vs all browsers)

**Context:** Visual regression + E2E pe Oak Fantasy.
**Decizie:** Doar Chromium pentru Playwright. NU Firefox, NU WebKit. Override `browserName: 'chromium'` la projects care moștenesc `devices['iPhone 13']` și `devices['iPad Mini']` (default WebKit).
**Motiv:** Audiență production 70%+ Chromium-based (Chrome, Edge, Opera). Fiecare engine în plus = +200MB install + 2x runtime. Firefox/Safari au quirks separate de rendering — visual regression pe Chromium prinde cazul dominant. La nevoie viitoare, adăug pe CI un job separat Firefox.
**Alternative respinse:** Cele 3 engines (overkill marketing site), doar WebKit (audiență prea mică).

## 2026-05-23 — Lighthouse OUT din `npm run verify`

**Context:** `verify` rulează pe fiecare commit. Trebuie să dea feedback rapid.
**Decizie:** Lighthouse NU în `verify`. Scripts separate `npm run lighthouse` (desktop) și `npm run lighthouse:mobile` pentru audit periodic.
**Motiv:** Lighthouse rulează 1-2 min per URL × 4 URLs = 4-8 min. Combinat cu E2E (3 min), `verify` ar deveni 7-11 min. Cadența potrivită Lighthouse = săptămânal / înainte de deploy major, NU per-commit. Per-commit gate trebuie să rămână în zona <5min.
**Alternative respinse:** Lighthouse în verify (sparge budget timp), Lighthouse pe doar 1 URL în verify (incomplet, fals de optimist).

## 2026-05-23 — i18n checker custom (Node stdlib, vs i18next-checker / lingui-extract)

**Context:** Verificare automată că shared components nu au `stejar` pe EN, nu au cedilla, nu lipsesc chei.
**Decizie:** Script custom `scripts/check-i18n.mjs`, zero dependencies, 169 linii. Balanced-brace parser pentru `Record<Locale, ...>` extraction, regex pentru cedilla + RO chars în EN block + key parity.
**Motiv:** Tool-urile externe (i18next-parser, lingui-extract) așteaptă message catalogs framework-specific (.po, .json). Noi folosim `Record<Locale, ContentInterface>` în TS — zero match cu tool-uri externe. ~150 linii de Node stdlib (`fs.promises`, `path`) face exact ce avem nevoie + reguli specifice (cedilla, scan JSX hardcoded). Zero overhead.
**Alternative respinse:** `i18next-parser` (cataloage neutiluzate), `lingui-extract` (overhead framework), AST-parsing complet TS via `typescript` package (overkill — heuristic regex e suficient).

## 2026-05-23 — Visual regression `maxDiffPixelRatio: 0.02` + screenshots commit-uite

**Context:** Stabilitate cross-system pentru `toHaveScreenshot`.
**Decizie:** `maxDiffPixelRatio: 0.02` (2% tolerance) + `snapshotPathTemplate` fără `{platform}` (baselines portabile cross-OS) + commit screenshots în `tests/e2e/__screenshots__/`.
**Motiv:** Cross-system rendering diff = ~0.5-1% (font subpixel anti-aliasing, color profile). 2% acoperă drift normal, fail pe schimbări reale (typo / color = 5%+). Commit screenshots = ground truth comună; fără commit, fiecare dev are baselines proprii (useless).
**Alternative respinse:** 0% threshold (false positives constanti), 5% (ascunde regresii reale), screenshots per-dev (rupe colaborarea).

## 2026-05-27 — /atelier = mini-documentar long-form (vs short tease)

**Context:** După /despre (1 pagină) trebuia decis profundimea /atelier — short tease sau full documentary?
**Decizie:** **Long-form mini-documentar** (Variant C — Tool-Forward Catalog). 8 secțiuni: Hero dark + Tools centerpiece (6 cards 12-col asimetric) + Place + Day + Pull-quote + Process summary + Conditions + Seasonality + Articles + CTA.
**Motiv:** Founder spec explicit: "Mai lungă decât /despre — un articol pentru cititorul care vrea să înțeleagă locul, uneltele, ritmul zilei, condițiile, sezonul." E pagina de "vino să vezi atelierul" pentru cititori curioși de proces, nu pagină de conversie. Catalog format pune uneltele în prim-plan, ceea ce e identitatea brandului (artisan + tool-craft).
**Alternative respinse:** Variant A (Editorial Long-Form — capitole romane + drop caps) — prea premium fără fotografie reală încă. Variant B (Timeline Documentary) — bun dar focus pe timp/zi, mai puțin pe unelte.

## 2026-05-27 — /despre process refactor = medium-compact (Option C)

**Context:** v3-catalog spunea "detalii pe /despre" DAR founder Task 2 cerea /despre process compact. Contradicție.
**Decizie:** **Compromise C** — /despre process devine **medium-compact**: păstrez 2-3 propoziții esențiale per pas (în câmp nou `bodyCompact`), elimin doar greutate vizuală (placeholder images + alternating layout). Layout nou = vertical centered cards max 760px. /atelier rămâne very-short (1 propoziție per pas) cu cross-ref `Detalii complete pe pagina Despre`.
**Motiv:** Option A (ambele compact) ar șterge tot info-ul process din site până la blog launch — risc real de a pierde keyword-uri SEO. Option B (păstrare detailed /despre) — defy founder Task 2 direct. C reconciliază: cititorul de pe /atelier are cross-ref onest pentru detalii, cititorul de pe /despre are info esențial fără greutate vizuală.
**Alternative respinse:** A (lose content), B (defy founder).
**Implementare:** câmp `bodyCompact` adăugat per step în content.ts; câmpul `body` original păstrat for future restoration.

## 2026-05-27 — Slug EN /atelier = "workshop"

**Context:** EN URL pentru /atelier. Opțiuni: passthrough ("/en/atelier") sau localized ("/en/workshop").
**Decizie:** **`/en/workshop`** — slug EN diferit, gestionat via PATHNAMES + middleware (același pattern ca /despre↔/about).
**Motiv:** SEO friendly URLs per locale. "Workshop" e termenul natural EN; "atelier" e franco-italian acceptat în EN dar mai puțin universal. Plus consistency cu /despre↔/about precedent.
**Alternative respinse:** Passthrough (/en/atelier) — rupe simetria cu /about.

## 2026-05-27 — Variant-switch pill din handoff ignorat

**Context:** Bundle handoff avea `<nav class="atelier-switch">` fixed bottom cu butoane A/B/C pentru switching între variante.
**Decizie:** **Ignorat complet** — variant switcher e tool intern Claude Design pentru review, NU element pentru utilizatorul final.
**Motiv:** Clutter pentru cititor; nu există variante A/B/C în production, doar varianta aprobată (C).
**Alternative respinse:** Implementare ca "preview" — nu are sens.

## 2026-05-27 — Drop Navbar anchor `#atelier`, add route link `/atelier`

**Context:** Navbar avea anchor "Atelier" → `#atelier` (homepage WorkshopSection). Adăugarea rutei `/atelier` creează 2 link-uri cu același label.
**Decizie:** **D1** — drop anchor din Navbar. Singular "Atelier" în nav = ruta `/ro/atelier`. WorkshopSection rămâne pe homepage ca conținut (scroll natural), nu ca destination navigare.
**Motiv:** Zero ambiguity vizuală în nav. Ruta dedicate are detalii complete; section homepage e doar tease scroll natural pentru users care nu fac click pe nav.
**Alternative respinse:** D2 (păstrare ambele cu redenumiri) — clutter + confuzie.

## 2026-05-27 — Tool images = placeholder stripat (NU real photos, NU AI gen)

**Context:** 6 tool cards din /atelier — care e tratamentul vizual pentru imagine?
**Decizie:** **Striped placeholder** cu caption monospace (același pattern ca /despre's PlaceholderImage). NU real photos, NU AI gen.
**Motiv:** Real photos vin la sesiune foto produs viitoare (deja decizie Faza A — workshop.webp era mislabeled, nu utilizabil). AI gen ar fi nesigur pentru brand identity și nu se aliniază cu valorea "manual" / "lucrat". Placeholder onest = "vine fotografie reală" e mai bun decât AI sintetic.
**Alternative respinse:** AI generation, real photos premature.

## 2026-05-27 — Visual regression workers=1 (split test:e2e)

**Context:** `playwright.config.ts` `workers: 3` (decizie Faza C pentru rapid verify). La regenerarea baselines pentru /atelier + /despre + /home, 6 tests fail consistently — chromium-mobile/tablet/desktop simultane cu fullPage screenshots → instabilitate. Individual rulează stabil, paralel nu.
**Decizie:** **Split test scripts** — `test:e2e` (non-visual, workers paralel) + `test:e2e:visual` (only visual regression, `--workers=1` sequential). `verify` rulează ambele chained.
**Motiv:** Workers=1 GLOBAL ar regresa Faza C performance (3.3min → 5.8min). Split preserves fast non-visual + reliable visual. Trade-off acceptabil: total verify 3.3min → 4min, dar 100% deterministic.
**Alternative respinse:** `workers: 1` global (prea slow), `test.describe.configure({ mode: 'serial' })` (doesn't fix cross-project parallelism), skip visual din verify (pierde gate).

## 2026-05-21 — Workshop H2 EN păstrată cu virgulă (NU em-dash)

**Context:** Workshop banner EN H2 = `Sawdust on the floor, oil on our fingers.` Discuție dacă virgula trebuie schimbată în em-dash.
**Decizie:** Păstrare CU VIRGULĂ. NU em-dash.
**Motiv:** Founder a decis în chat-ul strategic. Virgula respiră natural în structura paralelă (sawdust on X, oil on Y); em-dash ar fi accentuat ruptura. Voice editorial Apartamento-style, nu corporate punctuație.
**Alternative respinse:** Em-dash (`Sawdust on the floor — oil on our fingers.`), punct intermediar (rupe ritmul).
