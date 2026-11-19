'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { isLocale, localizedPath, type Locale } from '@/lib/i18n-routes';
import { NOT_FOUND_CONTENT } from './content';

// 404 inside /[locale]: same chrome as every page (Navbar + Footer), copy in
// the URL's language only. not-found.tsx gets no params, so the locale is read
// on the client from the URL (useParams), falling back to RO.
export default function NotFoundView() {
  const params = useParams<{ locale?: string }>();
  const router = useRouter();
  const locale: Locale = params?.locale && isLocale(params.locale) ? params.locale : 'ro';
  const c = NOT_FOUND_CONTENT[locale];
  const other: Locale = locale === 'ro' ? 'en' : 'ro';

  return (
    <>
      <Navbar language={locale} onToggleLanguage={() => router.push(`/${other}`)} />
      <main
        className="paper-texture flex items-center justify-center px-6"
        style={{ minHeight: '70vh', paddingTop: 140, paddingBottom: 96, backgroundColor: 'var(--cream-warm)' }}
      >
        <div className="text-center" style={{ maxWidth: 520 }}>
          <p className="label-caps" style={{ color: 'var(--copper)', fontSize: '0.72rem' }}>
            {c.label}
          </p>
          <h1
            className="font-caudex"
            style={{ color: 'var(--oak-deep)', fontSize: 'clamp(1.9rem, 6vw, 2.6rem)', lineHeight: 1.15, marginTop: 14, textWrap: 'balance' }}
          >
            {c.title}
          </h1>
          <p className="font-lora" style={{ color: 'var(--ink-soft)', fontSize: '1rem', lineHeight: 1.7, marginTop: 14 }}>
            {c.body}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3" style={{ marginTop: 30 }}>
            <Link
              href={`/${locale}`}
              className="font-caudex inline-flex items-center justify-center w-full max-w-[280px] sm:w-auto sm:max-w-none transition-opacity hover:opacity-90"
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
              href={localizedPath('tocatoare', locale)}
              className="font-caudex inline-flex items-center justify-center w-full max-w-[280px] sm:w-auto sm:max-w-none transition-colors hover:bg-[var(--paper-aged)]"
              style={{
                color: 'var(--oak-warm)',
                border: '1px solid var(--oak-warm)',
                borderRadius: 8,
                minHeight: 48,
                padding: '0 28px',
                fontSize: '0.95rem',
              }}
            >
              {c.catalog}
            </Link>
          </div>
        </div>
      </main>
      <Footer language={locale} />
    </>
  );
}
