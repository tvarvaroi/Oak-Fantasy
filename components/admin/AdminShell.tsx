import AdminSidebar from './AdminSidebar';

// Reusable chrome for every protected admin page: fixed left sidebar + top bar
// with the logout control, content rendered in the main column. Server
// component — receives only the serializable user display name. The gate lives
// at the page top (requireAdminOrNotFound) AND in the (protected) layout, so by
// the time this renders the viewer is already a verified admin; nothing here
// streams to a non-admin (the Task 2.3 RSC-leak lesson).

export default function AdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--cream-warm)' }}>
      {/* Sidebar — fixed on desktop, scrolls with page on mobile */}
      <aside
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0"
        style={{
          width: 240,
          backgroundColor: 'var(--paper-aged)',
          borderRight: '1px solid rgba(92,58,32,0.18)',
          padding: '24px 16px',
        }}
      >
        <div className="px-3 mb-8">
          <p className="font-caudex" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--oak-deep)' }}>
            Oak Fantasy
          </p>
          <p className="label-caps" style={{ color: 'var(--copper)', fontSize: '0.58rem', marginTop: 2 }}>
            Administrare
          </p>
        </div>
        <AdminSidebar />
      </aside>

      {/* Main column */}
      <div className="md:pl-[240px]">
        {/* Topbar */}
        <header
          className="flex items-center justify-between"
          style={{
            height: 64,
            padding: '0 clamp(16px, 4vw, 40px)',
            backgroundColor: 'var(--paper-aged)',
            borderBottom: '1px solid rgba(92,58,32,0.18)',
          }}
        >
          <p className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.92rem' }}>
            Bun venit, <span style={{ color: 'var(--oak-deep)', fontWeight: 500 }}>{userName}</span>.
          </p>

          <form action="/auth/signout" method="post">
            <input type="hidden" name="redirectTo" value="/admin/login" />
            <button
              type="submit"
              className="font-caudex transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--oak-warm)',
                border: '1px solid var(--oak-warm)',
                borderRadius: 6,
                letterSpacing: '0.03em',
                padding: '8px 18px',
                fontSize: '0.85rem',
              }}
            >
              Ieși din cont
            </button>
          </form>
        </header>

        {/* Mobile nav (sidebar is hidden on small screens) */}
        <div
          className="md:hidden"
          style={{ padding: '12px clamp(16px, 4vw, 40px)', borderBottom: '1px solid rgba(92,58,32,0.18)' }}
        >
          <AdminSidebar />
        </div>

        <main style={{ padding: 'clamp(24px, 5vw, 48px)' }}>{children}</main>
      </div>
    </div>
  );
}
