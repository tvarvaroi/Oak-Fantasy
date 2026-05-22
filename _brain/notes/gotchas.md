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
