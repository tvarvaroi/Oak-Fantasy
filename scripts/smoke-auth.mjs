// Task 2.1 auth-foundation smoke test (service-role, controlled, cleaned up).
//   1. admin.createUser -> handle_new_user trigger should auto-create profile
//   2. profile defaults: role='customer'
//   3. guard_profile_role: an AUTHENTICATED non-admin cannot self-promote
//      (we sign in as the user and attempt role='admin' via the anon client)
//   4. cleanup: delete the auth user (profile cascades)
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envText = readFileSync('.env.staging.local', 'utf8');
const env = Object.fromEntries(
  envText.split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => {
    const i = l.indexOf('=');
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const email = `smoke-auth-${Date.now()}@example.com`;
const password = 'Test-Passw0rd!' + Date.now();
let pass = 0, fail = 0, userId = null;

console.log('Project:', url);

try {
  // 1. create user
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // confirm so we can sign in below regardless of dashboard setting
  });
  if (cErr) throw new Error('createUser failed: ' + cErr.message);
  userId = created.user.id;
  console.log('Created auth user:', userId);

  // 2. trigger should have created a profile with role=customer
  // small retry — trigger runs in same txn but PostgREST cache can lag a tick
  let profile = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data } = await admin.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) { profile = data; break; }
    await new Promise((r) => setTimeout(r, 300));
  }
  if (!profile) {
    console.log('T1 FAIL — no profile auto-created by handle_new_user trigger');
    fail++;
  } else {
    console.log('T1 PASS — profile auto-created');
    pass++;
    if (profile.role === 'customer') {
      console.log('T2 PASS — default role=customer');
      pass++;
    } else {
      console.log(`T2 FAIL — expected role=customer, got ${profile.role}`);
      fail++;
    }
  }

  // 3. guard_profile_role — sign in as the user (anon client) and try to
  //    self-promote to admin. Trigger should RAISE EXCEPTION.
  const userClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: signIn, error: sErr } = await userClient.auth.signInWithPassword({ email, password });
  if (sErr || !signIn.session) {
    console.log('T3 SKIP — could not sign in as user:', sErr?.message);
  } else {
    const { error: upErr } = await userClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);
    if (upErr) {
      console.log(`T3 PASS — self-promotion blocked (${upErr.code ?? ''} ${upErr.message})`);
      pass++;
    } else {
      // verify whether it actually changed (RLS WITH CHECK may also block)
      const { data: after } = await admin.from('profiles').select('role').eq('id', userId).single();
      if (after.role === 'admin') {
        console.log('T3 FAIL — user self-promoted to admin!');
        fail++;
      } else {
        console.log('T3 PASS — update reported no error but role unchanged (RLS filtered)');
        pass++;
      }
    }
  }
} catch (e) {
  console.log('ERROR:', e.message);
  fail++;
} finally {
  // 4. cleanup
  if (userId) {
    const { error: dErr } = await admin.auth.admin.deleteUser(userId);
    console.log(dErr ? 'Cleanup FAILED: ' + dErr.message : 'Cleanup OK — test user deleted (profile cascades)');
  }
}

console.log(`\nResult: ${pass} PASS / ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
