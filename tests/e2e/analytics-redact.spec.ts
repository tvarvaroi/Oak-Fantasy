import { test, expect } from '@playwright/test';
import { redactAnalyticsUrl } from '../../lib/analytics/redact-url';

// Pure-function checks for the Web Analytics privacy filter (no browser).
// Guards the promise made in the privacy policy: no identifier leaves the site.

const O = 'https://oakfantasy.ro';

test.describe('Web Analytics URL redaction', () => {
  test('sends nothing for admin, auth and api paths', () => {
    expect(redactAnalyticsUrl(`${O}/admin`)).toBeNull();
    expect(redactAnalyticsUrl(`${O}/admin/comenzi/3f2b8c1e-1111-2222-3333-444455556666`)).toBeNull();
    expect(redactAnalyticsUrl(`${O}/admin/login?next=/admin`)).toBeNull();
    expect(redactAnalyticsUrl(`${O}/auth/callback?code=abc123`)).toBeNull();
    expect(redactAnalyticsUrl(`${O}/api/contact`)).toBeNull();
    expect(redactAnalyticsUrl('not a url')).toBeNull();
  });

  test('keeps public pages and product slugs', () => {
    expect(redactAnalyticsUrl(`${O}/ro`)).toBe(`${O}/ro`);
    expect(redactAnalyticsUrl(`${O}/en/`)).toBe(`${O}/en`);
    expect(redactAnalyticsUrl(`${O}/ro/tocatoare`)).toBe(`${O}/ro/tocatoare`);
    expect(redactAnalyticsUrl(`${O}/ro/tocatoare/tocator-taur-alb`)).toBe(
      `${O}/ro/tocatoare/tocator-taur-alb`,
    );
    expect(redactAnalyticsUrl(`${O}/en/cutting-boards/board-35x25-end-grain`)).toBe(
      `${O}/en/cutting-boards/board-35x25-end-grain`,
    );
    expect(redactAnalyticsUrl(`${O}/ro/la-comanda`)).toBe(`${O}/ro/la-comanda`);
  });

  test('removes query strings and hashes', () => {
    expect(redactAnalyticsUrl(`${O}/ro/tocatoare?q=cadou+ion%40example.com&tier=core`)).toBe(
      `${O}/ro/tocatoare`,
    );
    expect(redactAnalyticsUrl(`${O}/ro/reset-parola?token=eyJhbGciOi.abc.def#access_token=xyz`)).toBe(
      `${O}/ro/reset-parola`,
    );
    expect(redactAnalyticsUrl(`${O}/en/login?next=%2Fen%2Fcheckout&email=a@b.ro`)).toBe(
      `${O}/en/login`,
    );
  });

  test('drops the order id from the thank-you page', () => {
    const id = '3f2b8c1e-1111-2222-3333-444455556666';
    expect(redactAnalyticsUrl(`${O}/ro/multumim/${id}`)).toBe(`${O}/ro/multumim`);
    expect(redactAnalyticsUrl(`${O}/en/thank-you/${id}`)).toBe(`${O}/en/thank-you`);
    expect(redactAnalyticsUrl(`${O}/ro/multumim/OF-2026-0001`)).toBe(`${O}/ro/multumim`);
  });

  test('never reports identifiers or unknown paths verbatim', () => {
    const cases = [
      `${O}/ro/tocatoare/3f2b8c1e-1111-2222-3333-444455556666`,
      `${O}/ro/tocatoare/OF-2026-0001`,
      `${O}/ro/tocatoare/ion@example.com`,
      `${O}/ro/tocatoare/ion%40example.com`,
      `${O}/ro/tocatoare/123456`,
      `${O}/ro/tocatoare/a1b2c3d4e5f6a7b8c9d0`,
      `${O}/ro/tocatoare/slug/extra/deep`,
      `${O}/ro/ion@example.com`,
      `${O}/ro/pagina-care-nu-exista/OF-2026-0001`,
      `${O}/wp-login.php`,
    ];
    for (const input of cases) {
      const out = redactAnalyticsUrl(input);
      expect(out, input).not.toBeNull();
      expect(out, input).toMatch(/\/\[(?:id|other)\]$/);
      expect(out, input).not.toMatch(/@|%40|OF-2026|3f2b8c1e|123456|a1b2c3|wp-login/i);
    }
  });
});
