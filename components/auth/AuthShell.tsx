'use client';

import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  localizedPath,
  type Locale,
  type RouteKey,
} from '@/lib/i18n-routes';

type AuthRouteKey = Extract<
  RouteKey,
  'login' | 'register' | 'forgotPassword' | 'resetPassword'
>;

// Client shell for the 4 auth pages: global Navbar + Footer (Task 1.5 check
// #0) wrapped around a centered card. Language toggle swaps to the localized
// slug of the SAME auth route.
export default function AuthShell({
  routeKey,
  locale,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  routeKey: AuthRouteKey;
  locale: Locale;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  const toggleLanguage = () => {
    const next: Locale = locale === 'ro' ? 'en' : 'ro';
    router.push(localizedPath(routeKey, next));
  };

  return (
    <>
      <Navbar language={locale} onToggleLanguage={toggleLanguage} />
      <main
        style={{ backgroundColor: 'var(--cream-warm)', minHeight: '100vh' }}
        className="relative"
      >
        <div className="paper-texture absolute inset-0 pointer-events-none" aria-hidden />

        <div
          className="relative mx-auto px-6 flex flex-col items-center"
          style={{
            maxWidth: 440,
            paddingTop: 'clamp(120px, 18vh, 200px)',
            paddingBottom: 'clamp(72px, 12vh, 140px)',
          }}
        >
          <motion.div
            className="w-full"
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="mb-7 text-center">
              <p className="label-caps" style={{ color: 'var(--copper)' }}>
                {eyebrow}
              </p>
              <h1
                className="font-caudex"
                style={{
                  marginTop: 10,
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                  lineHeight: 1.15,
                  color: 'var(--oak-deep)',
                  fontWeight: 700,
                }}
              >
                {title}
              </h1>
              <p
                className="font-lora"
                style={{
                  marginTop: 12,
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: 'var(--ink-soft)',
                }}
              >
                {subtitle}
              </p>
            </header>

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
          </motion.div>
        </div>
      </main>
      <Footer language={locale} />
    </>
  );
}
