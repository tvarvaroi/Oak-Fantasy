'use client';

import Link from 'next/link';
import type { AboutContent } from './content';
import Reveal from './Reveal';
import PlaceholderImage from './PlaceholderImage';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import styles from './about.module.css';

// Workshop — v2-timeline.html:174-187. Full-bleed banner + bottom gradient
// (about.module.css .workshopBanner::after) + overlay text.
// Task 4.5 DECIDED: striped placeholder (no real photo). The bundled
// workshop.webp is a mislabeled PNG / magazine mockup — not used.
// 2026-05-27 addition: cross-link to /atelier in the overlay, pointing the
// reader to the full workshop documentary page.
// TODO: replace with real workshop photo when the founder supplies one.

export default function WorkshopBanner({
  content,
  locale,
}: {
  content: AboutContent;
  locale: Locale;
}) {
  const { workshop } = content;
  const atelierHref = localizedPath('atelier', locale);

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
          <Link href={atelierHref} className={styles.workshopCrossRef}>
            {workshop.crossLinkLabel}
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
              <path
                d="M1 5h12M9 1l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
