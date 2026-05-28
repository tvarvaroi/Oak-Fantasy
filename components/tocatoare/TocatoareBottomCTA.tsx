'use client';

import styles from './tocatoare.module.css';
import Reveal from '@/components/about/Reveal';
import type { TocatoareContent } from './content';

export default function TocatoareBottomCTA({ content }: { content: TocatoareContent }) {
  return (
    <section className={`${styles.bottomCta} paper-texture`} aria-label={content.bottomCta.heading}>
      <Reveal className={styles.bottomCtaWrap}>
        <h2 className={styles.bottomCtaHeading}>{content.bottomCta.heading}</h2>
        <p className={styles.bottomCtaBody}>{content.bottomCta.body}</p>
        <a
          href={`mailto:${content.bottomCta.email}`}
          className={styles.bottomCtaButton}
        >
          {content.bottomCta.button}
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
            <path
              d="M1 6h15M11 1l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </Reveal>
    </section>
  );
}
