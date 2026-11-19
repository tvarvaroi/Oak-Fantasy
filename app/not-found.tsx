import Link from 'next/link';
import { fontVariables } from '@/lib/fonts';

import { NOT_FOUND_CONTENT, ROOT_ENGLISH_LINK } from '@/components/not-found/content';
import '@/app/globals.css';

// Root-level 404 — only for paths WITHOUT a locale (dotted junk such as
// /.env or /x.jpg rejected by the [locale] guard; SEO audit fix #1). Every
// /ro/... and /en/... 404 is app/[locale]/not-found.tsx. The root layout is a
// passthrough, so this page provides its own document and loads the brand
// fonts itself. Romanian copy, with the English home as a separate link
// (2026-11-19: no more mixed RO/EN sentence). Generic on purpose: no
// admin/login hints (Task 2.3 security lesson).

export default function RootNotFound() {
  const c = NOT_FOUND_CONTENT.ro;
  return (
    <html lang="ro" className={fontVariables}>
      <body>
        <main
          className="paper-texture flex items-center justify-center px-6"
          style={{ minHeight: '100vh', backgroundColor: 'var(--cream-warm)' }}
        >
          <div className="text-center" style={{ maxWidth: 520 }}>
            <p className="label-caps" style={{ color: 'var(--copper)', fontSize: '0.72rem' }}>
              {c.label}
            </p>
            <h1
              className="font-caudex"
              style={{ color: 'var(--oak-deep)', fontSize: 'clamp(1.9rem, 6vw, 2.6rem)', lineHeight: 1.15, marginTop: 14 }}
            >
              {c.title}
            </h1>
            <p className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '1rem', lineHeight: 1.7, marginTop: 14 }}>
              {c.body}
            </p>
            <div className="flex flex-col items-center gap-2" style={{ marginTop: 30 }}>
              <Link
                href="/ro"
                className="font-caudex inline-flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--oak-warm)',
                  color: 'var(--cream-warm)',
                  borderRadius: 8,
                  minHeight: 48,
                  padding: '0 28px',
                  fontSize: '0.95rem',
                }}
              >
                {c.home}
              </Link>
              <Link
                href="/en"
                lang="en"
                className="font-lora inline-flex items-center justify-center"
                style={{ color: 'var(--oak-warm)', textDecoration: 'underline', minHeight: 44, fontSize: '0.9rem' }}
              >
                {ROOT_ENGLISH_LINK}
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
