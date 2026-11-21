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

## 2026-07-02 — SEO Critical Fixes (post-audit, 4 fix-uri + bonus)

**Pattern descoperit:** `notFound()` aruncat în layout-ul `[locale]` se randează SUB root
layout (passthrough, fără html/body) → trebuie `app/not-found.tsx` cu PROPRIUL
`<html><body>` (404 generic, fără hints admin — lecția 2.3). Guard `isLocale` în
`[locale]/layout.tsx` (server) închide soft-200 pe dotted paths — page-ul e 'use client',
nu poate chema notFound(). `app/robots.ts`/`app/sitemap.ts` (convenții metadata) se
rezolvă ÎNAINTE de `[locale]` → bypass automat. Entity graph JSON-LD cu `@graph` +
`@id` (#organization/#website) în layout; subpaginile referă `{'@id': ...}` în loc să
dubleze. Address placeholder-aware (spread condiționat — nu emite `[ADRESA_ATELIER]`).
**Aplicat la:** [locale]/layout.tsx (guard+alternates+graph), app/not-found.tsx,
app/robots.ts (Variant A Disallow all — 🚨 MUST-FLIP la cutover, în SECURITY_CHECKLIST
TL;DR #11), app/sitemap.ts (localizedPath+fetchActiveProducts+filtru 'test'),
tocatoare/page.tsx (ItemList InStock/OutOfStock + URL-uri PDP), Hero/Navbar/FloatingCTA/
WaitlistSection/tocatoare content (copy magazin real — zero „Lansăm în octombrie"),
despre/atelier (@id refs), titlu catalog cu keywords.
**De ce contează:** Toate cele 5 CRITICE din audit închise în cod (test product =
founder în admin). Baselines regen (Navbar global). Auth pages aveau DEJA noindex —
auditul cerea doar verificare, nu s-a fabricat fix.

## 2026-07-04 — Design QA: skill permanent + audit complet site + Navbar drawer redesign

**Pattern descoperit:** (1) Skill nou permanent `~/.claude/skills/design-qa/` — protocol
vizual obligatoriu la finalul oricărui task UI: captură Playwright pe matrice 4 viewports
(375/768/1024/1440 — inclusiv valorile EXACTE de breakpoint md/lg, unde se aglomerează
bug-urile) + REVIEW pe fiecare screenshot (captura fără review = gate fals) pe checklist
A-I (overlap, touch targets 44px, spacing, ierarhie, tipografie, brand, animații +
reduced-motion, stări interactive, onestitate). Înregistrat în CLAUDE.md (tabel skills +
workflow UI pas 5 + Iron Law). (2) Audit la scară: 140 capturi → segmentare ffmpeg la
2000px → 9 agenți paraleli de review cu brief comun + format strict de findings →
sinteză dedupe-uită. Agenții căzuți pe erori API tranzitorii se reiau cu SendMessage
(„resume + deliver FINAL report"); transcript pierdut = respawn de la zero. (3) Navbar
redesign: hamburger drawer sub lg (1024) — pattern CartDrawer (Esc + backdrop + scroll-lock
+ focus close), z-order disciplinat (navbar 50 < menu 55/56 < cart 60/61), logo redus
sub lg, limba/auth/CTA mutate în drawer (bară = logo + cart + hamburger).
**Aplicat la:** ~/.claude/skills/design-qa/SKILL.md, CLAUDE.md, scripts/design-qa-capture.mjs,
docs/design-qa-audit-2026-07-04.md (raportul complet), docs/plans/2026-07-03-navbar-drawer-design.md,
components/Navbar.tsx (rewrite: drawer + breakpoint md→lg + GSAP mort eliminat + logo
responsive + tagline hidden <md), tests/e2e/shared-components.spec.ts (selector
aria-expanded + skip <1024).
**De ce contează:** Vechiul Navbar era CAUZA a 3 findings „de pagină" (overflow PDP 375,
click-uri interceptate în checkout, coliziune H1 /cos) — un fix de chrome a închis 5
findings. GSAP scos din Navbar = GSAP dispare din First Load JS pe paginile interioare
(rămâne doar unde e folosit: ProductTease). Auditul complet (docs/design-qa-audit-2026-07-04.md)
e input-ul founder-ului pentru batch-urile de fix — NIMIC din raport nu s-a reparat în
afara Navbar-ului (scope discipline). Verificare 199/199 e2e + 72 baselines regen +
hydration 0 + runtime checks pe cele 3 findings ambigue (toate rezolvate/false alarm).

## 2026-07-05 — Design Batch A: root-cause pe 2 critice + 5 fix-uri vizuale

**Pattern descoperit:** (1) **Două „critice" din audit erau atacabile doar prin
systematic-debugging, nu prin fix direct**: ProductTease @768 s-a dovedit artefact
de captură (lazy images mid-flight în stitch-ul fullPage + captura RM fără scroll),
iar /despre EN era geometrie pură (overlay 572px > banner fix 380px cu overflow
hidden — măsurat runtime cu getBoundingClientRect înainte și după fix). Regula:
findings vizuale din screenshots = verifică runtime ÎNAINTE de fix (assert-uri
scriptabile: h2 inside banner, zero token-uri, opacity la scroll). (2) **`img.decode()`
pe imagini lazy ascunse (display:none) rămâne PENDING etern în Chromium** — orice
așteptare pe decode-uri cere `Promise.race` cu timeout, nu doar catch (a blocat
complet capture-ul; gotcha dedicat). (3) **Scroll-driven opacity (useTransform pe
scrollYProgress al secțiunii) e fragil pe secțiuni înalte mobile** — pragurile de
progress se ating după ce elementul a ieșit din viewport; whileInView per-element
e corect la orice înălțime. (4) **Ascundere condiționată de placeholders**:
`hasPlaceholder()` (includes '[') + rând nerandat = pattern aplicat în 4 componente;
datele apar automat din env, zero cod la lansare.
**Aplicat la:** lib/legal-info.ts, Footer, ContactInfo, LegalCompanyInfo, LegalHero,
about.module.css (workshopBanner flow + scrim), tocatoare.module.css (gradient cream
v3 peste treeline), atelier/content.ts (EN „gets done."), CuttingBoard3D (slot decal
plat în loc de fake C-cutout; umbră #5C3A20 @0.13 + radius 7), WorkshopSection
(RevealLines whileInView), scripts/design-qa-capture.mjs + skill design-qa (decode
race + RM priming).
**De ce contează:** Auditul rămâne credibil doar dacă protocolul de captură nu
fabrică findings — cele 2 reguli noi (decode race, RM priming) sunt permanente în
skill. Toate cele 7 fix-uri verificate cu 52 capturi + 4 assert-uri runtime.

## 2026-07-06 — llms.txt + security headers (CSP Report-Only) + H2 semantic

**Pattern descoperit:** (1) **CSP se introduce în două trepte pe un site live**:
inventar de surse din COD (nu din presupuneri — ex. verificat că Stripe hosted
Checkout = redirect, zero JS Stripe pe site → fără stripe.com în policy), apoi
`Content-Security-Policy-Report-Only` cu verificare pe fluxurile fragile
(checkout/imagini/3D/fonturi), promovare la enforce abia după fereastra de
observație. Nonce-uri pe SSG = forțează dynamic rendering — unsafe-inline e
trade-off-ul corect deocamdată. (2) **Dovada „vizual neschimbat" = visual
regression contra baseline-urilor EXISTENTE fără update** — dacă trec, refactorul
e pixel-identic; nu regenera baselines când nu s-a schimbat nimic. (3) **heading
fragmentat de animație** = un `<h2>` + `<motion.span className="block">` per
linie cu aceiași parametri — pattern-ul Hero (h1) aplicat la h2-uri. (4) llms.txt
= fapte citabile VERIFICATE din conținutul site-ului (grep înainte de scris),
placeholder-aware (fără telefon/firmă cât sunt token-uri).
**Aplicat la:** public/llms.txt, next.config.js (headers() + CSP_REPORT_ONLY cu
inventar comentat), WorkshopSection.tsx + ProductTease.tsx (h2 unic).
**De ce contează:** SEO #8/#12/#14 închise. 🚨 De reținut: promovarea CSP la
enforce = schimbi numele header-ului în next.config.js DUPĂ verificarea pe
Vercel prod (violările apar în consola browserului).

## 2026-07-11 — Landing cadouri Faza 1: pattern „design-first, build la assets"

**Pattern descoperit:** Pentru pagini noi dependente de assets (poze) — Faza 1 = design
doc + copy final + DESIGN SPEC BRIEF self-contained (tokens hex + fonturi + structură +
ratio-uri sloturi foto, consumabil de Claude Design fără acces la codebase) + brief foto
prioritizat P1/P2/P3 scris pentru fotograf. Build-ul e gated pe cadrele P1. Research
vizual cu agenți (5-6 site-uri premium + incumbenții RO) înainte de structură = decizii
de layout cu dovezi, nu gust. CRO pt cadouri: gravura vizibilă ÎN hero, navigație pe
ocazie/destinatar, povestea meșterului mid-page, promisiune de livrare PE DATĂ (feature
funcțional cu calcul zile lucrătoare, nu copy static), zero mecanici de urgență.
**Aplicat la:** docs/plans/landing-cadouri-design.md + landing-cadouri-photo-brief.md;
skills marketingskills (cro+copywriting) folosite prima dată — framework-urile lor de
structură/claritate au ghidat wireframe-ul și copy-ul.
**De ce contează:** Template reutilizabil pentru orice pagină nouă cu dependență de
assets (ex. /ingrijire cu poze proces). Claude Design în buclă: spec brief aprobat →
prototip vizual founder → build cu țintă vizuală clară — reduce iterațiile de design-qa.

---

## 2026-08-10 — Inventar media + plan stock (docs/media-inventory.md)

**Pattern descoperit:** Inventarul complet de sloturi media = grep pe `<Image`/`next/image` +
`<video>` + `background-image|url(` + `placeholder` peste app/+components/, apoi citire punctuală
pentru ratio/rol. Rezultat surprinzător: site-ul are DOAR 2 foto-uri „reale" în cod în afara
produselor (workshop.webp pe homepage — mislabeled mockup marcat „not used" în decizia /despre
dar LIVE în WorkshopSection.tsx:224 — și cele 4 product-*.webp din era Bolt în ProductTease,
1,5–2MB fiecare, proveniență neclară). Restul = placeholder-e stripate intenționate (/despre
banner, /atelier 6 unelte + 2 place + 4 articole) + slot video 16:9 fără element `<video>`.
Zero video în tot codul. next.config.js permite doar `*.supabase.co` la images + CSP img-src
fără CDN-uri stock → hosted stock ar cere 2 schimbări de config; local `/public` = zero.
**Aplicat la:** docs/media-inventory.md (tabel complet cu file:line + categorii PRODUS/BRAND/
DECOR-SVG/STOCK-NEUTRU/STOCK-DECOR/VIDEO + plan căutare per slot + note ATENȚIE).
**De ce contează:** (1) Sloturile ⚠️ unde stock contrazice copy-ul: WorkshopPlace „workshop
wide · 60sqm" e cel mai riscant (afirmație verificabilă vizual) — alternativa = cadre-detaliu,
nu wide-shot. (2) Regula anti-portret: mâini + unelte OK, față de meșter NU (contrazice
„atelierul nostru"). (3) OG_IMAGE pe toate paginile interioare = logo pătrat declarat 1200×630
(mismatch ratio) — upgrade ieftin într-un task viitor. (4) 5 fișiere >500KB în /public de
recomprimat la task 2 indiferent de decizii.

---

## 2026-08-10 — Task 2: umplere media stock (Pexels) + video loop + produse reale în tease

**Pattern descoperit:** (1) **Sourcing stock fără API keys**: Unsplash napi cere auth acum
(„Authorization required"), dar Pexels merge complet keyless: WebFetch pe pagina de căutare →
listă de photo-page URLs; download direct `images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?w=1920`;
pentru video, og:video de pe pagina video dă `videos.pexels.com/video-files/...mp4`. Verificare
vizuală OBLIGATORIE cu Read pe fiecare candidat (am respins 6: branduri lizibile Ryobi/DeWalt,
fețe vizibile, culori reci, magazie de grădină). (2) **Video ambient în React**: `<video muted
loop playsInline preload="none" poster>` + play() din IntersectionObserver-ul existent, gated pe
`!prefersReducedMotion` → zero LCP impact, RM = poster static. Scenă STATICĂ (flat-lay) = loop
fără saltul vizibil de la cut + compresie excelentă (14,9s 1080p CRF28 = 1,8MB). (3) **Video în
visual regression** = frame nedeterminist → `addInitScript` cu stub `HTMLMediaElement.prototype.play
= () => Promise.resolve()` în spec → doar posterul e capturat vreodată. Playwright fullPage
screenshot poate să și blocheze („Unable to capture screenshot") cu video în play — pause înainte
de capture la retry. (4) **ProductTease static cu produse reale**: pozele hero din Supabase
Storage extrase în `/public/products/` + data map actualizat manual cu numele/dimensiunile reale —
zero refactor server-side pentru homepage (pagina e 'use client').
**Aplicat la:** public/stock/ (12 fișiere) + public/products/ (4), ProductTease (4 produse reale:
taur-alb/pește/valuri/live-edge), WorkshopSection (P1), WorkshopBanner+about/content.ts (P4,
imageAlt), atelier/content.ts+ToolsSection+WorkshopPlace (P5×6+P6×2, captions „60sqm" eliminate),
CraftVideoTease (P3 rescris cu <video>), visual-regression.spec.ts (stub play), docs/stock-credits.md.
Șterse: workshop.webp + 4× product-*.webp (6,9MB scoși de pe homepage).
**De ce contează:** (1) Evidența de licență per fișier stă în docs/stock-credits.md — orice asset
stock nou intră ACOLO înainte de commit. (2) Alt-textele stock = descriu ce SE VEDE, nu afirmații
despre noi („Banc de lucru sub fereastră", NU „atelierul nostru de 60mp"). (3) Copy-ul
CraftVideoTease ajustat onest la ce arată loop-ul („o privire scurtă peste blatul de lucru").
(4) Rămas pre-existent, flagat founder-ului: /despre CTA „Lansăm în octombrie." (RO+EN) contrazice
magazinul live — de curățat într-un task de copy.

---

## 2026-10-15 — QA & Polish pre-launch: fără Three.js, slideshow, OG static, crop 4:3

**Pattern descoperit:** (1) **„First Load JS" nu vede chunk-urile `next/dynamic`** — scoaterea
Three.js a mutat metrica doar 286→282 kB, dar JS-ul total transferat pe home a scăzut cu 42%
(1.926→1.123 KB). Raportează ÎNTOTDEAUNA ambele; „before" se măsoară pe live (= HEAD) cu același
script Playwright ca „after" pe prod local. (2) **Determinism pentru animații pe timer** în
baselines: `navigator.webdriver` (setat de Playwright) → freeze pe primul frame, fără stub-uri
în spec; RM = același frame static. (3) **`next/og` fără sharp**: rută temporară pe runtime
`edge` (Node runtime pică pe Windows), fonturi TTF raw din `google/fonts` (googleapis dă
woff/EOT), fără fonturi variabile; rezultatul se commite static. **NU** `opengraph-image.tsx`
în `[locale]` — ar suprascrie og:image-ul produselor de pe PDP. (4) **Thumbnails fără sharp**:
`/_next/image?url=…&w=640&q=82` pe serverul local = WebP gata de salvat în /public.
(5) **Warning-uri de bundling**: citește import trace-ul complet — „Critical dependency" avea
o A DOUA cauză (@react-email barrel → tailwindcss) după fix-ul vechi de line-clamp.
(6) **Ascunde prin flag, nu șterge** (`SHOW_WAITLIST`, `SHOW_ARTICLES`): secțiunile revin
post-lansare cu un boolean. (7) **Screenshot-urile full-page de 10.000px nu se pot revizui**
— capturi pe element (`locator.screenshot()`) pentru fiecare secțiune schimbată × 4 viewports
sunt review-ul real; matricea full-page rămâne pentru regresii de chrome.
**Aplicat la:** Hero/Navbar/Footer/ProductTease/CraftVideoTease/WaitlistSection, atelier
(hero mozaic, tools, CTA, articles), tocatoare (hero, medallion 4:3), product/ProductGallery
(4:3 contain), about (overlay h2 + CTA), lib/seo.ts + public/og, next.config.js, teste e2e.
**De ce contează:** Site-ul e coerent pentru lansarea din noiembrie: zero relicve de waitlist,
toate CTA-urile duc la magazinul real, pozele de produs se văd integral, OG corect în
previews, bundle cu 800KB mai mic pe home. Flag deschis: OF-10 (ceas) în catalog „Tocătoare".

---

## 2026-10-15 — Ramburs-only: Stripe dormant prin flag, confirmare manuală, smoke E2E cu admin temporar

**Pattern descoperit:** (1) **Inventar înainte de a tăia**: „rezervarea stocului depinde de
webhook" era o premisă falsă — RPC-ul `create_order` rezerva la plasare pentru ambele
metode; fără inventar aș fi „mutat" ceva care era deja la locul lui. (2) **Un singur flag
pentru o integrare dormantă**: `CARD_PAYMENTS_ENABLED` gated în 4 locuri (UI pași, server
forțează metoda, webhook 410, enum-uri admin filtrate) — codul rămâne, revenirea = env.
Flag NEXT_PUBLIC pentru că UI client + server trebuie să fie de acord; boolean, nu secret.
(3) **Pașii de checkout ca listă derivată** (`STEPS: StepKind[]`) în loc de `1|2|3`
hardcodat — un pas dispare fără să rescrii logica de navigare. (4) **Smoke E2E real pe
DB live** cu Playwright pentru client + admin temporar creat/șters prin
`auth.admin.createUser` + `profiles.role`, verificări directe în DB după fiecare pas
(status, payment_status, history, inventory.quantity_reserved, stock_movements). Un check
care aruncă înainte de cleanup lasă comandă + stoc rezervat → curăță cu rețeta webhook-ului
expired. (5) `innerText` aplică `text-transform` (label-caps) — compară case-insensitive.
(6) `next dev` și `next start` NU pot rula simultan din același `.next`: dev-ul
suprascrie build-ul de producție (pagini fără CSS/JS pe serverul prod).
**Aplicat la:** lib/config/payments.ts, components/checkout/*, lib/orders/{place-order,
status}.ts, app/api/webhooks/stripe, admin (layout/shell/sidebar/dashboard/comenzi),
emails/OrderConfirmationClient, termeni/page.tsx, .env.example, scripts/smoke-ramburs-
order.mjs, tests/e2e/checkout.spec.ts, _brain/notes/payments-dormant-stripe.md.
**De ce contează:** Lansarea nu mai depinde de KYC Stripe live + webhook în prod. Founder-ul
are inbox-ul „Nouă, de confirmat" cu badge și filtrează gravările înainte de producție.
Reactivarea cardului = 3 env + endpoint webhook, documentat.

---

## 2026-11-18 — „La comandă": formular → admin, migrații fantomă, review multi-lens

**Pattern descoperit:** (1) **`migration list` înainte de ORICE `db push`**: 4 migrații din iunie
aplicate din SQL editor nu erau în istoricul remote — un push orb le-ar fi re-rulat. Verificare
obiecte prin OpenAPI-ul PostgREST (`GET /rest/v1/` cu service role) → `migration repair --status
applied` (doar evidență) → `db push --dry-run` → push. (2) **Formular public fără politică anon**:
server action `'use server'` + service role DOAR după Zod + honeypot + timing + rate limit;
tabelul rămâne de neatins din browser (verificat: anon SELECT `[]`, INSERT 42501). Honeypot-ul
NU se constrânge în schemă (altfel botul primește eroare de validare și află de capcană).
(3) **Zod vs Postgres la lungimi**: `.length` numără unități UTF-16, `char_length()` code
points → `Array.from(v).length` în refine (target-ul TS e ES5, `[...v]` nu compilează).
(4) **Testul de „încape în nav" trebuie să acopere starea logată**: review-ul multi-lens
(4 dimensiuni + verificator adversarial per dimensiune, 7 agenți) a prins că EN la 1024px cu
client logat avea 0px între blocuri — testul meu rula doar delogat. Fix: strângere doar pe
1024–1279 + sign-out icon-only acolo + variantă „signed in" în test (element injectat).
(5) **Python heredoc + escape-uri**: `'\\u0000'` a ajuns ca octet NUL REAL în fișier
(`'\\u00a0'` ca NBSP real) — scanează fișierele modificate după octeți NUL înainte de commit.
**Aplicat la:** supabase/migrations/20261118090000_create_custom_orders.sql, lib/custom-orders/*,
lib/schemas/custom-order.ts, lib/whatsapp.ts, components/la-comanda/*, app/[locale]/la-comanda,
app/admin/(protected)/comenzi-custom/*, AdminSidebar (badge generic per item), Navbar (lg–xl),
tests/e2e/la-comanda.spec.ts, scripts/smoke-custom-orders.mjs.
**De ce contează:** primul formular public care scrie direct în DB fără policy anon — tiparul
(server action + service role + apărări în ordine + insert fără `.select()` de la anon) e
reutilizabil pentru orice formular viitor (cerere ofertă B2B, recenzii).

---

## 2026-11-19 — Texte legale finale + „nu inventa fapte” verificat în cod

**Pattern descoperit:** (1) **Textul legal se scrie DIN audit, nu din șablon**: un agent de
audit (citire, cu file:line) + verificări directe (regiunea Supabase prin `supabase projects
list`, numărul de rânduri prin `Prefer: count=exact`) au dat baza pentru fiecare fișă de
prelucrare; gate-ul a pus founder-ului doar întrebările pe care codul nu le putea lămuri.
(2) **Model de conținut cu tokeni** (`{companyName}`, `{shippingFee}`, `[x](route:returns)`):
datele de registru și prețurile au o singură sursă, iar un token necunoscut aruncă eroare la
build. Renderer-ul trebuie să fie RECURSIV în `**bold**` — testul e2e „niciun `{token}` în
pagină” a prins asta. (3) **Review-ul text ↔ cod găsește nepotriviri pe care testele nu le
văd**: emailul automat se numea „Confirmare comandă”, deși Termenii spun că emailul confirmă
doar primirea → subiect/corp/pagina de mulțumire aliniate. Rulează un review „fiecare
afirmație din text vs codul care o face adevărată” după orice text legal. (4) **Cifrele de
marketing sunt și ele afirmații**: „1.200+ pe listă” cu 2 rânduri de test în DB = practică
înșelătoare; fiecare cifră are acum sursa notată lângă ea.
**Aplicat la:** components/legal/* (LegalText, LegalBlocks, LegalToc, content.ts × 3),
components/checkout/ReviewStep.tsx (nota de gravură), ContactForm/RegisterForm, Footer,
NumbersStrip, emails/OrderConfirmationClient.tsx, lib/orders/send-order-emails.ts,
lib/rate-limit.ts (sweep la fiecare apel, ca să fie adevărat „o fereastră de o oră”).
**De ce contează:** când politica spune ceva, codul trebuie să facă exact acel lucru —
ținem textul și codul legate prin teste (tokeni rezolvați, linkuri, faptele de la gate).

---

## 2026-11-19 — Curățare branduri + afirmații absolute: caută în HTML-ul randat, nu doar în repo

**Pattern descoperit:** pentru „scoate X de peste tot”, grep-ul în repo nu ajunge: textul
vine și din DB (descrieri de produs) și apare în JSON-LD / RSC payload. Am făcut trei treceri:
grep în repo, scanare a tuturor câmpurilor `products` prin REST (service role) și o scanare a
HTML-ului randat (`page.content()`) pe toate paginile publice + llms.txt, cu același regex.
Când o instrucțiune e ambiguă ca întindere (o expresie exactă vs. o afirmație formulată în
mai multe feluri), o întrebare scurtă cu 3 opțiuni a dat un răspuns diferit de toate trei —
merită întrebat înainte de a rescrie copy de brand.
**Aplicat la:** components/atelier/content.ts, numbers-strip-content.ts (+ Stat.display),
NumbersStrip.tsx, about/content.ts, StoryStrip.tsx, public/llms.txt, tests (atelier, despre,
shared-components).
**De ce contează:** o gardă e2e pe HTML-ul randat prinde și reintroducerile din DB sau din
JSON-LD, nu doar din fișierele editate.

---

## 2026-11-19 — Stock pentru o unealtă anume: când Pexels n-are, decupează (licența permite)

**Pattern descoperit:** pentru „rindea electrică de mână” Pexels dă aproape numai rindele
manuale, mașini staționare sau poze cu brand/fețe. Singura potrivită avea fața lucrătorului →
decupaj cu ffmpeg (`crop` + `colorbalance` + `hqdn3d`, WebP q72) în format peisaj apropiat de
cardul `object-fit: cover`, ca subiectul să nu fie tăiat. Verificare vizuală a fiecărui
candidat cu Read înainte, a decupajului după, și a cardului randat la 4 viewporturi.
Pentru inventare mari (afirmații de pe tot site-ul): workflow pe zone + critic de
completitudine + agent de grupare pe „fapt” → pagină artifact cu `db` unde founder-ul
marchează, iar noi citim marcajele cu ArtifactData în loc de o listă lungă în chat.
**Aplicat la:** public/stock/atelier-tool-hand-planer.webp, docs/stock-credits.md,
artifact „Verificarea afirmațiilor”.

## 2026-11-19 — Fact-check în două runde + cifre live din DB

**Pattern descoperit:** un marcaj „de corectat” fără valoarea corectă nu se poate aplica
fără a inventa → a doua rundă în ACELAȘI artifact: propunere concretă per fapt (text tăiat →
text nou, variante A/B/C + „altă variantă” + „las cum e”), grupată pe secțiuni când mai
multe fapte stau în aceeași secțiune; răspunsurile vin în colecția `decisions`. Când
founder-ul cere „general valabil”, rescrierea folosește fizica lemnului + doar faptele
marcate adevărat. Orice cifră care descrie catalogul (număr de modele) se citește din DB,
nu se scrie de mână: homepage-ul e acum server shell (`app/[locale]/page.tsx`, revalidate 60)
+ `components/HomeClient.tsx`; `countActiveProducts()` întoarce null la eroare, iar banda
ascunde celula în loc să afișeze o cifră falsă.
**Aplicat la:** /despre, /atelier, homepage, navbar/footer, /tocatoare, /la-comanda,
llms.txt, 5 produse din DB; garda tests/e2e/fact-check.spec.ts.
**De ce contează:** site-ul nu mai conține afirmații pe care founder-ul nu le-a confirmat;
testul împiedică revenirea lor.

## 2026-11-19 — Trecerea pe oakfantasy.ro: originea din cod, configurările din dashboard

**Pattern descoperit:** la o schimbare de domeniu, codul e partea ușoară (o singură constantă
`SITE_URL`, fără env care poate rămâne vechi); riscurile reale stau în dashboard-uri: Vercel
servea www ca primar (invers față de canonical), Supabase avea Site URL = localhost (linkul de
resetare ducea pe localhost). Ambele le-a prins un smoke LIVE (`scripts/smoke-domain.mjs`), nu
testele locale. Allow-list-ul Supabase se verifică fără inbox: `admin.generateLink` + fetch cu
`redirect: 'manual'`. Un `test:e2e:update` „verde” poate îngheța o randare stricată (baseline-uri
fără Lora) — deschide capturile înainte de commit.
**Aplicat la:** lib/site-url.ts, lib/email/resend-config.ts, next.config.js (alias vechi → 308),
tests/e2e/domain.spec.ts, scripts/smoke-domain.mjs, branch local `launch/robots-allow`.
**De ce contează:** lansarea depinde de 3 setări externe (Vercel primar, Supabase URL, Resend
domeniu) pe care codul nu le poate repara — sunt în raport ca pași ai founder-ului.

## 2026-11-19 — CSP enforce, open redirect, 404 per limbă, polish mobil

**Pattern descoperit:** (1) Un design-qa pe build de PRODUCȚIE prinde ce dev-ul ascunde: 404-ul
root se servea fără CSS (shell `__next_error__`), invizibil în `next dev`. (2) Un rewrite cu regex
pe primul segment poate rupe tot site-ul (`(?!en$)` a dat 404 pe /en/about) — orice rewrite nou
primește un test „rutele reale rămân 200”. (3) Un eșec de build intermitent (next/font/google) cere
reproducere în buclă înainte de a „repara” — prima ipoteză (fonturi duplicate) era greșită.
(4) CSP trecut în enforce doar după dovadă: 0 încălcări Report-Only live, apoi smoke-urile pică la
orice încălcare, inclusiv în admin.
**Aplicat la:** next.config.js, lib/safe-redirect.ts, app/[locale]/not-found + [...rest],
components/cart|checkout|tocatoare, app/globals.css, tests/e2e/{auth-redirect,mobile-polish}.spec.ts.
**De ce contează:** verificarea trebuie să ruleze pe forma în care rulează și clienții (build de
producție, domeniul live), nu doar pe serverul de dezvoltare.

## 2026-11-20 — Retușuri pre-lansare: stoc mixt, fonturi locale

**Pattern descoperit:** o schimbare de fapt („stocul e mixt”) atinge mai multe suprafețe decât pare:
pagini, eticheta de pe produs, checkout, email, Termeni (+ data lor), banda de cifre, llms.txt. Inventarul
făcut întâi cu grep pe formularea veche + scanarea DB, apoi o gardă e2e cu formulările interzise.
Fonturi: `next/font/local` + subset fontTools (rețeta în assets/fonts/README.md) a eliminat ultima
dependență de rețea a build-ului. La ținte de 44px în blocuri de text dens: `min-h-[44px]` + margine
negativă egală (sau padding + `-mx`) ca să nu strici ritmul vizual — design-qa a prins diferența.
**Aplicat la:** lib/fonts.ts, assets/fonts, lib/typography.ts (keepUnits), lib/no-break-ranges.tsx,
components/Footer.tsx, Terms/checkout/PDP/emails, tests/e2e/fact-check + mobile-polish.
**De ce contează:** textul de pe site rămâne adevărat și consecvent după fiecare decizie a founder-ului.

## 2026-11-20 — Lansare (robots deschis)

**Pattern descoperit:** schimbarea „de lansare” pregătită din timp pe un branch separat (commit
gata testat + testul de robots inversat în același commit) a făcut lansarea un cherry-pick fără
conflicte, urmat de o verificare live completă: robots.txt, fiecare URL din sitemap (200 + fără
noindex) și noindex pe paginile private.
**Aplicat la:** app/robots.ts, tests/e2e/domain.spec.ts, _brain/notes/SECURITY_CHECKLIST.md, journal.
**De ce contează:** orice schimbare ireversibilă „la comanda founder-ului” se pregătește ca un commit
izolat și testat, care se aplică doar la confirmare.

## 2026-11-20 — JSON-LD Product: cauza „Missing field 'image'”

**Pattern descoperit:** „câmpul X lipsește” în Google nu înseamnă neapărat că lipsește din markup —
verifică și dacă resursa e indexabilă (antete `X-Robots-Tag`). Supabase Storage trimite
`x-robots-tag: none` pe orice obiect public. Un test „200 + content-type” e verde fals; testul trebuie
să verifice exact condiția din documentație („crawlable AND indexable”). Revizia adversarială
independentă (workflow cu 3 unghiuri + verificatori) a prins cauza reală și `minValue` obligatoriu
la handlingTime, pe care documentația rezumată le ratase.
**Aplicat la:** lib/product-jsonld.ts, lib/config/{shipping,returns}.ts, lib/db/products.ts (isInStock),
app/[locale]/tocatoare/{page,[slug]/page}.tsx, tests/e2e/product-jsonld.spec.ts, scripts/validate-schema.mjs.
**De ce contează:** datele structurate se generează dintr-un singur loc, din aceleași surse ca textul
vizibil, și se validează pe toate produsele, RO + EN, nu pe un exemplu.

## 2026-11-20 — Curățenie setup Claude Code + hook de skilluri

**Pattern descoperit:** un memento scris de mână cu numere, căi și nume de pluginuri se învechește
și trimite sesiunile la skilluri care nu mai există. Textul fix rămâne generic, iar partea care
expiră stă într-un fișier cu dată (`~/.claude/skills-audit.json`, limită 30 de zile).
**Aplicat la:** `~/.claude/hooks/skills-reminder.js`, `~/.claude/skills-audit.json`, `_brain/SKILLS-MANIFEST.md`.
**De ce contează:** lista de skilluri a scăzut de la 228 la 73 fără să se șteargă nimic; rezerva e în
`C:\Users\tvarv\.claude\_disabled-2026-11-20\` (+ `settings.json.bak`), comenzile de readucere în manifest.
După fiecare audit se actualizează `lastAudit`.

## 2026-11-20 — Vercel Web Analytics: verifică în scriptul real, nu doar în documentație

**Pattern descoperit:** documentația Vercel nu spune nimic despre CSP și nici ce conține cererea trimisă.
Răspunsul a venit din sursa pachetului (`node_modules/@vercel/analytics/dist/next`) și din scriptul servit
pe site (`/_vercel/insights/script.js`): gazdele, câmpurile din cerere (`o`, `dp`, `r`), faptul că nu
scrie cookie-uri și că ignoră browserele automate (`navigator.webdriver`, „Headless” în user agent — un
smoke Playwright are nevoie de un user agent obișnuit). O funcție (`beforeSend`) nu trece dintr-un layout
server într-o componentă client → wrapper `'use client'`. Filtrul de URL e listă de permisiuni, nu listă
de interdicții: ce nu e cunoscut se raportează ca `[other]`.
**Aplicat la:** components/analytics/WebAnalytics.tsx, lib/analytics/redact-url.ts, app/[locale]/layout.tsx,
scripts/smoke-analytics.mjs, tests/e2e/analytics-redact.spec.ts, _brain/notes/web-analytics.md.
**De ce contează:** politica de confidențialitate promite că nu identificăm vizitatorii; testul și
smoke-ul țin promisiunea legată de cod. O rută publică nouă intră în `PATHNAMES`, altfel apare ca `[other]`.

## 2026-11-20 — Pagină de confirmare pentru formular: canonical moștenit, server action simulat în teste

**Pattern descoperit:** (1) O pagină nouă sub `app/[locale]` fără `alternates` proprii primește
canonical-ul și hreflang-ul HOMEPAGE-ului din layout — un test pe `link[rel=canonical]` l-a prins.
(2) Rezultatul unui server action se poate simula în Playwright fără să atingă DB-ul: `page.route` pe
POST-urile cu antetul `next-action`, răspuns `text/x-component` cu corpul
`0:["$@1",["development",null]]\n1:{json}\n` (Next 14.2, server de dev). Așa se testează și ramurile
de eroare (limită, server, validare, rețea căzută). (3) `PATHNAMES` acceptă o intrare cu două segmente
pentru `localizedPath`, dar middleware-ul traduce doar primul segment — al doilea rămâne același în
ambele limbi. (4) În dev, prima vizită pe o rută nouă se compilează: așteptările pe URL după o
navigare au nevoie de un timeout mai lung decât cele 5 secunde implicite.
**Aplicat la:** app/[locale]/la-comanda/sent/page.tsx, components/la-comanda/{CustomOrderSent,CustomOrderForm}.tsx,
lib/i18n-routes.ts, tests/e2e/la-comanda.spec.ts.
**De ce contează:** cererile la comandă se pot număra ca vizite pe un URL distinct, fără evenimente proprii.

## 2026-11-20 — Actualizare auditată de skilluri: „citit integral” se dovedește cu liste, nu se presupune

**Pattern descoperit:** (1) O afirmație de acoperire („citit integral ce s-a instalat”) se verifică
scăzând din lista fișierelor instalate listele celor citite efectiv; o revizuire independentă a găsit 117
fișiere necitite pe care le credeam acoperite prin diff și scanări. (2) Un workflow mare de audit poate
consuma limita de utilizare la jumătate: loturile se prioritizează după „ce se instalează efectiv”, restul
se raportează ca necitit. (3) Copierea manuală a unui pachet care are instalator = se imită instalatorul
pas cu pas dintr-un script propriu cu `plan`/`backup`/`install`/`verify`, iar verificarea compară octet cu
octet cu sursa auditată, admițând doar modificările documentate. (4) Scanările cu `grep -P` pentru
caractere invizibile pot da fals „zero” în Git Bash; se fac cu un script Python. (5) Înainte de a rula cod
terț: verifică dacă sesiunea e elevată (`IsInRole(Administrator)`) și spune-i founder-ului.
**Aplicat la:** `_brain/SKILLS-MANIFEST.md` (secțiunea „Actualizare auditată 20.11.2026”),
`_brain/skills-locks/claude-seo-2.6.2.txt`, `~/.claude/skills` (seo + 23 seo-*, 8 marketing).
**De ce contează:** REGULI DE FOLOSIRE, valabile în orice sesiune — vezi `_brain/SKILLS-MANIFEST.md`,
„Reguli de folosire”: nu rula `/seo flow sync`; nu adăuga subsolul publicitar al claude-seo în livrabile;
nu rula comenzi de instalare din skilluri sau din linkurile lor (`claude mcp add`, `pip install` global,
`npx` nefixat) fără acordul founder-ului. Scripturile SEO se rulează doar prin lansator, din Bash:
`"$HOME/.claude/skills/seo/scripts/claude-seo" run <script.py>`.

## 2026-11-21 — O modificare locală într-un skill terț intră în rețetă, nu doar în fișier

**Pattern descoperit:** Când schimbăm de mână un fișier instalat dintr-un pachet auditat (aici promptul
subagentului `seo-visual`), modificarea se scrie și în rețeta de instalare ca înlocuire care trebuie să se
potrivească exact o dată (`LOCAL_PATCHES` în `_brain/skills-locks/phase2.py`), apoi `verify` dovedește că
fișierul editat de mână e identic cu ce produce rețeta. Altfel următoarea actualizare o pierde în tăcere.
Regulile din manifest nu ajung la subagenți: o instrucțiune periculoasă dintr-un prompt de subagent se
repară în prompt, nu printr-o regulă scrisă în altă parte.
**Aplicat la:** `~/.claude/agents/seo-visual.md`, `_brain/skills-locks/phase2.py`,
`_brain/SKILLS-MANIFEST.md` („Modificări locale” punctul 5, „De știut”).
**De ce contează:** REGULĂ NOUĂ a founder-ului: Claude Code rulează elevat; până se lămurește, se
instalează doar skilluri terțe exclusiv markdown (fără scripturi, dependențe, hook-uri, servere MCP).
Nu se schimbă permisiuni ca ocolire. Vezi „De știut” în `_brain/SKILLS-MANIFEST.md`.

## 2026-11-21 — Audit GEO: citește HTML-ul brut, nu pagina afișată

**Pattern descoperit:** (1) Ce vede un crawler fără JavaScript se verifică pe HTML-ul descărcat cu `curl`,
nu în browser: contoarele animate pornesc de la 0 în HTML („0 modele”), iar titlurile împărțite în
`<span>`-uri fără spațiu între ele se citesc lipit („Tocătoarelucrate”). `<br/>` nu are problema.
(2) Înainte de a raporta o „contradicție cu o decizie”, caută și în comentariile din teste, nu doar în
decisions.md: adresa din Arad din `Organization` (layout.tsx) părea o scăpare, dar fact-check.spec.ts
spune că sediul social rămâne intenționat în JSON-LD și că „Arad” se verifică doar pe textul vizibil.
Am prins asta abia la verificarea finală a raportului. (3) PageSpeed Insights fără cheie are o cotă zilnică comună și
răspunde 429; varianta locală din skill (`npx lighthouse`) cade sub regula 3. (4) Într-un raport de audit,
fiecare rând se etichetează: măsurat, judecată sau afirmație a skillului nereverificată.
**Aplicat la:** `_brain/notes/geo-audit-2026-11-21.md` (liste A/B/C + recomandările skillului care
contrazic deciziile).
**De ce contează:** nimic din audit nu e implementat; listele așteaptă aprobarea founder-ului. Înainte de
orice task SEO/GEO, citește raportul și secțiunea 9 (ce NU se aplică din skilluri).

## 2026-11-21 — Reparațiile GEO: verifică pe HTML-ul servit și măsoară „fără să schimbi aspectul”

**Pattern descoperit:** (1) „Nu schimba aspectul” se dovedește cu cifre: dreptunghiurile elementului și
ale fiecărui copil, comparate între site-ul live și build-ul local la cele 4 viewporturi. La fel „nu
împinge butonul”: poziția butonului, înainte și după. (2) Un bloc nou în pagina de produs se pune în
DOM DUPĂ coloana cu butonul și se mută cu grila de la `lg` (`lg:grid-rows-[auto_1fr]`, info pe două
rânduri), nu se dublează în markup. (3) O revizuire pe mai multe unghiuri, cu verificare adversarială, a
prins ce testele mele nu vedeau: un test care trecea și pe HTML-ul vechi (scotea tagurile punând spații),
un salt 320 → 0 → 320 la reîncărcare, și capturi de bază care treceau sub pragul de 2% deși arătau „0”.
(4) O captură de bază care „trece” nu e neapărat corectă: după o schimbare de conținut, regenerează
capturile paginii atinse și deschide-le. (5) Un test care pică doar cu 3 workeri pe server rece: verifică
pe codul neatins (`git stash -u`, rulează, `git stash pop`) înainte să-l atribui modificării tale.
**Aplicat la:** components/NumbersStrip.tsx, components/product/{BuyingInfo,ProductDescription,ProductDetailContent}.tsx,
lib/product-description.ts, Hero / WorkshopSection / ProductTease / CustomOrderHero, app/[locale]/layout.tsx,
public/llms.txt, tests/e2e/geo.spec.ts.
**De ce contează:** înlocuiește intrarea de mai sus de azi: adresa din JSON-LD NU mai conține strada
(doar localitate, regiune, țară), iar A1–A6 și R1 din audit sunt implementate. Rămân A7–A11.
Orice cifră despre livrare, plată sau retur se ia din lib/config, nu se scrie în text.
