'use client';

import Reveal from '@/components/about/Reveal';
import type { AtelierContent } from './content';
import styles from './atelier.module.css';

// Hero — v3-catalog.html. Dark bark bg + noise overlay + 2-col grid:
// left = eyebrow + h1 (italic em copper accent) + sub + read-time pill;
// right = 3x3 rotated cell grid with tool/sensor/light labels.

export default function AtelierHero({ content }: { content: AtelierContent }) {
  const { hero } = content;

  return (
    <section className={`${styles.hero} ${styles.noise}`}>
      <div className={styles.heroWrap}>
        <div>
          <p className={styles.heroEyebrow}>{hero.eyebrow}</p>
          <h1 className={styles.heroH1}>
            {hero.h1Line1}
            <br />
            <em>{hero.h1Line2Em}</em> {hero.h1Line2Tail}
          </h1>
          <p className={styles.heroSub}>{hero.sub}</p>
          <span className={styles.readTime}>{hero.readTime}</span>
        </div>
        <Reveal>
          <div className={styles.heroGridVis}>
            {hero.cells.map((cell) => (
              <div key={cell.label} className={styles.heroCell}>
                {cell.label}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
