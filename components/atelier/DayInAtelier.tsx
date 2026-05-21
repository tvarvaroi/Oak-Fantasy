'use client';

import Reveal from '@/components/about/Reveal';
import type { AtelierContent } from './content';
import styles from './atelier.module.css';

// Day — v3-catalog.html. 1fr/1.6fr head, 4-col strip with top-border accent.
// Each day-moment: time (italic copper) + h3 + p.

export default function DayInAtelier({ content }: { content: AtelierContent }) {
  const { day } = content;

  return (
    <section className={styles.day} id="zi">
      <div className={styles.dayWrap}>
        <Reveal className={styles.dayHead}>
          <div>
            <p className={styles.eyebrow}>{day.eyebrow}</p>
            <h2 className={styles.dayH2}>
              {day.h2Line1} <em>{day.h2Em}</em>
            </h2>
          </div>
          <p className={styles.dayIntro}>{day.intro}</p>
        </Reveal>
        <div className={styles.dayStrip}>
          {day.moments.map((m, i) => (
            <Reveal key={m.title} delay={i * 0.1}>
              <div className={styles.dayMoment}>
                <span className={styles.dayTime}>{m.time}</span>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
