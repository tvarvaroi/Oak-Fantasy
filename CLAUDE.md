# Oak Fantasy — CLAUDE.md (Developer Reference)

> Last updated: 2026-05-16 | Etapa 1 (Foundation) — landing page live, magazinul în construcție
> Project: Romanian artisan brand selling handcrafted oak cutting boards
> Founder: solo, has workshop, has SRL, has partial stock

---

## ⚡ PRE-TASK RITUAL — MANDATORY, EVERY SESSION, EVERY TASK

**Înainte să scrii o singură linie de cod, parcurge checklist-ul ăsta de fiecare dată:**

1. **Citește MEMORY.md** — învățăminte din sesiunile anterioare (vezi secțiunea 4)
2. **Citește `_brain/notes/gotchas.md`** — bug-uri rezolvate, ore de debugging salvate
3. **Verifică `_brain/notes/decisions.md`** — decizii arhitecturale luate deja, nu le re-litigam
4. **Citește orice notă relevantă din `_brain/notes/`** pentru task-ul curent
5. **Verifică ce skills se aplică** — vezi secțiunea Skills
6. **Pentru orice feature nou: brainstorming înainte de cod.** HARD GATE — fără implementare până designul e prezentat și aprobat
7. **La finalul sesiunii: actualizează MEMORY.md** cu pattern-uri noi, fix-uri, learnings

**Raportează ce ai încărcat ÎNAINTE să scrii cod.** Spune-mi ce skills, ce notes, ce gotchas relevante ai citit.

**Asta nu e negociabil. Fiecare task. Fiecare sesiune. Fără excepții.**

---

## 1. Cine sunt eu, cine ești tu

Sunt fondatorul Oak Fantasy. Lucrez singur, am atelier complet, am SRL înregistrat, am stoc parțial de tocătoare. **Tu ești asistentul meu tehnic principal** — înlocuiești Bolt.new pe care l-am folosit până acum.

**Vorbește-mi în română.** Eu scriu în română, tu răspunzi în română. Codul, numele de fișiere și termenii tehnici universali rămân în engleză (convenție). Diacriticele românești (ă, â, î, ș, ț) sunt obligatorii în orice text vizibil pe site — semnal de calitate pentru brand.

---

## 2. Stack tehnic actual

- **Framework:** Next.js 14.2.18 cu App Router
- **Limbaj:** TypeScript
- **Styling:** Tailwind CSS 3.3.3 + shadcn/ui (Radix în `components/ui`)
- **Animații:** Framer Motion 11.11.17 + GSAP 3.15 + ScrollTrigger
- **3D:** React Three Fiber 8.18 + Drei 9.122 + Three.js 0.169 (PINNED, nu schimba)
- **Backend / DB / Auth:** Supabase
- **Hosting:** Vercel (auto-deploy din `main` la fiecare push)
- **i18n:** Route-based, `app/[locale]` cu RO default, EN disponibil
- **State management:** Zustand
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

**Reguli absolute despre stack:**
- NU schimba versiunile pachetelor existente fără să întrebi
- Folosește `--legacy-peer-deps` la orice `npm install` (necesar pentru R3F)
- Importurile animații: `from 'framer-motion'`, NICIODATĂ `from 'motion/react'`
- Componente cu browser APIs (Three.js, window, localStorage): `'use client'` ca prima linie
- 3D se importă cu `next/dynamic` cu `ssr: false`

---

## 3. Second Brain — sistemul de cunoaștere persistentă

Acest proiect folosește `_brain/` ca bază de cunoaștere care persistă între sesiuni. **Asta e diferența între un proiect care progresează și unul care reface aceeași muncă la fiecare sesiune.** Sistemul e adaptat după pattern-ul Zettelkasten + Obsidian.

### Structura `_brain/`

```
_brain/
├── maps/                          # Indexuri și orientare
│   ├── oak-fantasy-overview.md   # Project orientation, linkuri la note
│   └── resources-index.md         # Index docs externe descărcate
├── notes/                         # Cunoaștere persistentă, self-contained
│   ├── gotchas.md                # Bug-uri rezolvate, ore de debugging salvate
│   ├── decisions.md              # Decizii arhitecturale + motivul lor
│   ├── codebase-map.md           # Structura codului, ce face fiecare folder
│   ├── stack-frontend.md         # Detalii frontend
│   ├── stack-backend.md          # Detalii backend (când îl construim)
│   ├── design-system.md          # Detalii design system (culori, fonturi, voice)
│   ├── seo-strategy.md           # Strategia SEO, cuvinte cheie, structură URL
│   └── [topic].md                # Alte teme când apar
├── resources/                     # Docs externe descărcate cu webfetch
│   ├── framer-motion-docs.md     # API docs framer-motion
│   ├── shadcn-ui.md              # shadcn component reference
│   ├── supabase-auth.md          # Supabase Auth API
│   ├── stripe-checkout.md        # Stripe integration patterns
│   ├── sameday-api.md            # Sameday curier (RO-specific)
│   ├── smartbill-api.md          # SmartBill e-Factura
│   └── netopia-api.md            # Netopia payment (RO)
└── inbox/                         # Temporar — procesează în aceeași sesiune
```

### Reguli Zettelkasten

- Fiecare notă e **self-contained** — citibilă fără alte note
- Linkuri cu sintaxa `[[note-name]]`
- Maps fac legături, nu explică
- Inbox e temporar — procesează în note în aceeași sesiune

### Pe fiecare task — citește

1. `_brain/maps/oak-fantasy-overview.md` — orientarea proiectului
2. `_brain/notes/gotchas.md` — bug-uri trecute, verifică ÎNAINTE să atingi cod
3. Orice notă relevantă pentru task-ul curent

### Când descoperi ceva nou — scrie imediat

- **Gotcha nou** (bug rezolvat, comportament neașteptat) → append la `_brain/notes/gotchas.md` cu data și context
- **Decizie arhitecturală** → append la `_brain/notes/decisions.md` cu motivul
- **Pattern reutilizabil** → fișier nou `_brain/notes/[topic].md`

### Documente externe — folosește mereu webfetch

Când lucrezi cu o bibliotecă externă (Stripe SDK, Sameday API, framer-motion, etc):
- Fetch URL-ul oficial de docs
- Salvează în `_brain/resources/[library-name].md` cu URL sursă + data fetch la început
- Adaugă entry la `_brain/maps/resources-index.md`
- **NU te baza pe training data pentru API-uri de biblioteci** — întotdeauna fetch docs curente

---

## 4. MEMORY.md — Session Learning Log

Fișierul `MEMORY.md` (în root, lângă CLAUDE.md) e jurnalul tău de învățare cross-session. Pattern-urile tale, fix-urile tale, ce-ai învățat.

### La începutul fiecărei sesiuni

Citește MEMORY.md. Vezi ce ai învățat data trecută.

### La finalul fiecărei sesiuni

Scrie noile descoperiri în MEMORY.md cu format:

```markdown
## YYYY-MM-DD — [topic-ul sesiunii]

**Pattern descoperit:** [scurt]
**Aplicat la:** [unde, ce fișiere]
**De ce contează:** [implicații pentru viitor]
```

**Asta e ce face diferența între "Claude care învață" și "Claude care reface aceleași greșeli".** MEMORY.md crește în timp și devine cel mai valoros asset tehnic al proiectului.

---

## 5. Skills inventory

### Plugins active (auto-loaded)

Aceste plugins trebuie folosite pe fiecare task relevant. Referențiază-le explicit în gândirea ta ("Using frontend-design for this component...").

| Plugin | Când | De ce |
|--------|------|-------|
| **frontend-design** | ORICE UI work — componente, pagini, styling | Direcție estetică non-generic AI |
| **code-reviewer** | Orice fișier nou semnificativ, refactor, "PR" | Quality gate înainte de "done" |
| **context7** | Orice bibliotecă externă (Stripe, Supabase, Sameday) | Fetch docs curente, nu training data |

### Workflow skills

| Skill | Trigger |
|-------|---------|
| `brainstorming` | **HARD GATE** — feature nou / componentă nouă |
| `writing-plans` | Ai requirements? Creează PLAN.md întâi |
| `executing-plans` | Ai PLAN.md? Execută cu atomic commits |
| `systematic-debugging` | Orice bug — root cause ÎNAINTE de fix |
| `verification-before-completion` | Înainte de "done" — verifică prima |
| `senior-frontend` | React/Next.js/TS work |
| `senior-backend` | Server-side, API, DB |
| `senior-architect` | Decizii arhitecturale |
| `senior-fullstack` | Full-stack features end-to-end |
| `database-designer` | Schema, migrations |
| `stripe-integration-expert` | Stripe (Etapa 3) |
| `ux-researcher-designer` | Page design, user flow |
| `playwright-pro` | E2E testing |

### Engineering workflow pentru orice task UI

```
1. brainstorming (HARD GATE)     → design approved BEFORE code
2. frontend-design               → aesthetic direction
3. senior-frontend               → implementation
4. systematic-debugging          → if bugs arise
5. verification-before-completion → before "done" claim
6. code-reviewer                 → final pass
```

### Raportează ce încarci

Înainte să acționezi:
- Ce skills ai încărcat
- Ce contribuie fiecare
- Ce gotchas relevante ai citit din `_brain/notes/`

---

## 6. Brand identity — design system imutabil

Detalii complete în `_brain/notes/design-system.md`. Rezumat aici:

### Poziționare

Brand artisan românesc, warm, hand-made, countryside-heritage cu polish modern. **NU** corporate minimal. **NU** Aesop-clean. Inspirație: "premium Etsy artisan" combinat cu "Apartamento magazine".

Trei adjective: **CALD. LUCRAT MANUAL. ÎNRĂDĂCINAT.**

### Tagline

- RO (primar): *"Făcut cu drag în România."*
- EN: *"From Carpathian oak, by hand."*

### Paleta (CSS variables în `app/globals.css`)

**Primare:**
- `--forest-deep: #2D3A1F`
- `--forest-mid: #5A6B3C`
- `--moss: #8FA068`
- `--oak-warm: #8B5E3C`
- `--oak-deep: #5C3A20`
- `--copper: #B87333`

**Background:**
- `--cream-warm: #F5EBD8`
- `--paper-aged: #EDE0C5`
- `--bark: #1F1810`

**Text:**
- `--ink: #2A2218` (NICIODATĂ negru pur)
- `--ink-soft: #5D4E3A`
- `--highlight: #C9A66B`

**Regulă absolută:** Toate culorile au căldură. Zero gri rece. Zero alb pur. Zero negru pur.

### Tipografie

- **Display:** Caudex, 400 și 700
- **Script:** Caveat, 400 și 600 — folosit RAR, doar pentru "semnături"
- **Body:** Lora, 400 și 500
- **Labels uppercase:** Caudex cu letter-spacing 0.18em

### Reguli copy

- Persoana întâi plural: "noi facem", "atelierul nostru"
- Concret peste abstract: "stejar din Bucegi" nu "lemn premium"
- Diacritice CORECTE și COMPLETE — niciodată stripate
- Zero emoji-uri
- Maximum un semn de exclamare în întregul site
- Evită: "premium", "exclusiv", "luxury", "rafinat"
- Folosește des: "lucrat", "făcut", "atelier", "manual", "mâini", "stejar", "moștenire"

---

## 7. Ce avem deja construit

Landing page-ul live cu componente în `components/`:
- `Navbar.tsx` — sticky, language toggle RO/EN
- `Hero.tsx` — editorial + 3D cutting board
- `CuttingBoard3D.tsx` — Three.js cu material oak procedural
- `StoryStrip.tsx` — 3 coloane cu ornamente SVG
- `WorkshopSection.tsx` — layout asimetric
- `ProductTease.tsx` — gallery orizontal scroll
- `NumbersStrip.tsx` — counters animate
- `CraftVideoTease.tsx` — placeholder video
- `WaitlistSection.tsx` — email capture
- `Footer.tsx` — 3 coloane dark
- `FloatingCTA.tsx` — buton flotant
- `EmailForm.tsx` — conectat la Supabase
- `PageTransition.tsx` — tranziții

Detalii arhitecturale: vezi `_brain/notes/codebase-map.md`.

---

## 8. Catalog produse — 10 SKU-uri

| # | Nume | Tier | Dimensiuni | Preț | Producție |
|---|------|------|------------|------|-----------|
| 01 | Tocător Mic | Entry | 25×18×2 cm | 180 RON | 60-90 min |
| 02 | Platou Serving | Entry | 30×18×2 cm | 240 RON | 60-90 min |
| 03 | Tocător Bucătărie Mediu | Core | 35×25×3 cm | 380 RON | 2h |
| 04 | Tocător Bucătărie Mare | Core | 45×30×3 cm | 520 RON | 2.5h |
| 05 | Platou Lung | Core | 50×20×2.5 cm | 480 RON | 2h |
| 06 | Tocător Rotund | Core | Ø32×2.5 cm | 450 RON | 2.5h |
| 07 | Bloc End-Grain Mediu | Premium | 35×25×5 cm | 850 RON | 5-6h |
| 08 | Bloc End-Grain Mare | Premium | 45×35×6 cm | 1,250 RON | 7-8h |
| 09 | Bloc Heirloom | Hero | 50×40×8 cm | 1,500-2,200 RON | 12-15h |
| 10 | Platou Statement | Hero | 80×25×4 cm | 1,800 RON | 6-8h |

Personalizare (gravare laser): +80-180 RON, disponibil pe SKU 02-09.

---

## 9. Planul de business pe etape

**Lansare = Etapa 5 completă**. Tot vândem (card + ramburs + curieri + factură) la lansare.

| Etapă | Săpt. | Focus | Lansabil? |
|-------|-------|-------|-----------|
| 1 — Site prezentare | 1-3 | Pagini, SEO, conținut. Zero tranzacții. | Listă email, SEO acumulează |
| 2 — Auth + Admin | 4-5 | Supabase Auth, cont client, admin dashboard | Conturi se pot crea |
| 3 — Stripe + Email | 6-7 | Plata card internațional, email tranzacționale | **PRIMA VÂNZARE REALĂ** |
| 4 — Ramburs + Curieri | 8-10 | COD, Sameday API, FAN Courier | Full e-commerce RO |
| 5 — e-Factura + Netopia | 11-13 | SmartBill, Netopia, rate | Lansare reală finală |

Suntem la **Etapa 1, Săptămâna 1**. Următorul task: construire pagini lipsă (`/despre`, `/atelier`, `/ingrijire`, `/contact`, `/tocatoare`, `/blog`).

---

## 10. Workflow-ul nostru

### Procesul tipic per task

1. Asistentul strategic (Claude Opus în chat-ul de planificare) îmi dă task + prompt pentru tine
2. Eu îți paste-uiesc prompt-ul aici
3. **Tu citești CLAUDE.md + gotchas + design-system note ÎNAINTE să codezi**
4. Tu raportezi ce skills + notes ai încărcat
5. **Tu brainstormezi designul (HARD GATE) și-l prezinți**
6. Eu aprob designul
7. Tu execuți: cod, modificări, instalări
8. Eu verific local pe `localhost:3000`
9. **Eu** fac commit + push (nu tu)
10. Vercel deploy automat în 1-2 min
11. Eu verific live, apoi următorul task
12. **Tu** actualizezi MEMORY.md + `_brain/notes/` cu ce ai învățat

### Reguli pentru tine în execuție

1. **Înainte să modifici, citește.** Folosește view/cat pe fișierele relevante. Nu presupune.
2. **Respectă design system-ul.** Toate culorile sunt CSS vars (`--oak-warm`). NU hardcoda hex.
3. **Folosește componentele existente** din `components/ui/` (shadcn) când e posibil.
4. **Toate textele noi: română cu diacritice** + variantă EN dacă pagina e în `app/[locale]/`.
5. **`'use client'`** pe orice folosește hooks/framer-motion/browser APIs.
6. **`next/image`** pentru imagini, niciodată `<img>`.
7. **Rute noi:** `app/[locale]/numele-rutei/page.tsx`. NU `pages/`.
8. **Comentariile în engleză** (convenție tech).
9. **NU instala pachete fără să întrebi.** Spune-mi ce și de ce, eu confirm.
10. **NU face commit-uri.** Le fac eu manual ca să controlez istoria.

### Iron Law — Verification Before Completion

Înainte să-mi spui "gata":
- Ai rulat `npm run build` local? A trecut fără erori?
- Ai testat manual pe `localhost:3000`?
- Funcționează pe mobile (DevTools mobile view)?
- Diacriticele se afișează corect?
- Funcționează versiunea EN dacă e i18n?
- Nu apar warnings la build?

Dacă oricare e "nu" — NU spune că e gata. Spune ce mai rămâne.

### Când întâlnești erori

- **NU presupune** că ai rezolvat-o până nu confirm
- **NU fă workaround-uri** în loc de cauza adevărată (cum a făcut Bolt-ul când a renunțat la 3D și a făcut Canvas 2D — ăsta e anti-pattern interzis)
- **Folosește systematic-debugging** — root cause analysis prima
- **Verifică `_brain/notes/gotchas.md`** — poate ai mai întâlnit asta
- Dacă ești blocat: "Am încercat X, Y, Z, nu merge, hai să gândim împreună"
- După rezolvare: **scrie gotcha în `_brain/notes/gotchas.md`**

---

## 11. Env vars

`.env.local` (în `.gitignore`, NU commit):

```
NEXT_PUBLIC_SUPABASE_URL=https://[id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Etapele 2-5 vor adăuga:
```
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
RESEND_API_KEY=...
SAMEDAY_API_KEY=...
SMARTBILL_API_KEY=...
NETOPIA_API_KEY=...
```

**Toate trebuie adăugate și pe Vercel** (Project Settings → Environment Variables). Dacă uităm, build-ul de producție pică.

---

## 12. Comenzi des folosite

```bash
npm run dev                              # dev server local
npm run build                            # production build local (test înainte de push)
npm run lint                             # linting
npm run typecheck                        # TypeScript check
npm install nume --legacy-peer-deps      # instalează pachet

# Git workflow
git status
git add .
git commit -m "mesaj clar"
git push                                 # Vercel deploy automat
```

---

## 13. Întrebări pentru tine acum (prima sesiune)

Înainte de primul task, confirmă-mi:

1. Ai citit tot CLAUDE.md? Înțelegi pre-task ritual, brain system, MEMORY.md, Iron Law?
2. Ai verificat dacă `_brain/` și `MEMORY.md` există? Dacă nu, primul task e secțiunea 14.
3. Ești de acord cu workflow-ul (eu îți dau task-uri, tu execuți, EU fac commit-uri)?
4. Vreo ambiguitate de clarificat?

---

## 14. Bootstrap task — crearea sistemului `_brain/`

Dacă `_brain/` și `MEMORY.md` nu există în proiect, primul tău task e să le creezi.

### Structura de fișiere de creat

```
_brain/
├── maps/
│   ├── oak-fantasy-overview.md   # vezi conținut mai jos
│   └── resources-index.md         # header gol pentru moment
├── notes/
│   ├── gotchas.md                # header gol
│   ├── decisions.md              # header gol
│   ├── codebase-map.md           # mapează ce există în componenta acum
│   ├── design-system.md          # copiază secțiunea 6 din CLAUDE.md aici
│   └── seo-strategy.md           # header gol
├── resources/                     # folder gol
└── inbox/                         # folder gol

MEMORY.md                          # în root, vezi conținut mai jos
```

### Conținut pentru `_brain/maps/oak-fantasy-overview.md`

```markdown
# Oak Fantasy — Project Map

## Repository
- **GitHub:** https://github.com/tvarvaroi/Oak-Fantasy
- **Live:** [Vercel URL] (de adăugat după deploy)
- **Domain target:** oakfantasy.ro (conectare amânată)

## Brand
- Tagline (RO): "Făcut cu drag în România."
- Tagline (EN): "From Carpathian oak, by hand."
- Positioning: Romanian artisan, warm hand-made

## Stack
- [[notes/stack-frontend]]
- [[notes/stack-backend]] (când îl construim)

## Architecture
- [[notes/codebase-map]]
- [[notes/design-system]]

## Knowledge
- [[notes/gotchas]] — debugging history
- [[notes/decisions]] — architectural decisions
- [[notes/seo-strategy]]

## Resources
- [[maps/resources-index]]

## Current Phase
Etapa 1 — Site prezentare (Săpt. 1-3 din 13). Următorul task: pagini lipsă.
```

### Conținut pentru `MEMORY.md` (în root)

```markdown
# Oak Fantasy — Session Learning Log

> Cross-session knowledge persistence. Append the end of each session.

---

## 2026-05-16 — Bootstrap

**Pattern descoperit:** Acest proiect folosește Second Brain pattern adaptat din proiectul gym-gurus.
**Aplicat la:** `_brain/` system + MEMORY.md + pre-task ritual obligatoriu.
**De ce contează:** Cross-session knowledge persistence. Evit să fac aceeași greșeală de două ori. Citește MEMORY.md la fiecare început de sesiune.
```

După ce creezi structura, confirmă-mi și aștept primul task real de la mine.
