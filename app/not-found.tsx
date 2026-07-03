import Link from 'next/link';

// Root-level 404. Renders when notFound() fires OUTSIDE the [locale] layout —
// e.g. the locale guard rejecting dotted junk paths (/robots.txt handled by
// metadata routes, /.env, /x.jpg → real 404; SEO audit fix #1). The root
// layout (app/layout.tsx) is a passthrough without <html>/<body> (they live in
// [locale]/layout.tsx), so this page must provide its own document shell.
// Generic on purpose: no admin/login hints (Task 2.3 security lesson).

export default function RootNotFound() {
  return (
    <html lang="ro">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5EBD8',
          color: '#2A2218',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        <main style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#B87333',
            }}
          >
            404
          </p>
          <h1 style={{ margin: '12px 0 8px', fontSize: 28, color: '#5C3A20' }}>
            Pagina nu există
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: 16, color: '#5D4E3A' }}>
            The page you are looking for does not exist.
          </p>
          <Link
            href="/ro"
            style={{
              display: 'inline-block',
              backgroundColor: '#8B5E3C',
              color: '#F5EBD8',
              borderRadius: 8,
              padding: '12px 28px',
              textDecoration: 'none',
              fontSize: 15,
            }}
          >
            Înapoi acasă
          </Link>
        </main>
      </body>
    </html>
  );
}
