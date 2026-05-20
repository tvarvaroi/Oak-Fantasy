'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { AboutContent } from './content';
import Reveal from './Reveal';
import styles from './about.module.css';

// Values — v2-timeline.html:189-229. 4 cards, each a hand-drawn SVG icon
// (drawn on scroll, ports shared.css .draw), title, body. The Reveal wraps
// the card so its scroll transform never collides with the CSS :hover lift
// on .vcard (framer-motion inline transform vs CSS :hover).

function drawProps(reduce: boolean, i: number) {
  return reduce
    ? {}
    : {
        initial: { pathLength: 0 } as const,
        whileInView: { pathLength: 1 } as const,
        viewport: { once: true, amount: 0.4 } as const,
        transition: {
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1] as const,
          delay: i * 0.12,
        },
      };
}

function ValueIcon({ index, reduce }: { index: number; reduce: boolean }) {
  const common = { fill: 'none' as const };
  if (index === 0) {
    return (
      <svg viewBox="0 0 36 36" {...common} aria-hidden="true">
        <motion.circle
          cx="18" cy="18" r="14" stroke="var(--oak-warm)" strokeWidth="1.5"
          fill="none" {...drawProps(reduce, 0)}
        />
        <motion.path
          d="M18 8 L18 18 L24 22" stroke="var(--copper)" strokeWidth="1.6"
          strokeLinecap="round" fill="none" {...drawProps(reduce, 1)}
        />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 36 36" {...common} aria-hidden="true">
        <motion.path
          d="M18 30 C12 24 6 18 6 12 C6 7 9 5 14 6 C16.5 6.5 18 9 18 12 C18 9 19.5 6.5 22 6 C27 5 30 7 30 12 C30 18 24 24 18 30Z"
          stroke="var(--forest-mid)" strokeWidth="1.5" strokeLinejoin="round"
          fill="none" {...drawProps(reduce, 0)}
        />
        <motion.path
          d="M18 30 L18 12" stroke="var(--forest-mid)" strokeWidth="1"
          strokeLinecap="round" {...drawProps(reduce, 1)}
        />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg viewBox="0 0 36 36" {...common} aria-hidden="true">
        <motion.rect
          x="4" y="10" width="28" height="20" rx="3" stroke="var(--oak-warm)"
          strokeWidth="1.5" fill="none" {...drawProps(reduce, 0)}
        />
        <motion.path
          d="M9 18 L27 18 M9 24 L23 24" stroke="var(--copper)" strokeWidth="1.2"
          strokeLinecap="round" {...drawProps(reduce, 1)}
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 36 36" {...common} aria-hidden="true">
      <motion.path
        d="M8 28 C8 22 10 18 14 16 C12 14 12 10 14 8 C16 6 20 6 22 8 C24 10 24 14 22 16 C26 18 28 22 28 28"
        stroke="var(--oak-warm)" strokeWidth="1.5" strokeLinecap="round"
        fill="none" {...drawProps(reduce, 0)}
      />
    </svg>
  );
}

export default function ValuesGrid({ content }: { content: AboutContent }) {
  const reduce = useReducedMotion() ?? false;
  const { values } = content;

  return (
    <section className={styles.values} id="valori">
      <div className={styles.valuesWrap}>
        <Reveal className={styles.valuesHead}>
          <div>
            <p className={styles.eyebrow}>{values.eyebrow}</p>
            <h2>{values.h2}</h2>
          </div>
          <p className={styles.valuesLead}>{values.lead}</p>
        </Reveal>
        <div className={styles.valuesGrid}>
          {values.cards.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.06}>
              <div className={styles.vcard}>
                <ValueIcon index={i} reduce={reduce} />
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
