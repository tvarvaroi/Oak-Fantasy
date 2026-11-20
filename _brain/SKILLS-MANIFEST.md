# Skills Manifest — setup-ul Claude Code (Oak Fantasy)

> Inventar făcut 2026-11-20, pe Claude Code 2.1.329 (extensia VS Code), ÎNAINTE de curățenia
> din aceeași zi. Sursa listei: lista de skilluri văzută de sesiune + citirea folderelor de pe disc.
> Raportul /skill-doctor: 18 skilluri folosite din ~215.

## Unde stau skillurile (ordinea în care le încarcă Claude Code)

| Loc | Ce conține | Cum apar în listă |
|-----|------------|-------------------|
| `~/.claude/skills/<nume>/SKILL.md` | skilluri de utilizator (doar folderele cu SKILL.md direct în ele) | `nume` |
| `~/.claude/skills/synced/<bucket>/` | skilluri sincronizate din claude.ai (73 + manifest.json) | `anthropic-skills:nume` |
| `~/.claude/commands/**.md` | comenzi slash (subfolder = prefix) | `git:cm`, `gsd:*`, `README`, `review` |
| `~/.claude/agents/*.md` | subagenți (gsd-*, seo-*) | tipuri de agent, nu skilluri |
| `~/.claude/plugins/cache/<marketplace>/<plugin>/<ver>/` | pluginuri; active doar dacă `enabledPlugins` = true în settings.json | `plugin:nume` |
| `<proiect>/.claude/skills/` | skilluri de proiect: `testing`, `ui-ux-pro-max` | `nume` |
| `<proiect>/.agents/skills/` | NU e încărcat automat de Claude Code (folosit de alte unelte) | — |
| încorporate în Claude Code | 17 (dataviz, artifact-*, update-config, code-review, simplify, loop, schedule, claude-api, run, init, security-review …) | `nume` |

Observații:
- În `~/.claude/skills/`, 17 intrări sunt **symlink-uri** către `~/.agents/skills/<nume>` (cele 14
  copii superpowers + design-md, enhance-prompt, react-components). Mutarea symlink-ului nu atinge
  ținta din `~/.agents/skills/`.
- Folderele `agents`, `business-growth`, `documentation`, `engineering`, `engineering-team`,
  `finance`, `product-team`, `project-management`, `ra-qm-team`, `standards`, `templates` din
  `~/.claude/skills/` NU au SKILL.md la primul nivel, deci Claude Code nu le încarcă (sunt doar
  arhive pe disc). Hook-ul `skills-reminder.js` le descrie ca active — informație veche.
- `~/.claude/skills/.trash/` conține 14 skilluri sincronizate pe care Claude Code le-a scos singur
  pe 18.11.2026; se șterg automat după `cleanupPeriodDays` (implicit 30 de zile).

## Inventar pe surse (înainte de curățenie)

| Sursă | Nr. | Conținut |
|-------|-----|----------|
| `~/.claude/skills` (top-level) | 51 | 14 copii superpowers (symlink), design-md, enhance-prompt, react-components (symlink), c-level-advisor, design-qa, marketing-skill, ab-testing, analytics, copy-editing, copywriting, cro, emails, offers, signup, seo + 22 seo-* |
| claude.ai sync (`anthropic-skills:*`) | 73 | agent-designer … xlsx (inclusiv docx, pdf, pptx, xlsx, skill-creator, docs) |
| `~/.claude/commands` | 38 | git:cm, git:cp, git:pr, review, security-scan, README, 32 × gsd:* |
| plugin superpowers 7.0.2 | 15 | cele 14 de mai sus + diagnosing-superpowers |
| plugin frontend-design | 1 | frontend-design |
| plugin code-review | 1 | code-review:code-review |
| plugin engineering-skills 1.1.0 | 20 | senior-*, code-reviewer, playwright-pro, tdd-guide, aws-solution-architect, ms365-tenant-manager, self-improving-agent, tech-stack-evaluator |
| plugin pm-skills 1.0.0 | 6 | atlassian-admin, atlassian-templates, confluence-expert, jira-expert, scrum-master, senior-pm |
| plugin c-level-skills 2.0.0 | 1 | c-level-advisor |
| plugin business-growth-skills 1.1.0 | 3 | customer-success-manager, revenue-operations, sales-engineer |
| plugin context7 | 0 | doar server MCP |
| proiect `.claude/skills` | 2 | testing, ui-ux-pro-max |
| încorporate | 17 | — |
| **Total în listă** | **228** | (/skill-doctor număra ~215 — altă metodă de numărare) |

## GSD (get-shit-done 1.22.4, instalat 2026-03-07)

Instalat prin installer propriu (nu plugin). Componente găsite:
- `~/.claude/commands/gsd/` — 32 comenzi
- `~/.claude/agents/gsd-*.md` — 12 agenți
- `~/.claude/get-shit-done/` — 96 fișiere (bin, references, templates, workflows)
- `~/.claude/gsd-file-manifest.json`
- `~/.claude/hooks/gsd-check-update.js` (SessionStart), `gsd-context-monitor.js` (PostToolUse),
  `gsd-statusline.js` (statusLine) — toate trei referite din `~/.claude/settings.json`
- `~/.claude/cache/gsd-update-check.json`
- `~/.claude/package.json` (`{"type":"commonjs"}`, pus de installer pentru hooks)

---

## Dezactivate 20.11.2026

Curățenie reversibilă: nimic nu s-a șters. Totul s-a mutat în
`C:\Users\tvarv\.claude\_disabled-2026-11-20\`, cu aceeași structură relativă la `C:\Users\tvarv\.claude\`.
Copie a setărilor dinainte: `C:\Users\tvarv\.claude\settings.json.bak`.

**Toate comenzile de readucere sunt PowerShell** și pornesc de la aceste două variabile:

```powershell
$C = 'C:\Users\tvarv\.claude'; $B = "$C\_disabled-2026-11-20"
```

Pentru foldere și junction-uri folosim `[IO.Directory]::Move`, care redenumește doar legătura și nu
copiază conținutul. NU folosi `mv` din Git Bash pe junction-uri. După orice readucere, deschide o
sesiune nouă.

### 1. Setări schimbate în `C:\Users\tvarv\.claude\settings.json`

| Schimbare | Readucere |
|-----------|-----------|
| `"syncClaudeAiSkills": false` (adăugat) | șterge cheia din settings.json → la următoarea pornire skillurile se **descarcă din nou** de pe claude.ai (nu se restaurează din rezervă) |
| `engineering-skills@claude-code-skills` → false | `claude plugin enable engineering-skills@claude-code-skills` |
| `pm-skills@claude-code-skills` → false | `claude plugin enable pm-skills@claude-code-skills` |
| `c-level-skills@claude-code-skills` → false | `claude plugin enable c-level-skills@claude-code-skills` |
| `business-growth-skills@claude-code-skills` → false | `claude plugin enable business-growth-skills@claude-code-skills` |
| `code-review@claude-plugins-official` → false | `claude plugin enable code-review@claude-plugins-official` |
| hook SessionStart `gsd-check-update.js` scos | după readucerea fișierului (secțiunea 3), adaugă în `hooks.SessionStart[0].hooks`: `{"type":"command","command":"node \"C:/Users/tvarv/.claude/hooks/gsd-check-update.js\""}` |
| hook PostToolUse `gsd-context-monitor.js` scos | adaugă în `hooks`: `"PostToolUse":[{"hooks":[{"type":"command","command":"node \"C:/Users/tvarv/.claude/hooks/gsd-context-monitor.js\""}]}]` |
| `statusLine` (gsd-statusline.js) scos | adaugă: `"statusLine":{"type":"command","command":"node \"C:/Users/tvarv/.claude/hooks/gsd-statusline.js\""}` |
| Tot fișierul, dintr-o dată | `Copy-Item "$C\settings.json.bak" "$C\settings.json"` (readuce TOATE setările de mai sus) |

Pluginurile au rămas instalate, doar dezactivate. Nu e nevoie de reinstalare.

### 2. Copiile superpowers (junction-uri către `C:\Users\tvarv\.agents\skills\<nume>`)

Toate 14 există în pluginul superpowers 7.0.2 (verificat înainte de mutare). S-au mutat doar
junction-urile: `~/.agents/skills` are aceleași 132 de fișiere cu hash-uri SHA1 identice înainte și
după mutare, plus 21 de foldere.

| Mutat din | Readucere |
|-----------|-----------|
| `C:\Users\tvarv\.claude\skills\brainstorming` | `[IO.Directory]::Move("$B\skills\brainstorming", "$C\skills\brainstorming")` |
| `C:\Users\tvarv\.claude\skills\writing-plans` | `[IO.Directory]::Move("$B\skills\writing-plans", "$C\skills\writing-plans")` |
| `C:\Users\tvarv\.claude\skills\executing-plans` | `[IO.Directory]::Move("$B\skills\executing-plans", "$C\skills\executing-plans")` |
| `C:\Users\tvarv\.claude\skills\systematic-debugging` | `[IO.Directory]::Move("$B\skills\systematic-debugging", "$C\skills\systematic-debugging")` |
| `C:\Users\tvarv\.claude\skills\dispatching-parallel-agents` | `[IO.Directory]::Move("$B\skills\dispatching-parallel-agents", "$C\skills\dispatching-parallel-agents")` |
| `C:\Users\tvarv\.claude\skills\finishing-a-development-branch` | `[IO.Directory]::Move("$B\skills\finishing-a-development-branch", "$C\skills\finishing-a-development-branch")` |
| `C:\Users\tvarv\.claude\skills\receiving-code-review` | `[IO.Directory]::Move("$B\skills\receiving-code-review", "$C\skills\receiving-code-review")` |
| `C:\Users\tvarv\.claude\skills\requesting-code-review` | `[IO.Directory]::Move("$B\skills\requesting-code-review", "$C\skills\requesting-code-review")` |
| `C:\Users\tvarv\.claude\skills\subagent-driven-development` | `[IO.Directory]::Move("$B\skills\subagent-driven-development", "$C\skills\subagent-driven-development")` |
| `C:\Users\tvarv\.claude\skills\test-driven-development` | `[IO.Directory]::Move("$B\skills\test-driven-development", "$C\skills\test-driven-development")` |
| `C:\Users\tvarv\.claude\skills\using-git-worktrees` | `[IO.Directory]::Move("$B\skills\using-git-worktrees", "$C\skills\using-git-worktrees")` |
| `C:\Users\tvarv\.claude\skills\using-superpowers` | `[IO.Directory]::Move("$B\skills\using-superpowers", "$C\skills\using-superpowers")` |
| `C:\Users\tvarv\.claude\skills\verification-before-completion` | `[IO.Directory]::Move("$B\skills\verification-before-completion", "$C\skills\verification-before-completion")` |
| `C:\Users\tvarv\.claude\skills\writing-skills` | `[IO.Directory]::Move("$B\skills\writing-skills", "$C\skills\writing-skills")` |

### 3. GSD (get-shit-done 1.22.4)

| Mutat din | Readucere |
|-----------|-----------|
| `C:\Users\tvarv\.claude\commands\gsd\` (32 comenzi) | `[IO.Directory]::Move("$B\commands\gsd", "$C\commands\gsd")` |
| `C:\Users\tvarv\.claude\agents\gsd-*.md` (12: codebase-mapper, debugger, executor, integration-checker, nyquist-auditor, phase-researcher, plan-checker, planner, project-researcher, research-synthesizer, roadmapper, verifier) | `Get-ChildItem "$B\agents" -Filter 'gsd-*.md' \| ForEach-Object { [IO.File]::Move($_.FullName, "$C\agents\$($_.Name)") }` |
| `C:\Users\tvarv\.claude\get-shit-done\` (96 fișiere) | `[IO.Directory]::Move("$B\get-shit-done", "$C\get-shit-done")` |
| `C:\Users\tvarv\.claude\gsd-file-manifest.json` | `[IO.File]::Move("$B\gsd-file-manifest.json", "$C\gsd-file-manifest.json")` |
| `C:\Users\tvarv\.claude\hooks\gsd-check-update.js` | `[IO.File]::Move("$B\hooks\gsd-check-update.js", "$C\hooks\gsd-check-update.js")` + intrarea din settings (secțiunea 1) |
| `C:\Users\tvarv\.claude\hooks\gsd-context-monitor.js` | `[IO.File]::Move("$B\hooks\gsd-context-monitor.js", "$C\hooks\gsd-context-monitor.js")` + intrarea din settings |
| `C:\Users\tvarv\.claude\hooks\gsd-statusline.js` | `[IO.File]::Move("$B\hooks\gsd-statusline.js", "$C\hooks\gsd-statusline.js")` + intrarea din settings |
| `C:\Users\tvarv\.claude\cache\gsd-update-check.json` | `[IO.File]::Move("$B\cache\gsd-update-check.json", "$C\cache\gsd-update-check.json")` (opțional, e doar cache) |

Rămas pe loc intenționat: `C:\Users\tvarv\.claude\package.json` (`{"type":"commonjs"}`), care e inofensiv.

### 4. Alte skilluri și comenzi

| Mutat din | Ce era | Readucere |
|-----------|--------|-----------|
| `C:\Users\tvarv\.claude\skills\design-md` | junction → `~/.agents/skills/design-md` | `[IO.Directory]::Move("$B\skills\design-md", "$C\skills\design-md")` |
| `C:\Users\tvarv\.claude\skills\enhance-prompt` | junction → `~/.agents/skills/enhance-prompt` | `[IO.Directory]::Move("$B\skills\enhance-prompt", "$C\skills\enhance-prompt")` |
| `C:\Users\tvarv\.claude\skills\react-components` | junction → `~/.agents/skills/react-components` | `[IO.Directory]::Move("$B\skills\react-components", "$C\skills\react-components")` |
| `C:\Users\tvarv\.claude\skills\c-level-advisor` | folder real | `[IO.Directory]::Move("$B\skills\c-level-advisor", "$C\skills\c-level-advisor")` |
| `C:\Users\tvarv\.claude\commands\README.md` | apărea ca skillul „README” | `[IO.File]::Move("$B\commands\README.md", "$C\commands\README.md")` |

### 5. Skilluri sincronizate din claude.ai (`anthropic-skills:*`, 73 + manifest.json)

Mutate imediat după ce am setat `syncClaudeAiSkills: false`. Altfel, la următoarea pornire, Claude Code
le-ar fi mutat în `skills\.trash` și le-ar fi șters după `cleanupPeriodDays` (implicit 30 de zile).

| Mutat din | Readucere |
|-----------|-----------|
| `C:\Users\tvarv\.claude\skills\synced\7c5e0507-ae41-4fc3-850f-ec510b5cccfc_a64cd214-2b05-4b93-b11d-db90289b5df1\` | Calea recomandată: șterge `syncClaudeAiSkills` din settings.json, iar Claude Code le descarcă din nou, în versiunea curentă. Copia din rezervă rămâne doar pentru consultare sau pentru recuperarea manuală a unui skill anume: `Copy-Item -Recurse "$B\skills\synced\7c5e0507-ae41-4fc3-850f-ec510b5cccfc_a64cd214-2b05-4b93-b11d-db90289b5df1\<nume>" "$C\skills\<nume>"` |
| `C:\Users\tvarv\.claude\skills\synced\.bucket-7c5e0507-…` (marcaj gol) | nu e nevoie, Claude Code îl recreează la sincronizare |

### 6. Coșul vechi `C:\Users\tvarv\.claude\skills\.trash\` (14 intrări, mutate de Claude Code pe 18.11.2026)

Salvate ca să nu fie șterse automat în jur de 18.12.2026. Conțin un bucket sincronizat mai vechi
(`1795032175155-14756-lOza9o`) și 13 skilluri sincronizate individuale: stripe-integration-expert,
senior-backend, senior-computer-vision, senior-fullstack, prompt-engineer-toolkit, scrum-master,
cto-advisor, senior-frontend, saas-scaffolder, content-creator, agile-product-owner,
product-manager-toolkit, senior-pm. Acum sunt în `$B\skills\.trash\<id>\`.
**Nu le readuce în `.trash`**, pentru că acolo s-ar șterge. Ca să folosești unul, copiază folderul
skillului într-un `C:\Users\tvarv\.claude\skills\<nume>\`, de exemplu:
`Copy-Item -Recurse "$B\skills\.trash\1795032690279-19484-8YjpR2\stripe-integration-expert" "$C\skills\stripe-integration-expert"`

### Ce a rămas activ după curățenie (73 în listă)

- `~/.claude/skills`: design-qa, marketing-skill, ab-testing, analytics, copy-editing, copywriting,
  cro, emails, offers, signup, seo + 22 seo-* (33)
- `~/.claude/commands`: git:cm, git:cp, git:pr, review, security-scan (5)
- pluginuri: superpowers (15), frontend-design (1), context7 (doar MCP)
- proiect: testing, ui-ux-pro-max (2)
- încorporate: 17

### Pas următor (neatins aici)

`C:\Users\tvarv\.claude\hooks\skills-reminder.js` (hook **SessionStart**, singurul hook rămas) le spune
în continuare sesiunilor să folosească GSD, `engineering/`, `c-level-advisor/` și locații care nu mai
sunt valabile. Trebuie rescris după noua listă.
