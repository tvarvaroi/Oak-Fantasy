import { NOT_FOUND_CONTENT, ROOT_ENGLISH_LINK } from '@/components/not-found/content';

// Root-level 404 — LAST RESORT only (2026-11-19). Every unknown URL, including
// dotted junk such as /.env, is routed to the branded, localized
// app/[locale]/not-found.tsx (see the afterFiles rewrite in next.config.js).
// This page renders only if the [locale] layout itself rejects a segment.
// Next serves it through its error shell, which loads NO stylesheet and no
// next/font CSS — so it is styled inline and uses system serif fonts; the
// hex values mirror the palette tokens in app/globals.css (cream-warm, ink,
// ink-soft, oak-deep, oak-warm, copper). Romanian copy with the English home
// as a separate link. Generic on purpose: no admin/login hints.
const C = {
  cream: '#F5EBD8',
  ink: '#2A2218',
  inkSoft: '#5D4E3A',
  oakDeep: '#5C3A20',
  oakWarm: '#8B5E3C',
  copper: '#B87333',
};

export default function RootNotFound() {
  const c = NOT_FOUND_CONTENT.ro;
  return (
    <html lang="ro">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: C.cream,
          color: C.ink,
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        <main style={{ textAlign: 'center', padding: '48px 24px', maxWidth: 520 }}>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.copper }}>
            {c.label}
          </p>
          <h1 style={{ margin: '14px 0 0', fontSize: 30, lineHeight: 1.2, fontWeight: 400, color: C.oakDeep }}>
            {c.title}
          </h1>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.7, color: C.inkSoft }}>{c.body}</p>
          <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <a
              href="/ro"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 48,
                padding: '0 28px',
                borderRadius: 8,
                backgroundColor: C.oakWarm,
                color: C.cream,
                textDecoration: 'none',
                fontSize: 15,
              }}
            >
              {c.home}
            </a>
            <a
              href="/en"
              lang="en"
              style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, color: C.oakWarm, fontSize: 14 }}
            >
              {ROOT_ENGLISH_LINK}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
