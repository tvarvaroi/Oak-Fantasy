'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface LegalHeroProps {
  eyebrow: string;
  title: string;
  // Pre-launch the date is a [PLACEHOLDER] string; once lawyer-approved
  // copy lands, it becomes an ISO-formatted date rendered in the user's
  // locale. We pass the rendered string through unchanged either way.
  lastUpdated: string;
  lastUpdatedLabel: string;
}

export default function LegalHero({
  eyebrow,
  title,
  lastUpdated,
  lastUpdatedLabel,
}: LegalHeroProps) {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'var(--cream-warm)',
        paddingTop: 'clamp(96px, 14vh, 160px)',
        paddingBottom: 'clamp(28px, 4.5vh, 48px)',
      }}
      aria-label={eyebrow}
    >
      <div className="paper-texture absolute inset-0 pointer-events-none" aria-hidden />

      <div
        className="mx-auto px-6 sm:px-8"
        style={{ maxWidth: 720, position: 'relative' }}
      >
        <motion.p
          className="label-caps"
          style={{ color: 'var(--copper)' }}
          initial={prefersReduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          className="font-caudex"
          style={{
            marginTop: 12,
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            lineHeight: 1.14,
            color: 'var(--oak-deep)',
            fontWeight: 700,
          }}
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="font-lora"
          style={{
            marginTop: 18,
            fontSize: '0.88rem',
            lineHeight: 1.6,
            color: 'var(--ink-soft)',
            opacity: 0.85,
          }}
          initial={prefersReduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="label-caps" style={{ color: 'var(--ink-soft)', fontSize: '0.62rem' }}>
            {lastUpdatedLabel}
          </span>{' '}
          <span
            className="font-caveat"
            style={{
              color: 'var(--oak-warm)',
              fontSize: '1.25rem',
              marginLeft: 6,
              transform: 'rotate(-1deg)',
              display: 'inline-block',
            }}
          >
            {lastUpdated}
          </span>
        </motion.p>
      </div>
    </section>
  );
}
