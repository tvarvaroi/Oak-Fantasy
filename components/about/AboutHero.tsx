'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { AboutContent } from './content';
import styles from './about.module.css';

// Hero — verbatim structure from v2-timeline.html:109-123.
// Decorative twig: 4 SVG paths that "draw" on load (ports shared.css .draw),
// reduced-motion -> fully drawn, no animation.

const TWIG_PATHS = [
  { d: 'M4 22 C20 14, 56 12, 80 18 C104 24, 140 14, 156 8', w: 1.5 },
  { d: 'M56 18 C54 12, 50 8, 46 6', w: 1 },
  { d: 'M88 16 C86 10, 94 5, 98 3', w: 1 },
  { d: 'M124 12 C126 6, 132 3, 136 4', w: 1 },
];

export default function AboutHero({ content }: { content: AboutContent }) {
  const reduce = useReducedMotion();
  const { hero } = content;

  return (
    <section className={`${styles.hero} paper-texture`}>
      <div className={styles.heroWrap}>
        <p className={styles.eyebrowCopper}>{hero.eyebrow}</p>
        <h1 className={styles.heroH1}>
          {hero.h1Lines[0]}
          <br />
          {hero.h1Lines[1]}
        </h1>
        <p className={styles.heroSub}>{hero.sub}</p>
        <div className={styles.heroTwig}>
          <svg viewBox="0 0 160 32" fill="none" aria-hidden="true">
            {TWIG_PATHS.map((p, i) => (
              <motion.path
                key={p.d}
                d={p.d}
                stroke="var(--oak-warm)"
                strokeWidth={p.w}
                strokeLinecap="round"
                fill="none"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={reduce ? undefined : { pathLength: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: i * 0.12 }}
              />
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
