// Task 2.2 register/login flow smoke (anon client = simulates the forms).
//   1. signUp (RegisterForm) -> with Confirm email OFF returns a session
//   2. profile update full_name + phone (D3) as the authenticated user
//   3. verify profile row has full_name + role=customer
//   4. signOut, then signInWithPassword (LoginForm) -> session
//   5. cleanup via service role
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env.staging.local', 'utf8')
    .split('\n').filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const email = `smoke-flow-${Date.now()}@example.com`;
const password = 'Test-Passw0rd!';
const fullName = 'Ion Popescu';
const phone = '0712345678';
let pass = 0, fail = 0, userId = null;
console.log('Project:', url);

try {
  const anon = createClient(url, anonKey, { auth: { persistSession: false } });

  // 1. signUp
  const { data: su, error: suErr } = await anon.auth.signUp({
    email, password, options: { data: { full_name: fullName } },
  });
  if (suErr) throw new Error('signUp: ' + suErr.message);
  userId = su.user?.id;
  if (su.session) { console.log('T1 PASS — signUp returned active session (Confirm email OFF)'); pass++; }
  else { console.log('T1 WARN — no session (Confirm email may be ON in dashboard)'); }

  // 2. profile update full_name + phone (authed as the new user)
  if (su.session) {
    const { error: upErr } = await anon.from('profiles')
      .update({ full_name: fullName, phone }).eq('id', userId);
    if (upErr) { console.log('T2 FAIL — profile update: ' + upErr.message); fail++; }
    else { console.log('T2 PASS — profile full_name/phone updated by user'); pass++; }
  }

  // 3. verify profile (service role read)
  const { data: profile } = await admin.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (profile && profile.full_name === fullName && profile.role === 'customer' && profile.phone === phone) {
    console.log('T3 PASS — profile correct (full_name, phone, role=customer)'); pass++;
  } else {
    console.log('T3 FAIL — profile mismatch:', JSON.stringify(profile)); fail++;
  }

  // 4. signOut + signIn
  await anon.auth.signOut();
  const { data: si, error: siErr } = await anon.auth.signInWithPassword({ email, password });
  if (siErr || !si.session) { console.log('T4 FAIL — signIn: ' + (siErr?.message ?? 'no session')); fail++; }
  else { console.log('T4 PASS — signInWithPassword returns session'); pass++; }

  // 5. wrong password rejected
  const anon2 = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error: wErr } = await anon2.auth.signInWithPassword({ email, password: 'wrong-password' });
  if (wErr) { console.log('T5 PASS — wrong password rejected'); pass++; }
  else { console.log('T5 FAIL — wrong password accepted!'); fail++; }
} catch (e) {
  console.log('ERROR:', e.message); fail++;
} finally {
  if (userId) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    console.log(error ? 'Cleanup FAILED: ' + error.message : 'Cleanup OK — test user deleted');
  }
}

console.log(`\nResult: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
