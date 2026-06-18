'use client';

import { useRouter } from 'next/navigation';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  localizedPath,
  type Locale,
  type RouteKey,
} from '@/lib/i18n-routes';

// Client shell that mounts the global Navbar + Footer around legal pages.
// LegalLayout (and its sectionOverrides) stay server components — they are
// passed in as `children`, the canonical "server component inside a client
// component" pattern. This keeps the OUG 34/2014 statutory note and all
// section content fully server-rendered while still giving every legal
// page the global chrome (fixes the Task 1.5 navigation dead-end).
export default function LegalShell({
  routeKey,
  locale,
  children,
}: {
  routeKey: Extract<RouteKey, 'terms' | 'privacy' | 'returns'>;
  locale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const toggleLanguage = () => {
    const next: Locale = locale === 'ro' ? 'en' : 'ro';
    router.push(localizedPath(routeKey, next));
  };

  return (
    <>
      <Navbar language={locale} onToggleLanguage={toggleLanguage} />
      {children}
      <Footer language={locale} />
    </>
  );
}
