# Verification Workflow

The Oak Fantasy project ships with a single command that verifies the site is still working: `npm run verify`. Use it before every commit, in every task. Aim for green.

## Quick start

```bash
npm run verify
```

Runs in ~3 minutes (114 E2E tests across 3 viewports + typecheck + lint + i18n) and gates on:

1. **TypeScript** — `tsc --noEmit`, zero errors
2. **ESLint** — `next lint`, zero errors
3. **i18n** — `check:i18n`, zero missing keys, no cedilla, no RO chars in EN
4. **E2E + visual regression** — Playwright across 3 viewports

Lighthouse runs separately (slower, 1–2 min per preset).

## When to use each script

| Script | When | Time |
|---|---|---|
| `npm run verify` | Before every commit, in every task | ~4–5min |
| `npm run typecheck` | Quick TS sanity check during refactor | <5s |
| `npm run lint` | ESLint only, while iterating | <5s |
| `npm run check:i18n` | Catch i18n bugs fast (5s, zero deps) | <5s |
| `npm run test:e2e` | Non-visual E2E tests, 3 parallel workers | ~1.5min |
| `npm run test:e2e:visual` | Visual regression alone, single worker (stability) | ~2.5min |
| `npm run test:e2e:headed` | Debug a failing E2E test, watch the browser | 1–2min |
| `npm run test:e2e:update` | Refresh visual regression baselines after intentional changes | ~2.5min |
| `npm run lighthouse` | Desktop perf audit, before major deploys | 1–2min |
| `npm run lighthouse:mobile` | Mobile perf audit, weekly | 1–2min |

## Visual regression failures

If `verify` fails on `toHaveScreenshot`:

1. Open the report: `npx playwright show-report`
2. Inspect the diff images side-by-side
3. **If change is INTENTIONAL** (you redesigned a section): `npm run test:e2e:update` to refresh baselines, then commit the new `.png` files
4. **If change is UNINTENTIONAL** (regression bug): fix the code, don't update the baseline

The 2% pixel tolerance (`maxDiffPixelRatio: 0.02` in `playwright.config.ts`) covers cross-system rendering drift; anything above that is a real change.

## i18n failures

`check:i18n` enforces these rules:

- **`Legacy cedilla diacritic`**: replace `ş` → `ș` and `ţ` → `ț` (use VS Code find-replace; one is Turkish, the other is the Romanian standard)
- **`Missing EN/RO key`**: add the equivalent in the other locale's block in the content map
- **`Romanian diacritic in en: block`**: an EN translation was forgotten — update the EN value

Warnings (no exit failure):
- `Potential hardcoded visible text in JSX`: probabilistic detector, often false positives on brand names. Review periodically, extract to content map if it's real copy.

JSON output:
```bash
npm run check:i18n -- --json
```
Returns `{ passed, errors[], warnings[] }`.

## Lighthouse thresholds

Configured in `lighthouserc.desktop.json` and `lighthouserc.mobile.json`. Identical thresholds on both presets:

- Performance ≥ 80
- Accessibility ≥ 95
- SEO ≥ 95
- Best Practices ≥ 90

**Do NOT lower thresholds when a page fails.** Investigate and fix:
- Performance: oversized images, missing `loading="lazy"`, render-blocking JS
- Accessibility: missing `alt`, low contrast, missing `aria-label`
- SEO: missing canonical, missing meta description, broken hreflang
- Best Practices: HTTP/2 (skipped for local dev), console errors, deprecated APIs

## CI integration (future)

When we set up GitHub Actions:
- `npm run verify` runs on every PR — gates merge
- `npm run lighthouse` + `npm run lighthouse:mobile` run nightly on `main`
- Visual regression baselines committed in `tests/e2e/__screenshots__/` are the source of truth across machines

## Anti-patterns

- ❌ Don't run `npm run build` on Windows while `npm run dev` is running (`.next` cache corruption — see `_brain/notes/gotchas.md`)
- ❌ Don't `--update-snapshots` blindly when tests fail — first verify the change is intentional
- ❌ Don't bypass `verify` with `--no-verify` on commits — that defeats the gate
- ❌ Don't commit `test-results/`, `playwright-report/`, `.lighthouseci/` — all gitignored
