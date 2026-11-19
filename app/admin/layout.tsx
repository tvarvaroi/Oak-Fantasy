import type { Metadata } from 'next';
import { fontVariables } from '@/lib/fonts';

import '../globals.css';

// Admin root layout. /admin/* lives OUTSIDE [locale] (admin is RO-only,
// single internal user — D1), so it does NOT inherit the <html>/<body> from
// [locale]/layout.tsx. This layout provides them + the brand fonts. Without
// it, admin pages would render with no html/body and crash hydration (same
// class of bug as Task 2.2.1). No PageTransition, no i18n, no customer chrome.
//
// This layout does NOT gate — /admin/login must stay reachable. The 404 gate
// for non-admins lives in app/admin/(protected)/layout.tsx.


// SECURITY: neutral title (no "Admin") so the 404 for /admin and any probe
// is indistinguishable from a normal page — the <title> must not confirm an
// admin area exists. Individual admin pages keep this neutral title; they're
// reached only by knowing the URL. robots noindex on the whole segment.
export const metadata: Metadata = {
  title: 'Oak Fantasy',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
