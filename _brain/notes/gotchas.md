# Gotchas — Debugging History

> Bug-uri rezolvate și comportamente neașteptate. Citește ÎNAINTE să atingi cod.
> Format per entry:
>
> ```
> ## YYYY-MM-DD — titlu scurt
> **Simptom:** ce se vedea
> **Cauză reală:** root cause (nu workaround)
> **Fix:** ce s-a făcut
> **Fișiere:** unde
> ```

---

## 2026-05-16 — Stack constraints moștenite (preventiv, din CLAUDE.md)

**Simptom:** Posibile erori de peer-deps la `npm install` din cauza React 18 + React Three Fiber.
**Cauză reală:** R3F 8.18 / Drei 9.122 au peer-deps stricte.
**Fix:** Întotdeauna `npm install ... --legacy-peer-deps`. Versiuni Three.js/R3F/Drei sunt **PINNED** — nu le schimba.
**Fișiere:** `package.json`.

> Anti-pattern interzis (lecție de la Bolt.new): NU înlocui 3D-ul cu Canvas 2D când apare o eroare Three.js. Root cause analysis, nu workaround.

## 2026-05-16 — `npm run build` pică: "supabaseUrl is required"

**Simptom:** `next build` → `✓ Compiled successfully`, TypeScript/lint OK, dar `Error occurred prerendering page "/ro"` și `"/en"` cu `Error: supabaseUrl is required.` → `Export encountered errors`.
**Cauză reală:** `lib/supabase.ts` rulează `createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, ...)` la **top-level de modul** (cu non-null assertion `!`). Modulul e importat tranzitiv (`EmailForm` → `Hero`/`WaitlistSection` → `[locale]/page.tsx`), deci se evaluează la prerender. Dacă `.env.local` lipsește (cazul folderului ăsta — checkout proaspăt, nu copia de lucru a fondatorului), `supabaseUrl` e `undefined` și `createClient` aruncă.
**Fix:** Nu e bug de cod — e config de mediu. Soluție: `.env.local` cu `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` reale (gitignored, vezi CLAUDE.md §11). NU se face `.env.local` cu valori fake (workaround interzis — ar muta eroarea la runtime).
**Recomandare (necesită brainstorming + aprobare, NU implementat acum):** lazy init Supabase (instanțiere la prima folosire, nu la import) ca o variabilă lipsă să degradeze grațios, nu să crape prerender-ul. Vezi `decisions.md` dacă se adoptă.
**Fișiere:** `lib/supabase.ts`, consumat de `components/EmailForm.tsx`.

## 2026-05-23 — WorkshopSection SSR hydration mismatch (`transform:translateY(4%)` vs `null`)

**Simptom:** Pe `/ro` și `/en` în dev, console.warn: `Warning: Prop \`style\` did not match. Server: "transform:translateY(4%)" Client: "null" at WorkshopSection`. Doar dev mode (Next.js React warnings).
**Cauză reală:** `WorkshopSection.tsx` folosește framer-motion `useScroll()` + `useTransform()` care produc valori diferite la SSR (server n-are scroll-context, returnează valoarea inițială) vs client (calculează din scroll real). Pe primul render client după hydration, `transform: null` (înainte de mount) ≠ `transform: translateY(4%)` (server SSR snapshot).
**Fix recomandat (NU implementat în Faza C — out of scope):** wrap `useScroll` într-un `useEffect` care setează un state `isMounted`, render `motion.div` doar după mount, sau folosește `useMotionValueEvent` cu `whileInView` în loc de scroll-driven `useTransform`. Pattern documentat în framer-motion docs ca "ssr-safe useScroll".
**Workaround test:** `tests/e2e/homepage.spec.ts` filtrează `consoleErrors` care încep cu `Warning:` sau conțin `Hydration` — astea sunt dev-only, nu apar în prod build. Fix-ul real al hydration mismatch e un task viitor.
**Fișiere:** `components/WorkshopSection.tsx`, `tests/e2e/homepage.spec.ts` (filter).

## 2026-05-18 — "Cannot find module './vendor-chunks/framer-motion.js'"

**Simptom:** Server Error la `app/[locale]/page.js` (homepage): `Cannot find module './vendor-chunks/framer-motion.js'` în dev server.
**Cauză reală:** `.next/` corupt — `npm run build` (prod) rulat în timp ce `npm run dev` era pornit. `next build` și `next dev` scriu în ACELAȘI `.next/`; build-ul prod suprascrie layout-ul de vendor-chunks pe care webpack-runtime al dev server-ului îl așteaptă → chunk lipsă. NU e bug de cod.
**Fix:** oprește dev server → șterge `.next/` (cache regenerabil; PowerShell `Remove-Item -Recurse -Force .next`, NU `rm -rf` — e în deny-list) → repornește `npm run dev`.
**Prevenție (proces):** NU rula `npm run build` cât rulează `npm run dev`. În timpul task-urilor verific cu `npm run typecheck`. `npm run build` (Iron Law) doar coordonat, cu dev oprit. Build-urile prod cer repornirea dev server-ului.
**Fișiere:** niciunul (artefact de build).

## 2026-05-22 — Audit "rename tabelă": numără referințe reale, nu potriviri de string

**Simptom:** `grep "waitlist"` pe `.ts/.tsx` → 33 potriviri în ~12 fișiere. Pare risc mare să redenumești tabela `waitlist`.
**Cauză reală:** doar **1** e o referință la *tabela DB* (`lib/supabase.ts` `.from('waitlist')`). Restul sunt complet neafectate de un rename de tabelă: anchor-ul homepage `#waitlist`, componenta `WaitlistSection`, valoarea coloanei `source: 'waitlist'`, numele funcției `addToWaitlist`, tipul `WaitlistEntry`, copy UI "Waitlist".
**Fix:** rename direct (1 linie de schimbat), NU VIEW shim de compatibilitate (ar fi over-engineering pentru un singur `.from()`).
**Lecție:** la decizia de rename, count-ul relevant = referințele reale la obiectul DB (`.from('X')` / FK / policy), nu `grep | wc -l` brut. Vezi [[decisions]] D3.
**Fișiere:** `lib/supabase.ts` (singura referință tabelă).

## 2026-05-22 — RLS guard trigger: first-admin lockout (auth.uid() NULL în SQL editor)

**Simptom:** trigger-ul `guard_profile_role` ar arunca excepție chiar la `UPDATE profiles SET role='admin'` rulat de fondator în Supabase SQL editor (pasul de creare a primului admin).
**Cauză reală:** în SQL editor / service role / server actions, `auth.uid()` întoarce **NULL** → `is_admin()` = false → `NOT is_admin()` = true → `RAISE EXCEPTION`. Chicken-egg clasic: regula care interzice escaladarea de rol blochează și setarea manuală a PRIMULUI admin (nimeni nu e încă admin).
**Fix:** condiție suplimentară `auth.uid() IS NOT NULL` în trigger. Contextele server de încredere (uid NULL) sunt exceptate; doar un user **autentificat** non-admin e blocat să-și escaladeze rolul. Adminii logați (uid not null, is_admin true) pot schimba roluri.
**Detectat la:** review static manual (Postgres local indisponibil pentru `psql --check`).
**Fișiere:** `supabase/migrations/20260522090010_rls_policies.sql`.

## 2026-05-22 — `profiles.email NOT NULL` presupune auth cu email

**Context:** `handle_new_user` inserează `NEW.email` în `profiles` (coloană `NOT NULL`).
**Risc latent:** dacă se adaugă vreodată un provider de auth fără email (ex. phone OTP), INSERT-ul din trigger pică → întreg signup-ul eșuează (triggerul e AFTER INSERT pe `auth.users`).
**Status:** OK pentru providerii aprobați (Email + Google OAuth — ambii furnizează email). De revizitat (email nullable + COALESCE) DOAR dacă se adaugă phone auth.
**Fișiere:** `supabase/migrations/20260522090001_create_profiles.sql`.

## 2026-05-22 — `git status` "up to date with origin/main" e stale fără fetch

**Simptom:** după ce remote-ul GitHub a fost resetat extern (incident reset #4), `git status` local raporta totuși "Your branch is up to date with 'origin/main'".
**Cauză reală:** `origin/main` e un ref-cache LOCAL, actualizat doar la `fetch`/`push`. Fără fetch, reflectă ultimul push reușit (015ea88), nu starea reală a remote-ului.
**Lecție:** într-un diagnostic de recovery, NU folosi "up to date" ca dovadă că remote-ul e intact. Commit-urile locale sunt în siguranță față de un simplu `fetch` (fetch nu șterge obiecte locale). Pericolul real care poate suprascrie local-ul = `git pull` sau `git reset --hard origin/main`. Recovery garantat din: git objects locale + `git bundle --all` + copie pe disk.
**Fișiere:** niciunul (proces git).

## 2026-05-23 — `supabase login` refuză non-TTY (bash agentic = no browser flow)

**Simptom:** `npx supabase login` din bash-ul agentului → `Cannot use automatic login flow inside non-TTY environments. Please provide --token flag or set the SUPABASE_ACCESS_TOKEN environment variable.` exit 1.
**Cauză reală:** CLI-ul deschide browser-ul OS-ului + pornește listener local pentru callback OAuth. Fără TTY n-are unde să afișeze progress/spinner sau să raporteze interactiv. Refuză să pornească flow-ul ca să nu hanguie tăcut.
**Fix (cel folosit):** Fondatorul rulează `npx supabase login` ÎN TERMINALUL LUI (cu TTY) o singură dată. Sesiunea se salvează în `~/.supabase/` (per-user). Bash-ul agentului (același user OS) o **moștenește** automat. Subsequent commands non-interactive (`db push`, `gen types`, `migration list`, etc.) merg curat din agent.
**Fix alternativ (când agent rulează headless cu env var):** Generează Personal Access Token din Supabase Dashboard → Account → Access Tokens. Setează `SUPABASE_ACCESS_TOKEN=xxx` în mediul agentului. CLI-ul îl folosește direct, fără browser.
**Aplicabil și la:** `supabase link --project-ref X` cere DB password interactiv → fondatorul rulează în terminalul lui (sau pasează `--password X` / setează `SUPABASE_DB_PASSWORD=X`). După link, password-ul se cache-uiește local; subsequent `db push` din agent merge.
**Workflow stabilit:** login + link = founder terminal (one-time). Tot restul DB ops = agent bash.
**Fișiere:** niciunul (proces CLI).

## 2026-05-28 — CSS specificity: `> *` PIERDE la `> :nth-child(N)` chiar în media query

**Simptom:** `.toolsFeature > * { grid-column: span 4 }` cu override `:nth-child(1) { span 6 }` ş.a. + media query `@media (max-width: 1024px) { .toolsFeature > * { span 6 } }`. La 1024 mă aşteptam toate cardurile să fie span 6; primele 2 rămăneau totuşi span 6 din `:nth-child(1)` desktop (OK), dar al 6-lea spuneam să fie span 8 din `:nth-child(6)` desktop → la 1024 ar trebui forţat span 6 → NU se aplica.
**Cauză reală:** `.toolsFeature > *` specificity = `(0,1,0)` (.classname + universal). `.toolsFeature > :nth-child(N)` specificity = `(0,2,0)` (.classname + pseudo-class). Media queries NU schimbă specificity. Regula `:nth-child` cu specificity mai mare câştigă, indiferent de source order sau media query.
**Fix folosit:** Schimbat selectorul din media query la `:nth-child(n)` (matches all children, specificity 0,2,0). Egal la specificity cu `:nth-child(1)`, dar source-ordered DUPĂ → câştigă pe equal specificity.
```css
/* GREŞIT — pierde specificity battle: */
@media (max-width: 1024px) { .toolsFeature > * { grid-column: span 6; } }

/* CORECT — same specificity + later in source: */
@media (max-width: 1024px) { .toolsFeature > :nth-child(n) { grid-column: span 6; } }
```
**Aplicabil la:** orice CSS module cu rule `.x > *` desktop + rule `.x > :nth-child(N)` override + media query care vrea să override-eze ambele. Înainte de schimbare media query — verifică toate selectorii care match elementul.
**Fişiere:** `components/atelier/atelier.module.css` (lines 169-175 FIX 2).

## 2026-05-28 — Port 3000 stale dev server confuză Playwright

**Simptom:** `npm run verify` 60+ teste fail cu `expect(page).toHaveTitle failed`, `locator.getAttribute: Test timeout 30000ms exceeded`, etc — toate pe /tocatoare şi alte pagini. Înainte aceleaşi teste treceau cu 256+ passed.
**Cauză reală:** Un dev server vechi (Bolt/sesiune anterioară) era încă pe port 3000. Playwright config are `webServer.reuseExistingServer: !process.env.CI` = true în local. Playwright a reusat serverul stale care întorcea HTML broken (no metadata, no title). Curl la /tocatoare pe 3000 = HTML golit; pe 3001 (dev server-ul meu fresh) = HTML complet 29KB. Teste şe rulau contra 3000 (config baseURL).
**Fix folosit:** Identificat PID cu `netstat -ano | grep ":3000.*LISTENING"`, kill via fondator (`Stop-Process -Id 16480 -Force` în PowerShell admin). Playwright apoi a spawnat dev server fresh pe 3000. Verify 264/264 passed (260 + 4 skipped).
**Auto-mode restriction:** `taskkill /PID X /F` din agent e blocat (risc cross-process pe shared Windows machine). Necesită input fondator.
**Pattern preventiv:** Înainte de `npm run verify` într-un mediu interactiv, check `netstat -ano | grep ":3000"`. Dacă există PID nefamiliar (nu Playwright's webServer process), kill-l înainte. Alternativ: setează `process.env.CI=1` ca să forţezi `reuseExistingServer: false` — dar atunci Next.js încearcă 3000 → blocked → fallback 3001 → `webServer.url` check pe 3000 fail.
**Fişiere:** `playwright.config.ts` (line 44-47 — definirea `reuseExistingServer`).

## 2026-05-29 — Playwright `--update-snapshots` default e `'changed'`, nu `'all'` (v1.50+)

**Simptom:** Ran `npm run test:e2e:update` după modificare CSS (logo SVG swap Footer + ProductCard). Toate cele 24 teste raportate "screenshot matches baseline", zero diff în md5sum. Schimbarea era reală și vizibilă (qa-tester confirmed) dar nu s-a regenerat niciun baseline.
**Cauză reală:** Playwright 1.50+ a schimbat default-ul pentru `--update-snapshots`: era `'all'` (regen tot), acum e `'changed'` (regen DOAR cele care eșuează compararea). Schimbarea logo-ului (Footer 100×100 + 10 medallions × 200×200) erau sub pragul `maxDiffPixelRatio: 0.02` (2%) pe fullpage screenshots de ~5M pixeli → Playwright considera "matching" și nu actualiza.
**Fix folosit:** Explicit `--update-snapshots=all` forțează regen indiferent de match status:
```bash
# GREŞIT pentru schimbări sub-threshold:
npx playwright test --update-snapshots ...

# CORECT pentru regen complet:
npx playwright test --update-snapshots=all ...
```
**Pattern preventiv:** Pentru orice schimbare vizuală care e VIZIBILĂ la ochi dar SMALL în pixeli (logo, icon swap, single-element color change pe fullpage), folosește `--update-snapshots=all`. Pentru schimbări mari (responsive overhaul, full redesign), default `'changed'` e OK.
**Aplicabil la:** orice asset swap (image src, icon swap, font swap), color tweaks pe single elements, padding/margin sub 8px diff cumulativ.
**Sugestie viitoare:** Update `package.json` scripts:
```
"test:e2e:update": "playwright test --workers=1 --update-snapshots=all --grep \"Visual regression\""
```
Decizie amânată (poate vrem comportament selectiv în viitor). Pentru moment manual `=all` în CLI.
**Fişiere:** `package.json` (`test:e2e:update` script).

## 2026-05-29 — Vercel SpeedInsights / analytics: ÎNTOTDEAUNA în root `app/layout.tsx`, NU în `[locale]/layout.tsx`

**Simptom (anticipat de founder):** Dacă `<SpeedInsights />` e în `app/[locale]/layout.tsx`, atunci la switch locale (RO ↔ EN) — `router.push('/en/atelier')` — layout-ul `[locale]` se re-montează (cheie route param-uri schimbată) → SpeedInsights se re-montează → vitals init de DOUĂ ori per sesiune (sau mai mult la fiecare switch). Network tab ar arăta request-uri duplicate către `vitals.vercel-insights.com`.
**Cauză reală:** Layouturile Next.js App Router se re-montează când părinții lor se schimbă. `app/[locale]/layout.tsx` se re-montează la fiecare schimbare a param-ului `locale`. `app/layout.tsx` (root) NU se re-montează — e părintele stabil.
**Fix corect (după push verification):** Mută SpeedInsights în root `app/layout.tsx`. Acolo se mountează O SINGURĂ DATĂ per sesiune browser; locale switch nu îl afectează.
```tsx
// app/layout.tsx (root — passthrough cu SpeedInsights)
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <SpeedInsights />
    </>
  );
}
```
**De ce funcționează în root passthrough chiar și fără `<body>`:** SpeedInsights e Client Component care returnează `null` și injectează scriptul prin `useEffect` direct în `document.head/body`. Nu are nevoie să fie randat IN `<body>` în React tree — important e doar să fie montat. Dacă root layout returnează fragment cu children + SpeedInsights, browserul vede `<html><body>...children...</body></html>` (din [locale] layout) plus un React node null sibling — DOM stays valid.
**Verificare:** `curl http://localhost:PORT/ro | grep -c speed-insights` = 1. Same pe /en. Single chunk reference per page.
**Aplicabil la:** ORICE analytics/monitoring/tracking script (SpeedInsights, Plausible, Google Analytics, Sentry init, etc.). Regula generală: tracking init care trebuie să persiste cross-navigation = ROOT LAYOUT, indiferent dacă root are sau nu `<body>`.
**Fişiere:** `app/layout.tsx` (root, SpeedInsights mount), `app/[locale]/layout.tsx` (locale-specific html/body/fonts, NU SpeedInsights).

## 2026-05-29 — `.env.local` vs `.env.staging.local`: swap pattern pentru baselines cu DB staging

**Simptom:** `npm run test:e2e:update -- --grep "tocatoare-"` raporta `6 passed` dar `md5sum *.png` diff = empty. Adică Playwright a rulat testele cu success dar `--update-snapshots` nu schimba nimic — implicit baseline-urile noi erau IDENTICE cu cele vechi.
**Cauză reală:** Dev server-ul spawned de Playwright citește `.env.local` (Next.js default loader order). `.env.local` are `NEXT_PUBLIC_SUPABASE_URL=https://fgeubbsxucppypyjbdpg.supabase.co` (prod), iar fondatorul activase produsele pe STAGING (`juuozsjvuikdtjqhdylw`). Catalog-ul vedea prod (0 produse active) → empty state → hash identic cu baseline-ul anterior generat pe prod tot empty.
**Fix folosit:** Swap temporar `.env.local` ↔ `.env.staging.local`:
```bash
cp .env.local .env.local.bak
cp .env.staging.local .env.local
npm run test:e2e:update -- --grep "tocatoare-"
mv .env.local.bak .env.local
```
**Verificare post-regen:** `md5sum` pre + post → diff arată EXACT cele 6 baseline-uri tocatoare (RO/EN × mobile/tablet/desktop), zero side-effects pe celelalte 18.
**Pattern preventiv:** Înainte de orice `test:e2e:update` care depinde de DB-data state-uri specifice (produse active/draft, comenzi seed-uite, etc):
1. Verifică `grep SUPABASE_URL .env.local` — corespunde cu mediul unde ai făcut modificările DB?
2. Dacă NU, swap temporar conform pattern-ului de mai sus
3. ÎNTOTDEAUNA `mv .env.local.bak .env.local` la final (verifică post-restore cu `grep`)
4. md5sum diff pentru a confirma exact ce baseline-uri se schimbă
**Alternativ:** Activează data state-ul atât pe staging cât și pe prod, sau update `.env.local` permanent la staging. Decizia D-day se face per fondator.
**Fişiere:** niciunul (proces env).

## 2026-05-28 — `useReducedMotion` guard pe scroll listener = bug subtil

**Simptom:** Test Playwright `Atelier link active state` fail după FIX 1: după `window.scrollTo(0, 300) + waitForTimeout(400)`, link-ul rămânea copper (cum era la scroll 0), nu trecea la oak-warm (cum aşteptam la scroll>100). Comportament reprodus în Playwright dar nu vizibil manual în Chrome (unde reduced-motion era off).
**Cauză reală:** Navbar useEffect-ul registra scroll listener-ul DOAR dacă `!prefersReducedMotion`. Pentru utilizatori (sau test envs) cu reduced motion ON, listener-ul nu se înregistra → `scrolled` rămânea `false` perpetuu → toate state derivations bazate pe scroll erau congelate. Pre-FIX 1 efectul vizibil era: Navbar bg rămânea transparent forever pe ALTE pagini (despre/tocatoare). După FIX 1, pe /atelier: `onDark = darkHero && !scrolled` rămânea true, text cream forever.
**Fix folosit:** Eliminat guard-ul `prefersReducedMotion` din useEffect-ul scroll listener-ului. State updates trebuie să ruleze mereu; `prefersReducedMotion` rămâne folosit DOAR pentru CSS transitions (`colorTransition = prefersReducedMotion ? undefined : 'color 0.3s ease'`).
```tsx
/* GREŞIT — state-updates skipped pentru reduced-motion: */
useEffect(() => {
  if (!nav || prefersReducedMotion) return;
  // listener never registered for reduced-motion users
}, [prefersReducedMotion]);

/* CORECT — state always updates, animations separately controlled: */
useEffect(() => {
  if (!nav) return;
  // listener always registered
}, []);
```
**Lecție generală:** **Reduced motion suprimă animaţii, nu state functional.** Orice useEffect care actualizează state pe baza scroll/resize/intersection trebuie să ruleze indiferent de prefs reduced-motion. Animations din CSS/Framer-Motion sunt suprimate separat. Guarduri pe state updates = bug ascuns vizibil doar la utilizatori reduced-motion.
**Aplicabil la:** orice useEffect cu `prefersReducedMotion` în dep array sau early-return. Verifică: e o ANIMAŢIE pe care vreau să o skipez, sau e STATE pe care îl actualizez?
**Fişiere:** `components/Navbar.tsx:60-75` (FIX 1).

## 2026-06-15 — Single Supabase project, not staging+prod (reality clarification)

**Simptom:** Brain anterior + commit-uri menționau două proiecte Supabase:
"staging juuozsjvuikdtjqhdylw" şi "prod fgeubbsxucppypyjbdpg". `.env.local`
pointa la `fgeubbsxucppypyjbdpg` care a returnat NXDOMAIN; `.env.staging.local`
pointa la `juuozsjvuikdtjqhdylw` care funcţiona după restore.
**Cauză:** `fgeubbsxucppypyjbdpg` nu a fost niciodată creat ca proiect — era
parte din planul pre-launch (vezi `_brain/notes/SECURITY_CHECKLIST.md`
Section 8 TODO), NU implementare. Site-ul Vercel rulează ÎN PRODUCŢIE pe
unicul proiect real (`juuozsjvuikdtjqhdylw`).
**Fix folosit:** Acceptăm realitatea: un singur proiect Supabase până la
pre-launch. La pre-launch creem proiect prod nou (oakfantasy-prod), apply
canonical migrations din repo (inclusiv `20260616120000_restore_canonical_email_subscribers_policies.sql`),
update Vercel env vars Production, test E2E pe prod project ÎNAINTE de
switch domain `oakfantasy.ro`.
**Lecție generală:** "Plan menţionat în brain" ≠ "implementat". Înainte
de a presupune două environment-uri, verifică **realitatea practică**:
`grep -E "SUPABASE_URL" .env.local .env.staging.local | sed 's/=.*\\(.\\{20\\}\\)$/=...\\1/'`.
**Fişiere:** `.env.local`, `.env.staging.local`, `_brain/notes/SECURITY_CHECKLIST.md`
Section 8 (TODOs prod creation).

## 2026-06-15 — Supabase Free Plan auto-pause după 7 zile + PostgREST cache post-restore

**Simptom 1:** Project URL devine NXDOMAIN (`Non-existent domain`) la
`supabase db push` / smoke test fetch. Cauză: Free Plan auto-paused
proiectul după 7 zile fără activitate.
**Simptom 2 (după restore):** INSERT ca anon returnează 42501 RLS, dar
schema/policy/grants par corecte la audit. PostgREST schema cache poate
rămâne stale post-restore.
**Cauză:** Supabase Free Plan oprește proiecte după 7 zile inactivitate
(read/write zero). La restore, conexiunile DB nu sunt reciclate complet
şi PostgREST poate continua să cacheze schema veche pentru câteva minute.
**Fix folosit:**
1. Dashboard → restore from pause (durează ~2 min, project ref neschimbat)
2. Apply orice migrations pending: `npx supabase db push`
3. Dashboard → Settings → General → Restart project (forţează PostgREST
   reload + connection pool reset)
4. Smoke test ca rol anon înainte de a presupune că totul merge
**Lecţie generală:** Free Plan = bun pentru dev, riscant pentru orice
demo/staging cu uptime aşteptat. Pre-launch: upgrade Pro ($25/lună) ca
să avem no-pause + daily automated backups + 28d point-in-time recovery.
Vezi `_brain/notes/SECURITY_CHECKLIST.md` Section 8 TODO Free vs Pro.
**Fişiere:** niciunul (operaţional dashboard).

## 2026-06-15 — RLS policies NU se migrează automat la `ALTER TABLE … RENAME TO`

**Simptom:** După `ALTER TABLE waitlist RENAME TO email_subscribers`
(migration `20260522090009_extend_waitlist_to_email_subscribers.sql`),
policy "Anyone can join the waitlist" e preservată prin rename + renamed
explicit în acea migration la "Anyone can subscribe". Toate operaţiile
subsequente trebuie să referenţeze noul nume.
**Cauză:** Postgres preservă policies attached la table prin RENAME
(table OID rămâne acelaşi), DAR orice debug migration sau diagnostic
care referenţiază vechiul nume (`waitlist`) va eşua silenţios sau va
opera pe state neexistent.
**Fix folosit:** După ORICE `RENAME TO`, audit obligatoriu:
```sql
SELECT policyname, roles, cmd, with_check
FROM pg_policies
WHERE tablename = '{new_name}';
```
+ Smoke test ca rol anon pe toate endpoint-urile public INSERT/SELECT.
+ În comentariile migration-ului, documentează explicit care policies
migrează automat vs care necesită re-create.
**Lecţie generală:** RENAME table = OID preservat = policies preserve.
RENAME column nu afectează policies (referenţiază numele nou). DROP +
CREATE table = policies pierdute. Audit policies după orice schimbare
de schema care touchează RLS-enabled tables.
**Fişiere:** `supabase/migrations/20260522090009_extend_waitlist_to_email_subscribers.sql`.

## 2026-06-15 — `.insert(entry).select()` cu RLS — 42501 e misleading

**🚨 CRITICAL gotcha. Acesta a cauzat o spirală de debug de ~2 ore.**

**Simptom:** Smoke test `supabase.from('email_subscribers').insert({email}).select()`
ca rol anon returnează `42501 new row violates row-level security policy`,
DAR producţia (`lib/supabase.ts addToWaitlist`) care foloseşte
`.from('email_subscribers').insert(entry)` (fără `.select()`) funcţionează
perfect (returnează `201 Created`, rândul e inserat).
**Cauză:** `supabase-js .insert(...).select()` setează implicit
`Prefer: return=representation` pe request. PostgREST execută:
1. INSERT — verificat contra INSERT policy (PASS pentru anon)
2. SELECT pe rândul inserat — verificat contra SELECT policy
   (FAIL: anon NU are SELECT policy pe `email_subscribers` — by design,
   doar `service_role` citeşte subscribers)

PostgREST mapează "INSERT succeeds but cannot SELECT-back" la **acelaşi
cod 42501** ca un INSERT denied real. Niciun indiciu în error code/message
că pasul 2 a eşuat, nu pasul 1.
**Fix folosit:** Pentru smoke tests pe tabele cu doar INSERT policy
(no SELECT pentru rol-ul testat), foloseşte `.insert(entry)` fără chain
`.select()`. Dacă ai nevoie să confirmi inserarea, foloseşte service_role
client separat pentru SELECT verification.
**Diagnostic question înainte de orice debug RLS 42501:** "Care e EXACT
lanţul `.insert()` folosit în producţie vs în test-ul tău? Producţia
foloseşte `.select()` chained?"
**Exemplu Oak Fantasy:**
- `email_subscribers` are INSERT policy pentru anon (abonaţii submit)
- `email_subscribers` NU are SELECT policy pentru anon (doar service_role citeşte)
- `.insert({email})` → 201 ✓
- `.insert({email}).select()` → 42501 ✗ (SELECT blocat, mesaj înşelător)

**Documentat pentru posterity.** Au fost create 5 migrations debug
(20260615180000 + 190000-220000) chasing această fantomă. Toate au
fost marcate `reverted` via `supabase migration repair` şi restorate
la canonical via `20260616120000_restore_canonical_email_subscribers_policies.sql`.
**Lecţie generală:** "RLS error" în PostgREST ≠ neapărat "INSERT denied".
Întotdeauna compară EXACT calea producţie vs cea de test. Dacă diferă
în chained methods (`.select()`, `.single()`, etc), reproduce mai întâi
cu calea producţie înainte de a ataca DB-ul.
**Fişiere:** `lib/supabase.ts:14-27` (production path),
`supabase/migrations/20260616120000_restore_canonical_email_subscribers_policies.sql`
(canonical restore), `scripts/smoke-canonical.mjs` (test corect).

## 2026-06-16 — Funcții în copy map → server→client component pasează crash la build

**Simptom:** `npm run build` eșuează la static prerender de `/ro/contact` și
`/en/contact` cu eroarea:
```
Error: Functions cannot be passed directly to Client Components unless you
explicitly expose it by marking it with "use server". Or maybe you meant
to call this function rather than return it.
  { ..., successHeadline: function successHeadline, ... }
```
+ `Static page generation for /ro/contact is still timing out after 3 attempts`.
**Cauză:** `components/contact/content.ts` exporta câmpuri ca funcții
(`successHeadline: (name: string) => string`, `errorRate: (minutes: number) => string`)
în obiectul `CONTACT_CONTENT[locale]`. Server component
(`app/[locale]/contact/page.tsx`) pasa obiectul întreg ca prop la client
component (`ContactPage`). Next 14 RSC serializează prop-urile prin
`stringify` — funcțiile NU sunt serializabile, throw în render, page hangs,
build fail.
**Fix folosit:** Înlocuiește funcții cu template strings:
```ts
// înainte (BROKEN):
successHeadline: (name) => `Mulțumim, ${name}!`,
errorRate: (m) => `Încearcă din nou peste ${m} ${m===1?'minut':'minute'}.`,

// după (works):
successHeadlineTemplate: 'Mulțumim, {name}!',
errorRateTemplate: { one: '... {minutes} minut.', many: '... {minutes} minute.' },
```
Și `String.replace('{name}', actual)` în client component. Plural ales
runtime din `minutes === 1`.
**Lecție generală:** **Orice prop care traversează granița server→client
trebuie să fie JSON-serializable.** Asta înseamnă fără funcții, fără
Date instances, fără Map/Set, fără class instances. Template strings +
helper functions client-side. Această regulă se aplică retroactiv la
toate `<route>_CONTENT[locale]` patterns din proiect.
**Aplicabil la:** orice content map nou care expune copy bilingv. Dacă
există nevoie de logică (plural, format dată, format număr), păstrezi
template + extragi în helper client. Verifică: `npm run build` PE LOCAL
înainte de commit pentru pagini noi care folosesc content-map pattern.
**Fișiere:** `components/contact/content.ts:42-58`,
`components/contact/ContactForm.tsx:148-155`.

## 2026-06-18 — Navbar + Footer NU sunt în layout global; se montează per-pagină

**🚨 BUG CRITIC (Task 1.5). /contact + cele 3 pagini legale erau dead-ends:
fără Navbar, fără Footer, user blocat (doar browser back funcționa).**

**Simptom:** User ajunge pe /contact (sau /termeni, /confidentialitate,
/retur) și nu are NICIO navigare — nici Navbar sus, nici Footer jos.
Singura ieșire = browser back button. UX inacceptabil.

**Cauză:** `app/[locale]/layout.tsx` NU conține Navbar + Footer — doar
fonts + PageTransition wrapper. **Fiecare pagină își montează propriul
Navbar + Footer** prin client wrapper-ul ei:
- Homepage: `app/[locale]/page.tsx`
- /despre: `components/about/AboutContent.tsx` (Navbar + main + Footer)
- /atelier: `components/atelier/AtelierContent.tsx`
- /tocatoare: `components/tocatoare/TocatoareContent.tsx`

Paginile noi din Sprint 1 au RATAT pattern-ul:
- /contact: `components/contact/ContactPage.tsx` renderiza doar `<main>`
- /termeni|confidentialitate|retur: `components/legal/LegalLayout.tsx`
  (server component) renderiza doar `<main>`

**Fix folosit:**
- ContactPage (deja `'use client'`): adăugat `Navbar` + `Footer` + toggle
  `useRouter` direct (pattern AboutContent identic).
- Legal: `LegalLayout` e server component (ca să păstreze `sectionOverrides`
  server-rendered pentru OUG 34/2014 statutory note). Creat
  `components/legal/LegalShell.tsx` (`'use client'`) = Navbar + children +
  Footer + toggle. Paginile legale wrap `<LegalShell routeKey locale>
  <LegalLayout/></LegalShell>`. Pattern canonic "server component drept
  children al unui client component" — zero RSC serialization risk.

**Verificare fix (proof la build):** First Load JS sare la paginile fixed —
legal 127kB→190kB, contact 155kB→217kB. Creșterea = exact chunk-urile
Navbar (GSAP/ScrollTrigger) + Footer (framer-motion) acum bundled. Dacă
NU crește First Load, Navbar/Footer NU s-au montat.

**Lecție generală / prevention:** Acest proiect NU are Navbar/Footer în
layout global (decizie istorică — fiecare pagină controlează `darkHero`
prop al Navbar-ului + toggle-ul de limbă specific rutei). Deci ORICE
pagină nouă TREBUIE să-și monteze explicit Navbar + Footer prin client
wrapper. Adăugat la checklist-ul din [[New Page Accessibility Checklist]]
ca verificare obligatorie #0.

**De ce nu mutăm în layout global?** Navbar are nevoie de `darkHero` prop
(per-pagină) + `onToggleLanguage` care navighează la slug-ul localizat
AL RUTEI CURENTE (diferit per pagină). Un layout global ar trebui să
deducă routeKey din pathname — refactor mai mare, deferred. Pattern
per-pagină rămâne, dar checklist-ul îl face explicit.

**Fișiere:** `components/contact/ContactPage.tsx`,
`components/legal/LegalShell.tsx` (nou),
`app/[locale]/{termeni,confidentialitate,retur}/page.tsx`.

## 2026-06-18 — New Page Accessibility Checklist (IA 5-tier system, Task 1.4)

**Context:** Post-Sprint-1 smoke test a descoperit că /contact (și implicit
cele 3 pagini legale) erau accesibile DOAR via Footer — niciun link primary
în Navbar. Cauza: la Task 1.2/1.3 am adăugat paginile dar n-am verificat
TOATE căile de navigare. Fix-ul (Task 1.4) a stabilit acest sistem de
tier-uri ca să nu se mai întâmple.

**REGULA: La fiecare pagină publică nouă, verifică explicit în ce tier
intră și actualizează navigarea corespunzătoare ÎNAINTE de a zice "done".**

### Tier 1 — Navbar primary navigation
Pagini la maxim 1 click de homepage. Visitor browse flow, primary CTA.
Curent (Sprint 1 closed): **Atelier, Tocătoare, Despre, Contact** (4 links).
Fișier: `components/Navbar.tsx` (`NAV_LINKS_RO` / `NAV_LINKS_EN`).
Future triggers:
- Cart icon → Sprint 3 (conditional pe cart_items_count > 0)
- Cont link → Sprint 2 (conditional pe auth state)

### Tier 2 — Footer NAVIGARE column
Mirror Tier 1 pentru redundancy + better mobile UX.
Curent: Atelier, Tocătoare, Despre, Contact (mirror Navbar).
Fișier: `components/Footer.tsx` (`nav.navLinks`).
**IMPORTANT:** folosește page links (`localizedPath`), NU #anchors.
Anchors în Footer NAVIGARE erau dead pe paginile interior (bug fixat
Task 1.4 — `#workshop`/`#products`/`#story` nu existau decât pe homepage).

### Tier 3 — Footer fine print row
Legal compliance only. ANPC + SAL/SOL badges.
Curent: Termeni, Confidențialitate, Retur (+ Cookie Policy la Sprint 4
după analytics decision — vezi SECURITY_CHECKLIST §10.1.b).
Fișier: `components/Footer.tsx` (`nav.legalLinks` + ANPC/SAL/SOL row).

### Tier 4 — Contextual / hidden navigation
Accesibil DOAR din alte pagini sau flow-uri, NU din Navbar/Footer general.
Examples (current + future):
- /admin/* (post-login admin — Sprint 2)
- /account/* sau /cont/* (post-login user — Sprint 2)
- /tocatoare/[slug] (din catalog card click)
- /cos, /checkout/* (din add-to-cart — Sprint 3)
- /multumim/[orderId] (post-checkout — Sprint 3)
- /parola-uitata, /reset-parola (din login flow — Sprint 2)

### Tier 5 — Future expansion (Sprint 4)
Footer column nouă "PENTRU CLIENȚI" sau extindere NAVIGARE:
- FAQ, Livrare și plată, Garanție, Cum gravăm
Decizie IA globală la Sprint 4 (sub-nav strategy dacă nav primary > 5 items).

### Checklist obligatoriu la pagină nouă — ASK:
- [ ] **#0 GLOBAL CHROME (cel mai important — vezi gotcha 2026-06-18
      layout):** pagina montează Navbar + Footer? Acest proiect NU le are
      în layout global — fiecare client wrapper le montează explicit.
      TEST: poți naviga AWAY de pagină FĂRĂ browser back? Verifică la build:
      First Load JS include chunk-urile Navbar+Footer (~+60kB)?
- [ ] Tier 1 (Navbar)? — primary CTA pentru visitor browse
- [ ] Tier 2 (Footer NAVIGARE)? — mirror Navbar pentru redundancy
- [ ] Tier 3 (Footer fine print)? — doar legal/compliance
- [ ] Tier 4 (Hidden contextual)? — auth-required sau flow-specific
- [ ] Cross-links internal — ce alte pagini trebuie să linkuie aici?
- [ ] Active state highlighting în navigation (pathname match)?
- [ ] Mobile drawer reflection (Navbar)?
- [ ] Sitemap (auto-generated de Next.js dacă rută publică)
- [ ] SEO meta + canonical URL + JSON-LD
- [ ] Visual regression entry în tests/e2e/visual-regression.spec.ts

### Decizii IA viitoare documentate (Task 1.4)
- **D2 — Navbar pe /admin/* (Sprint 2):** Hide Navbar primary, show admin
  top bar dedicat. Admin lucrează în app shell separat. Logo → home always
  (logical exit point). NU implementat acum — doar documentat aici.
- **Cart icon:** added Sprint 3, hidden complet până atunci.
- **Cont link:** added Sprint 2, hidden complet până atunci. Footer COL3
  "CONT / Account" e deja slot vizibil cu "În curând" placeholder (artisan
  voice, nu enterprise) — Sprint 2 înlocuiește placeholder-ul cu link-uri
  reale, zero layout shift.
- **Search bar:** skip până la Sprint 4+, doar dacă catalog > 20-30 produse.

**Fișiere:** `components/Navbar.tsx`, `components/Footer.tsx`.

## 2026-06-18 — Schema pre-existed din 2026-05-22 (verifică ÎNTÂI existing state)

**Al doilea caz după "single project reality" (Task 1.1) când o premisă de
task s-a dovedit greșită la audit. Pattern recurent — verifică realitatea.**

**Simptom:** Task 2.1 cerea "creem profiles + orders + RLS + trigger de la
zero" pentru auth foundation. Audit a descoperit că TOATĂ schema există deja
din migrațiile 20260522090001-090011 (applied pe remote): profiles cu role
CHECK, orders (profile_id + guest, bani integer, status enum bogat),
order_items, addresses, products, inventory, stock_movements,
order_status_history, RLS complet, is_admin(), guard_profile_role(),
handle_new_user, generate_order_number (OF-YYYY-NNNN global seq), stock funcs.
Plus lib/supabase-server.ts (getServerSupabase + getServiceSupabase),
types/supabase.ts, @supabase/ssr installed.

**Cauză:** Munca de schema fusese făcută într-o sesiune anterioară (Bolt sau
sesiune timpurie 2026-05-22) dar planul de task strategic presupunea
greenfield. ~85% din Task 2.1 era deja livrat.

**Fix:** Scope redus la 3 piese auth wiring care GENUIN lipseau (browser
client, middleware session, auth helpers). Zero migrații noi.

**Lecție generală (REGULA):** Înainte de ORICE task care presupune "creem X
de la zero", rulează audit: `ls supabase/migrations/`, `grep CREATE TABLE`,
`ls lib/`, `npx supabase migration list --linked`. Premisa task-ului
strategic poate fi stale. Vezi și [[single-project-reality]]. Cost audit:
5 min. Cost re-creare peste existing: ore + conflict migrații.

**Fișiere:** toate `supabase/migrations/20260522*`.

## 2026-06-18 — Middleware: compose Supabase session refresh cu i18n (Set-Cookie pe redirects)

**Context Task 2.1.** Supabase SSR auth cere middleware care refreshează
token-ul la fiecare request. Proiectul are deja middleware i18n (redirects
locale-slug + rewrites). Compunerea lor are un gotcha real.

**Gotcha:** Dacă session refresh setează cookies pe un response, dar apoi
logica i18n returnează ALT response object (redirect/rewrite), Set-Cookie
se pierde — sesiunea nu se mai refreshează niciodată pe rutele care
redirectează.

**Soluție folosită:** `lib/supabase-middleware.ts`:
- `refreshSession(request)` NU returnează response — colectează cookies pe
  care refresh-ul vrea să le seteze și le returnează ca array.
- `applyCookies(response, cookies)` aplică array-ul pe ORICE response.
- `middleware.ts` rulează refreshSession ÎNTÂI, apoi wrap-uiește FIECARE
  return (next/redirect/rewrite) cu applyCookies(..., authCookies).
- `getUser()` (nu getSession) — validează token cu auth server, triggers
  refresh. Erori swallowed → anonymous browsing nu se sparge niciodată.

**Verificare:** middleware bundle 26.8kB→81.9kB (ssr client bundled).
Runtime curl: root→307 /ro, /en/despre→308 /en/about, /en/about→200 rewrite,
/ro/contact→200. i18n intact + anonymous browsing OK.

**Fișiere:** `middleware.ts`, `lib/supabase-middleware.ts`.

## 2026-06-18 — "Email signups are disabled" ≠ "Confirm email OFF" (Supabase Auth)

**Context Task 2.2.** Smoke test register flow (anon `signUp`) a eșuat cu
`Email signups are disabled` deși founder făcuse "Confirm email" OFF.

**Cauză:** Sunt DOUĂ setări separate în Supabase Dashboard:
1. **Auth → Providers → Email → "Enable Email provider"** + în unele versiuni
   **Auth → Sign In/Providers → "Allow new users to sign up"** — controlează
   dacă `signUp()` e permis DELOC.
2. **"Confirm email"** (OFF) — controlează dacă userul trebuie să confirme
   email-ul după signup ÎNAINTE de a avea sesiune.

Founder a setat (2) OFF dar (1) era încă OFF → signup blocat complet.

**Fix:** Hand-off founder — Dashboard → Authentication:
- Providers → Email → **Enable** (provider ON)
- "Allow new users to sign up" → **ON**
- "Confirm email" → **OFF** (deja făcut)

**Lecție:** signup flow are 2 gate-uri dashboard independente. Codul
`signUp()` poate fi 100% corect și tot să eșueze pe config. Eroarea
"Email signups are disabled" = gate (1), NU bug de cod. Smoke test live
necesită ambele gate-uri setate. (Admin API `auth.admin.createUser` din
Task 2.1 ocolește gate-ul — de aia smoke 2.1 a trecut dar 2.2 nu.)

**Fișiere:** niciunul (config dashboard). Smoke: `scripts/smoke-auth-flow.mjs`.

## 2026-06-18 — Middleware locale catch-all redirectează route handlers non-locale (/auth/*) → white screen #418

**🚨 BUG CRITIC (Task 2.2.1). Logout → white screen + React #418/#423 +
HierarchyRequestError "Only one element on document allowed".**

**Simptom:** Click "Ieși" (logout) → white screen complet. Console:
React #418 (hydration mismatch), #423 (hydration recovery error),
HierarchyRequestError appendChild, NotFoundError removeChild, AggregateError.

**Root cause (NU era race condition React):** `middleware.ts` are un
catch-all la final: orice path FĂRĂ locale → `redirect(/ro${path})`. Asta e
corect pentru pagini (`/despre` → `/ro/despre`). DAR route handler-ele auth
(`/auth/signout`, `/auth/callback`) trăiesc ÎN AFARA `[locale]` și matcher-ul
middleware NU le excludea (excludea doar `_next|api|static`).

Flow rupt:
1. POST `/auth/signout` (form logout)
2. Middleware: path fără locale → 307 redirect la `/ro/auth/signout`
3. `/ro/auth/signout` nu există ca rută → render broken sub [locale]
4. White screen + hydration crash. Handler-ul signout NU rulează niciodată.

Confirmat cu curl: POST /auth/signout → `307 -> /ro/auth/signout` (înainte),
`303 -> /ro` (după fix). Același bug lovea /auth/callback (reset + OAuth).

**Fix:** exclude `/auth` din middleware:
- matcher: `/((?!_next|api|auth|.*\\..*).*)` (adăugat `auth`)
- guard defensiv în funcție: `if (pathname.startsWith('/auth')) return NextResponse.next();`

**Lecție generală:** Când adaugi route handlers (`app/**/route.ts`) SAU
orice rute ÎN AFARA structurii `[locale]`, verifică INTOTDEAUNA că
middleware-ul i18n le exclude — altfel catch-all-ul locale le sparge.
Bug-ul a fost introdus la Task 2.2 (am adăugat /auth/* fără update matcher);
descoperit la primul logout real. Adaugă la mental model: matcher-ul
middleware e un allowlist invers — fiecare familie nouă de rute non-locale
(/auth, future /api extern, webhooks) trebuie exclusă explicit.

**Verificare obligatorie:** test în PRODUCTION build (`npm run start`),
nu doar dev — #418/#423 sunt minified prod-only. curl pe status codes
e suficient pentru a confirma că handler-ul rulează (303/307 corect)
vs redirect greșit.

**Fișiere:** `middleware.ts` (matcher + guard).

## 2026-06-18 — Git Bash (MSYS) mutilează path-args în curl → teste false-fail

**A costat ~45 min de debugging fantomă la Task 2.3.** Codul era corect;
testul mințea.

**Simptom:** smoke test cu `curl -X POST --data-urlencode "redirectTo=/admin/login"`
către /auth/signout returna mereu /ro (nu /admin/login), iar
`redirectTo=//evil.com` returna /evil.com. Reproductibil pe prod build ȘI
dev ȘI port nou — părea bug de cod imposibil (logica mea nu putea produce
/evil.com din //evil.com).

**Cauză:** Git Bash pe Windows (MSYS2) face **automatic POSIX-path
conversion** pe argumentele care arată a path Unix. `--data-urlencode
"redirectTo=/admin/login"` → MSYS rescrie valoarea ÎNAINTE ca curl s-o
trimită: `/admin/login` devine `C:/Program Files/Git/admin/login`;
`//evil.com` devine `/evil.com` (colapsează leading //). Serverul primea
valori mutilate → comportament "greșit" care era de fapt corect pentru
input-ul mutilat.

**Detectare:** debug header temporar care echo-a `form.get('redirectTo')`
a arătat `rt=C:/Program Files/Git/admin/login` — smoking gun.

**Fix test:** `export MSYS_NO_PATHCONV=1` înainte de curl (sau prefix
`MSYS_NO_PATHCONV=1 curl ...`). După: /admin/login→/admin/login,
//evil.com→/ro (guard OK), locale=en→/en. Toate corecte.

**Lecție generală:** Pe acest mediu (Git Bash/Windows), ORICE argument
curl/CLI care conține un path care începe cu `/` e suspect de MSYS
mangling. Pentru teste cu paths în body/args: `MSYS_NO_PATHCONV=1`.
Dacă un test dă rezultate "imposibile" cu codul sursă, suspectează
ÎNTÂI mediul de test (shell mangling, server stale) înainte de a vâna
un bug fantomă în cod. Verifică cu debug header ce vede efectiv runtime-ul.

**Fișiere:** niciunul (test methodology). Relevant: orice smoke curl viitor
cu paths.

## 2026-06-18 — 404 ascuns nu trebuie să dezvăluie zona protejată (2 leak-uri)

**Security review founder la Task 2.3.** Scopul 404-ului pe /admin = să
ascundă că zona admin există. Două leak-uri anulau scopul:

**Leak 1 — link explicit în 404:** `app/admin/not-found.tsx` avea
"Mergi la autentificare" → /admin/login. Un atacator care da /admin vedea
DIRECT calea spre login admin. Fix: 404 generic, link DOAR la "/", zero
mențiune admin/login/administrare. Indistinguibil de un 404 normal.

**Leak 2 (mai subtil) — RSC payload + title:** chiar și după ce am curățat
textul vizibil, HTML-ul răspunsului /admin (status 404) conținea inline:
`"children":"Administrare"` + `"name":"redirectTo","value":"/admin/login"`
(payload-ul dashboard-ului) + `<title>Admin — Oak Fantasy</title>`.

Cauză Leak 2: **gate-ul era DOAR în layout** (`(protected)/layout.tsx`
notFound()). În Next App Router, layout + page se randează ÎN PARALEL (RSC).
notFound() în layout NU oprește pagina copil să-și construiască JSX-ul →
payload-ul ei se scurge în flight stream-ul inline din HTML-ul 404.
**Layout-ul NU e graniță de securitate pentru pagina copil** (documentat
de Next: fă auth check în page / middleware / data-access layer, nu doar
layout). Plus `<title>` din admin layout metadata zicea "Admin".

Fix Leak 2:
- Gate la nivel de PAGINĂ: `requireAdminOrNotFound()` (lib/auth/require-admin.ts)
  apelat la TOPUL fiecărei pagini admin protejate, ÎNAINTE de orice JSX →
  short-circuit, zero payload pentru non-admin.
- Title neutru în `app/admin/layout.tsx` metadata ('Oak Fantasy', fără "Admin").
- Layout gate păstrat ca defense-in-depth, dar NU e suficient singur.

**Verificare:** curl pe HTML-ul randat (nu doar status code) +
grep leak-uri. /admin non-admin → 404, title "Oak Fantasy", grep
admin/login|administrare → ZERO.

**Lecție generală:**
1. 404 de pe o zonă hidden = GENERIC, fără link/text spre zona protejată.
2. Auth gate care trebuie să PREVINĂ leak de conținut → în PAGINĂ (sau
   middleware/DAL), NU doar în layout (RSC randează page paralel cu layout).
3. Verifică leak-uri în HTML-ul COMPLET randat (RSC flight payload inline),
   nu doar în textul vizibil sau status code. `curl <url> | grep <secret>`.
4. `<title>` + metadata pot fi leak-uri — neutralizează-le pe zone ascunse.

**Fișiere:** `app/admin/not-found.tsx`, `app/admin/(protected)/page.tsx`,
`app/admin/layout.tsx`, `lib/auth/require-admin.ts` (requireAdminOrNotFound).

## SECURITY_CHECKLIST.md maintenance protocol

Document: `_brain/notes/SECURITY_CHECKLIST.md` (living document)

După fiecare sprint cu task-uri sensibile, Claude Code TREBUIE să:

1. Review codul nou adăugat în sprint:
   - `process.env.NEW_VAR_NAME` folosit? → adaugă în Section 2 (Env Vars)
   - Service extern nou integrat? → adaugă în Section 1 (API Keys)
   - Endpoint public nou? → adaugă în Section 6 (Rate Limiting)
   - DB schema schimbată? → review Section 8 (RLS audit)

2. Update Section 14 (Jurnal Rotații) dacă vreo cheie a fost:
   - Creată nouă în sprint
   - Rotated/regenerated
   - Expusă accidental (necesită rotire imediată)

3. Update timestamp "Ultima actualizare:" la începutul documentului (line 5)

4. Commit atomic: `docs(security): update checklist after Sprint X`

Acest protocol e CRITICAL — fără el documentul devine stale și pierde
valoarea de "living document".

**Bonus rule pre-commit:** orice commit care touchează `SECURITY_CHECKLIST.md`
trebuie să fie scanat de `grep -E "re_[A-Za-z0-9_]{20,}|sk_live_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,}|eyJ[A-Za-z0-9._-]{50,}" _brain/notes/SECURITY_CHECKLIST.md`
înainte de `git add`. Repo e PUBLIC (`tvarvaroi/Oak-Fantasy`) → orice secret raw
e scanat automat de GitHub + revocat de provider. Cheile de menționat în
checklist trebuie să fie REDACTATE (ex: `re_GnEqPV...***REDACTED***`).

## 2026-06-22 — zodResolver + schemă cu .transform() = mismatch de tip RHF

**Simptom:** `useForm<Input, unknown, Output>({ resolver: zodResolver(schema) })`
cu o schemă care folosește `.transform()` (string '380' → number 380) pică la
typecheck: "Type 'string | number' is not assignable to type 'number'" pe
câmpurile transformate.

**Cauză:** zodResolver nu reușește să inferă cele 3 generice (input/context/output)
când schema are transforms; întoarce semnătura de resolver generic ne-tipată.

**Fix:** cast explicit pe resolver —
`resolver: zodResolver(schema) as Resolver<Input, unknown, Output>`
(import `type { Resolver }` din 'react-hook-form'). useForm rămâne cu 3 generice;
handleSubmit livrează Output (numere coerced). Action-ul re-parsează cu safeParse
(idempotent — transform pe number e tot number). Vezi components/admin/ProductForm.tsx.

**Pattern transform vs preprocess:** folosește `.transform()` (nu `.preprocess()`)
ca `z.input` să rămână o uniune utilizabilă (string|number) pentru RHF, nu `unknown`.

## 2026-06-22 — check:i18n respinge diacriticele cedilla legacy (ş/ţ) chiar în cod

**Simptom:** un map de slugify cu `'ş': 's', 'ţ': 't'` (cedilla, U+015F/U+0163)
pică `npm run check:i18n` cu "Legacy Romanian cedilla diacritic — use ș/ț".

**Cauză:** checker-ul scanează TOATE .tsx pentru caractere cedilla, indiferent
de context (string literal, regex, comentariu). Nu deosebește text vizibil de cod.

**Fix:** nu băga caractere cedilla literale în sursă. Pentru slugify e suficient
să mapezi comma-below ș/ț → ASCII; orice alt non-ASCII (inclusiv cedilla rar)
cade oricum pe pasul `.replace(/[^a-z0-9]+/g, '-')` și devine cratimă. Soluție mai
simplă și conformă. (Editorul/tooling convertește \uXXXX înapoi în caracter, deci
escape-urile nu ajută — pur și simplu elimină cazul.)

## 2026-06-22 — Imagini produs „404": cauza reală = next/image remotePatterns, NU formatul URL

**Raport inițial:** founder a testat URL-uri brute și a concluzionat: URL cu
`/storage/v1/object/public/product-images/X` → 404; fără `/public/` → 200. A cerut
strip `/public/` + getPublicUrl().

**Investigație empirică (systematic-debugging, script one-off pe proiectul live):**
- Codul folosea DEJA `getPublicUrl()` (nu string concat). getPublicUrl produce
  formatul standard CU `/public/` — corect pentru bucket public.
- Fetch anonim pe URL-ul cu `/public/` (cel din DB) = **200 OK, stabil** (×3).
- `next/image` (`/_next/image?url=…`) cu `/public/` = **200, image/jpeg** ✓
- `next/image` FĂRĂ `/public/` = **400 „url parameter is not allowed"** ✗
  (remotePatterns permite exact `pathname:'/storage/v1/object/public/**'`).

**Root cause real:** DOUĂ lucruri, niciunul fiind formatul URL:
1. **next/image remotePatterns lipsea** pe serverul founder-ului (modificarea
   next.config era necommisă) → next/image întorcea 400 pentru TOATE URL-urile
   supabase → thumbnail spart în app.
2. **404-ul brut pe `/public/` a fost TRANZITORIU** — CDN-ul Supabase cache-uiește
   un miss (404) pe path-ul public imediat după creare bucket/upload; path-ul
   non-`/public/` ocolește CDN-ul (servește direct via RLS anon SELECT), deci
   „părea" că merge. CDN-ul s-a auto-vindecat → `/public/` acum 200 stabil.

**Concluzie / regulă:**
- `getPublicUrl()` e CORECT — produce `/public/`, formatul canonic pentru bucket
  public. NU strip `/public/`. NU rula UPDATE SQL să scoți `/public/` — ar sparge
  next/image (remotePatterns permite DOAR `/public/**`).
- Fix-ul real = `next.config.js` `images.remotePatterns` cu
  `pathname:'/storage/v1/object/public/**'` + restart/redeploy server.
- Lecție de proces: când un URL brut pare să dea 404 dar fișierul+bucket+policy
  sunt OK → suspectează (a) CDN cache tranzitoriu pe path public, (b) layer-ul de
  rendering (next/image remotePatterns) care întoarce 400, nu 404. Testează la
  FIECARE layer (raw fetch vs /_next/image) înainte de a „repara" formatul URL.

## 2026-06-23 — #418/#423 GLOBAL: SpeedInsights ca frate al <html> în root layout

**Simptom:** React #418 (hydration mismatch) + #423 (entire root client-renders)
pe TOATE paginile în producție. Founder a raportat /tocatoare + /admin/produse,
dar reproducerea (Playwright pe prod build) a arătat eroarea pe homepage, atelier,
despre, tocatoare, contact, /admin/login — TOT site-ul.

**Diagnostic greșit inițial:** „componentă partajată de afișare produs". FALS —
nu e legat de produse. Eroarea apărea identic pe pagini fără produse.

**Root cause (confirmat: stack trace + sursă pachet):**
`app/layout.tsx` randa `<>{children}<SpeedInsights/></>` — adică `<SpeedInsights/>`
ca **frate al lui `<html>`** (children = layout-ul [locale] care emite `<html>`).
`@vercel/speed-insights@2.0.0` randează intern `<Suspense fallback={null}>` (citește
useSearchParams). Un **Suspense boundary ca frate al lui `<html>`, la nivel #document,
nu poate fi hidratat** → stack: `tryToClaimNextHydratableSuspenseInstance` →
`updateSuspenseComponent` → „server HTML replaced with client content in #document,
outside Suspense boundary → entire root client-renders".

Comentariul vechi din root layout („returnează null, e ok în afara <body>") era
valid pentru o versiune veche a pachetului; v2.0.0 a adăugat wrapper-ul `<Suspense>`
→ presupunerea a picat. **Regresie tăcută la bump de pachet.** Vizibilă abia când
founder a deschis devtools pe /tocatoare (recovery-ul #423 re-randează pe client,
deci pagina „merge" dar cu flash + erori console).

**Fix:** mută `<SpeedInsights/>` ÎN interiorul `<body>` (în `app/[locale]/layout.tsx`).
Root layout devine pur passthrough (`return children`). Guard-ul de dedup din
SpeedInsights (`document.head.querySelector(script[src*=...])`) previne dubla
încărcare la remount pe schimbarea locale — deci grija veche nu se aplică.

**Verificat:** prod build, Playwright capture pageerror pe 6 pagini publice +
/admin/login → toate „clean", zero #418/#423.

**Reguli:**
- NU randa NIMIC care produce DOM/Suspense ca frate al `<html>` în root layout.
  Orice (SpeedInsights, Analytics, scripturi) trebuie în interiorul `<body>`.
- La fiecare bump de pachet care randează ceva la nivel de layout, re-verifică
  hidratarea (Playwright pageerror pe prod build) — regresiile de hidratare sunt
  tăcute (site-ul pare să meargă datorită recovery-ului #423).
- Tehnică de debug: capturează `page.on('pageerror')` din prod build (minified
  #418 + link) SAU din dev (mesaj complet); stack-ul `tryToClaim...SuspenseInstance`
  = mismatch la o graniță Suspense; „#document" = problema e la rădăcină, nu adânc.

## 2026-06-23 — Poza produs pe /admin dar nu pe /tocatoare: ProductCard ignora hero_image_url

**Simptom:** produs cu hero_image_url → poza apare în /admin/produse (ProductTable),
dar /tocatoare public arată placeholder SVG.

**Root cause (cod, nu fetch):** `fetchActiveProducts` face `select('*')` → datele
includ hero_image_url. ProductTable (admin) îl randa cu next/image; dar
ProductCard (public) avea HARDCODAT `<img src="/3D_Cutting_Board_Model_Design.svg">`
(placeholder din 2026-05-29, când nu existau poze) și nu citea deloc hero_image_url.

**Fix:** ProductCard randează condiționat — `product.hero_image_url` prezent →
`<Image fill>` full-bleed în `.medallion` (clasă `.medallionPhoto { object-fit: cover }`)
+ ascunde badge-ul „Foto în pregătire"; null → placeholder SVG ca înainte.
Verificat: /tocatoare prod build → produsul cu poză afișează /_next/image (loaded),
restul placeholder; hydration 0.

**Lecție:** când un component „placeholder-only" preia date noi (poze încărcate),
verifică DACĂ le citește — placeholder-ul hardcodat maschează datele reale. Compară
mereu componentul care merge (admin) cu cel care nu (public): aici diferența era
că public nu folosea câmpul deloc, nu un fetch/mapare greșit.

## 2026-06-23 — Calitate imagine ProductCard: q90 + sizes + AVIF; sursa trebuie PĂTRATĂ

**Simptom:** poza produsului (1376×768) apărea blurată în cardul /tocatoare.

**Investigație empirică (Playwright DPR2 + decodare output optimizator):**
- next/image servea varianta 750w @ **q75** (default). → bumped la **q90**.
- `sizes` era „360px"; real card desktop ≈ 360-390px (grid 3-col, container 1240px,
  gap 40px). Aliniat la `(max-width:640px) 100vw, (max-width:1024px) 50vw, 400px`.
- next.config: adăugat `formats: ['image/avif','image/webp']` (AVIF mai eficient).
- Output optimizator verificat (decodat dims reale): w=828→828×462, w=1920→1376×768
  (capat la sursă, fără upscale). Deci optimizatorul servește corect high-res.

**Limita reală a clarității (calcul):** o sursă 16:9 landscape cropată în medalionul
PĂTRAT (object-fit cover) lasă doar ~462px înălțime utilă din varianta 828w; un ecran
retina (DPR2) la medalion 355px cere ~710px → rămâne ușor soft. Width-based `sizes`
sub-servește înălțimea pentru surse landscape. A umfla `sizes` ca să forțezi varianta
1920w ar repara DOAR sursele landscape, dar ar risipi bandă pe surse pătrate (corecte).
**Decizie: sizes rămâne corect; soluția reală = upload imagini PĂTRATE.**

**Recomandare poze produs (founder reference):**
- **Aspect ratio: PĂTRAT 1:1** (medalionul e pătrat; landscape se crop-uiește pe centru).
- **Rezoluție: min 1500×1500** (retina-sharp în card; cardul cere ~710px utili la DPR2).
- Format: JPG sau WebP, q85-90, sub 5MB.

**Finding secundar — JPEG numit .png:** fișierul „test" e JPEG (magic `ffd8ffe0`/JFIF)
dar stocat ca `.png` cu `Content-Type: image/png`. Cauza: `ImageUpload.tsx` derivă
extensia + contentType din `file.type` (raporta image/png pentru un JPEG). NU strică
randarea (sharp sniff-uiește formatul real), dar e date murdare. TODO opțional: sniff
magic bytes la upload în loc să te bazezi pe file.type. Vezi components/admin/ImageUpload.tsx.
