'use client';

import Link from 'next/link';
import Reveal from '@/components/about/Reveal';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import type { AtelierContent } from './content';
import styles from './atelier.module.css';

// Process summary — v3-catalog.html `proc` strip. 1fr/2fr 2-col:
// left = eyebrow + h2 + italic intro + cross-ref to /despre#proces;
// right = 5 compact steps (i. ii. iii. iv. v.) with top-border accent.

export default function ProcessSummary({
  content,
  locale,
}: {
  content: AtelierContent;
  locale: Locale;
}) {
  const { process } = content;
  const despreHref = `${localizedPath('despre', locale)}#proces`;

  return (
    <section className={styles.proc} id="proces">
      <div className={styles.procWrap}>
        <Reveal>
          <p className={styles.eyebrow}>{process.eyebrow}</p>
          <h2 className={styles.procH2}>
            {process.h2Line1} <em>{process.h2Em}</em>
          </h2>
          <p className={styles.procIntro}>
            <em>{process.intro}</em>
          </p>
          <div className={styles.procFoot}>
            <Link href={despreHref} className={styles.crossRef}>
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
          </div>
        </Reveal>
        <Reveal className={styles.procSteps}>
          {process.steps.map((step) => (
            <div key={step.n} className={styles.procStep}>
              <span className={styles.procStepNum}>{step.n}</span>
              <h4>{step.title}</h4>
              <p>{step.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
