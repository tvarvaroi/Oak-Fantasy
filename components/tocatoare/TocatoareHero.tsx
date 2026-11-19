'use client';

import styles from './tocatoare.module.css';
import Reveal from '@/components/about/Reveal';
import type { TocatoareContent } from './content';

// Keep numeric ranges ("5–10", "1–3") on one line — browsers break after an
// en dash, which split "5–" / "10 zile" on narrow screens (design-qa 2026-11-19).
function noBreakRanges(text: string) {
  return text.split(/(\d+–\d+)/).map((part, i) =>
    /^\d+–\d+$/.test(part) ? (
      <span key={i} style={{ whiteSpace: 'nowrap' }}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export default function TocatoareHero({ content }: { content: TocatoareContent }) {
  return (
    <section className={`${styles.hero} paper-texture`} aria-label={content.hero.eyebrow}>
      <div className={styles.heroWrap}>
        <div>
          <p className={styles.eyebrow}>{content.hero.eyebrow}</p>
          <h1 className={styles.heroTitle}>
            {content.hero.titleStart} <em>{content.hero.titleEm}</em>
          </h1>
        </div>
        <Reveal className={styles.heroNote}>
          <strong>{content.hero.note.strong}</strong> {noBreakRanges(content.hero.note.rest)}
        </Reveal>
      </div>
    </section>
  );
}
