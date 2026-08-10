'use client';

import Image from 'next/image';
import Reveal from '@/components/about/Reveal';
import type { AtelierContent } from './content';
import styles from './atelier.module.css';

// Place — v3-catalog.html. 1.2fr/1fr 2-col: text left, 2-img stack right
// (second image offset 32px left for editorial asymmetry).
// 2026-08-10: stock photos (Pexels — docs/stock-credits.md). Detail shots on
// purpose, NOT a wide shot: the copy describes our real 60sqm room, and a
// stock wide shot of someone else's workshop would visibly contradict it.

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
          <div className={styles.placeImg}>
            <Image
              src="/stock/atelier-place-window.webp"
              alt={place.imageTopAlt}
              fill
              sizes="(max-width: 900px) 100vw, 480px"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className={styles.placeImg}>
            <Image
              src="/stock/atelier-place-sawdust.webp"
              alt={place.imageBottomAlt}
              fill
              sizes="(max-width: 900px) 100vw, 480px"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
