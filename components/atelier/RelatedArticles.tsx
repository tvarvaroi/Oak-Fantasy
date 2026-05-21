'use client';

import Reveal from '@/components/about/Reveal';
import type { AtelierContent } from './content';
import styles from './atelier.module.css';

// Related articles — v3-catalog.html. Centered head, 4-col grid of
// placeholder article-cards with "Articol în pregătire" / "Article coming
// soon" badge (rendered via ::after using data-coming attr).

export default function RelatedArticles({ content }: { content: AtelierContent }) {
  const { articles } = content;

  return (
    <section className={styles.articles} id="articole">
      <div className={styles.articlesWrap}>
        <Reveal className={styles.articlesHead}>
          <p className={styles.eyebrow}>{articles.eyebrow}</p>
          <h2 className={styles.articlesH2}>
            {articles.h2Line1} <em>{articles.h2Em}</em>
          </h2>
          <p className={styles.articlesIntro}>{articles.intro}</p>
        </Reveal>
        <div className={styles.articlesGrid}>
          {articles.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <article className={styles.articleCard} data-coming={item.meta}>
                <div className={styles.articleImg} />
                <div className={styles.articleBody}>
                  <span className={styles.articleTopic}>{item.topic}</span>
                  <h3>{item.title}</h3>
                  <span className={styles.articleMeta}>{item.meta}</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
