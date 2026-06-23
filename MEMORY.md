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

---

## 2026-05-27 — /atelier page + /despre refactor + Navbar update

**Pattern descoperit:** **Claude Design handoff workflow consistency** — al doilea ciclu cu acelaşi flow (după /despre): bundle inline → strict implementation (no reinterpretation) → routing extension via PATHNAMES → Server Component cu JSON-LD + generateMetadata → reuse Reveal/PlaceholderImage din pagini anterioare. Working pattern, replicable pentru orice nouă pagină. Plus **cross-page narrative** (/despre summary → /atelier detailed, cross-linked bilateral) funcționează editorial fără cannibalization SEO — fiecare pagină are titluri+content distincte.

**Aplicat la:** `components/atelier/` (9 components + content.ts + atelier.module.css), `app/[locale]/atelier/page.tsx` (Server Component cu **3 JSON-LD** scripts inclusiv `ItemList` pentru 6 tools — rich-result candidate Google), `lib/i18n-routes.ts` (extension `atelier↔workshop`), `middleware.ts` (zero changes — route-key generic), `components/about/` (refactor process la medium-compact + cross-link, WorkshopBanner cross-link), `components/Navbar.tsx` (drop anchor `#atelier`, add route link `Atelier`/`Workshop`), `tests/e2e/atelier.spec.ts` (10 tests noi), update `seo.spec.ts` + `visual-regression.spec.ts` + `shared-components.spec.ts` cu /atelier coverage. Total **10 commits**.

**De ce contează:** (1) **Pattern reusable pentru următoarele pagini** (`/ingrijire`, `/contact`, `/blog`, `/tocatoare`): Server Component + content.ts + module CSS + Reveal + cross-link strategy. La fel ca /despre+/atelier, /ingrijire poate suma pe homepage + detalii pe ruta dedicată. (2) **JSON-LD ItemList precedent** — orice listă structurată (unelte, products, articles, FAQs) merită schema markup pentru rich results. Aplicabil imediat la `/tocatoare` (Product ItemList) și `/blog` (Article ItemList). (3) **Visual regression concurrency bug** descoperit: `workers: 3` × dev server cu fullPage screenshots → flaky. Fix: split `test:e2e` non-visual paralel (rapid) + `test:e2e:visual` sequential cu `workers=1` (stabil). Runtime crescut 3.3min → 4min, dar deterministic 100%. Solid trade-off. (4) **HARD GATE pe content removal** validat: founder a cerut preview ASCII mockup înainte de refactor /despre, am livrat, aprobat, executat fără surprize. Pattern de a NU șterge silent content — descrierea precisă a refactor-ului în advance previne regret post-implementation.

---

## 2026-05-23 — Etapa 2.1: Supabase foundation (schema live pe staging, types, server clients)

**Pattern descoperit:** Schema-first via versioned SQL migrations + Supabase CLI workflow (`link` → `db push` → `gen types`). `Database` generic din `types/supabase.ts` feeds type-safe server queries; existing `lib/supabase.ts` (browser anon, used by `EmailForm`) stays **un-generic + on legacy table name** until prod migrates — code-to-DB pairing e enforced prin secvențiere, nu prin code branches. Server/client client split (`lib/supabase-server.ts` cookie-bound + service-role vs `lib/supabase.ts` anon) previne `next/headers` să leak în Client Components. Static review ÎNAINTE de apply a prins bug-ul `guard_profile_role` first-admin-lockout (`auth.uid() IS NULL` în SQL editor) — `psql --check` indisponibil offline, dar manual review riguros e equivalent. `supabase login` cere TTY → fondatorul rulează login + link în terminal propriu, sesiunea din `~/.supabase/` e moștenită de bash-ul agentic pentru `db push` + `gen types`.

**Aplicat la:** `supabase/migrations/*.sql` (12 noi + waitlist original; aplicate clean pe staging `juuozsjvuikdtjqhdylw`), `supabase/seeds/01_products.sql` (10 SKU draft), `types/supabase.ts` (generated, 20KB, 9 tabele), `lib/supabase-server.ts` (NEW — `getServerSupabase` + `getServiceSupabase`), `lib/db/products.ts` (NEW — `fetchActiveProducts` cu graceful empty-state), `lib/db/order-math.ts` (TS pure), `lib/i18n-routes.ts` (+ `tocatoare↔cutting-boards`), `.env.example` (+ `SUPABASE_SERVICE_ROLE_KEY`), `.env.staging.local` (gitignored), runbook `docs/etapa-2-1-supabase-setup.md`.

**De ce contează:** (1) **Schema = fundație pentru Etapa 2 (auth+admin) + Etapa 3 (Stripe+orders)** — toate cele 9 tabele + RLS + audit + helper functions sunt aici; refactor ulterior expensive. Money în integer bani, soft-delete via status enum, snapshot adrese în jsonb pentru immutability comenzi. (2) **Staging-first protocol** elimină risc pe prod live waitlist data; replay deterministic pe prod cu același SQL. (3) **Server/client split = pattern reutilizabil** pentru toate fetch-urile DB viitoare (auth Etapa 2.2, orders Etapa 3). (4) **Bug prins la review static înainte de apply** = pattern de aplicat înainte de orice `db push` viitor — citește migrațiile end-to-end ca un revizor exterior; căutare de chicken-egg-uri (rol/sesiune/identitate). (5) **`lib/supabase.ts` swap amânat** = pattern pentru orice cod-DB pairing strâns: schimbarea de cod în repo se face DUPĂ ce DB-ul real a fost migrat, nu înainte; altfel testele E2E pică pe prod nemigrat. Aplicabil la fiecare refactor de tabelă viitor.

---

## 2026-05-23 — Task 2.1.5: /tocatoare catalog (Variant A · Editorial Grid)

**Pattern descoperit:** Claude Design `.tar.gz` handoff bundle workflow: WebFetch are 10MB cap → bundle 46MB → fix cu `curl -o` + gunzip + `tar -xf` într-un temp dir local; apoi citire selectivă (README → chat transcript → primary HTML → shared CSS → HANDOFF.md). Implementare faithful față de v1-editorial.html cu adaptare Next.js (Server Component + ISR + bilingual content map). Pattern reusable din /atelier: `TocatoareContent` client wrapper + `Reveal` + Server `fetchActiveProducts()` cu graceful empty-state. Schimbările pe Navbar+Footer (shared cross-page) **invalidează visual baselines pe TOATE paginile** → regen 18 baselines la fiecare modificare globală. Founder-review pe baselines înainte de push = protocol stabilit.

**Aplicat la:** `components/tocatoare/` (content.ts cu format helpers + tocatoare.module.css + Hero/Catalog/ProductCard/BottomCTA/Content), `app/[locale]/tocatoare/page.tsx` (`generateMetadata` + ISR=60 + JSON-LD BreadcrumbList+ItemList cu nested `Product` `offers`), `public/treeline.webp` (243KB final; vezi (7) și D7 pentru swap-ul pre-push din PNG 16.7MB), `components/Navbar.tsx` (D5: replace anchor mort `#tocatoare` cu route), `components/Footer.tsx` (Vecteezy attribution OBLIGATORIE pentru free PNG license), `tests/e2e/tocatoare.spec.ts` (13 tests cu branched empty-state assertion) + updates pe seo.spec.ts (JSON-LD split AboutPage vs ItemList) + shared-components.spec.ts (Tocatoare Navbar describe block). Regen 18 visual baselines existente (Navbar+Footer schimbări shared).

**De ce contează:** (1) **Catalog citește live din Supabase** — `fetchActiveProducts()` server-side, ISR=60 reflectă activările din Studio fără redeploy; visual baselines DEFER până fondatorul activează cele 10 produse pe staging și aprobă render-ul. (2) **Empty state grațios** = pagina rămâne validă chiar dacă DB e gol / down / migrația prod nu s-a aplicat încă; branched tests pass în ambele stări. (3) **Dual CTA → waitlist param** = catalog read-only Etapa 2.1.5 (fără cart Etapa 3, fără product detail page); `?interested_product=slug` parked acum, citit la Etapa 2.6 pentru `email_subscribers.interested_product_ids[]`. (4) **Vecteezy attribution = legal requirement** — free PNG license cere link credit clickable oriunde se folosește asset-ul; Footer global = locul corect. (5) **Bilingv cu reguli brand cross-language** = filter labels Starters/Essentials/Standouts/Heirloom (evită „premium"/„luxury" inclusiv în EN — voice consistent). (6) **Shared component changes propagate visual** — orice modificare de Navbar/Footer atinge 18 baselines simultan (3 pagini × 3 viewports × 2 locale, minus /atelier nav-on-dark = 18); plan pentru viitor: orice schimbare Navbar/Footer = regen automat + founder review înainte de push. (7) **Post-script asset oversize:** treeline.png initial committat la 16.7MB (5760×1911) — fondatorul a flagat pre-push. Convertit cu ffmpeg libwebp la 1920×638 q75 → **243KB (98% reducere)**, PNG eliminat via `git reset --mixed cb3aab8` + re-commit (blob neambăzător niciodată pe branch tips push-uite). Lecție permanentă: orice binary asset >500KB = evaluează compresie ÎNAINTE de `git add`, NU „later" — git history e permanent.

---

## 2026-05-28 — FIX 1: Navbar `darkHero` adaptive text (over /atelier dark hero)

**Pattern descoperit:** Pentru navbar `fixed top-0` transparent până la scroll, peste hero dark = text ink ilizibil. Soluția elegantă = prop opt-in `darkHero?: boolean` derived `onDark = darkHero && !scrolled`. Page-ul cu hero dark pasează `darkHero={true}`. SSR-safe, zero FOUC, zero observer. Tranziție CSS `color 0.3s ease` (guarded `prefersReducedMotion`). **Bug pre-existing găsit colateral**: scroll listener-ul din Navbar era guarded inutil de `prefersReducedMotion` → reduced-motion users aveau Navbar transparent forever pe TOATE paginile. State updates (scrolled true/false) ≠ animation. Reduced motion suprimă DOAR CSS transitions, nu funcţionalitate.

**Aplicat la:** `components/Navbar.tsx` (interface `NavbarProps.darkHero?: boolean`, derive `onDark`/`navInk`/`navInkSoft`/`navAccent`/`colorTransition`, swap pe wordmark + nav links + language toggle + hamburger lines; scroll listener regravat fără guard `prefersReducedMotion`), `components/atelier/AtelierContent.tsx` (`<Navbar ... darkHero />`), `tests/e2e/shared-components.spec.ts` (test "active state on /ro/atelier" actualizat — scroll 300 înainte de assertion ca să verifice mecanismul default oak-warm; test nou pentru copper la scroll 0 cu skip pe mobile viewport). Verdict tagline copper-on-bark = GOOD (artisan stamped look, nu murky).

**De ce contează:** (1) **Pattern extensibil**: orice viitoare pagină cu hero dark pasează `darkHero` prop, fără refactor Navbar. CTA dark mid-page nu necesită prop pentru că la scroll>100 Navbar are bg cream propriu → text ink lizibil automat. (2) **Reduced-motion fix = îmbunătăţire UX cross-site**: bug-ul afecta TOATE paginile pentru user-i cu reduced motion (transparent navbar perpetuu). Acum scroll state se update-ează indiferent de prefs. (3) **Pattern QA-tester false negative**: prima rundă QA a raportat wordmark ink (FAIL) — am citit SSR HTML cu curl + node, am confirmat `color:var(--cream-warm)` în răspuns. Cauza = browser cache stale + screenshot mid-hydration. Rezolvare: re-dispatch QA cu hard refresh + `waitForTimeout(1500)` + inspectare element specific (`.font-caudex` span, nu `<a>` wrapper). (4) **YAGNI vs IntersectionObserver**: am evaluat observer-based (data-attribute pe secţiuni dark + watching intersect cu navbar) — respins pentru complexitate fără caz real. Prop simple wins.

---

## 2026-05-29 — FIX 2: /atelier responsive overhaul + Navbar touch targets

**Pattern descoperit:** Audit responsive systematic pe toate secţiunile la 3 viewports (375/768/1440) cu qa-tester + screenshots clear = identifică P0 (broken) vs P1 (looks bad) vs P2 (polish). Pentru editorial CSS modules: aggregated `@media (max-width: 640px)` block la finalul fişierului pentru toate override-urile mobile (gutter, paddings reduse, margin resets) = single source of truth, uşor de citit. Pentru padding/heights cross-viewport: `clamp(min, vh, max)` în loc de fixed pixels = răspunde natural la viewport schimbat fără media queries multiple. **Specificity gotcha critică**: `.classname > *` (specificity 0,1,0) PIERDE la `.classname > :nth-child(N)` (0,2,0). Media queries NU schimbă specificity. Dacă o regulă media-query trebuie să override-eze regula de tip `:nth-child`, foloseşte `:nth-child(n)` (same specificity 0,2,0) + source-order câştigă.

**Aplicat la:** `components/atelier/atelier.module.css` (hero + 7 sections cu `clamp()` paddings, `.toolsFeature` media queries fix cu `:nth-child(n)` pentru full-width mobile, breakpoint `.procWrap/.condHead/.condGrid` 900→640px pentru tablet 2-col, aggregate `@media (max-width: 640px)` cu gutter universal 24px + place margin reset + day tight padding), `components/Navbar.tsx` (hamburger `p-3 min-w-[44px] min-h-[44px]`, mobile menu links `py-3 min-h-[44px] flex items-center` ambele ramuri route+anchor), `tests/e2e/visual-regression.spec.ts` (adăugat `/ro/tocatoare` + `/en/cutting-boards` la PAGES → 24 total baselines = 8 pagini × 3 viewports). 24/24 baselines regenerate clean.

**De ce contează:** (1) **Specificity bug fix transferabil**: orice CSS module cu rule `.x > *` în desktop + media query `.x > *` mobile — verifică dacă există rule-uri `.x > :nth-child(N)` care le ucid pe ambele. Aplicabil la oricare grid asymmetric din viitor. (2) **Touch target 44px = WCAG 2.5.5 mandatory**: hamburger + mobile menu links erau fail; fix cu min-h/min-w + flex items-center păstrează visual fără to bloat. Pattern: orice button/link interactiv pe mobile = 44×44 min. (3) **Aggregate mobile block = readability**: în loc de @media imprăștiate în CSS module, un singur bloc final cu toate overrides mobile = mai uşor de citit + de modificat. (4) **Iron Law gotcha port 3000 stale**: dev server vechi pe 3000 (de la sesiuni Bolt/anterior) confuza Playwright (`reuseExistingServer: true`) → 60+ teste eșuau cu HTML broken. Pattern viitor: înainte de `npm run verify`, check `netstat -ano | grep ":3000"` — dacă există PID nefamiliar, kill înainte de verify. Auto-mode blochează `taskkill /F` pe PID-uri nedeţinute (rezonabil) — necesită input founder. (5) **QA false negative pattern repetat**: a doua rundă QA a confirmat fix-uri cu hard refresh + 1.5s wait. Pattern QA: orice schimbare client-side (React state, CSS class swap), pentru verificare specifică = inspectează SSR HTML cu curl/node ÎNAINTE de QA browser screenshot. SSR HTML e ground truth pentru initial paint.

## 2026-06-22 — Task 2.4: Admin shell + /admin/produse CRUD

**Pattern descoperit:** Primele server actions din proiect (lib/admin/product-actions.ts).
Pattern: `'use server'` → requireAdminOrNotFound() → Zod safeParse(input) →
getServerSupabase() (RLS is_admin, NU service role) → revalidatePath. Client
ProductForm trimite valorile RHF; action-ul re-validează (nu se încrede în client).
Money: RON în UI → ×100 bani la salvare. Toggle binar ON=active/OFF=archived (soft-delete).
**Aplicat la:** components/admin/{AdminShell,AdminSidebar,ProductForm,ProductTable,ImageUpload},
app/admin/(protected)/produse/**, lib/schemas/product.ts, lib/admin/*, migrația Storage.
**De ce contează:** Template pentru toate uneltele admin viitoare (subscribers, comenzi).
Gate la nivel de PAGINĂ + layout (RSC-leak lesson). zodResolver + .transform() necesită
cast `as Resolver<Input,unknown,Output>`. check:i18n respinge cedilla ş/ţ chiar în cod.

## 2026-06-23 — Task 2.5: /admin/subscribers + CSV export

**Pattern descoperit:** CSV download = route handler cu gate EXPLICIT (layout-urile
NU gatează route handlers — lecția 2.3), Content-Disposition attachment, BOM UTF-8
(String.fromCharCode(0xFEFF)) + CRLF + RFC-4180 escaping pentru Excel.
**Aplicat la:** app/admin/(protected)/subscribers/{page.tsx,export/route.ts},
components/admin/SubscribersTable.tsx, lib/admin/subscribers.ts, migrația admin SELECT.
**De ce contează:** email_subscribers NU avea policy SELECT (doar INSERT) — admin
primea 0 rânduri până la migrația 20260623090000. Verifică RLS SELECT existent înainte
de a presupune că getServerSupabase poate citi un tabel. Tabel display = server component
(fără hidratare). Date RO = Intl ro-RO + timeZone Europe/Bucharest (null-safe).

## 2026-06-23 — Task 2.6: /admin/profile schimbare parolă

**Pattern descoperit:** Schimbare parolă sigură fără parola veche cerută de Supabase —
reauth prin signInWithPassword(currentPassword) → dacă OK → updateUser(newPassword).
signInWithPassword pe același user reîmprospătează sesiunea (rămâne logat). updateUser
singur NU verifică parola veche — de aceea reauth-ul e obligatoriu.
**Aplicat la:** components/admin/ChangePasswordForm.tsx, lib/schemas/auth.ts (changePasswordSchema).
**De ce contează:** Pattern reutilizabil pentru orice „change password" cu user logat.
2FA TOTP deferred la pre-launch (SECURITY_CHECKLIST §8.1.d). Admin RO-only → text hardcodat
generează warnings i18n acceptate (nu errors).

## 2026-06-23 — Task 2.7+2.8: Dashboard + Comenzi (SPRINT 2 CLOSED)

**Pattern descoperit:** recharts în App Router = MOUNTED-GUARD obligatoriu (useState mounted +
useEffect; server + first client render = placeholder same height → swap post-mount) ca să eviți
#418 din ResponsiveContainer. Dashboard stats = fetch + agregare JS (counts mici), force-dynamic.
OrderStatusBadge cu 9 stări reale pregătit pentru Sprint 3.
**Aplicat la:** components/admin/{SubscribersChart,StatCard,OrderStatusBadge}.tsx,
lib/admin/{dashboard,orders}.ts, app/admin/(protected)/{page,comenzi/page}.tsx.
**De ce contează:** Sprint 2 (auth + admin) COMPLET — sidebar 5 items active. Sprint 3 = Stripe.
2 migrații DB de aplicat pe live (Storage 2.4 + subscribers SELECT 2.5). 2FA = pre-launch.
Gotcha durabil major al sprintului: SpeedInsights ca frate al <html> = #418 global (mutat în body).

## 2026-06-23 — Task 3.1: Product detail page (Sprint 3 start)

**Pattern descoperit:** Server component pasat ca PROP/children la un client wrapper (ProductInfo
server → ProductDetailContent 'use client') — singura cale de a avea Navbar/toggle client + conținut
server. Client NU poate importa server component, dar îl poate primi ca prop. ISR detail page:
generateStaticParams (toate locale × slug) + revalidate + dynamicParams. Middleware existent
gestionează deja rute nested (rest = segments.slice(3)) — zero schimbare pentru /[locale]/tocatoare/[slug].
**Aplicat la:** app/[locale]/tocatoare/[slug]/page.tsx, components/product/*, lib/db/products.ts (fetchProductBySlug).
**De ce contează:** Template pentru orice pagină detaliu viitoare. AddToCartButton = placeholder, wired Task 3.2.

## 2026-06-23 — Task 3.2: Cart (Zustand persist + drawer)

**Pattern descoperit:** Zustand persist + SSR = #418 garantat → useHydrated guard OBLIGATORIU
(items=[] pe server+first client render, valoare reală post-mount) pe TOATE componentele care
citesc coșul (badge, drawer, /cos). persist cu partialize: salvează DOAR items, NU isOpen (altfel
drawer se redeschide la load). lineId = productId sau productId:{engravingText} (linii separate).
Snapshot preț bani la add; stoc real validat la checkout (3.4), nu în coș.
**Aplicat la:** lib/store/cart.ts, lib/hooks/useHydrated.ts, components/cart/*, components/product/AddToCartPanel.tsx, Navbar.
**De ce contează:** Primul Zustand store din proiect — template pentru orice state client persistat.
Cart complet funcțional (add/drawer/badge/stepper/remove/persist/EN). NEXT: checkout 3.3.

## 2026-06-23 — Task 3.3: Checkout multistep

**Pattern descoperit:** Multistep checkout = UN singur RHF useForm + FormProvider + validare per pas
via trigger(STEP_FIELDS[step]); state pași React local (NU persistat — date personale nu în localStorage).
Cart guard useHydrated → coș gol post-hydration → router.replace(/cos). force-dynamic page sub
generateStaticParams apare ● în build dar e dinamică real (verifică header runtime Cache-Control no-store,
nu simbolul build). Shipping config în lib/config (25 RON / gratuit ≥500), bani.
**Aplicat la:** app/[locale]/checkout/, components/checkout/*, lib/schemas/checkout.ts, lib/data/counties.ts, lib/config/shipping.ts.
**De ce contează:** Template multistep form. „Plasează comanda" = placeholder; Stripe + order real = 3.4/3.5.

## 2026-06-23 — Task 3.4: Stripe Checkout + order creation

**Pattern descoperit:** Order placement ATOMIC = RPC PL/pgSQL (order+items+reserve_stock+history într-o
tranzacție; reserve eșuat → rollback, fără comandă fantomă). JS revalidează preț CURRENT din DB (D1, nu
client) + totaluri server, apoi cheamă RPC. Stripe Checkout hosted = doar `stripe` server SDK, redirect la
session.url (fără @stripe/stripe-js). unit_amount = bani direct (RON smallest unit). getStripe() LAZY
(nu arunca la build fără cheie). Webhook: constructEvent(raw body+sig), idempotent (skip dacă paid),
expired→release_stock. /multumim: UUID guard (D3) + clear cart pe mount (D6). RPC nou nu e în types →
cast `'fn' as never`. Server action call în client → try/catch (throw necontrolat → buton blocat altfel).
**Aplicat la:** lib/stripe/, lib/orders/, app/api/webhooks/stripe/, app/[locale]/multumim/, migrația RPC.
**De ce contează:** Prima vânzare reală (Sprint 3). 4 hand-off-uri founder (migrație, inventory, env, webhook).

## 2026-06-23 — Task 3.5: Email tranzacționale comandă (Resend)

**Pattern descoperit:** Email-uri comandă centralizate în `sendOrderEmails(orderId)` —
self-contained (citește tot din `orders`+`order_items` via fetchOrderConfirmation;
`guest_email` ține emailul clientului ȘI pentru useri logați, setat de create_order).
**Best-effort total (D5):** funcția NU aruncă niciodată, swallow + console.error,
nu blochează/rollback comanda. În webhook se cheamă DUPĂ update-ul `paid` (status
corect în email + un 500 ar declanșa retry Stripe care ar sări emailul din cauza
guard-ului `paid`). Idempotency (D4) = fără coloană nouă: guard `payment_status='paid'`
(card) + execuție unică (ramburs). Test mode (D2): `fromEmail===onboarding@resend.dev`
→ ambele emailuri la founder, client cu banner `[TEST → {email}]`. React Email reuse
pattern Sprint 1 (paletă inline, Caudex/Lora, LEGAL_INFO). locale read defensiv din
order (cast — nu e în types până la regen). `email-template-builder` skill NU există
în registry — folosit pattern-ul existent din proiect.
**Aplicat la:** emails/OrderConfirmationClient.tsx + OrderNotificationAdmin.tsx,
lib/orders/send-order-emails.ts, hook în place-order (ramburs) + webhook (card),
migrația 20260623110000 (coloană locale + create_order p_locale).
**De ce contează:** D1 = coloană `locale` pe orders (premisa „comanda are locale" era
GREȘITĂ — orders n-avea coloană). Gotcha durabil: param nou la funcție Postgres =
OVERLOAD, trebuie DROP cu semnătura veche exactă întâi (vezi gotchas). Hand-off founder:
aplică migrația locale + regen types înainte de smoke pe Vercel.

## 2026-06-23 — Task 3.6: Admin orders management (SPRINT 3 CLOSED)

**Pattern descoperit:** Sursă unică pentru enum-uri partajate (`lib/orders/status.ts`:
ORDER_STATUSES + labels + isOrderStatus guard) importată de badge + dropdown + action +
listă → zero drift față de CHECK-ul DB. Server actions order (updateOrderStatus +
markOrderPaid) urmează pattern-ul product-actions: requireAdminOrNotFound (întoarce
AuthUser → .id pentru changed_by) + getServerSupabase (RLS admin, NU service role) +
revalidatePath. Status change = update orders (+ timestamp auto pe shipped/delivered/
cancelled/refunded) + insert order_status_history (audit). D7: cancel din stare
pre-shipment (RESERVED_STATUSES) cheamă release_stock per item; shipped/delivered NU
(fulfill = Sprint 4). markOrderPaid → payment_status='paid' (ramburs, audit la status
curent). Detaliu = server component + 1 insulă client (OrderStatusControl, useTransition
+ router.refresh). Filtru listă pills server-side via ?status= (validat cu isOrderStatus).
**Typecheck gotcha:** payload de update Supabase NU acceptă Record<string,unknown> (index
`never`) → tipează cu Database[...]['orders']['Update'] + cast punctual pe cheia timestamp.
**Aplicat la:** lib/orders/status.ts, lib/admin/orders.ts (fetchOrderDetail), lib/admin/
order-actions.ts, components/admin/{OrderStatusBadge,OrderStatusControl}, app/admin/
(protected)/comenzi/{page,[id]/page}.tsx.
**De ce contează:** SPRINT 3 COMPLET — magazin end-to-end (catalog→detaliu→coș→checkout→
Stripe/ramburs→comandă→emailuri→admin management). Efecte stoc PARȚIALE: reserve la
creare ✅, release la cancel/expired ✅, fulfill la shipped → Sprint 4 (curier). Pre-launch
blockers: Stripe live keys, domeniu Resend, poze produs 1:1, date firmă (LEGAL_INFO env).

## 2026-06-23 — Task 4.1: Stock management + out-of-stock visibility (SPRINT 4 start)

**Pattern descoperit:** Vizibilitate stoc client FĂRĂ a expune numărul: `inventory` RLS =
admin-only, deci catalogul anon nu-l poate citi. Soluție: `fetchStockMap(ids)` cu
**client service-role SERVER-SIDE** în lib/db/products.ts (cheia nu e NEXT_PUBLIC → nu
ajunge în bundle client; fișierul e importat doar de Server Components), derivă DOAR
`inStock: boolean` și pasează booleanul la componentele client. **Fail-open:** map gol
(fetch eșuat / lipsă cheie la build) → totul „în stoc" (nu ascunde catalogul). `quantity_available`
= GENERATED STORED (total−reserved) → scade INSTANT la reserve, deci out-of-stock client
e condus de reserve (deja wired); `fulfill` nu schimbă available (e doar acuratețe fizică).
**fulfill_stock wired** în updateOrderStatus la shipped/delivered din stare rezervată (D3,
lângă release la cancel) — nu se dublează (ambele doar din RESERVED_STATUSES). Ajustare
manuală admin = funcție PL/pgSQL `adjust_stock(set absolut → delta intern → movement)`
(regula backend: stoc prin funcții atomice FOR UPDATE). Oversell prevenit de reserve_stock
atomic (FOR UPDATE + RAISE) — al 2-lea cumpărător al ultimului produs primește rollback.
**Aplicat la:** migrația adjust_stock, lib/db/products.ts (fetchStockMap/fetchOutOfStockIds),
lib/admin/inventory.ts + inventory-actions.ts, lib/admin/order-actions.ts (fulfill),
ProductCard (overlay D5) + ProductInfo (badge + mesaj) + TocatoareCatalog/Content (thread
outOfStockIds), admin ProductTable (coloană) + StockPanel + edit page (istoric).
**De ce contează:** Numărul exact NU părăsește serverul niciodată (doar boolean). UI stoc =
best-effort (ISR 60s + revalidatePath la ajustări/tranziții); guard real anti-oversell =
reserve atomic la checkout. Hand-off founder: aplică migrația adjust_stock + regen types.
JSON-LD detaliu acum InStock/OutOfStock (era PreOrder).
