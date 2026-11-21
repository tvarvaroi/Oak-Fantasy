import type { Locale } from '@/lib/i18n-routes';

import CustomOrderForm from './CustomOrderForm';
import type { CustomOrderCopy } from './content';
import styles from './la-comanda.module.css';

// Hero: headline + intro on the left, the order slip (the form) on the right;
// stacked below 1024 with the slip under the text.

export default function CustomOrderHero({
  copy,
  locale,
}: {
  copy: CustomOrderCopy;
  locale: Locale;
}) {
  const { hero } = copy;
  return (
    <section className={styles.hero}>
      <div className="paper-texture absolute inset-0 pointer-events-none" aria-hidden />
      <div className={`${styles.wrap} ${styles.heroGrid}`}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>{hero.eyebrow}</p>
          <h1 className={styles.h1}>
            {/* Trailing space: the served HTML reads "Ai o idee? O facem…",
                not "Ai o idee?O facem…". It collapses at the end of the block
                line, so nothing moves. */}
            <span className={styles.h1Line}>{hero.titleLine1}{' '}</span>
            <span className={styles.h1Line}>
              {/* A real space (not a margin) so a wrapped "in wood." starts flush left. */}
              {hero.titleLine2}{' '}
              <span className={styles.handwritten}>{hero.titleHandwritten}</span>
            </span>
          </h1>
          <p className={styles.intro}>{hero.intro}</p>
        </div>
        <CustomOrderForm copy={copy.form} locale={locale} />
      </div>
    </section>
  );
}
