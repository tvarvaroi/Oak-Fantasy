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
| `C:\Users\tvarv\.claude\skills\marketing-skill` | folder real (alirezarezvani/claude-skills, aproape de commitul `00ee177` din 06.03.2026: 183 din 184 fișiere identice), mutat la actualizarea auditată, vezi secțiunea „Actualizare auditată 20.11.2026” | `[IO.Directory]::Move("$B\skills\marketing-skill", "$C\skills\marketing-skill")` |

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
  → după actualizarea auditată din aceeași zi: fără marketing-skill, cu seo-agentic (tot 33):
  design-qa, cele 8 de marketing, seo + 23 seo-*. Vezi secțiunea următoare.
- `~/.claude/commands`: git:cm, git:cp, git:pr, review, security-scan (5)
- pluginuri: superpowers (15), frontend-design (1), context7 (doar MCP)
- proiect: testing, ui-ux-pro-max (2)
- încorporate: 17

---

## Actualizare auditată 20.11.2026 — pachetul SEO și skillurile de marketing

Făcută în două faze: audit pe o copie descărcată în `C:\Users\tvarv\skills-staging\` (fără a rula nimic
din repo-uri), apoi copiere manuală după „da”-ul founder-ului. Instalatoarele originale NU au fost rulate.
Jurnalul complet al auditului: `C:\Users\tvarv\skills-staging\_audit\` (se păstrează până confirmă
founder-ul după `/skill-doctor`).

| Pachet | Sursă | Versiune veche → nouă | Commit instalat | Instalat |
|--------|-------|-----------------------|-----------------|----------|
| SEO (`seo` + 23 `seo-*`, 17 agenți) | https://github.com/AgriciDaniel/claude-seo | v2.2.0 (`47df91e`) → **v2.6.2** | `468ed5b0d9e3249394783710e54abb02837e326b` | 20.11.2026 |
| Marketing (cro, copywriting, copy-editing, ab-testing, analytics, emails, offers, signup) | https://github.com/coreyhaines31/marketingskills | v2.8.1 (`33218ff`) → **v2.14.25** | `5b2b400eec1e7e1cec76245a715d0b0d4fd2a9c1` | 20.11.2026 |
| `marketing-skill` | https://github.com/alirezarezvani/claude-skills | cel mai apropiat commit: `00ee177` (06.03.2026): 183 din 184 fișiere identice, diferă doar `version` din `.claude-plugin/plugin.json` (1.1.0 local, 1.0.0 la commit); NEactualizat | — | mutat în rezervă |

**Auditat de:** Claude Code, un singur auditor, fără verificare independentă; citit integral ce s-a instalat.

Precizări la fraza de mai sus:
- „Citit integral” = fișierele din repo care au ajuns în `~/.claude`: 242 pentru SEO (67 de scripturi,
  24 SKILL.md, 17 agenți, fișierele de referință, șabloane, `requirements.txt`) și 32 pentru marketing.
- NU acoperă ce a adus `/seo setup` din afara repo-ului: 66 de pachete Python de pe PyPI și Chromium.
  Acelea nu au fost auditate; versiunile exacte sunt în `_brain/skills-locks/claude-seo-2.6.2.txt`.
- Un al doilea cititor a existat doar pentru 117 fișiere SEO fără cod (89 de referință, 18 LICENSE.txt,
  9 șabloane .md, 1 șablon HTML) și pentru scriptul de instalare al Fazei 2. Scripturile, SKILL.md și agenții au avut un singur auditor.
- Tagul marketingskills v2.14.25 avea sub 24 de ore la instalare (publicat 20.11.2026, 02:15 UTC).
- Restul repo-urilor (extensiile claude-seo au fost citite; CLI-urile și celelalte 45 de skilluri din
  marketingskills și conținutul noului `marketing-skill` NU) nu s-a instalat.

### Ce s-a instalat și ce nu

SEO, din v2.6.2:
- skilluri (24): `seo`, `seo-agentic` (nou), `seo-audit`, `seo-backlinks`, `seo-cluster`,
  `seo-competitor-pages`, `seo-content`, `seo-content-brief`, `seo-drift`, `seo-ecommerce`, `seo-flow`,
  `seo-geo`, `seo-google`, `seo-hreflang`, `seo-images`, `seo-local`, `seo-maps`, `seo-page`, `seo-plan`,
  `seo-programmatic`, `seo-schema`, `seo-sitemap`, `seo-sxo`, `seo-technical`;
- agenți (17) în `~/.claude/agents`: cei 16 de dinainte + `seo-agentic`;
- în `~/.claude/skills/seo/`: `scripts/` (67 de fișiere), `schema/`, `data/`, `requirements.txt`,
  `runtime-plugin.json` (copia lui `.claude-plugin/plugin.json`, din care runtime-ul își citește versiunea).
  La rulare apare și `scripts/__pycache__/` (bytecode generat local, nu din repo);
- atenție: `scripts/` e setul complet de bază al repo-ului minus cele două unlighthouse, deci conține și
  scripturile folosite de skillurile NEinstalate (`bing_webmaster.py`, `shopify_crawl.py`, `shopify_env.py`,
  `dataforseo_*.py`, `matomo_*.py`). Au fost citite integral, sunt în lista permisă a lansatorului și nu
  fac nimic fără chei API; unele sunt folosite și de skilluri instalate (seo-ecommerce, seo-backlinks).

NEinstalat din SEO (decizia founder-ului):
- skilluri `seo-bing`, `seo-shopify`, `seo-posthog`, `seo-dataforseo`, `seo-image-gen` și agenții
  `seo-posthog`, `seo-dataforseo`, `seo-image-gen` (cer chei API sau servere MCP);
- toate cele 11 extensii (`extensions/`): instalatoarele lor scriu servere MCP și chei în clar în
  configurația Claude;
- `/seo unlighthouse`: skillul e în extensii, iar scripturile `unlighthouse_run.py` și
  `unlighthouse_http_proxy.cjs` au fost lăsate deliberat afară (pe Windows, primul trimite URL-ul
  neprotejat către `npx.cmd`). Lansatorul îl refuză: „script is not in the bundled runtime allowlist”;
- `hooks/` (funcționează doar la instalare ca plugin; niciun skill nu-l folosește). Niciun hook și niciun
  server MCP nu au fost adăugate; `settings.json` are același hash înainte și după.

Marketing, din v2.14.25: doar markdown (SKILL.md + `references/*.md`, 32 de fișiere). Fără `evals/`, fără
`AGENTS.md` (conține instrucțiunea „verifică actualizări” care ar pune modelul să descarce `VERSIONS.md`),
fără `tools/`, fără niciun skill nou din repo (attribution, conversion-tracking, events,
influencer-marketing, link-building, reverse-engineer-marketing nu au fost auditate).

### Modificări locale (de refăcut la următoarea actualizare)

Fișierele instalate sunt identice octet cu octet cu sursa de la commit, cu aceste excepții (verificate
automat: 220 identice, 50 + 4 diferă doar prin ce e scris aici):

1. **SEO, 50 de fișiere `.md`**: cele 4 înlocuiri pe care le face `install.ps1` (liniile 298–299 și 339–347):
   - `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run` → `"$HOME/.claude/skills/seo/scripts/claude-seo" run`
   - la fel pentru `setup` și `doctor`
   - `${CLAUDE_PLUGIN_ROOT}/skills/` → `C:/Users/tvarv/.claude/skills/`

   După înlocuiri: 0 căi sau comenzi cu `${CLAUDE_PLUGIN_ROOT}`. A rămas 1 mențiune în proză, în
   `skills/seo/SKILL.md` linia 20 („Claude Code expands `${CLAUDE_PLUGIN_ROOT}` to the installed plugin
   directory…”), pe care o lasă și instalatorul original. Numele mai apare în 4 scripturi nemodificate
   (`claude-seo`, `runtime.py`, `consistency_check.py`, `matomo_auth.py`): comentarii, text de ajutor și
   citirea variabilei de mediu în `runtime.py:106`.
2. **Marketing, 4 fișiere, 18 linkuri**: `https://github.com/coreyhaines31/marketingskills/blob/main/…` →
   `…/blob/5b2b400eec1e7e1cec76245a715d0b0d4fd2a9c1/…` în `analytics/SKILL.md` (9), `emails/SKILL.md` (7),
   `cro/SKILL.md` (1), `signup/SKILL.md` (1). Toate cele 18 ținte există la acel commit.
3. **Fișiere adăugate de noi**: `~/.claude/skills/seo/.provenance` și `~/.claude/skills/cro/.provenance`
   (sursă, commit, dată, ce s-a instalat, modificările locale). Testul a lăsat și
   `~/.claude/skills/seo/scripts/__pycache__/` (2 fișiere `.pyc`, bytecode Python; se pot șterge oricând).
4. **Lăsate afară** față de ce copiază instalatorul: cele două scripturi unlighthouse, `hooks/`, skillurile
   și agenții din lista „NEinstalat”, extensiile.

Rețeta completă: `_brain/skills-locks/phase2.py` (`plan`, `backup`, `install`, `verify`; copie a scriptului
folosit, care stă și în `C:\Users\tvarv\skills-staging\_audit\`). Lista celor 50 + 4 fișiere modificate:
`_brain/skills-locks/phase2-modified-files.json`. `python -I phase2.py verify` reface comparația doar cât
timp există sursele auditate din `C:\Users\tvarv\skills-staging\`.

### Mediul izolat al scripturilor SEO (`/seo setup`)

De la v2.2.4 scripturile pornesc doar prin lansator și doar după setup. Rulat pe 20.11.2026 cu
`py -3 "C:/Users/tvarv/.claude/skills/seo/scripts/runtime.py" setup` (exact ce face instalatorul la final).

- Unde: `C:\Users\tvarv\.claude\skills\seo\.venv` (≈635 MB), `ms-playwright\` (≈744 MB: chromium-1255,
  chromium_headless_shell-1255, ffmpeg-1013, winldd-1007), `runtime-state.json`. Python 3.12.10.
- Pachete: 66 de wheel-uri de pe `files.pythonhosted.org` (index `pypi.org`), fără nicio compilare din
  surse. Lista exactă: `_brain/skills-locks/claude-seo-2.6.2.txt` (`pip freeze --all`).
  `requirements.txt` are doar intervale de versiuni, deci un setup refăcut altă dată poate aduce alte versiuni.
- Restricții puse de noi la rulare (variabile de mediu, nu modificări în script): `PIP_ONLY_BINARY=:all:`,
  `PIP_NO_CACHE_DIR=1`, `PIP_REQUIRE_VIRTUALENV=1`, `PIP_INDEX_URL=https://pypi.org/simple`,
  `PIP_CONFIG_FILE=nul`, `PIP_NO_INPUT=1`, `PIP_LOG` (jurnalul e în staging, `setup-pip.log`).
- Verificat înainte/după: `settings.json`, serverele MCP și hook-urile, pachetele Python globale (68,
  neschimbate), npm global, PATH și variabilele de mediu (utilizator și mașină), servicii, sarcini
  programate, cheile Run, Program Files/ProgramData — toate neschimbate. Singura scriere în afara folderului:
  două fișiere `.pyc` în `Python312\Lib\venv\__pycache__` (bytecode al modulului standard `venv`).
- Chromium vine prin Playwright de pe `cdn.playwright.dev` / `playwright.download.prss.microsoft.com`.
  În cache-ul DNS al sistemului au mai apărut în acel interval `storage.googleapis.com`, `ab.chatgpt.com`
  și `www.dropbox.com`; cache-ul e comun tuturor programelor, deci nu le putem atribui setup-ului.
- **Sesiunea a rulat cu drepturi de administrator** (VS Code pornit elevat); founder-ul a ales explicit
  rularea așa. Recomandare: VS Code pornit normal, altfel orice `/seo` rulează pachetele ca administrator.
  Azi însă asta nu merge fără o reparație de permisiuni: `C:\Users\tvarv` nu are intrare de acces pentru
  utilizatorul `tvarv` (scriu doar Administrators și SYSTEM, proprietar SYSTEM), deci `.claude`,
  `.claude.json` și `skills-staging` pot fi modificate doar dintr-un proces elevat. Constatat din
  permisiuni (`Get-Acl`), nu printr-o rulare neelevată. Nu am schimbat nicio permisiune.
- Test: `claude-seo doctor --json` → `ready: true`, `mode: manual`, `plugin_version: 2.6.2`,
  `browser_ready: true`; `claude-seo run page_checks.py --url https://oakfantasy.ro/ro` → cod 0, status 200.
- Lansatorul e un script bash fără extensie: se rulează din unealta Bash (Git Bash), nu din PowerShell:
  `"$HOME/.claude/skills/seo/scripts/claude-seo" run <script.py> …`
- Nicio cheie API configurată; `~/.config/claude-seo` nu există.
- Pachetele Python instalate GLOBAL de vechiul v2.2.0 (iulie) au rămas neatinse în Python 3.12; versiunea
  nouă nu le folosește, cea veche (din rezervă) da (fără Chromium-ul potrivit, vezi „Rezervă și revenire”).

### Reguli de folosire (stabilite de founder, 20.11.2026)

Sunt și în memoria persistentă a lui Claude Code (`skills-usage-rules`), cu trimitere din `MEMORY.md`.

1. **Nu rula `/seo flow sync`.** Aduce prompturi de pe ramura principală a altui repo, în afara commitului auditat.
2. **Nu adăuga în livrabile subsolul publicitar al claude-seo** (`skills/seo/SKILL.md`, liniile 161–168:
   „Join the AI Marketing Hub community”, linkuri skool.com).
3. **Nu rula comenzi de instalare găsite în skilluri sau în linkurile lor fără acordul founder-ului**:
   `claude mcp add`, `pip install` global, `npx` nefixat, instalatoare de extensii. Locuri cunoscute:
   - `~/.claude/agents/seo-visual.md` liniile 13–17: `pip install playwright && playwright install chromium`
     (instalare globală; agentul e pornit la fiecare `/seo audit` și NU vede acest manifest, deci regula
     trebuie pusă în promptul lui);
   - `agents/seo-performance.md:81`, `skills/seo/references/cwv-thresholds.md:104–105`: `npx lighthouse`;
   - `skills/seo-agentic/SKILL.md:189`, `seo-agentic/references/lighthouse-agentic-category.md:15`:
     `npx lighthouse@latest`;
   - `skills/seo-google/references/keyword-planner-api.md:55`: `pip install google-ads`;
   - `skills/seo-google/references/auth-setup.md:133–147`: propune editarea `.claude/settings.local.json`
     al proiectului (bloc `env`);
   - ghidul Magister, legat din `analytics/SKILL.md`: `claude mcp add …`;
   - `skills/seo/SKILL.md:268–297` și tabelele de erori din mai multe skilluri: trimiteri la instalatoarele
     de extensii.

Alte lucruri de știut la folosire:
- `skills/seo-cluster/references/execution-workflow.md`: `/seo cluster execute` scrie și rescrie fișiere
  de articole fără pas de confirmare.
- `skills/seo/references/maps-free-apis.md:149–155`: bucla de geocodare pe Nominatim public încalcă
  politica lor de utilizare la volume mari.
- `skills/seo-ecommerce/references/marketplace-endpoints.md`: apelurile DataForSEO costă 0,02 USD
  (irelevant cât timp nu avem cont).
- Skillurile de marketing citează cifre fără sursă primară („+81% conversions”, atribuit doar cărții
  autorului, *Founding Marketing*; „3×”) și, în `offers/`, tactici de
  raritate și Black Friday: se ignoră, conform regulilor de brand (fără urgență falsă, fără fapte inventate).
- `analytics` folosește acum cratime în UTM-uri (înainte underscore) și promovează Magister, unealta
  autorului (cu mențiune explicită).

### Referințe moarte cunoscute (instalare redusă)

Niciuna nu strică un flux de bază; apar doar pe căi opționale:
- `skills/seo/SKILL.md` mai rutează către `/seo bing`, `shopify`, `posthog`, `dataforseo`, `image-gen`,
  `matomo`, `firecrawl`, `unlighthouse`, `ahrefs`, `profound`, `seranking` și către agenții `seo-matomo`,
  `seo-posthog`, `seo-dataforseo`, `seo-image-gen`;
- `skills/seo-ecommerce/references/marketplace-endpoints.md:118` → `…/skills/seo-dataforseo/references/cost-tiers.md`;
- `./extensions/*/install.sh` (extensiile nu sunt copiate);
- marketing: `offers/references/offer-formats.md:202` → `../../pricing/SKILL.md`; trimiteri la skilluri
  neinstalate (onboarding, popups, pricing, revops ș.a.) și la `seo-audit` al marketingskills, care NU e
  `seo-audit` din claude-seo.

### Rezervă și revenire

Nimic nu s-a șters. Versiunile vechi sunt în `C:\Users\tvarv\.claude\_backup-2026-11-20\` (`skills\`: 23
SEO + 8 marketing; `agents\`: 16), iar `marketing-skill` în `C:\Users\tvarv\.claude\_disabled-2026-11-20\skills\`.

Comenzile sunt PowerShell și trebuie rulate într-un PowerShell deschis cu „Run as administrator”: tot ce e
în `C:\Users\tvarv\.claude` poate fi modificat doar de grupul Administrators (folderul de profil nu are
intrare de acces pentru utilizatorul `tvarv`; constatat cu `Get-Acl`). Într-un PowerShell obișnuit comenzile
dau „Access to the path is denied” și nu schimbă nimic. `[IO.Directory]::Move` și `[IO.File]::Move` dau
eroare dacă ținta există, deci nu pot suprascrie. Înainte: închide orice proces pornit din `skills\seo`
(Python din `.venv`, Chromium din `ms-playwright`) și orice terminal aflat în acel folder. După: sesiune nouă.

Readucerea lui `marketing-skill`:

```powershell
$C = 'C:\Users\tvarv\.claude'
[IO.Directory]::Move("$C\_disabled-2026-11-20\skills\marketing-skill", "$C\skills\marketing-skill")
```

Revenirea la versiunile vechi (parchează versiunile noi în `_rolledback-2026-11-20`, nu șterge nimic).
Lipește blocul întreg, cu tot cu `& {` și `}`, ca să se oprească la prima eroare. `$ce` alege pachetul:
`'tot'`, `'seo'` sau `'marketing'`. Blocul poate fi rulat din nou după o oprire (continuă de unde a rămas)
și încă o dată, mai târziu, pentru celălalt pachet. `skills\seo` se mută primul: dacă e blocat de un
proces, blocul se oprește înainte să fi schimbat ceva. Blocul a fost verificat sintactic și simulat pe
starea reală a folderelor, dar NU a fost rulat.

```powershell
& {
  $ErrorActionPreference = 'Stop'
  $ce = 'tot'   # 'tot', 'seo' sau 'marketing'
  $C = 'C:\Users\tvarv\.claude'; $K = "$C\_backup-2026-11-20"; $R = "$C\_rolledback-2026-11-20"
  $mkt = 'cro','copywriting','copy-editing','ab-testing','analytics','emails','offers','signup'
  if ($ce -notin 'tot','seo','marketing') { throw 'ce = tot, seo sau marketing' }
  $admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
  if (-not $admin) { throw 'Deschide PowerShell cu Run as administrator: folderul .claude poate fi modificat doar de Administrators.' }
  if ($ce -ne 'marketing' -and (Get-Process | Where-Object { $_.Path -like "$C\skills\seo\*" })) { throw 'Un proces din skills\seo încă rulează.' }
  New-Item -ItemType Directory -Force "$R\skills", "$R\agents" | Out-Null
  # ce a mai rămas de readus din rezervă; seo primul
  $sk = @(Get-ChildItem "$K\skills" -Directory | ForEach-Object { $_.Name } | Where-Object { $ce -eq 'tot' -or (($_ -in $mkt) -eq ($ce -eq 'marketing')) })
  $sk = @($sk | Where-Object { $_ -eq 'seo' }) + @($sk | Where-Object { $_ -ne 'seo' })
  $ag = @(); if ($ce -ne 'marketing') { $ag = @(Get-ChildItem "$K\agents" -Filter 'seo-*.md' | ForEach-Object { $_.Name }) }
  foreach ($n in $sk) {   # versiunea nouă iese, cea veche revine
    if ((Test-Path "$C\skills\$n") -and -not (Test-Path "$R\skills\$n")) { [IO.Directory]::Move("$C\skills\$n", "$R\skills\$n") }
    [IO.Directory]::Move("$K\skills\$n", "$C\skills\$n")
  }
  foreach ($a in $ag) {
    if ((Test-Path "$C\agents\$a") -and -not (Test-Path "$R\agents\$a")) { [IO.File]::Move("$C\agents\$a", "$R\agents\$a") }
    [IO.File]::Move("$K\agents\$a", "$C\agents\$a")
  }
  if ($ce -ne 'marketing') {   # seo-agentic nu are versiune veche: doar iese
    if ((Test-Path "$C\skills\seo-agentic") -and -not (Test-Path "$R\skills\seo-agentic")) { [IO.Directory]::Move("$C\skills\seo-agentic", "$R\skills\seo-agentic") }
    if ((Test-Path "$C\agents\seo-agentic.md") -and -not (Test-Path "$R\agents\seo-agentic.md")) { [IO.File]::Move("$C\agents\seo-agentic.md", "$R\agents\seo-agentic.md") }
  }
  "Readuse: $($sk.Count) skilluri, $($ag.Count) agenți. Versiunile noi sunt în $R."
}
```

Ce nu face blocul: nu readuce `marketing-skill` (comanda de mai sus) și lasă goale `_backup-2026-11-20\skills`
și `\agents`. Versiunile noi rămân în `_rolledback-2026-11-20` (≈1,4 GB cu `.venv` și `ms-playwright`).
Dacă o mutare dă „Access to the path is denied” într-un PowerShell elevat, ceva ține un fișier deschis:
închide-l și rulează blocul din nou.

Doar un pachet: `$ce = 'marketing'` (cele 8; agenții nu se ating) sau `$ce = 'seo'` (seo + 22 seo-*, cei 16
agenți; `seo-agentic` și agentul lui ies). Celălalt pachet poate fi readus mai târziu cu același bloc.

Vechiul SEO v2.2.0 folosește pachetele Python globale, care sunt încă instalate (playwright 1.61.0, bs4,
requests, lxml, trafilatura ș.a.). Atenție: Playwright-ul global cere Chromium revizia 1228, iar în
`%LOCALAPPDATA%\ms-playwright` sunt doar 1208 și 1223. După revenire, scripturile fără browser merg, dar
randarea și capturile (`render_page.py`, `capture_screenshot.py`) nu pornesc fără
`python -m playwright install chromium`, care e o instalare globală: doar cu acordul founder-ului
(regula 3). Situația era aceeași și înainte de actualizare.

### Rămase de decis

- `agents/seo-visual.md` 13–17: o a cincea modificare locală (înlocuirea blocului cu o trimitere la
  `/seo setup`) ar face regula 3 valabilă și pentru subagent. Nefăcută: nu a fost cerută.
- `skills/seo/SKILL.md:20`: mențiunea în proză a variabilei poate fi rescrisă ca a șasea modificare locală.
- Skillurile noi din marketingskills, extensiile SEO și `marketing-skill` v2.14.14 (plugin cu hook
  `UserPromptSubmit`) cer audit separat înainte de orice instalare.
- Permisiunile folderului de profil `C:\Users\tvarv` (scriere doar pentru Administrators): cât timp rămân
  așa, Claude Code și comenzile de revenire rulează elevat. Repararea lor e decizia founder-ului.
- Ștergerea `C:\Users\tvarv\skills-staging\` (≈150 MB) și, mai târziu, a rezervelor: doar la confirmarea founder-ului.

---

## Cum se ține la zi

- **Hook-ul** `C:\Users\tvarv\.claude\hooks\skills-reminder.js` (SessionStart, singurul hook rămas),
  rescris pe 20.11.2026. Pune în fiecare sesiune un text fix, „SKILLS CHECK”: uită-te la skillurile
  disponibile, încarcă-le pe cele potrivite task-ului, spune într-un rând ce ai încărcat. Nu mai conține
  numere, căi de foldere sau nume de pluginuri, deci nu se învechește când se schimbă setup-ul.
- **Fișierul** `C:\Users\tvarv\.claude\skills-audit.json`:
  `{ "lastAudit": "AAAA-LL-ZZ", "maxAgeDays": 30, "manifest": "<calea către acest fișier>" }`.
- **Regula de 30 de zile:** dacă de la `lastAudit` au trecut mai mult de `maxAgeDays` zile, hook-ul
  adaugă „SKILLS AUDIT OVERDUE”, iar sesiunea îți spune asta la primul răspuns și propune
  `/skill-doctor` + actualizarea acestui manifest.
- **După fiecare audit:** rulezi `/skill-doctor`, actualizezi manifestul, apoi pui data zilei în
  `lastAudit`. Fără acest ultim pas, avertismentul rămâne.
- Dacă `skills-audit.json` lipsește sau e stricat, hook-ul afișează doar textul fix și nu dă eroare
  (testat: dată de azi, dată veche, fișier lipsă, JSON trunchiat; cod de ieșire 0 de fiecare dată).
  Atenție: în acest caz nici avertismentul de audit nu mai apare.
- Versiunea veche a hook-ului: `C:\Users\tvarv\.claude\_disabled-2026-11-20\hooks\skills-reminder.js`.
  Readucere: `Copy-Item "$B\hooks\skills-reminder.js" "$C\hooks\skills-reminder.js" -Force`.
