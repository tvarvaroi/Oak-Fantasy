'use client';

import type { CSSProperties, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Scroll-reveal wrapper — ports shared.css `.reveal` (opacity 0 + y:28 ->
// settled) using framer-motion. Honors prefers-reduced-motion: when reduced,
// content renders statically with no transform/opacity animation.
// IntersectionObserver threshold 0.18 -> viewport amount 0.18, once.

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  /** stagger delay in seconds */
  delay?: number;
}

export default function Reveal({
  children,
  className,
  style,
  id,
  delay = 0,
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={className} style={style} id={id}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
