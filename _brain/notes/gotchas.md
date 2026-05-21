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
