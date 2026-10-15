// Smoke test — ramburs (cash on delivery) order, end-to-end (2026-10-15).
//
//   1. customer (Playwright): PDP → add to cart → /ro/checkout (2 steps) →
//      place order → lands on /ro/multumim/<uuid>
//   2. DB (service role): order status=pending_cod, payment_method=cod,
//      payment_status=pending, items, history "Order created",
//      inventory.quantity_reserved +qty, stock_movements order_reserved
//   3. admin (Playwright): /admin/login → sidebar badge counts the new order →
//      /admin/comenzi/<id>: confirm → mark paid → cancel
//   4. DB: confirmed (+history) → paid (+history) → cancelled (+history),
//      quantity_reserved back to the starting value, stock_movements order_cancelled
//
// Admin credentials: SMOKE_ADMIN_EMAIL + SMOKE_ADMIN_PASSWORD in .env.local.
// If absent, a TEMPORARY admin is created through the service role (auth
// admin API + profiles.role='admin') and deleted at the end.
//
// Runs against a PRODUCTION build: `npm run build && npx next start -p 3001`
//   BASE_URL=http://localhost:3001 node scripts/smoke-ramburs-order.mjs
// The test order stays in the DB as `cancelled` (same as the June smoke orders).

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

const results = [];
function check(label, ok, detail = '') {
  results.push({ label, ok });
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) throw new Error(`FAILED: ${label} ${detail}`);
}

async function inventoryOf(productId) {
  const { data } = await sb
    .from('inventory')
    .select('quantity_total, quantity_reserved, quantity_available')
    .eq('product_id', productId)
    .single();
  return data;
}

async function orderRow(id) {
  const { data } = await sb.from('orders').select('*').eq('id', id).single();
  return data;
}

async function historyNotes(id) {
  const { data } = await sb
    .from('order_status_history')
    .select('from_status, to_status, note')
    .eq('order_id', id)
    .order('created_at', { ascending: true });
  return data ?? [];
}

async function movements(id) {
  const { data } = await sb.from('stock_movements').select('type, quantity_change').eq('order_id', id);
  return data ?? [];
}

async function main() {
  // ── pick a product with stock ────────────────────────────────────────────
  const { data: inv } = await sb
    .from('inventory')
    .select('product_id, quantity_available, products!inner(slug, status, name_ro)')
    .gt('quantity_available', 0);
  const candidate = (inv ?? []).find((r) => r.products?.status === 'active');
  if (!candidate) throw new Error('No active product with stock');
  const productId = candidate.product_id;
  const slug = candidate.products.slug;
  const before = await inventoryOf(productId);
  console.log(`product: ${slug} (${candidate.products.name_ro}) reserved=${before.quantity_reserved} available=${before.quantity_available}`);

  const { count: pendingBefore } = await sb
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_cod');

  const browser = await chromium.launch();
  let tempAdminId = null;
  let orderId = null;
  try {
    // ── 1. customer flow ─────────────────────────────────────────────────
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/ro/tocatoare/${slug}`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Adaugă în coș' }).click();
    await page.waitForTimeout(500);
    await page.goto(`${BASE}/ro/checkout`, { waitUntil: 'networkidle' });
    check('checkout has 2 steps', (await page.locator('ol li').count()) === 2);
    const smokeEmail = `smoke-ramburs+${Date.now()}@example.com`;
    await page.fill('#co-email', smokeEmail);
    await page.fill('#co-name', 'Smoke Ramburs');
    await page.fill('#co-phone', '0712345678');
    await page.fill('#co-street', 'Str. Smoke 1');
    await page.fill('#co-city', 'Arad');
    await page.selectOption('#co-county', { label: 'Arad' });
    await page.fill('#co-postal', '310001');
    await page.fill('#co-notes', 'SMOKE TEST — comandă automată, se anulează singură');
    await page.getByRole('button', { name: 'Continuă' }).click();
    await page.getByTestId('cod-info').waitFor();
    check('review step shows the ramburs panel, no radio', (await page.locator('input[type="radio"]').count()) === 0);
    await page.locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: 'Plasează comanda' }).click();
    await page.waitForURL(/\/ro\/multumim\/[0-9a-f-]{36}$/, { timeout: 30000 });
    orderId = page.url().split('/').pop();
    check('redirected to /multumim/<uuid>', !!orderId, orderId);
    await expect(page, 'thank-you shows ramburs copy', async () =>
      (await page.locator('main').innerText()).includes('Plătești la livrare'));
    await ctx.close();

    // ── 2. DB after placement ────────────────────────────────────────────
    const o1 = await orderRow(orderId);
    check('order.status = pending_cod', o1.status === 'pending_cod', o1.status);
    check('order.payment_method = cod', o1.payment_method === 'cod', o1.payment_method);
    check('order.payment_status = pending', o1.payment_status === 'pending', o1.payment_status);
    check('order.guest_email = checkout email', o1.guest_email === smokeEmail);
    const { data: items } = await sb.from('order_items').select('product_id, quantity').eq('order_id', orderId);
    check('1 order item for the product', items?.length === 1 && items[0].product_id === productId);
    const qty = items[0].quantity;
    const after1 = await inventoryOf(productId);
    check(`quantity_reserved +${qty} after placement`, after1.quantity_reserved === before.quantity_reserved + qty, `${before.quantity_reserved} → ${after1.quantity_reserved}`);
    const h1 = await historyNotes(orderId);
    check('history: Order created → pending_cod', h1.some((h) => h.to_status === 'pending_cod' && h.note === 'Order created'));
    check('stock_movements: order_reserved', (await movements(orderId)).some((m) => m.type === 'order_reserved'));

    // ── 3. admin flow ────────────────────────────────────────────────────
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
      // profile row comes from the signup trigger; promote it.
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
    const badge = admin.getByTestId('orders-to-confirm-badge').first();
    await badge.waitFor({ timeout: 15000 });
    const badgeValue = Number(await badge.innerText());
    check('sidebar badge counts pending_cod orders', badgeValue === (pendingBefore ?? 0) + 1, `badge=${badgeValue}, expected ${(pendingBefore ?? 0) + 1}`);
    // innerText applies the label-caps text-transform → compare case-insensitively.
    check('dashboard card "Comenzi de confirmat"', /comenzi de confirmat/i.test(await admin.locator('main').innerText()));

    await admin.goto(`${BASE}/admin/comenzi/${orderId}`, { waitUntil: 'networkidle' });
    const select = admin.getByLabel('Status comandă');
    check('admin dropdown hides pending_payment', !(await select.innerText()).includes('Așteaptă plata'));
    check('admin dropdown shows "Nouă, de confirmat"', (await select.innerText()).includes('Nouă, de confirmat'));

    // confirm
    await select.selectOption('confirmed');
    await admin.getByRole('button', { name: 'Actualizează' }).click();
    await admin.getByText('Status actualizat.').waitFor({ timeout: 15000 });
    const o2 = await orderRow(orderId);
    check('admin confirm → status confirmed', o2.status === 'confirmed', o2.status);
    check('stock still reserved after confirm', (await inventoryOf(productId)).quantity_reserved === before.quantity_reserved + qty);

    // mark paid
    await admin.getByRole('button', { name: 'Marchează plătit' }).click();
    await admin.getByText('Comandă marcată ca plătită.').waitFor({ timeout: 15000 });
    const o3 = await orderRow(orderId);
    check('mark paid → payment_status paid', o3.payment_status === 'paid', o3.payment_status);
    check('history: plată marcată manual', (await historyNotes(orderId)).some((h) => /Plată marcată manual/.test(h.note ?? '')));

    // cancel (cleanup) → release
    await admin.reload({ waitUntil: 'networkidle' });
    await admin.getByLabel('Status comandă').selectOption('cancelled');
    await admin.getByRole('button', { name: 'Actualizează' }).click();
    await admin.getByText('Status actualizat.').waitFor({ timeout: 15000 });
    const o4 = await orderRow(orderId);
    check('cancel → status cancelled + cancelled_at', o4.status === 'cancelled' && !!o4.cancelled_at);
    const after4 = await inventoryOf(productId);
    check('quantity_reserved back to start after cancel', after4.quantity_reserved === before.quantity_reserved, `${after4.quantity_reserved} vs ${before.quantity_reserved}`);
    check('stock_movements: order_cancelled', (await movements(orderId)).some((m) => m.type === 'order_cancelled'));
    const h4 = await historyNotes(orderId);
    check('history has 4 rows (created, confirmed, paid, cancelled)', h4.length === 4, h4.map((h) => `${h.from_status ?? '∅'}→${h.to_status}`).join(', '));

    // badge back to the starting count
    await admin.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
    const badgeAfter = await admin.getByTestId('orders-to-confirm-badge').count();
    const expectedAfter = pendingBefore ?? 0;
    check('sidebar badge reflects the cancel', expectedAfter === 0 ? badgeAfter === 0 : Number(await admin.getByTestId('orders-to-confirm-badge').first().innerText()) === expectedAfter);
    await actx.close();
  } finally {
    await browser.close();
    if (tempAdminId) {
      await sb.from('profiles').delete().eq('id', tempAdminId);
      await sb.auth.admin.deleteUser(tempAdminId);
      console.log('temporary admin deleted');
    }
  }

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\nSMOKE RAMBURS: ${results.length - failed}/${results.length} checks passed${orderId ? ` (order ${orderId}, left as cancelled)` : ''}`);
}

// tiny helper so a thrown check reads like the others
async function expect(_page, label, fn) {
  check(label, await fn());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
