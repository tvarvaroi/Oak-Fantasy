'use client';

import Link from 'next/link';
import type { Locale } from '@/lib/i18n-routes';
import type { AboutContent } from './content';
import Reveal from './Reveal';
import styles from './about.module.css';

// Final CTA — v2-timeline.html:231-242. Anchors point at the locale
// homepage sections (#waitlist / #products) per founder decision C
// (the /tocatoare route does not exist yet — Etapa 1 future task).

export default function AboutCTA({
  content,
  locale,
}: {
  content: AboutContent;
  locale: Locale;
}) {
  const { cta } = content;
  const home = `/${locale}`;

  return (
    <section className={`${styles.cta} paper-texture`}>
      <Reveal className={styles.ctaWrap}>
        <h2>{cta.h2}</h2>
        <p>{cta.p}</p>
        <div className={styles.ctaActions}>
          <Link href={`${home}${cta.primaryAnchor}`} className={styles.btnPrimary}>
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
          <Link href={`${home}${cta.ghostAnchor}`} className={styles.btnGhost}>
            {cta.ghostLabel}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
