# Faza C — Automation Infrastructure

> **Status:** plan, awaiting approval
> **Author:** Claude Code (Opus 4.7)
> **Date:** 2026-05-23
> **Predecessor:** [2026-05-16-despre-page.md](2026-05-16-despre-page.md), Faza A (commits + push), Faza B (shared components i18n cleanup)

## Goal

A single `npm run verify` command that — in <90 seconds — answers the question *"is the site still working?"* with concrete evidence. Everything that survives the gate is provably:

1. TypeScript-clean (zero errors)
2. ESLint-clean (zero errors/warnings — `next lint` defaults)
3. i18n-complete (no RO chars in EN strings, no legacy cedilla diacritics, no missing locale keys)
4. Page-reachable (all routes return 200, zero console errors)
5. Visually unchanged (screenshots match baselines on 3 viewports)
6. SEO-correct (title, description, canonical, hreflang, JSON-LD on all pages)

Lighthouse runs separately (`npm run lighthouse`) — too slow for the verify gate, valuable for periodic audits.

## Architecture decisions (recorded for decisions.md)

| # | Decision | Rationale | Alternative rejected |
|---|---|---|---|
| 1 | **Chromium only** for Playwright (no Firefox/WebKit) | Production audience is 70%+ Chromium-based (Chrome, Edge, Opera, Samsung Browser); Firefox/Safari have separate rendering quirks but visual regression on Chromium catches the dominant case. Each additional engine = +200MB install + 2x runtime. | All 3 engines — overkill for a marketing site, slows verify >90s budget |
| 2 | **Lighthouse OUT of `verify`** | Lighthouse takes 1-2 min for 4 URLs even with throttling disabled. Verify must be <90s to stay in active-feedback loop. Running 1x/week vs every commit is the right cadence for perf audits. | Lighthouse in verify — would blow the time budget, devs would skip the gate |
| 3 | **Custom i18n checker** (Node stdlib, zero deps) | Two project-specific rules to enforce: (a) RO diacritics in EN strings = forgotten translation, (b) cedilla ş/ţ = bad encoding. No off-the-shelf tool knows our content-map convention. ~120 lines of regex+glob is cheaper than configuring i18next-checker for our shape. | `i18next-parser`/`lingui-extract` — overkill, expects framework-specific message catalogs |
| 4 | **`maxDiffPixelRatio: 0.02`** (2% tolerance) | Cross-system font rendering, subpixel anti-aliasing, and color profile differences produce ~0.5-1% diff even when nothing changed. 2% covers env drift without hiding real regressions (a typo or color change = 5%+). | 0% (false positives), 5% (hides real changes) |
| 5 | **`reuseExistingServer: !process.env.CI`** | Founder's `npm run dev` is often already running. Re-spawning it costs 5-10s; reusing it = instant. CI will have its own server lifecycle. | Always spawn — slow local; never spawn — flaky in CI |
| 6 | **Screenshots committed to git** in `tests/e2e/__screenshots__/` | Visual regression needs a stable baseline across machines. Without commits, every dev has their own baselines → useless. PNG bytes are small (few KB at viewport sizes), well-compressed in git pack. | Generate per-run — defeats the purpose of regression testing |
| 7 | **Screenshot path platform-agnostic** | Playwright defaults emit OS-specific subfolders (`*-linux`, `*-darwin`, `*-win32`). On a solo-dev Windows project, that creates phantom paths when CI runs Linux. Set `snapshotPathTemplate` to omit `{platform}` so baselines are shared. | Default — would generate two baseline sets, double maintenance |

## Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Playwright install fails on Windows (postinstall script blocked by AV) | Medium | Plan B: skip `playwright install chromium` and use `PLAYWRIGHT_BROWSERS_PATH=0` env to install in node_modules. Document in gotchas if hit. |
| First-run screenshot baselines are taken from a broken render | High | Manual visual verification by founder BEFORE committing baselines. Plan: run `test:e2e:headed` first, founder confirms visuals, THEN commit baselines as separate commit. |
| Dev server boot >30s eats verify budget | Low (Next.js dev is ~3-5s on this stack) | `webServer.timeout: 60000`; `reuseExistingServer: true`. Founder usually has dev running anyway. |
| Visual diff fails on 3D canvas (procedural texture randomness) | High | 3D canvas (`CuttingBoard3D`) animates and uses Math.random for grain seed → unstable screenshots. Mitigation: mask the canvas region in screenshots via `mask: [page.locator('.canvas-3d')]`. |
| i18n checker false positives on legitimate EN content with mixed text | Medium | Scope check strictly to `en:` blocks via balanced-brace parsing; report as JSON with `file:line:snippet` so founder can audit. |
| `.next` cache corruption during install | Medium | Don't run `npm run build` (known gotcha). Only `typecheck` + `dev`. |

## C1 — Playwright E2E + Visual Regression

### Files to create

```
playwright.config.ts                       # Root config
tests/
  e2e/
    fixtures.ts                            # Shared utilities (disableAnimations, hideCanvas3D)
    homepage.spec.ts                       # /ro + /en — loads, console-clean, key elements, language toggle
    despre.spec.ts                         # /ro/despre + /en/about — loads + redirects + content
    shared-components.spec.ts              # Navbar tagline, Footer microTagline, NumbersStrip suffixes
    seo.spec.ts                            # <title>, <link rel="canonical">, hreflang, JSON-LD
    visual-regression.spec.ts              # Screenshots on 3 viewports × 4 pages
    __screenshots__/                       # Auto-generated baselines (committed)
```

### `playwright.config.ts` outline

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,             // Sequential — visual regression is order-stable; faster on a single core too
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,                       // Single worker — dev server is single-threaded, parallel = pointless
  reporter: [['html', { open: 'never' }], ['list']],
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',  // No {platform}
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-mobile',  use: { ...devices['iPhone 13'] } },             // 390x844
    { name: 'chromium-tablet',  use: { ...devices['iPad (gen 7)'] } },          // 810x1080
    { name: 'chromium-desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Test specs — what each verifies

#### `homepage.spec.ts`
- `/ro` and `/en` return 200, document is rendered
- No `console.error` events during page load (capture via `page.on('console')`)
- Key DOM landmarks present: `header[role=banner]` or visible `Navbar`, `Hero` h1, `Footer`, NumbersStrip section
- Language toggle: click EN on `/ro` → URL becomes `/en`, content reflects (assert via Navbar tagline)
- Diacritic visual check: `await expect(page.locator('body')).toContainText('Carpați')` on RO

#### `despre.spec.ts`
- `/ro/despre` and `/en/about` return 200
- `/en/despre` → 308 redirect to `/en/about` (assert via `response.status()` chain)
- `/ro/about` → 308 redirect to `/ro/despre`
- Specific RO content: "Cinci pași între copac și bucătărie", "nealtoit" (authenticity marker)
- Specific EN content: "Five steps between tree and kitchen" (or actual EN translation from `content.ts` — to verify)

#### `shared-components.spec.ts`
- Navbar tagline RO: visible text `stejar · manual`
- Navbar tagline EN: visible text `oak · handmade`, NO `stejar`
- Footer microTagline RO: `stejar · manual · România`
- Footer microTagline EN: `oak · handmade · Romania`, NO `stejar`, NO `România` (only `Romania`)
- NumbersStrip RO: contains `20+ ani`, `1.200+`
- NumbersStrip EN: contains `20+ years`, `1,200+`, NO `ani`
- Footer logo: `<img>` with `src` ending `.jpeg` (founder's brand logo, not the SVG fallback)

#### `seo.spec.ts`
- `/ro/despre` `<title>` contains "Despre Oak Fantasy"
- `/en/about` `<title>` contains "About Oak Fantasy"
- All 4 pages: `<link rel="canonical">` present with absolute URL
- All 4 pages: `<link rel="alternate" hreflang="ro">` + `hreflang="en"` + `hreflang="x-default"` present
- `/ro/despre` + `/en/about`: `<script type="application/ld+json">` present (at least 2 — AboutPage + BreadcrumbList)
- All pages: `<meta name="description">` not empty, length 50-160 chars

#### `visual-regression.spec.ts`
- For each of `/ro`, `/en`, `/ro/despre`, `/en/about` × 3 viewport projects: `await expect(page).toHaveScreenshot({ fullPage: true, mask: [page.locator('canvas')] })`
- Total: 12 screenshots × 3 viewports = 12 baseline PNGs (but spec runs once per project, so it's 4 specs × 3 projects = 12 PNGs)
- `mask: [canvas]` hides the unstable 3D canvas render

### `fixtures.ts`

```typescript
import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Disable framer-motion + GSAP via CSS
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
        }
      `;
      document.head.appendChild(style);
    });
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

### Installation steps (await founder confirm)

```bash
npm install -D @playwright/test --legacy-peer-deps
npx playwright install chromium
```

The second command downloads ~200MB Chromium binary into `~/.cache/ms-playwright/` (Windows: `%USERPROFILE%\AppData\Local\ms-playwright\`). Idempotent — safe to re-run.

### First-run protocol

1. Founder confirms install
2. I write all files
3. Run `npx playwright test --headed --workers=1 --project=chromium-desktop` (visible, single project to minimize first-run time)
4. Expected: ~8 specs run; visual regression specs FAIL on missing baselines (that's normal — they generate them)
5. Run again: `npx playwright test --project=chromium-desktop --update-snapshots`
6. Visual baselines created
7. Founder visually inspects `tests/e2e/__screenshots__/` for ~12 PNGs (the 4 pages × 3 viewports), confirms they look right
8. Re-run on all 3 projects: `npx playwright test` — should pass clean
9. Then commit baselines as a separate commit (so they're reviewable)

### Commits for C1

```
chore(testing): install Playwright for E2E and visual regression
chore(testing): add Playwright config and test specs for all pages
chore(testing): commit visual regression screenshot baselines
```

3 commits to keep `package.json+lock` change, code-change, and binary-blob change separable.

## C2 — Lighthouse CI

### Installation

```bash
npm install -D @lhci/cli --legacy-peer-deps
```

### `lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/ro",
        "http://localhost:3000/en",
        "http://localhost:3000/ro/despre",
        "http://localhost:3000/en/about"
      ],
      "startServerCommand": "npm run dev",
      "startServerReadyPattern": "Ready in",
      "numberOfRuns": 1,
      "settings": {
        "preset": "desktop",
        "skipAudits": ["uses-http2"]
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.80 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.90 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**Note on preset:** founder's spec said "mobile (default)", but Lighthouse's `desktop` preset is more representative for a marketing site optimized desktop-first. Open question — see "Open questions" below.

**Note on `uses-http2`:** dev server is HTTP/1.1, which would always fail this audit. Skipping for local; production deploys via Vercel get HTTP/2 automatically.

### Commit for C2

```
chore(testing): add Lighthouse CI configuration
```

## C3 — i18n checker + verify script + docs

### `scripts/check-i18n.mjs`

Zero-deps Node ES module. Algorithm:

1. **Glob discovery:** find `**/*content.ts`, `**/content.ts`, `**/numbers-strip-content.ts` under `components/` (exclude `node_modules`, `.next`, `tests/`)
2. For each file, read as UTF-8 text
3. **Cedilla check** (whole file): regex `/[şţ]/g` → any match is an error (legacy diacritic)
4. **Locale block extraction:** find `ro:` and `en:` keys, walk balanced braces to capture each block's content
5. **Key parity check:** parse keys from both blocks (regex on `^\s*(\w+):` lines); diff. Report missing in either direction.
6. **RO chars in EN check** (scope: en: block only): regex `/[ăâîșțĂÂÎȘȚ]/g` → any match in an EN string is an error. List file:line:snippet.
7. **(Warning-only) Hardcoded JSX text check** in `components/**/*.tsx` (exclude `*-content.ts` and `tests/`): scan for `>([^<>{}]+)<` patterns inside JSX that contain `[ăâîșțĂÂÎȘȚ]` chars or English common words ("the", "and", "with") — these are likely forgotten i18n. Warnings only, exit 0.

Output:
- Default: pretty terminal output with file:line, snippet, color-coded
- `--json` flag: emit `{ passed, errors, warnings }` to stdout

Exit code: 0 if errors empty (warnings OK), 1 otherwise.

### Updated `package.json` scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:update": "playwright test --update-snapshots",
    "lighthouse": "lhci autorun",
    "check:i18n": "node scripts/check-i18n.mjs",
    "verify": "npm run typecheck && npm run lint && npm run check:i18n && npm run test:e2e"
  }
}
```

Order in `verify`:
1. `typecheck` (fastest, fails first on type errors before slow tests)
2. `lint` (fast)
3. `check:i18n` (fast, content-level errors before runtime)
4. `test:e2e` (slowest, gives full runtime confidence — last gate)

### `docs/verification.md`

Sections:
- Quick start
- When to use each script (table with timing)
- Visual regression failures playbook
- i18n failures playbook
- Lighthouse thresholds + "do not lower thresholds" rule
- CI integration roadmap (future)

### Commits for C3

```
chore(testing): add i18n completeness checker script
chore(testing): add verify npm script and verification docs
```

## Total commits expected

| Phase | Commits |
|---|---|
| C1 | 3 (install / config+specs / baselines) |
| C2 | 1 |
| C3 | 2 |
| Brain updates | 1 |
| **Total** | **7** |

## Open questions — RESOLVED 2026-05-23

| # | Question | Decision | Rationale |
|---|---|---|---|
| Q1 | Lighthouse preset | **BOTH — two separate scripts** | `npm run lighthouse` (desktop) + `npm run lighthouse:mobile`. Coverage on both audiences; thresholds shared. |
| Q2 | Mobile viewport for visual regression | **iPhone 13 (390×844)** | 80th percentile post-2021. |
| Q3 | JSX hardcoded-text scan severity | **Warnings (exit 0)** for the heuristic JSX scan; **errors (exit 1)** for deterministic checks (missing keys, RO chars in EN, cedilla) | Probabilistic detector inherently has false positives. Real errors stay strict gate. Founder reviews warnings periodically. |
| Q4 | First-run baseline protocol | **Founder review THEN commit** | Baselines = ground truth. Auto-committing a broken render becomes the regression. Worst failure mode of visual regression. |

## Implementation order

1. Plan approved → install Playwright (founder confirms)
2. Write files (config + 5 specs + fixtures)
3. First-run protocol (headed, founder reviews screenshots)
4. Commit 1: `package.json + lock`
5. Commit 2: `playwright.config.ts + tests/e2e/*.ts` (specs only, no screenshots yet)
6. Commit 3: `tests/e2e/__screenshots__/` (after founder confirms baselines look right)
7. Pause for C1 verdict from founder
8. C2: install Lighthouse, write `lighthouserc.json` → commit
9. Pause for C2 verdict
10. C3: write `scripts/check-i18n.mjs` + update `package.json` + write `docs/verification.md` → 2 commits
11. Run `npm run verify` end-to-end as full pipeline test
12. Update brain: MEMORY.md, decisions.md, codebase-map.md, gotchas.md (if hit any)
13. Final commit: brain updates
14. Push everything
15. Final report to founder

## Anti-patterns to avoid

- ❌ Don't run `npm run build` (gotcha `.next` cache Windows active)
- ❌ Don't auto-update screenshots on first run — they must be visually verified
- ❌ Don't commit screenshots in the same commit as config (separability for review)
- ❌ Don't add `--legacy-peer-deps` to scripts (one-time install flag, not a daily ritual)
- ❌ Don't `playwright install` all browsers (Chromium only per architecture decision #1)
- ❌ Don't lower Lighthouse thresholds when a page fails — fix the page
