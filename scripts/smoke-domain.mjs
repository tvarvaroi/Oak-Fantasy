// Smoke test — live domain (2026-11-19, switch to https://oakfantasy.ro; CSP enforced).
//
//   1. Pages (RO + EN): 200, served on the expected host, canonical/hreflang/
//      og:url on https://oakfantasy.ro, no old Vercel alias in the HTML, no
//      console errors, and every Content-Security-Policy-Report-Only violation
//      collected (evidence for switching CSP to enforce).
//   2. Redirects: old alias, http, www/apex — final host + status chain.
//   3. Auth (UI on the live host, temporary user created + deleted through the
//      service role): login → session; logout; forgot-password form → the
//      /auth/v1/recover request carries redirect_to = <host>/auth/callback and
//      Supabase's answer is recorded; Supabase allow-list check through
//      admin.generateLink (where does the emailed link really go?);
//      /auth/callback without a code → back to /ro/login on the same host;
//      reset-password page with a session → new password → login with it.
//
// Usage (reads .env.local for the service role; nothing is printed from it):
//   BASE_URL=https://oakfantasy.ro SMOKE_AUTH_EMAIL=<real inbox> node scripts/smoke-domain.mjs
// SMOKE_AUTH_EMAIL gets a `+smoke-auth-<ts>` tag; if Supabase actually sends
// the reset email, it lands in that inbox (the link inside is dead: the user
// is deleted at the end).

import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
    }),
);
const BASE = (process.env.BASE_URL || 'https://oakfantasy.ro').replace(/\/$/, '');
const SITE = 'https://oakfantasy.ro';
const LEGACY = /oak-fantasy\.vercel\.app/;
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const results = [];
function check(label, ok, detail = '') {
  results.push({ label, ok });
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
}

const PAGES = [
  '/ro', '/en', '/ro/despre', '/en/about', '/ro/atelier', '/en/workshop',
  '/ro/tocatoare', '/en/cutting-boards', '/ro/la-comanda', '/en/custom-orders',
  '/ro/contact', '/en/contact', '/ro/termeni', '/en/terms', '/ro/retur', '/en/returns',
  '/ro/confidentialitate', '/en/privacy', '/ro/cos', '/ro/checkout', '/ro/login',
  '/ro/parola-uitata', '/admin/login',
];

async function redirectChain(url) {
  const hops = [];
  let cur = url;
  for (let i = 0; i < 6; i++) {
    const r = await fetch(cur, { redirect: 'manual' });
    hops.push(`${r.status} ${cur}`);
    const loc = r.headers.get('location');
    if (!loc || r.status < 300 || r.status >= 400) break;
    cur = new URL(loc, cur).toString();
  }
  return { hops, final: cur };
}

async function main() {
  // ── 2. redirects ───────────────────────────────────────────────────────
  for (const u of [
    'https://oak-fantasy.vercel.app/ro/despre?x=1',
    'http://oakfantasy.ro/ro',
    'https://www.oakfantasy.ro/ro',
    'https://oakfantasy.ro/ro',
  ]) {
    const { hops, final } = await redirectChain(u);
    console.log(`  ${u}\n    ${hops.join('\n    ')}`);
    if (u.includes('vercel.app')) {
      check('old alias → oakfantasy.ro (path + query kept)', /^https:\/\/(www\.)?oakfantasy\.ro\/ro\/despre\?x=1$/.test(final), final);
    }
  }
  const apexFinal = (await redirectChain(`${SITE}/ro`)).final;
  const servingHost = new URL(apexFinal).host;
  check('apex is the serving host (no redirect to www)', servingHost === 'oakfantasy.ro', `serving host: ${servingHost}`);

  const browser = await chromium.launch();
  const csp = new Map();
  let userId = null;
  try {
    // ── 1. pages ──────────────────────────────────────────────────────────
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    let current = '';
    const consoleErrors = [];
    page.on('console', (m) => {
      const t = m.text();
      if (/Content Security Policy|Content-Security-Policy|\[Report Only\]/i.test(t)) {
        const key = t.replace(/\s+/g, ' ').slice(0, 260);
        csp.set(key, (csp.get(key) ?? new Set()).add(current));
      } else if (m.type() === 'error') {
        consoleErrors.push(`${current}: ${t.slice(0, 200)}`);
      }
    });
    // A product page too (first active product from the catalog).
    const { data: prod } = await sb.from('products').select('slug').eq('status', 'active').limit(1);
    const pages = prod?.[0] ? [...PAGES, `/ro/tocatoare/${prod[0].slug}`, `/en/cutting-boards/${prod[0].slug}`] : PAGES;
    for (const p of pages) {
      current = p;
      const res = await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle' });
      const finalUrl = new URL(page.url());
      const html = await page.content();
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
      const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content').catch(() => null);
      const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute('content').catch(() => null);
      const isPrivate = /\/(cos|checkout|login|parola-uitata)$|^\/admin/.test(p);
      const okHead =
        isPrivate ||
        ((!canonical || canonical.startsWith(`${SITE}/`)) &&
          (!ogUrl || ogUrl.startsWith(`${SITE}/`)) &&
          (!ogImage || ogImage.startsWith(`${SITE}/`) || /supabase\.co/.test(ogImage)));
      check(
        `${p}: ${res?.status()} on ${finalUrl.host}`,
        res?.status() === 200 && okHead && !LEGACY.test(html),
        `canonical=${canonical ?? '-'} og:image=${ogImage ? ogImage.slice(0, 60) : '-'}`,
      );
    }
    check('no console errors on the pages', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));
    await ctx.close();

    // ── 3. auth ───────────────────────────────────────────────────────────
    const base = process.env.SMOKE_AUTH_EMAIL;
    const email = base
      ? base.replace('@', `+smoke-auth-${Date.now()}@`)
      : `smoke-auth+${Date.now()}@example.com`;
    const password = `Sm0ke-${randomBytes(6).toString('hex')}`;
    const newPassword = `Sm0ke-${randomBytes(6).toString('hex')}`;
    const { data: created, error: cErr } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Smoke Domeniu' },
    });
    if (cErr) throw new Error(`createUser: ${cErr.message}`);
    userId = created.user.id;

    const actx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    actx.on('page', (pg) =>
      pg.on('console', (m) => {
        const t = m.text();
        if (/Content Security Policy|Content-Security-Policy/i.test(t)) {
          const key = t.replace(/\s+/g, ' ').slice(0, 260);
          csp.set(key, (csp.get(key) ?? new Set()).add(pg.url()));
        }
      }),
    );
    const ap = await actx.newPage();
    const origin = new URL(apexFinal).origin; // the host that actually serves pages

    // login
    await ap.goto(`${origin}/ro/login`, { waitUntil: 'networkidle' });
    await ap.fill('#login-email', email);
    await ap.fill('#login-password', password);
    await ap.locator('main form button[type="submit"]').click();
    await ap.waitForURL((u) => u.pathname === '/ro', { timeout: 20000 });
    const cookies = await actx.cookies();
    const authCookie = cookies.find((c) => /^sb-.*-auth-token/.test(c.name));
    check('login → session cookie on the serving host', !!authCookie, authCookie ? `domain=${authCookie.domain}` : 'no sb-*-auth-token cookie');

    // reset-password page with a session → set a new password
    await ap.goto(`${origin}/ro/reset-parola`, { waitUntil: 'networkidle' });
    const pw = ap.locator('main input[type="password"]');
    await pw.nth(0).fill(newPassword);
    await pw.nth(1).fill(newPassword);
    await ap.locator('main form button[type="submit"]').click();
    await ap.waitForTimeout(2500);
    const { data: relog, error: relogErr } = await createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } },
    ).auth.signInWithPassword({ email, password: newPassword });
    check('reset-password page updates the password (login with the new one)', !!relog?.session && !relogErr, relogErr?.message ?? '');

    // logout through the navbar form → /auth/signout
    const signout = await ap.request.post(`${origin}/auth/signout`, { form: { redirectTo: '/ro' }, maxRedirects: 0 });
    check('POST /auth/signout redirects', [302, 303, 307].includes(signout.status()), `${signout.status()} → ${signout.headers()['location'] ?? ''}`);
    await actx.clearCookies();

    // forgot-password form → /auth/v1/recover
    const fp = await actx.newPage();
    let recover = null;
    fp.on('request', (r) => {
      if (r.url().includes('/auth/v1/recover')) recover = { url: r.url(), body: r.postData() };
    });
    const recoverRes = fp.waitForResponse((r) => r.url().includes('/auth/v1/recover'), { timeout: 20000 });
    await fp.goto(`${origin}/ro/parola-uitata`, { waitUntil: 'networkidle' });
    await fp.fill('main input[type="email"]', email);
    await fp.locator('main form button[type="submit"]').click();
    const rr = await recoverRes;
    const rrBody = (await rr.text()).slice(0, 200);
    const redirectTo = recover ? new URL(recover.url).searchParams.get('redirect_to') : null;
    check('forgot-password sends redirect_to on the serving host', redirectTo != null && decodeURIComponent(redirectTo) === `${origin}/auth/callback?next=/ro/reset-parola`, redirectTo ?? 'no request');
    check('Supabase accepted the recover request', rr.status() === 200, `${rr.status()} ${rrBody}`);

    // Supabase allow-list: where does the emailed link actually send people?
    for (const target of [`${SITE}/auth/callback?next=/ro/reset-parola`, `https://www.oakfantasy.ro/auth/callback?next=/ro/reset-parola`]) {
      const { data: link, error: lErr } = await sb.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo: target },
      });
      if (lErr) {
        check(`generateLink(${target})`, false, lErr.message);
        continue;
      }
      const r = await fetch(link.properties.action_link, { redirect: 'manual' });
      const loc = r.headers.get('location') ?? '';
      const landed = loc.split('#')[0].split('?')[0];
      console.log(`  email link with redirect_to=${target}\n    → ${r.status} ${landed}`);
      if (target.startsWith(SITE)) {
        check('Supabase allow-list accepts https://oakfantasy.ro/auth/callback', landed === `${SITE}/auth/callback`, `lands on ${landed || '(none)'}`);
      }
    }

    // callback without a code → same-host login with error flag
    const cb = await fetch(`${origin}/auth/callback?next=/ro/reset-parola`, { redirect: 'manual' });
    check('/auth/callback without code → /ro/login?error=auth on the same host', (cb.headers.get('location') ?? '') === `${origin}/ro/login?error=auth`, `${cb.status} ${cb.headers.get('location')}`);
    await actx.close();
  } finally {
    await browser.close();
    if (userId) {
      await sb.from('profiles').delete().eq('id', userId);
      const { error } = await sb.auth.admin.deleteUser(userId);
      console.log(error ? `cleanup FAILED: ${error.message}` : 'temporary auth user deleted');
    }
  }

  console.log('\nCSP violations, enforced or Report-Only (message → pages):');
  if (csp.size === 0) console.log('  none');
  for (const [msg, pages] of csp) console.log(`  ${msg}\n    on: ${[...pages].join(', ')}`);
  check('no CSP violations (pages + auth flow)', csp.size === 0, `${csp.size} distinct`);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
