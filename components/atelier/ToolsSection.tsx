'use client';

import Image from 'next/image';
import Reveal from '@/components/about/Reveal';
import type { AtelierContent } from './content';
import styles from './atelier.module.css';

// Tools — v3-catalog.html. The centerpiece of Variant C.
// 12-col grid: cards 1+2 span-6 (top row), cards 3-5 span-4 (bottom row).
// 2026-10-15: 5 tools (hand-tool set removed), "Featured ·" tags dropped.
// Hover lift via CSS only (no framer-motion needed for hover).

export default function ToolsSection({ content }: { content: AtelierContent }) {
  const { tools } = content;

  return (
    <section className={styles.toolsHero} id="unelte">
      <div className={styles.toolsWrap}>
        <Reveal className={styles.toolsHead}>
          <div>
            <p className={styles.eyebrow}>{tools.eyebrow}</p>
            <h2 className={styles.toolsH2}>
              {tools.h2Line1} <em>{tools.h2Em}</em>
            </h2>
          </div>
          <p className={styles.toolsIntro}>{tools.intro}</p>
        </Reveal>
        <div className={styles.toolsFeature}>
          {tools.items.map((tool) => (
            <Reveal key={tool.name}>
              <article className={styles.toolCard}>
                <span className={styles.toolTag}>{tool.tag}</span>
                <div className={styles.toolImg}>
                  {/* Stock (Pexels, free commercial license — docs/stock-credits.md).
                      Generic close-ups on purpose: no faces, no readable tool brands. */}
                  <Image
                    src={tool.image}
                    alt={tool.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.toolBody}>
                  <h3>{tool.name}</h3>
                  <p className={styles.toolRole}>{tool.role}</p>
                  <p className={styles.toolDesc}>{tool.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
