'use client';

import styles from './tocatoare.module.css';
import Reveal from '@/components/about/Reveal';
import type { TocatoareContent } from './content';

export default function TocatoareHero({ content }: { content: TocatoareContent }) {
  return (
    <section className={`${styles.hero} paper-texture`} aria-label={content.hero.eyebrow}>
      <div className={styles.heroWrap}>
        <div>
          <p className={styles.eyebrow}>{content.hero.eyebrow}</p>
          <h1 className={styles.heroTitle}>
            {content.hero.titleStart} <em>{content.hero.titleEm}</em>
          </h1>
          <p className={styles.heroSub}>{content.hero.sub}</p>
        </div>
        <Reveal className={styles.heroNote}>
          <strong>{content.hero.note.strong}</strong> {content.hero.note.rest}
        </Reveal>
      </div>
    </section>
  );
}
