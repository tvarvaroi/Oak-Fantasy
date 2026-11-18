import type { CustomOrderCopy } from './content';
import styles from './la-comanda.module.css';

// "Cum lucrăm o comandă" — a real sequence, so numbered (i. ii. iii., the
// same idiom as the /atelier process strip).

export default function HowItWorks({ copy }: { copy: CustomOrderCopy['steps'] }) {
  return (
    <section className={styles.steps} aria-labelledby="steps-heading">
      <div className={styles.wrap}>
        <h2 id="steps-heading" className={styles.h2}>
          {copy.heading}
        </h2>
        <ol className={styles.stepsGrid}>
          {copy.items.map((step) => (
            <li key={step.n} className={styles.step}>
              <span className={styles.stepNum} aria-hidden>
                {step.n}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
