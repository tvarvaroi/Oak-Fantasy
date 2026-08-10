'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { AboutContent } from './content';
import Reveal from './Reveal';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import styles from './about.module.css';

// Workshop — v2-timeline.html:174-187. Full-bleed banner + bottom gradient
// (about.module.css .workshopBanner::after) + overlay text.
// 2026-08-10: stock photo (Pexels, free commercial license — see
// docs/stock-credits.md). Deliberately a neutral atmospheric detail
// (workbench + lamp), NOT a wide shot of someone else's workshop — the
// page copy describes our real space, so the image must not contradict it.

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
        <Image
          src="/stock/despre-banner-workbench.webp"
          alt={workshop.imageAlt}
          fill
          sizes="100vw"
          className={styles.workshopBannerImg}
          style={{ objectFit: 'cover' }}
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
