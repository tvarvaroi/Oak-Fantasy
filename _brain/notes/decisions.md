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

## 2026-05-23 — Etapa 2.1 D1: Supabase SQL migrations (NU Drizzle ORM)

**Context:** Tooling pentru schema management.
**Decizie:** Versioned raw SQL migrations în `supabase/migrations/` aplicate cu `npx supabase db push`. NU Drizzle.
**Motiv:** Existing waitlist e raw SQL (consistency). RLS policies + PL/pgSQL functions (atomic locks, sequences) sunt SQL-native; Drizzle nu le gestionează — ai scrie raw SQL oricum pentru ele. Zero new heavy dep / peer-deps risk (R3F deja fragilă). Type-safety prin `supabase gen types`. `.claude/rules/backend.md` rescris să reflecte stack-ul real (în loc de regula generic "Drizzle only" care contrazicea proiectul).
**Alternative respinse:** Drizzle (overhead, still needs raw SQL for RLS/functions).

## 2026-05-23 — Etapa 2.1 D2: enums = text + CHECK (NU native ENUM)

**Context:** Reprezentare enums (role, status, payment_method, etc.).
**Decizie:** `text NOT NULL CHECK (col IN ('a','b',...))` peste tot.
**Motiv:** Consistent cu waitlist existent. Native Postgres ENUM e dureros de evoluat (adăugare valori OK, dar remove cere table rewrite). text+CHECK = adaugi/scoți valori via simplu `DROP CONSTRAINT + ADD CONSTRAINT`.
**Alternative respinse:** Native ENUM (rigid).

## 2026-05-23 — Etapa 2.1 D3: waitlist → email_subscribers (rename direct, NU VIEW shim)

**Context:** Tabela `waitlist` trebuie extinsă pentru per-product interest + unsubscribe. Risc de rename?
**Decizie:** `ALTER TABLE waitlist RENAME TO email_subscribers` + extend coloane + broaden source CHECK. Plus `lib/supabase.ts` `.from('waitlist')` → `.from('email_subscribers')` AMÂNAT până migrarea aplicată pe prod.
**Motiv:** Audit pe `.ts/.tsx`: 33 potriviri brute, dar doar **1** e referință la tabela DB (`.from('waitlist')`); restul = anchor `#waitlist`, componenta `WaitlistSection`, valoarea coloanei `source`, nume funcție/tip. 1 referință → rename direct = curat. VIEW shim ar fi over-engineering. Code change PAIRED cu migration A9 → forțat să fie aplicat secvențial (DB migrate prod → code swap → deploy).
**Alternative respinse:** New table + COPY data (date duplicate, complicat), VIEW shim (overkill pentru 1 referință).

## 2026-05-23 — Etapa 2.1 D4: slug EN /tocatoare = "cutting-boards"

**Context:** EN URL pentru catalog. Opțiuni: `/en/boards` vs `/en/cutting-boards`.
**Decizie:** **`/en/cutting-boards`** — exact-match keyword SEO.
**Motiv:** "Cutting board" = volum mare căutare; "boards" = ambiguu (surfboards, message boards, forums). Slug ușor mai lung dar descriptiv > ambiguu. Nav label EN = "Cutting Boards".
**Alternative respinse:** `/en/boards` (ambiguu pentru SEO).

## 2026-05-23 — Etapa 2.1 D5: Navbar /tocatoare = ruta, NU anchor mort

**Context:** Navbar avea anchor `#tocatoare` (poziția 4) → dead link (nu există `id="tocatoare"` nicăieri — doar `id="waitlist"`).
**Decizie:** Înlocuit cu route link `/tocatoare` (Task 2.1.5, când se construiește pagina). Aplicat la PAS 8 = adăugare `tocatoare` în PATHNAMES (middleware-ul rămâne neschimbat — route-key generic).
**Motiv:** D1-consistent cu /atelier (drop anchor mort). Nu pierdem funcționalitate (era deja dead link). Symmetry între /despre, /atelier, /tocatoare = toate route-uri în nav.
**Alternative respinse:** Păstrare anchor (continuă să nu funcționeze).

## 2026-05-23 — Etapa 2.1 D6: /tocatoare = ISR `revalidate=60` (NU SSG, NU force-dynamic)

**Context:** Render pattern pentru catalog (Task 2.1.5).
**Decizie:** `export const revalidate = 60` în Server Component + graceful empty-state on fetch error.
**Motiv:** Build nu pică pe Supabase down (gotcha "supabaseUrl is required" + `fetchActiveProducts` returnează `[]` pe orice eșec). Activarea de produse din Studio se reflectă în ~60s fără redeploy. Dev mode override SSR pentru testing stabilitate screenshots.
**Alternative respinse:** SSG (activarea ar cere redeploy), force-dynamic (overhead inutil pentru date care se schimbă rar).

## 2026-05-23 — Etapa 2.1 D7: Helper functions split (DB vs TS)

**Context:** `generate_order_number`, `reserve_stock`, `release_stock`, `fulfill_stock`, `calculateOrderTotal`.
**Decizie:** **Stock + order-number = DB** (PL/pgSQL, `FOR UPDATE` locks, audit row in same transaction, SECURITY DEFINER). **Total calc = TS** (`lib/db/order-math.ts`, pure, unit-testable).
**Motiv:** Stocul cere atomicitate + lock + audit într-o tranzacție; TS-only ar fi race-condition prone. Total = aritmetică pură care merită teste unitare ușoare. SECURITY DEFINER pentru DB functions permite apel din server actions fără să fie blocat de RLS pe insertul în audit.
**Alternative respinse:** Tot DB (overhead pentru aritmetică simplă), tot TS (race conditions pe stoc).

## 2026-05-23 — Etapa 2.1 D8: Staging-first pentru DB application

**Context:** Risk pe prod live waitlist data (collecting emails).
**Decizie:** Proiect separat Supabase staging (`juuozsjvuikdtjqhdylw`); aplici migrări + seed + activare acolo, verifică, apoi replay același SQL pe prod.
**Motiv:** Win10 Home + Docker local = friction excesivă. Staging cloud = zero Docker, sandbox safe. Replay deterministic pe prod cu același SQL = încredere. NU rulăm `db push` direct pe prod până nu confirmăm staging clean. `.env.staging.local` (gitignored prin pattern `.env*.local`) ține cheile separate de `.env.local` (prod).
**Alternative respinse:** Local Docker (Win10 Home friction), direct pe prod (risc waitlist data + zero rehearsal).

## 2026-05-23 — Etapa 2.1 extra: Server/client client SPLIT

**Context:** Plan inițial spunea `lib/supabase.ts: createServerClient`. Realitate: fișierul e importat de `EmailForm.tsx` (`'use client'`) — `createServerClient` din `@supabase/ssr` folosește `next/headers` care e server-only.
**Decizie:** Fișier NOU `lib/supabase-server.ts` cu `getServerSupabase()` (cookie-bound) + `getServiceSupabase()` (service-role, bypasses RLS). `lib/supabase.ts` rămâne neschimbat (browser anon pentru `EmailForm`).
**Motiv:** Importul `next/headers` într-un fișier ulterior pulled de Client Component = build fail clar. Split = enforce server-only via import constraints. Pattern reutilizabil pentru toate fișierele DB viitoare.
**Alternative respinse:** Rewrite `lib/supabase.ts` complet (spargem `EmailForm`).

## 2026-05-23 — Task 2.1.5 D1: Implement v1-editorial faithful, NU hybrid

**Context:** Claude Design oferea 3 variante (A Editorial / B Shop / C Tier-Sectioned). Fondatorul a ales A. Chat-ul de design recomanda hybrid C+A (tier sections + paper cards).
**Decizie:** Implementare A exact ca în `tocatoare/v1-editorial.html` — single 3-col grid, paper-aged cards, Caveat tier chips, sticky filter pills, sort dropdown, dual CTA. **NU hybrid**, NU "îmbunătățiri".
**Motiv:** Varianta A a fost aleasă explicit de fondator. Adaptările "îmbunătățiri" diluează intenția design-erului și creează drift față de iterația din chat. Faithful = predictible + reversibil dacă fondatorul vrea alt aspect ulterior.
**Alternative respinse:** C+A hybrid (over-engineering pentru un MVP catalog).

## 2026-05-23 — Task 2.1.5 D2: Dual CTA → `/[locale]?interested_product=slug#waitlist`

**Context:** Design are dual CTA pe card („Vezi detalii" link + quick-add cart icon button). Cart-ul vine la Etapa 3 (Stripe). Product detail page nu există încă.
**Decizie:** Ambele CTA rutează la `/{locale}?interested_product=${slug}#waitlist`. Visual distinction păstrat (text link + cart icon round button), behavioral identic.
**Motiv:** Vizual păstrăm intent-ul design-erului (catalog cu „cumpără / explorează"). Behavioral, până la Etapa 3, cea mai utilă acțiune e captura email cu interes per-produs; query param `interested_product` e parked acum, citit la Etapa 2.6 pentru `email_subscribers.interested_product_ids[]`.
**Alternative respinse:** Single CTA (sparge design-ul), cart funcțional acum (out-of-scope), product detail placeholder 404/coming-soon (worse UX).

## 2026-05-23 — Task 2.1.5 D3: Hero-note paper-aged solid, NU glassy

**Context:** HANDOFF.md descrie glassy caption pattern (backdrop-blur + cream-warm-translucent + copper hairlines). Inițial l-am aplicat pe `.hero-note` din /tocatoare.
**Decizie:** Revert la `paper-aged` solid + copper 1px border — exact ca în `tocatoare/v1-editorial.html`.
**Motiv:** Re-citire atentă: glassy pattern e folosit pe homepage + /despre subhead (text mic peste treeline). Pe /tocatoare hero-note e un block separat în col 2 — design-erul a ales solid paper, NU glass. Per-page intent matters.
**Alternative respinse:** Glass pe orice text peste treeline (uniformizare greșită — design diferențiază).

## 2026-05-23 — Task 2.1.5 D4: Vecteezy attribution în Footer GLOBAL

**Context:** `public/treeline.webp` (convertit din Vecteezy free PNG) — license cere atribuire vizibilă clickable.
**Decizie:** Adăugat în `components/Footer.tsx` (apare pe TOATE paginile). Link `https://www.vecteezy.com/free-png/tree` + text "Tree PNGs by Vecteezy", styled mic sub copyright.
**Motiv:** Footer global = pattern legal corect (atribuire prezentă oriunde se folosește asset-ul). Mic, nu intrusive, nu hidden.
**Alternative respinse:** Atribuire doar pe paginile cu treeline (ergonomic worse, same legal status), remove asset (pierdem identitatea aprobată).

## 2026-05-23 — Task 2.1.5 D5: Visual baselines `/tocatoare` DEFER post-activation

**Context:** Produsele sunt `status='draft'` pe staging până fondatorul le activează. Pe prod (.env.local-ul de dev), tabela `products` nu există încă. `fetchActiveProducts()` returnează `[]` în ambele cazuri → empty state.
**Decizie:** NU adaug `/tocatoare` la `visual-regression.spec.ts` PAGES acum. Baselines se generează DUPĂ ce fondatorul: (1) pointuiește `.env.local` la staging, (2) activează cele 10 produse, (3) confirmă render local, (4) eu generez baselines + fondatorul aprobă + commit.
**Motiv:** Baselines pe empty-state acum + regen post-activation = 2 churn-uri de baselines + commits inutile. Defer-ul aliniază momentul baseline generation cu starea reală pe care utilizatorul o va vedea live.
**Alternative respinse:** Baselines pe empty-state acum (regen forțat ulterior), skip visual regression total pe /tocatoare (pierdem gate).

## 2026-05-23 — Task 2.1.5 D6: Regen 18 baselines existente la schimbări Navbar/Footer

**Context:** Adăugarea route link `/tocatoare` în Navbar + Vecteezy attribution în Footer = schimbări shared cross-page; baselines vechi pentru home/despre/atelier × 3 viewports nu mai pot match (legitime, nu regresii).
**Decizie:** Regen automat al celor 18 baselines la commit-ul Task 2.1.5; founder review BEFORE push.
**Motiv:** Schimbările sunt legitime (D5 + atribuire legală obligatorie), NU regresii. Trebuie regen. Protocol: regen → review founder → push (same ca /atelier).
**Alternative respinse:** Skip visual regression pentru commit-ul ăsta (sparge Iron Law), commit baselines cu push fără review (risc baselines greșite în repo, hard de revertit), revert Navbar/Footer (sparge D5 + legal).

## 2026-05-23 — Task 2.1.5 D7: treeline.png 16.7MB → treeline.webp 243KB pre-push

**Context:** PNG-ul Vecteezy original era 5760×1911 / 16.7MB. Folosit ca CSS `background-image` pe `.hero::after` (pseudo-element decorativ), opacity .62, scalat `100% 100%` în box cu `aspect-ratio: 5760/1911`. Pe widest desktop = afișat la ~1920px = **33% din rezoluția nativă** = risipă masivă. Asset-ul a fost committat local, dar **nu a apucat push-ul** când founder-ul a semnalat problema.
**Decizie:** Convertit cu ffmpeg `libwebp` la 1920×638, quality 75, lossy cu alpha → **243KB (98% reducere)**. CSS background swap `.png` → `.webp`. **History rewrite** via `git reset --mixed cb3aab8` + re-commit 6 grupuri atomice cu asset-ul nou — PNG-ul de 16MB NU ajunge niciodată pe branch tips push-uite, deci git push nu transmite blob-ul (reachability-based).
**Motiv:** Git history e permanent — un blob committat și push-uit rămâne în istorie chiar dacă fișierul e șters ulterior. 16MB inflate `git clone` time + CI bandwidth perpetuu. WebP la 243KB e sub orice budget rezonabil (~1% din PNG; tipic LCP impact <100ms pe 4G). Photo backdrop păstrat (pe care fondatorul l-a ales explicit peste SVG/gradient în iterația de design).
**Lecție:** Orice binary asset >500KB trebuie evaluat ÎNAINTE de commit. NU „will optimize later" — git history permanent. ffmpeg `libwebp` e disponibil în mediu (8.0.1) — folosește pentru PNG→WebP. Pentru asset peste 1MB, conversia + size check înainte de `git add`.
**Alternative respinse:** OPȚIUNEA B (gradient/SVG pur) — fondatorul a respins SVG explicit în iterația design după 7+ încercări; pierdem fotorealism agreat. OPȚIUNEA C (SVG hand-drawn) — același motiv. Keep PNG (commit + later compress) — git history permanent. `git filter-repo` / BFG cleanup post-push — mai mult overhead și nu salvează network bandwidth-ul push-ului.

## 2026-05-28 — FIX 1: Navbar `darkHero` prop (adaptive text over dark hero)

**Context:** /atelier hero are `background: var(--bark)` (dark). Navbar e `fixed top-0` cu fundal transparent până scroll>100. La scroll=0 textul ink al Navbar-ului era ilizibil pe dark bark.
**Decizie:** Prop opt-in `darkHero?: boolean` pe Navbar; `AtelierContent` pasează `darkHero={true}`. Derive `onDark = darkHero && !scrolled` → swap text wordmark + nav links + hamburger + language toggle la `--cream-warm` și accent la `--copper`. CTA button neschimbat (self-contained). Mobile menu items neschimbate (au bg cream propriu). Tranziție `color 0.3s ease`, guarded pe `prefersReducedMotion`.
**Motiv:** SSR-safe (zero FOUC), dead-simple (derive, nu state). Extensibil — orice viitoare pagină cu hero dark pasează prop. YAGNI vs IntersectionObserver: cazul mid-page nu există (la scroll>100 Navbar are bg cream propriu → text ink lizibil indiferent ce-i sub).
**Alternative respinse:** IntersectionObserver pe `data-nav-theme="dark"` (complexitate fără caz real, risc FOUC mount-time). Prop-only fără scroll awareness (la scroll>100 textul cream pe bg cream = ilizibil).

## 2026-05-28 — FIX 2 D1: Hero `/atelier` rămâne 1-col la tablet (768)

**Context:** Hero pe `/atelier` are grid 2-col `1fr 1fr` cu collapse la 1024px. La 768 colapsează deja la 1-col. Întrebare: forțăm 2-col la 768?
**Decizie:** Lăsăm 1-col la 768. 2-col la 768 = h1 cu `clamp(2.4rem, 5.2vw, 4.6rem)` + grid 3×3 ar concura într-un spațiu îngust → îmbulzit. 1024px e pragul corect.
**Motiv:** Hero editorial cu typography mare are nevoie de respiraţie orizontală pe tablet. Stack vertical 1-col la 768 = h1 + paragraph respiră, grid 3×3 vine dedesubt clean.
**Alternative respinse:** Forțare 2-col la 768 (overcrowded), grid 3×3 ascuns pe tablet (pierdem ornament editorial).

## 2026-05-28 — FIX 2 D2: Mobile gutter `0 48px` → `0 24px` (universal)

**Context:** Toate `*Wrap` din `atelier.module.css` au `padding: 0 48px`. La 375px viewport, 96px gutter lasă 279px content (74%).
**Decizie:** Media query `@media (max-width: 640px)` reduce universal la `padding-left: 24px; padding-right: 24px` pe `.heroWrap, .toolsWrap, .placeWrap, .dayWrap, .procWrap, .condWrap, .seasonWrap, .articlesWrap`. CtaWrap special 20px (centered text, ceva mai strâns).
**Motiv:** +17% content width pe phone (279px → 327px). Editorial spacing 48px desktop păstrat. Trade-off acceptat: mai puțină respiraţie laterală pe mobile, dar tipografie + carduri mai citibile.
**Alternative respinse:** Păstrare 48px (cramped text pe phone), 0px gutter (text lipit de margine, ilizibil).

## 2026-05-28 — FIX 2 D3: ProcessSummary + Conditions breakpoint 900→640

**Context:** `.procWrap` (heading + 5 steps) și `.condHead + .condGrid` (2 carduri) erau 2-col desktop colapsând la 900px → 1-col. La tablet 768px = 1-col → spaţiu tablet irosit.
**Decizie:** Coboară breakpoint la 640px. Tablet (768) primeşte layout-ul 2-col desktop. Mobile (<640) rămâne 1-col.
**Motiv:** 768px are spaţiu pentru 2-col simetric — design intent original păstrat, doar spreadul pe tablet îmbunătăţit. Conditions = 2 carduri "Temperature + Humidity" pereche logică care apar mai bine side-by-side.
**Alternative respinse:** Păstrare 900px (tablet underutilized), breakpoint 768px (margine prea fină — la 769px viewport-uri rare se sparge).

## 2026-05-28 — FIX 2 D4: Navbar touch targets 44px (WCAG 2.5.5)

**Context:** Hamburger button era `p-1` = 26px height. Mobile menu links erau `py-1 border-b` = 33px. Ambele sub minimul WCAG 2.5.5 de 44×44px touch target.
**Decizie:** Hamburger → `p-3 min-w-[44px] min-h-[44px] flex items-center justify-center`. Mobile menu links → `py-3 border-b min-h-[44px] flex items-center` (ambele branches: route + anchor).
**Motiv:** Brand-wide benefit (afectează toate paginile cu Navbar), zero design impact pe desktop (hamburger e `md:hidden`), baseline cost zero suplimentar (regeneram oricum). WCAG compliance.
**Alternative respinse:** Doar p-3 (depinde de Tailwind default, fragil), 48px (over-sized), defer (refuz — touch UX prost pe deviceuri reale).

## 2026-05-28 — FIX 2 D5: Footer Vecteezy link touch target amânat

**Context:** Link "Tree PNGs by Vecteezy" din footer e 14px height (text mic).
**Decizie:** Amânat. Nu fixed în FIX 2.
**Motiv:** Attribution secundar (legal requirement, nu UX primar). Click-rate aşteptat = aproape zero. Fixing-ul ar fi adăugat min-height 44px care ar fi pus link-ul în propriul rând cu visual prominence ne-justificată.
**Alternative respinse:** Force 44px target (visual noise nemerită pentru attribution).

## 2026-05-29 — `tests/qa-screenshots/` = evidence temporară, ștersă la încheierea Etapei 1

**Context:** Auditele qa-tester pentru FIX 1 (Navbar darkHero) + FIX 2 (responsive atelier + Navbar touch targets) au produs 37 screenshots (1 pierdut la conversie). Convertite PNG→WebP q80 (19MB → 2MB, 89% reducere) și committate în `tests/qa-screenshots/`. Fondatorul vrea acces pentru review FIX 2 acum, dar **nu** intenția păstrării lor permanente în repo.
**Decizie:** Directorul rămâne committat pe durata Etapei 1 (până la finalizarea tuturor paginilor + Etapa 2 setup). La încheierea Etapei 1 (înainte de Etapa 2 commit) — ştergere completă `git rm -r tests/qa-screenshots/`. Reaplicabil pentru audituri viitoare: directorul se recrează la nevoie, committat temporar, șters la final de etapă.
**Motiv:** Screenshots de audit = evidence efemer pentru revizuit decizii vizuale; după revizuire valoarea cade la zero (decizia e codificată în CSS/components + brain notes). Repo-ul nu trebuie să crească cu evidence trecut; 2MB acum, dar dacă păstrăm pattern-ul cumulativ vom avea 100MB+ în 6 luni.
**Reminder:** La închiderea Etapei 1 — verifică `tests/qa-screenshots/` și șterge-l. Adaugă la checklistul de end-of-etapa.
**Alternative respinse:** Permanent retention (repo bloat cumulativ), git LFS (overkill pentru evidence temporară), gitignore + nu commit (founder nu primește acces pentru review pe machine-uri diferite/fresh clone).

## 2026-05-28 — FIX 1: Scroll listener trebuie să ruleze indiferent de `prefersReducedMotion`

**Context:** `Navbar.tsx` avea `useEffect` care register-uia scroll listener doar dacă `!prefersReducedMotion`. Pentru user reduced-motion, `scrolled` rămânea `false` perpetuu → Navbar transparent forever, iar (post-FIX 1) pe /atelier text rămânea cream forever.
**Decizie:** Scroll listener register-uit mereu, fără guard pe `prefersReducedMotion`. Hook-ul `prefersReducedMotion` rămâne folosit doar pentru CSS transitions (`colorTransition`), nu pentru state updates.
**Motiv:** State logic (scrolled true/false) ≠ animation (CSS transition). Reduced motion suprimă DOAR animaţiile, nu starea funcţională. Bug pre-existing care a devenit vizibil cu FIX 1; rezolvarea îmbunătăţeşte UX pentru user-ii reduced-motion pe TOATE paginile.
**Alternative respinse:** Lasă-l ca era (Navbar prost pentru reduced-motion users), elimină `useReducedMotion` total (pierdem transition guard).
