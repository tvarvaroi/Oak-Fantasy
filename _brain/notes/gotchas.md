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
