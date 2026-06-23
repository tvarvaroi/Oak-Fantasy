import { requireAdminOrNotFound } from '@/lib/auth/require-admin';
import ChangePasswordForm from '@/components/admin/ChangePasswordForm';

// /admin/profile — account info (read-only) + password change (Task 2.6, no 2FA;
// 2FA is a pre-launch checklist item). SECURITY: gate at the page top.

export const dynamic = 'force-dynamic';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrator',
  customer: 'Client',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.58rem' }}>
        {label}
      </span>
      <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.95rem' }}>
        {value}
      </span>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await requireAdminOrNotFound();
  const email = user.email ?? '';
  const name = user.profile?.full_name || '—';
  const role = user.role ? ROLE_LABEL[user.role] ?? user.role : '—';

  return (
    <div style={{ maxWidth: 900 }}>
      <p className="label-caps" style={{ color: 'var(--copper)' }}>
        Cont
      </p>
      <h1
        className="font-caudex"
        style={{ marginTop: 8, fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', color: 'var(--oak-deep)', fontWeight: 700 }}
      >
        Profil
      </h1>

      {/* Account info — read-only (name edit deferred, D2) */}
      <div
        className="mt-8 grid gap-5 sm:grid-cols-3"
        style={{
          backgroundColor: 'var(--paper-aged)',
          border: '1px solid rgba(92,58,32,0.18)',
          borderRadius: 10,
          padding: '20px 22px',
        }}
      >
        <InfoRow label="Email" value={email} />
        <InfoRow label="Nume" value={name} />
        <InfoRow label="Rol" value={role} />
      </div>

      {/* Password change */}
      <div className="mt-10">
        <h2 className="font-caudex" style={{ fontSize: '1.2rem', color: 'var(--oak-deep)', fontWeight: 700, marginBottom: 6 }}>
          Schimbă parola
        </h2>
        <p className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '0.88rem', marginBottom: 20, maxWidth: 420 }}>
          Îți cerem parola curentă ca să confirmăm că tu faci schimbarea.
        </p>
        <ChangePasswordForm email={email} />
      </div>
    </div>
  );
}
