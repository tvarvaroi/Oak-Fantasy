import type { CustomOrderCopy } from './content';
import styles from './la-comanda.module.css';

// "Ce putem face" — five directions, text only. Not a sequence, so no
// numbering: a sticky heading on the left, hairline-ruled entries on the right.

export default function WhatWeMake({ copy }: { copy: CustomOrderCopy['make'] }) {
  return (
    <section className={styles.make} aria-labelledby="make-heading">
      <div className={`${styles.wrap} ${styles.makeGrid}`}>
        <div className={styles.makeAside}>
          <h2 id="make-heading" className={styles.h2}>
            {copy.heading}
          </h2>
          <p className={styles.sectionIntro}>{copy.intro}</p>
        </div>
        <ul className={styles.makeList}>
          {copy.items.map((item) => (
            <li key={item.title} className={styles.makeItem}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
