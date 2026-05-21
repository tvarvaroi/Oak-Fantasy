import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for Oak Fantasy E2E + visual regression.
 *
 * - Chromium only (arch decision #1 in docs/plans/2026-05-23-faza-c-automation.md)
 * - Single worker, sequential — visual regression order-stable, dev server single-threaded
 * - Reuses existing dev server locally; spawns one in CI
 * - Snapshot path includes {projectName} but NOT {platform} — baselines portable across OS
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}',
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
    // iPhone 13 / iPad Mini device presets default to WebKit; we override to Chromium
    // per architecture decision #1 (single browser engine). Viewport, deviceScaleFactor,
    // isMobile, and userAgent are preserved from the preset.
    { name: 'chromium-mobile',  use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'chromium-tablet',  use: { ...devices['iPad Mini'], browserName: 'chromium' } },
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});
