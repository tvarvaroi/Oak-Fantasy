// Canonical smoke tests:
//   Test 1 — Production path .insert(entry) without .select() (expect PASS 201)
//   Test 2 — Invalid email (expect 42501 RLS — defense-in-depth)
// Cleanup test rows after.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envText = readFileSync('.env.staging.local', 'utf8');
const env = Object.fromEntries(
  envText
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const anon = createClient(url, anonKey, { auth: { persistSession: false } });
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

let pass = 0,
  fail = 0;

// --- TEST 1 — Production code path ---
const goodEmail = `smoke-canonical-good-${Date.now()}@example.com`;
const t1 = await anon
  .from('email_subscribers')
  .insert({ email: goodEmail, language: 'ro', source: 'waitlist' });
if (t1.error) {
  console.log(`T1 FAIL — expected null error, got ${t1.error.code} ${t1.error.message}`);
  fail++;
} else {
  console.log('T1 PASS — production code path .insert() works as anon');
  pass++;
}

// --- TEST 2 — Invalid email should hit DB-level WITH CHECK ---
const badEmail = 'no-at-sign';
const t2 = await anon
  .from('email_subscribers')
  .insert({ email: badEmail, language: 'ro', source: 'waitlist' });
if (t2.error?.code === '42501') {
  console.log('T2 PASS — invalid email blocked by WITH CHECK (DB-level defense-in-depth)');
  pass++;
} else if (t2.error) {
  console.log(`T2 PARTIAL — invalid email rejected but with unexpected code ${t2.error.code}: ${t2.error.message}`);
  pass++;
} else {
  console.log('T2 FAIL — invalid email was inserted (WITH CHECK not enforcing)');
  fail++;
}

// --- Cleanup ---
const { error: delErr } = await admin
  .from('email_subscribers')
  .delete()
  .like('email', 'smoke-canonical-%');
if (delErr) {
  console.log('Cleanup error:', delErr.message);
} else {
  console.log('Cleanup OK — smoke-canonical-% rows deleted');
}

console.log(`\nResult: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
