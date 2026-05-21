'use client';

import Reveal from '@/components/about/Reveal';
import type { AtelierContent } from './content';
import styles from './atelier.module.css';

// Seasonality — v3-catalog.html. Centered head, 4-col grid of season-cards
// (text-only, NO svg icons — that's Variant B). Top-border accent oak-warm.

export default function Seasonality({ content }: { content: AtelierContent }) {
  const { seasonality } = content;

  return (
    <section className={styles.season} id="sezon">
      <div className={styles.seasonWrap}>
        <Reveal className={styles.seasonHead}>
          <p className={styles.eyebrow}>{seasonality.eyebrow}</p>
          <h2 className={styles.seasonH2}>
            {seasonality.h2Line1} <em>{seasonality.h2Em}</em> {seasonality.h2Tail}
          </h2>
        </Reveal>
        <div className={styles.seasonGrid}>
          {seasonality.cards.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.08}>
              <div className={styles.seasonCard}>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
