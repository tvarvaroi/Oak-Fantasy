'use client';

import Link from 'next/link';

import { localizedPath, type Locale } from '@/lib/i18n-routes';
import { CUSTOM_ORDER_CONTENT } from '@/components/la-comanda/content';
import styles from '@/components/la-comanda/la-comanda.module.css';

// Homepage teaser for /la-comanda (2026-11-18). Last band before the Footer,
// after NumbersStrip (forest): "you've seen the shop; if it isn't there, we
// make it". Moved here when CraftVideoTease was hidden, so a light paper band
// still separates the dark NumbersStrip from the bark Footer. Links to the
// page (which explains the flow), not straight to the form.

export default function CustomOrderTease({ language }: { language: Locale }) {
  const copy = CUSTOM_ORDER_CONTENT[language].teaser;
  return (
    <section className={styles.teaser} aria-labelledby="custom-order-tease-heading" data-testid="custom-order-tease">
      <div className={`${styles.wrap} ${styles.teaserGrid}`}>
        <div>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="custom-order-tease-heading" className={styles.h2}>
            {copy.heading}
          </h2>
          <p className={styles.teaserBody}>{copy.body}</p>
        </div>
        <Link href={localizedPath('laComanda', language)} className={styles.teaserCta}>
          {copy.cta}
        </Link>
      </div>
    </section>
  );
}
