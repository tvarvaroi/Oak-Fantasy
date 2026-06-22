import { getUser } from '@/lib/auth/get-user';

// /admin dashboard — placeholder for Task 2.3. Full shell (sidebar, nav,
// stats) arrives in Task 2.4. The (protected) layout already guaranteed an
// admin; we re-read the user here only for the greeting name.

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await getUser();
  const name = user?.profile?.full_name || user?.email || 'admin';

  return (
    <main
      className="relative"
      style={{ backgroundColor: 'var(--cream-warm)', minHeight: '100vh', padding: 'clamp(32px, 6vw, 72px)' }}
    >
      <div className="paper-texture absolute inset-0 pointer-events-none" aria-hidden />

      <div className="relative mx-auto" style={{ maxWidth: 900 }}>
        <p className="label-caps" style={{ color: 'var(--copper)' }}>
          Administrare
        </p>
        <h1
          className="font-caudex"
          style={{ marginTop: 12, fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--oak-deep)', fontWeight: 700, lineHeight: 1.1 }}
        >
          Bun venit, {name}.
        </h1>
        <p
          className="font-lora"
          style={{ marginTop: 16, fontSize: '1.05rem', color: 'var(--ink-soft)', lineHeight: 1.7, maxWidth: 560 }}
        >
          Panoul de administrare prinde formă. Aici vei gestiona produsele,
          comenzile și abonații. Deocamdată e doar începutul.
        </p>

        <form action="/auth/signout" method="post" className="mt-10">
          <input type="hidden" name="redirectTo" value="/admin/login" />
          <button
            type="submit"
            className="font-caudex transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--oak-warm)',
              color: 'var(--cream-warm)',
              borderRadius: 6,
              fontFamily: 'var(--font-caudex)',
              letterSpacing: '0.04em',
              padding: '12px 28px',
              fontSize: '0.95rem',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 4px rgba(31,24,16,0.18)',
            }}
          >
            Ieși din cont
          </button>
        </form>
      </div>
    </main>
  );
}
