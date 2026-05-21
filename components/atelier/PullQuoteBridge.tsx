'use client';

import Reveal from '@/components/about/Reveal';
import type { AtelierContent } from './content';
import styles from './atelier.module.css';

// Pull-quote bridge between #zi and #proces. Paper-aged bg, Caveat font,
// copper hairlines above/below via ::before / ::after.

export default function PullQuoteBridge({ content }: { content: AtelierContent }) {
  return (
    <div className={styles.pullquoteWrap}>
      <Reveal>
        <p className={styles.pullquote}>{content.pullquote}</p>
      </Reveal>
    </div>
  );
}
