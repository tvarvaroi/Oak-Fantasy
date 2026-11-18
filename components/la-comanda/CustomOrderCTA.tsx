'use client';

import type { MouseEvent } from 'react';

import { NAME_FIELD_ID, SLIP_ID } from './CustomOrderForm';
import type { CustomOrderCopy } from './content';
import styles from './la-comanda.module.css';

// Closing band: sends the visitor back up to the slip and puts the cursor in
// the first field. Plain #formular anchor without JS; with JS, scroll honours
// reduced motion and focus lands on "Nume" (or on the slip after a send).

export default function CustomOrderCTA({ copy }: { copy: CustomOrderCopy['cta'] }) {
  const goToSlip = (e: MouseEvent<HTMLAnchorElement>) => {
    const slip = document.getElementById(SLIP_ID);
    if (!slip) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    slip.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${SLIP_ID}`);
    const target = document.getElementById(NAME_FIELD_ID) ?? slip;
    target.focus({ preventScroll: true });
  };

  return (
    <section className={styles.cta} aria-labelledby="cta-heading">
      <div className={styles.ctaInner}>
        <h2 id="cta-heading" className={styles.ctaH2}>
          {copy.heading}
        </h2>
        <p className={styles.ctaBody}>{copy.body}</p>
        <a href={`#${SLIP_ID}`} className={styles.ctaButton} onClick={goToSlip}>
          {copy.button}
        </a>
      </div>
    </section>
  );
}
