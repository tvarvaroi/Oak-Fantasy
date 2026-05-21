'use client';

import { Fragment } from 'react';
import Reveal from '@/components/about/Reveal';
import type { AtelierContent } from './content';
import styles from './atelier.module.css';

// Conditions — v3-catalog.html. 1fr/1.6fr head, 2 cond-cards with
// label (small caps copper) + paragraph that supports **strong** highlights
// (rendered via the renderStrong helper below).

/** Render a string with **markdown-bold** chunks promoted to <strong>. */
function renderStrong(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function Conditions({ content }: { content: AtelierContent }) {
  const { conditions } = content;

  return (
    <section className={styles.cond} id="conditii">
      <div className={styles.condWrap}>
        <Reveal className={styles.condHead}>
          <div>
            <p className={styles.eyebrow}>{conditions.eyebrow}</p>
            <h2 className={styles.condH2}>
              {conditions.h2Line1} <em>{conditions.h2Em}</em> {conditions.h2Tail}
            </h2>
          </div>
          <p className={styles.condIntro}>{conditions.intro}</p>
        </Reveal>
        <div className={styles.condGrid}>
          {conditions.cards.map((card) => (
            <Reveal key={card.label}>
              <div className={styles.condCard}>
                <span className={styles.condLabel}>{card.label}</span>
                <p>{renderStrong(card.body)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
