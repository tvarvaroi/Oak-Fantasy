'use client';

import Image from 'next/image';
import Reveal from '@/components/about/Reveal';
import type { AtelierContent } from './content';
import styles from './atelier.module.css';

// Hero — v3-catalog.html. Dark bark bg + noise overlay + 2-col grid:
// left = eyebrow + h1 (italic em copper accent) + sub + read-time pill;
// right = 3x3 rotated mosaic of real product photos (2026-10-15; was a
// grid of tool/sensor/light text labels).

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
            {hero.cells.map((cell, i) => (
              <div key={cell.src} className={styles.heroCell}>
                <Image
                  src={cell.src}
                  alt={cell.alt}
                  fill
                  // Above the fold on desktop: the first row paints eagerly.
                  priority={i < 3}
                  sizes="(max-width: 1024px) 30vw, 180px"
                  quality={80}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
