'use client';

import Link from 'next/link';
import type { AboutContent } from './content';
import Reveal from './Reveal';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import styles from './about.module.css';

// Process timeline — 2026-05-27 medium-compact refactor (Option C from
// docs/plans/2026-05-27-atelier-page.md). Vertical centered cards, no
// alternating layout, no placeholder images. Uses `step.bodyCompact`
// (2-3 sentences) instead of the long-form `step.body` (kept in content.ts
// for reference). Ends with a cross-link to /atelier#proces.

export default function ProcessTimeline({
  content,
  locale,
}: {
  content: AboutContent;
  locale: Locale;
}) {
  const { process } = content;
  const atelierHref = `${localizedPath('atelier', locale)}#proces`;

  return (
    <section className={`${styles.timeline} paper-texture`} id="proces">
      <Reveal className={styles.timelineHead}>
        <p className={styles.eyebrow}>{process.eyebrow}</p>
        <h2>{process.h2}</h2>
        <p className={styles.timelineSubHeading}>{process.subHeading}</p>
        <p>{process.lead}</p>
      </Reveal>

      <div className={styles.timelineTrack}>
        {process.steps.map((step) => (
          <Reveal key={step.num} className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepNum}>{step.num}</span>
              <span className={styles.stepTick}>{step.tick}</span>
            </div>
            <h3>{step.title}</h3>
            <p>{step.bodyCompact}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className={styles.timelineCross}>
        <Link href={atelierHref} className={styles.crossRef}>
          {process.crossLinkLabel}
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
            <path
              d="M1 5h12M9 1l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </Reveal>
    </section>
  );
}
