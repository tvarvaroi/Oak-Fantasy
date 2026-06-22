// Shared centered card for isolated admin pages (login, 404). No customer
// Navbar/Footer — admin chrome is intentionally minimal and separate.

import Image from 'next/image';

export default function AdminCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main
      className="relative flex items-center justify-center"
      style={{ backgroundColor: 'var(--cream-warm)', minHeight: '100vh', padding: '24px' }}
    >
      <div className="paper-texture absolute inset-0 pointer-events-none" aria-hidden />
      <div className="relative w-full" style={{ maxWidth: 420 }}>
        <div className="flex flex-col items-center mb-7">
          <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: 'var(--cream-warm)' }}>
            <Image src="/3D_Cutting_Board_Model_Design.svg" alt="Oak Fantasy" width={72} height={72} priority />
          </div>
          {eyebrow ? (
            <p className="label-caps" style={{ color: 'var(--copper)', marginTop: 16 }}>
              {eyebrow}
            </p>
          ) : null}
          <h1
            className="font-caudex text-center"
            style={{ marginTop: 8, fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', lineHeight: 1.15, color: 'var(--oak-deep)', fontWeight: 700 }}
          >
            {title}
          </h1>
        </div>

        <div
          className="relative"
          style={{
            backgroundColor: 'var(--cream-warm)',
            border: '1px solid rgba(139,94,60,0.25)',
            borderRadius: 6,
            padding: 'clamp(24px, 4vw, 34px)',
            boxShadow: '0 2px 16px rgba(31,24,16,0.06)',
          }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
