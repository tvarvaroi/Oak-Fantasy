'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { localizedPath, type Locale } from '@/lib/i18n-routes';

import { CUSTOM_ORDER_CONTENT } from './content';
import { SLIP_ID } from './CustomOrderForm';
import styles from './la-comanda.module.css';

// Confirmation page for /la-comanda (2026-11-20): /ro/la-comanda/sent ·
// /en/custom-orders/sent. The form redirects here only after the server action
// answered ok. Static on purpose: it shows the same success message the slip
// used to show inline and NOTHING about the request (no name, phone or idea —
// none of it is in the URL or in any client state that reaches this page).

export default function CustomOrderSent({ locale }: { locale: Locale }) {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const copy = CUSTOM_ORDER_CONTENT[locale].form;

  // Move focus to the message, as the inline version did, so screen-reader
  // users hear the outcome right after the navigation.
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  const toggleLanguage = () => {
    const next: Locale = locale === 'ro' ? 'en' : 'ro';
    router.push(localizedPath('laComandaSent', next));
  };

  return (
    <>
      <Navbar language={locale} onToggleLanguage={toggleLanguage} />
      <main>
        <section className={`${styles.hero} ${styles.sentHero}`}>
          <div className="paper-texture absolute inset-0 pointer-events-none" aria-hidden />
          <div className={`${styles.wrap} ${styles.sentWrap}`}>
            <div className={`${styles.slip} ${styles.sentSlip}`}>
              <div className={styles.slipHead}>
                <p className={styles.slipTitle}>{copy.heading}</p>
              </div>
              <div className={styles.success} role="status" data-testid="custom-order-success">
                <h1 ref={titleRef} tabIndex={-1} className={styles.successTitle}>
                  {copy.success.title}
                </h1>
                <p className={styles.successBody}>{copy.success.body}</p>
                <Link
                  href={`${localizedPath('laComanda', locale)}#${SLIP_ID}`}
                  className={`${styles.again} ${styles.againLink}`}
                >
                  {copy.success.again}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer language={locale} />
    </>
  );
}
