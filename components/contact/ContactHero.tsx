'use client';

import { motion, useReducedMotion } from 'framer-motion';

import type { ContactCopy } from './content';

export default function ContactHero({ copy }: { copy: ContactCopy['hero'] }) {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'var(--cream-warm)',
        paddingTop: 'clamp(96px, 14vh, 160px)',
        paddingBottom: 'clamp(40px, 6vh, 72px)',
      }}
      aria-label={copy.eyebrow}
    >
      <div className="paper-texture absolute inset-0 pointer-events-none" aria-hidden />

      <div
        className="mx-auto px-6 sm:px-8"
        style={{ maxWidth: 1200, position: 'relative' }}
      >
        <motion.p
          className="label-caps"
          style={{ color: 'var(--copper)' }}
          initial={prefersReduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {copy.eyebrow}
        </motion.p>

        <motion.h1
          className="font-caudex"
          style={{
            marginTop: 14,
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            lineHeight: 1.12,
            color: 'var(--oak-deep)',
            fontWeight: 700,
            maxWidth: 720,
          }}
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          {copy.title}{' '}
          <span
            className="font-caveat"
            style={{
              color: 'var(--oak-warm)',
              display: 'inline-block',
              transform: 'rotate(-1deg)',
              transformOrigin: 'left center',
              fontSize: 'clamp(1.6rem, 3.4vw, 2.6rem)',
              lineHeight: 1,
              fontWeight: 600,
              marginLeft: 6,
            }}
          >
            {copy.handwritten}
          </span>
        </motion.h1>

        <motion.p
          className="font-lora"
          style={{
            marginTop: 22,
            fontSize: '1.05rem',
            lineHeight: 1.75,
            color: 'var(--ink-soft)',
            maxWidth: 640,
          }}
          initial={prefersReduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {copy.intro}
        </motion.p>
      </div>
    </section>
  );
}
