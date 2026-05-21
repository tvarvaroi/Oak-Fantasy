'use client';

import Reveal from '@/components/about/Reveal';
import type { AtelierContent } from './content';
import styles from './atelier.module.css';

// Place — v3-catalog.html. 1.2fr/1fr 2-col: text left, 2-img stack right
// (second image offset 32px left for editorial asymmetry).

export default function WorkshopPlace({ content }: { content: AtelierContent }) {
  const { place } = content;

  return (
    <section className={styles.place} id="loc">
      <div className={styles.placeWrap}>
        <Reveal>
          <p className={styles.eyebrow}>{place.eyebrow}</p>
          <h2 className={styles.placeH2}>
            {place.h2Line1} <em>{place.h2Em}</em>
          </h2>
          {place.paragraphs.map((p, i) => (
            <p key={i} className={styles.placeP}>
              {p}
            </p>
          ))}
        </Reveal>
        <Reveal className={styles.placeSide}>
          <div className={`${styles.placeImg} ${styles.placeholder}`} role="img" aria-label={place.placeholderTop}>
            <span>{place.placeholderTop}</span>
          </div>
          <div className={`${styles.placeImg} ${styles.placeholder}`} role="img" aria-label={place.placeholderBottom}>
            <span>{place.placeholderBottom}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
