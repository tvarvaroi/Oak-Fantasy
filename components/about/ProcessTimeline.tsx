'use client';

import type { AboutContent } from './content';
import Reveal from './Reveal';
import PlaceholderImage from './PlaceholderImage';
import styles from './about.module.css';

// Process timeline — v2-timeline.html:125-158. Vertical centre line + 5 steps.
// Inner DOM order is constant (body, marker, side-img); the alternating
// left/right layout is driven purely by :nth-child grid-column rules in
// about.module.css, exactly as the prototype does it.

export default function ProcessTimeline({ content }: { content: AboutContent }) {
  const { process } = content;

  return (
    <section className={`${styles.timeline} paper-texture`} id="proces">
      <Reveal className={styles.timelineHead}>
        <p className={styles.eyebrow}>{process.eyebrow}</p>
        <h2>{process.h2}</h2>
        <p>{process.lead}</p>
      </Reveal>

      <div className={styles.timelineTrack}>
        {process.steps.map((step) => (
          <Reveal key={step.num} className={styles.step}>
            <div className={styles.stepBody}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
            <div className={styles.stepMarker}>
              <div className={styles.stepNumBubble}>{step.num}</div>
              <span className={styles.stepTick}>{step.tick}</span>
            </div>
            <PlaceholderImage caption={step.placeholder} className={styles.sideImg} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
