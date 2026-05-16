'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function FloatingCTA({ language }: { language: 'ro' | 'en' }) {
  const [visible, setVisible] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      /* show after scrolling past ~100vh */
      setVisible(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="floating-cta"
          className="fixed bottom-6 right-6 z-50"
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.9 }}
          transition={{
            type: 'spring',
            stiffness: 320,
            damping: 22,
            mass: 0.9,
          }}
        >
          <a
            href="#waitlist"
            onClick={handleClick}
            className="flex items-center gap-2 font-caudex text-sm"
            style={{
              backgroundColor: 'var(--oak-warm)',
              color: 'var(--cream-warm)',
              padding: '12px 22px',
              borderRadius: '8px',
              textDecoration: 'none',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 20px rgba(139,94,60,0.45), 0 1px 4px rgba(31,24,16,0.2)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--oak-deep)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--oak-warm)';
            }}
          >
            {/* small acorn dot */}
            <span
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--highlight)',
                flexShrink: 0,
              }}
              aria-hidden
            />
            {language === 'ro' ? 'Pre-comandă' : 'Pre-order'}
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
