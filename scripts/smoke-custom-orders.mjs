// Smoke test — /la-comanda custom-order requests, end-to-end (2026-11-18).
//
//   1. RLS: the anon key can neither insert into nor read custom_orders.
//   2. Visitor (Playwright): RO slip on /ro/la-comanda → success message →
//      DB row status=new, phone normalized +40…, locale=ro. Same on
//      /en/custom-orders → locale=en.
//   3. Bot defences: honeypot filled → success shown, NO row; submit < 2s after
//      mount → success shown, NO row.
//   4. Admin (temporary admin via service role, deleted at the end):
//      EN request → WhatsApp greeting in English → delete through the dialog;
//      sidebar badge = new-before + 1; RO request → WhatsApp greeting in
//      Romanian, list shows it, status "Contactat" + note saved (DB checked),
//      delete through the dialog → row gone → badge back to new-before.
//
// Runs against a PRODUCTION build (fresh process = fresh in-memory rate limit;
// the smoke sends 4 real submits, the limit is 5/hour/IP):
//   npm run build && npx next start -p 3001
//   BASE_URL=http://localhost:3001 node scripts/smoke-custom-orders.mjs
// Rows created by the smoke are always removed (finally), even on failure.

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
const BASE = process.env.BASE_URL || 'http://localhost:3001';
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const RUN = Date.now().toString(36);
const NAMES = {
  ro: `Smoke Comandă ${RUN}`,
  en: `Smoke Custom ${RUN}`,
  honeypot: `Smoke Honeypot ${RUN}`,
  timing: `Smoke Timing ${RUN}`,
};

const results = [];
function check(label, ok, detail = '') {
  results.push({ label, ok });
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) throw new Error(`FAILED: ${label} ${detail}`);
}

async function rowsByName(name) {
  const { data, error } = await sb.from('custom_orders').select('*').eq('customer_name', name);
  if (error) throw error;
  return data ?? [];
}

async function countNew() {
  const { count, error } = await sb
    .from('custom_orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');
  if (error) throw error;
  return count ?? 0;
}

async function badgeValue(page) {
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  const badge = page.getByTestId('custom-orders-new-badge');
  return (await badge.count()) === 0 ? 0 : Number(await badge.first().innerText());
}

/** Fill + submit the slip. `waitMs` = how long after load before submitting. */
async function submitSlip(page, { path, name, idea, waitMs = 2600, honeypot = '' }) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  const form = page.getByTestId('custom-order-form');
  await form.waitFor();
  if (waitMs) await page.waitForTimeout(waitMs);
  await page.fill('#co-name', name);
  await page.fill('#co-phone', '0712 345 678');
  await page.fill('#co-idea', idea);
  if (honeypot) {
    await page.evaluate((v) => {
      document.getElementById('co-website').value = v;
    }, honeypot);
  }
  await form.locator('button[type="submit"]').click();
  await page.getByTestId('custom-order-success').waitFor({ timeout: 20000 });
}

async function deleteThroughDialog(page) {
  await page.getByRole('button', { name: 'Șterge cererea' }).click();
  await page.getByRole('alertdialog').waitFor();
  await page.getByRole('button', { name: 'Șterge definitiv' }).click();
  await page.waitForURL(/\/admin\/comenzi-custom$/, { timeout: 20000 });
}

async function main() {
  const browser = await chromium.launch();
  let tempAdminId = null;
  try {
    const newBefore = await countNew();
    console.log(`requests in "new" before the run: ${newBefore}`);

    // ── 1. RLS (anon) ────────────────────────────────────────────────────
    const ins = await anon
      .from('custom_orders')
      .insert({ customer_name: 'Anon Probe', customer_phone: '+40712345678', description: 'anon insert probe' });
    check('anon INSERT rejected by RLS', ins.error?.code === '42501', ins.error?.code ?? 'no error');

    // ── 2. Visitor submits (RO + EN) ─────────────────────────────────────
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();

    await submitSlip(page, {
      path: '/ro/la-comanda',
      name: NAMES.ro,
      idea: 'SMOKE TEST — tocător rotund de 30 cm cu „Casa Pop, 1987” gravat pe spate.',
    });
    check('RO success message shown', /Am primit ideea ta/.test(await page.getByTestId('custom-order-success').innerText()));
    const [ro] = await rowsByName(NAMES.ro);
    check('RO row stored', !!ro);
    check('RO row status = new', ro.status === 'new', ro.status);
    check('RO phone normalized', ro.customer_phone === '+40712345678', ro.customer_phone);
    check('RO locale = ro', ro.locale === 'ro', ro.locale);
    check('RO diacritics intact', ro.description.includes('tocător') && ro.description.includes('„Casa Pop'));

    const anonRead = await anon.from('custom_orders').select('id');
    check('anon SELECT returns nothing (RLS)', !anonRead.error && (anonRead.data ?? []).length === 0, JSON.stringify(anonRead.data));

    await submitSlip(page, {
      path: '/en/custom-orders',
      name: NAMES.en,
      idea: 'SMOKE TEST — an oak wall clock with an engraved face.',
    });
    check('EN success message shown', /We've got your idea/.test(await page.getByTestId('custom-order-success').innerText()));
    const [en] = await rowsByName(NAMES.en);
    check('EN row stored with locale = en', en?.locale === 'en', en?.locale);

    // ── 3. Bot defences ──────────────────────────────────────────────────
    await submitSlip(page, {
      path: '/ro/la-comanda',
      name: NAMES.honeypot,
      idea: 'SMOKE TEST — honeypot completat, nu trebuie salvat.',
      honeypot: 'https://spam.example',
    });
    check('honeypot: success shown to the bot', true);
    check('honeypot: NO row stored', (await rowsByName(NAMES.honeypot)).length === 0);

    await submitSlip(page, {
      path: '/ro/la-comanda',
      name: NAMES.timing,
      idea: 'SMOKE TEST — trimis prea repede, nu trebuie salvat.',
      waitMs: 0,
    });
    check('timing check: success shown', true);
    check('timing check: NO row stored', (await rowsByName(NAMES.timing)).length === 0);
    await ctx.close();

    // ── 4. Admin ─────────────────────────────────────────────────────────
    let adminEmail = env.SMOKE_ADMIN_EMAIL;
    let adminPassword = env.SMOKE_ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      adminEmail = `smoke-admin+${Date.now()}@example.com`;
      adminPassword = randomBytes(18).toString('base64url');
      const { data: created, error } = await sb.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: 'Smoke Admin' },
      });
      if (error) throw error;
      tempAdminId = created.user.id;
      await sb.from('profiles').upsert({ id: tempAdminId, email: adminEmail, role: 'admin', full_name: 'Smoke Admin' });
      console.log(`temporary admin created (${adminEmail})`);
    }

    const actx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const admin = await actx.newPage();
    await admin.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });
    await admin.fill('#admin-email', adminEmail);
    await admin.fill('#admin-password', adminPassword);
    await admin.getByRole('button', { name: 'Intră în panou' }).click();
    await admin.waitForURL(/\/admin(\/)?$/, { timeout: 30000 });

    // EN request: English greeting, then delete it through the dialog.
    await admin.goto(`${BASE}/admin/comenzi-custom/${en.id}`, { waitUntil: 'networkidle' });
    const enWa = await admin.getByTestId('custom-order-whatsapp').getAttribute('href');
    const enText = new URL(enWa).searchParams.get('text') ?? '';
    check('EN WhatsApp link → wa.me/40712345678', enWa.startsWith('https://wa.me/40712345678?text='), enWa);
    check('EN WhatsApp greeting in English', enText.startsWith(`Hi ${NAMES.en}, this is Oak Fantasy.`), enText);
    await deleteThroughDialog(admin);
    check('EN row deleted from DB', (await rowsByName(NAMES.en)).length === 0);

    const badge1 = await badgeValue(admin);
    check('sidebar badge = new-before + 1', badge1 === newBefore + 1, `badge=${badge1}, expected ${newBefore + 1}`);
    check('dashboard card "Cereri custom noi"', /cereri custom noi/i.test(await admin.locator('main').innerText()));

    // RO request: list → detail → greeting → status + note → delete.
    await admin.goto(`${BASE}/admin/comenzi-custom?status=new`, { waitUntil: 'networkidle' });
    check('list (filter Nouă) shows the RO request', (await admin.locator('main').innerText()).includes(NAMES.ro));
    const listWa = await admin.locator(`a[href^="https://wa.me/40712345678"]`).first().getAttribute('href');
    check('list phone is a wa.me link', !!listWa, listWa ?? '');

    await admin.goto(`${BASE}/admin/comenzi-custom/${ro.id}`, { waitUntil: 'networkidle' });
    const roWa = await admin.getByTestId('custom-order-whatsapp').getAttribute('href');
    const roText = new URL(roWa).searchParams.get('text') ?? '';
    check('RO WhatsApp greeting in Romanian', roText.startsWith(`Bună, ${NAMES.ro}, sunt de la Oak Fantasy.`), roText);
    check('detail shows the full idea', (await admin.locator('main').innerText()).includes('Casa Pop, 1987'));

    const note = `Sunat pe WhatsApp, vrea gravură pe spate. (${RUN})`;
    await admin.selectOption('#custom-order-status', 'contacted');
    await admin.fill('#custom-order-notes', note);
    await admin.getByRole('button', { name: 'Salvează' }).click();
    await admin.getByText('Salvat.').waitFor({ timeout: 15000 });
    const [roAfter] = await rowsByName(NAMES.ro);
    check('status saved → contacted', roAfter.status === 'contacted', roAfter.status);
    check('internal note saved', roAfter.internal_notes === note, roAfter.internal_notes ?? '∅');
    check('updated_at moved forward', new Date(roAfter.updated_at) > new Date(roAfter.created_at));

    const badge2 = await badgeValue(admin);
    check('badge drops once the request is no longer "new"', badge2 === newBefore, `badge=${badge2}`);

    await admin.goto(`${BASE}/admin/comenzi-custom/${ro.id}`, { waitUntil: 'networkidle' });
    await deleteThroughDialog(admin);
    check('RO row deleted from DB', (await rowsByName(NAMES.ro)).length === 0);
    const badge3 = await badgeValue(admin);
    check('badge back to new-before after delete', badge3 === newBefore, `badge=${badge3}`);
    await actx.close();
  } finally {
    await browser.close();
    for (const name of Object.values(NAMES)) {
      await sb.from('custom_orders').delete().eq('customer_name', name);
    }
    if (tempAdminId) {
      await sb.from('profiles').delete().eq('id', tempAdminId);
      await sb.auth.admin.deleteUser(tempAdminId);
      console.log('temporary admin deleted');
    }
  }

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\nSMOKE CUSTOM ORDERS: ${results.length - failed}/${results.length} checks passed`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
