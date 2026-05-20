# Oak Fantasy — Skills Registry

> Always check ALL locations below before starting any task.
> Read every relevant SKILL.md. Report what you loaded BEFORE writing code.
> Vezi și `CLAUDE.md` §5 (skills inventory) și pre-task ritual §9-23.

---

## Location 1: `~/.claude/skills/` — Global Skills (user-scoped, 30 packs)

### Workflow & Engineering (folosește înainte de orice task de cod)

| Skill | Trigger |
|---|---|
| `brainstorming` | **HARD GATE** — feature/componentă nouă, înainte de cod |
| `writing-plans` | Ai requirements? PLAN.md întâi |
| `executing-plans` | Ai PLAN.md? Execută pe pași |
| `systematic-debugging` | Orice bug — root cause ÎNAINTE de fix |
| `test-driven-development` | Teste înainte de implementare |
| `verification-before-completion` | Înainte de orice „gata" — verifică prima (Iron Law) |
| `requesting-code-review` / `receiving-code-review` | Înainte/după review |
| `finishing-a-development-branch` | Decizie de integrare |
| `dispatching-parallel-agents` | 2+ task-uri independente |
| `using-git-worktrees` | Lucru izolat pe feature |

### Engineering Specialties (`engineering-team/`)

`senior-frontend` · `senior-backend` · `senior-architect` · `senior-fullstack` · `senior-qa` · `senior-devops` · `senior-security` · `senior-secops` · `code-reviewer` · `playwright-pro` · `tdd-guide` · `senior-data-*`

### Alte pack-uri

`marketing-skill/` (42) · `c-level-advisor/` (28) · `business-growth/` · `product-team/` · `project-management/` · `ra-qm-team/` · `finance/` · `documentation/` · `design-md/` · `react-components/`

## Location 2: `.agents/skills/` — Project-Scoped (skills-lock.json, 6+1)

| Skill | When |
|---|---|
| `ui-ux-pro-max` | Orice UI — 67 stiluri, 161 palete, 99 ghiduri UX, 16 stack-uri (hidratat v2.5.0) |
| `vercel-react-best-practices` | Componente React — reguli de performanță |
| `web-design-guidelines` | Audit accesibilitate + semantică |
| `verification-before-completion` | Înainte de „done" (Iron Law) |
| `writing-plans` | Planificare task multi-pas |
| `executing-plans` | Execuție plan cu checkpoint-uri |
| `nano-banana` | Generare/editare imagini (bonus din gym-gurus) |

## Location 3: `~/.claude/commands/` — Slash Commands

| Command | When |
|---|---|
| `/git:cm` | Stage + commit (no push) — **NU îl folosi**, commit-urile le face fondatorul |
| `/git:cp` | Stage + commit + push — idem, nu-l folosi |
| `/review` | Quality gate |
| `/security-scan` | Secret + vuln scan |
| `/gsd:*` | GSD orchestrators (plan/execute/verify) |

> Regula #1 proiect: **NU fac commit-uri.** Slash-urile de git rămân pentru fondator.

## Location 4: Plugins (auto-active)

`frontend-design` (ORICE UI — direcție estetică non-generic) · `code-review` · `context7` (docs curente librării — Supabase/Stripe/Sameday) · `superpowers`

---

## File → Skills Map (structura reală Oak Fantasy)

| Fișier / Zonă | Încarcă |
|---|---|
| `components/*.tsx` (landing) | `brainstorming` (HARD GATE) → `frontend-design` → `ui-ux-pro-max` → `senior-frontend` → `vercel-react-best-practices` |
| `components/ui/*` (shadcn) | `senior-frontend` + reuse existent, nu reinventa |
| `app/[locale]/**/page.tsx` (pagini noi) | `brainstorming` → `ux-researcher-designer` → `ui-ux-pro-max` → `senior-frontend` |
| `app/[locale]/layout.tsx`, metadata, SEO | `senior-frontend` + `web-design-guidelines` + `_brain/notes/seo-strategy` |
| `lib/*.ts`, `middleware.ts` | `senior-backend` + `code-reviewer` |
| `supabase/migrations/*` | `senior-backend` / `database-designer` |
| `CuttingBoard3D.tsx` / orice 3D | `senior-frontend` + atenție la constrângeri R3F (PINNED) |
| Orice bug | `systematic-debugging` PRIMA |
| Înainte de „gata" / PR | `verification-before-completion` + `code-reviewer` |
| Orice librărie externă | `context7` (fetch docs curente) + salvează în `_brain/resources/` |

## Pre-task ritual (rezumat — detalii în CLAUDE.md §9-23)

1. Citește `MEMORY.md`
2. Citește `_brain/notes/gotchas.md` + `decisions.md`
3. Citește nota `_brain/` relevantă (`codebase-map`, `design-system`, `seo-strategy`)
4. Verifică ce skills se aplică (tabelul de mai sus)
5. Feature nou → `brainstorming` (HARD GATE, design aprobat înainte de cod)
6. Raportează ce ai încărcat ÎNAINTE de cod
7. La final → update `MEMORY.md` + `_brain/notes/`
