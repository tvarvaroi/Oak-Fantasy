'use client';

import Link from 'next/link';
import Reveal from '@/components/about/Reveal';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import type { AtelierContent } from './content';
import styles from './atelier.module.css';

// CTA — v3-catalog.html. Dark bark bg + noise overlay + centered headline
// (italic em accent copper) + ONE button → the live catalog (/tocatoare).
// 2026-10-15: the ghost "join the launch waitlist" button was removed
// (store sells now, WaitlistSection is hidden).

export default function AtelierCTA({
  content,
  locale,
}: {
  content: AtelierContent;
  locale: Locale;
}) {
  const { cta } = content;

  return (
    <section className={`${styles.cta} ${styles.noise}`}>
      <Reveal className={styles.ctaWrap}>
        <h2 className={styles.ctaH2}>
          {cta.h2Line1} <em>{cta.h2Em}</em>
        </h2>
        <div className={styles.ctaActions}>
          <Link href={localizedPath('tocatoare', locale)} className={styles.btnPrimary}>
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
        </div>
      </Reveal>
    </section>
  );
}
