'use client';

import type { AboutContent } from './content';
import Reveal from './Reveal';
import styles from './about.module.css';

// Philosophy — v2-timeline.html:160-172. Dark --bark bg + grain ::before
// (in about.module.css). Two-column grid: heading left, 3 paragraphs right.
// h2 second line rendered in italic copper <em> per .philosophy h2 em.

export default function PhilosophySection({
  content,
}: {
  content: AboutContent;
}) {
  const { philosophy } = content;

  return (
    <section className={styles.philosophy} id="filosofie">
      <div className={styles.philosophyWrap}>
        <Reveal>
          <p className={styles.eyebrow}>{philosophy.eyebrow}</p>
          <h2>
            {philosophy.h2Line1}
            <br />
            <em>{philosophy.h2Line2Em}</em>
          </h2>
        </Reveal>
        <Reveal className={styles.philosophyBody}>
          {philosophy.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
