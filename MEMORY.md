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
