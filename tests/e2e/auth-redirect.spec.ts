import { test, expect } from './fixtures';
import { safeRedirectPath } from '../../lib/safe-redirect';

// 2026-11-19 — open redirect in /auth/signout: `/\evil.com` passed the old
// `startsWith('/') && !startsWith('//')` guard and the browser landed on
// https://evil.com. Every attack value must stay on our origin.
const ATTACKS = [
  '/\\evil.com',
  '/\\/evil.com',
  '/\t/evil.com',
  '/\n/evil.com',
  '//evil.com',
  '///evil.com',
  'https://evil.com',
  'evil.com',
  '\\\\evil.com',
  '/%09/evil.com',
];

test.describe('Open-redirect guard', () => {
  test('safeRedirectPath keeps every value on our origin', () => {
    const base = 'https://oakfantasy.ro/auth/signout';
    for (const v of ATTACKS) {
      const out = safeRedirectPath(v, '/ro', base);
      expect(new URL(out, base).origin, JSON.stringify(v)).toBe('https://oakfantasy.ro');
    }
    expect(safeRedirectPath('/admin/login', '/ro', base)).toBe('/admin/login');
    expect(safeRedirectPath('/ro/reset-parola?x=1#a', '/ro', base)).toBe('/ro/reset-parola?x=1#a');
    expect(safeRedirectPath(undefined, '/ro', base)).toBe('/ro');
  });

  test('POST /auth/signout never redirects off-site', async ({ request, baseURL }) => {
    const origin = new URL(baseURL!).origin;
    for (const v of ATTACKS) {
      const res = await request.post('/auth/signout', { form: { redirectTo: v }, maxRedirects: 0 });
      expect(res.status(), JSON.stringify(v)).toBe(303);
      const loc = new URL(res.headers()['location'], origin);
      expect(loc.origin, `${JSON.stringify(v)} → ${loc.href}`).toBe(origin);
    }
    const ok = await request.post('/auth/signout', { form: { redirectTo: '/admin/login' }, maxRedirects: 0 });
    expect(ok.headers()['location']).toBe(`${origin}/admin/login`);
    const loc = await request.post('/auth/signout', { form: { locale: 'en' }, maxRedirects: 0 });
    expect(loc.headers()['location']).toBe(`${origin}/en`);
  });

  test('GET /auth/callback without a code stays on our origin', async ({ request, baseURL }) => {
    const origin = new URL(baseURL!).origin;
    const res = await request.get(`/auth/callback?next=${encodeURIComponent('/\\evil.com')}`, { maxRedirects: 0 });
    expect(res.headers()['location']).toBe(`${origin}/ro/login?error=auth`);
  });
});
