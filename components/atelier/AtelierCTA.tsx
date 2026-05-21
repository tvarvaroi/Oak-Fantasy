'use client';

import Link from 'next/link';
import Reveal from '@/components/about/Reveal';
import type { Locale } from '@/lib/i18n-routes';
import type { AtelierContent } from './content';
import styles from './atelier.module.css';

// CTA — v3-catalog.html. Dark bark bg + noise overlay + centered headline
// (italic em accent copper) + 2 buttons. Primary -> #products, ghost -> #waitlist.

export default function AtelierCTA({
  content,
  locale,
}: {
  content: AtelierContent;
  locale: Locale;
}) {
  const { cta } = content;
  const home = `/${locale}`;

  return (
    <section className={`${styles.cta} ${styles.noise}`}>
      <Reveal className={styles.ctaWrap}>
        <h2 className={styles.ctaH2}>
          {cta.h2Line1} <em>{cta.h2Em}</em>
        </h2>
        <div className={styles.ctaActions}>
          <Link href={`${home}#products`} className={styles.btnPrimary}>
            {cta.primaryLabel}
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
              <path
                d="M1 6h15M11 1l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link href={`${home}#waitlist`} className={styles.btnGhost}>
            {cta.ghostLabel}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
