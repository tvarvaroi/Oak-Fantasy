'use client';

import Link from 'next/link';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import type { AboutContent } from './content';
import Reveal from './Reveal';
import styles from './about.module.css';

// Final CTA — v2-timeline.html:231-242. 2026-10-15 (QA & Polish #14): the
// pre-launch "Lansăm în octombrie" + waitlist anchors are gone; primary →
// /tocatoare (live catalog), ghost → /atelier.

export default function AboutCTA({
  content,
  locale,
}: {
  content: AboutContent;
  locale: Locale;
}) {
  const { cta } = content;

  return (
    <section className={`${styles.cta} paper-texture`}>
      <Reveal className={styles.ctaWrap}>
        <h2>{cta.h2}</h2>
        <p>{cta.p}</p>
        <div className={styles.ctaActions}>
          <Link href={localizedPath(cta.primaryRoute, locale)} className={styles.btnPrimary}>
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
          <Link href={localizedPath(cta.ghostRoute, locale)} className={styles.btnGhost}>
            {cta.ghostLabel}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
