'use client';

import type { AboutContent } from './content';
import Reveal from './Reveal';
import PlaceholderImage from './PlaceholderImage';
import styles from './about.module.css';

// Workshop — v2-timeline.html:174-187. Full-bleed banner + bottom gradient
// (about.module.css .workshopBanner::after) + overlay text.
// Task 4.5 DECIDED: striped placeholder (no real photo). The bundled
// workshop.webp is a mislabeled PNG / magazine mockup — not used.
// TODO: replace with real workshop photo when the founder supplies one.

export default function WorkshopBanner({
  content,
}: {
  content: AboutContent;
}) {
  const { workshop } = content;

  return (
    <section className={styles.workshop}>
      {/* No id="atelier" on /despre: collides with homepage anchor; user is
          already on the page, no in-page nav needed (founder decision). */}
      <div className={styles.workshopBanner}>
        {/* TODO: replace with real workshop photo (golden hour, wide shot, no faces) */}
        <PlaceholderImage
          caption={workshop.placeholder}
          className={styles.workshopBannerImg}
        />
        <Reveal className={styles.workshopOverlay}>
          <div>
            <p className={styles.eyebrow}>{workshop.eyebrow}</p>
            <h2>{workshop.h2}</h2>
          </div>
          <p>{workshop.paragraph}</p>
        </Reveal>
      </div>
    </section>
  );
}
