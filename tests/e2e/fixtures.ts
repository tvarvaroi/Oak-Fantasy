import { test as base, expect, type Page } from '@playwright/test';

/**
 * Shared fixtures for Oak Fantasy E2E tests.
 *
 * - Disables CSS animations and transitions for screenshot stability
 * - Captures console.error events for assertions in tests
 */

type Fixtures = {
  consoleErrors: string[];
};

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    // Disable CSS animations + transitions. Guard against document.head being null
    // (init script runs before <head> is parsed on early documents).
    await page.addInitScript(() => {
      const inject = () => {
        const style = document.createElement('style');
        style.textContent = `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `;
        (document.head ?? document.documentElement).appendChild(style);
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject, { once: true });
      } else {
        inject();
      }
    });
    // Emulate reduced motion so framer-motion's animate() jumps to final state
    // (Counter useEffect setDisplay(stat.to) when prefersReduced=true).
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await use(page);
  },
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));
    await use(errors);
  },
});

export { expect };

/** Mask the 3D canvas region for stable visual regression (procedural texture randomness). */
export function maskCanvas(page: Page) {
  return [page.locator('canvas')];
}
