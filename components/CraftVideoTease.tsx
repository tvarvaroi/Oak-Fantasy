'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/* ─── Corner oak-leaf ornaments ──────────────────────────────────
   Each corner gets a rotated version of the same leaf path.
   All paths are drawn on scroll-in via stroke-dashoffset.
──────────────────────────────────────────────────────────────── */

type Corner = 'tl' | 'tr' | 'bl' | 'br';

const cornerStyles: Record<Corner, React.CSSProperties> = {
  tl: { top: -18, left: -18, transform: 'rotate(0deg)' },
  tr: { top: -18, right: -18, transform: 'rotate(90deg)' },
  bl: { bottom: -18, left: -18, transform: 'rotate(-90deg)' },
  br: { bottom: -18, right: -18, transform: 'rotate(180deg)' },
};

function CornerOrnament({ corner, drawn, delay }: { corner: Corner; drawn: boolean; delay: number }) {
  /* viewBox origin is top-left; leaf points up-right */
  return (
    <div
      className="absolute pointer-events-none"
      style={{ ...cornerStyles[corner], width: 80, height: 80 }}
      aria-hidden
    >
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
        {/* L-bracket frame lines */}
        <path
          d="M 4 40 L 4 4 L 40 4"
          stroke="var(--oak-warm)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            strokeDasharray: 80,
            strokeDashoffset: drawn ? 0 : 80,
            transition: `stroke-dashoffset 0.7s ease-in-out ${delay}s`,
          }}
        />
        {/* small leaf body */}
        <path
          d="M 18 18
             C 16 12 12 8 10 6
             C 14 4 20 6 22 12
             C 26 8 32 6 34 8
             C 32 14 26 16 22 20
             C 22 20 18 18 18 18 Z"
          stroke="var(--forest-mid)"
          strokeWidth="1.3"
          strokeLinejoin="round"
          fill="none"
          style={{
            strokeDasharray: 90,
            strokeDashoffset: drawn ? 0 : 90,
            transition: `stroke-dashoffset 0.75s ease-in-out ${delay + 0.18}s`,
          }}
        />
        {/* leaf vein */}
        <path
          d="M 18 18 L 22 8"
          stroke="var(--forest-mid)"
          strokeWidth="0.9"
          strokeLinecap="round"
          style={{
            strokeDasharray: 14,
            strokeDashoffset: drawn ? 0 : 14,
            transition: `stroke-dashoffset 0.4s ease-in-out ${delay + 0.38}s`,
          }}
        />
        {/* twig from bracket corner to leaf */}
        <path
          d="M 4 4 C 8 4 12 6 18 18"
          stroke="var(--oak-warm)"
          strokeWidth="1.1"
          strokeLinecap="round"
          fill="none"
          style={{
            strokeDasharray: 22,
            strokeDashoffset: drawn ? 0 : 22,
            transition: `stroke-dashoffset 0.45s ease-in-out ${delay + 0.1}s`,
          }}
        />
      </svg>
    </div>
  );
}

/* ─── Decorative twig divider ────────────────────────────────────── */
function TwigDivider({ drawn }: { drawn: boolean }) {
  return (
    <svg viewBox="0 0 220 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="220" height="24" aria-hidden>
      <path
        d="M 4 12 C 30 8, 60 16, 110 12 C 160 8, 190 16, 216 12"
        stroke="var(--oak-warm)"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
        style={{
          strokeDasharray: 280,
          strokeDashoffset: drawn ? 0 : 280,
          transition: 'stroke-dashoffset 1.1s ease-in-out 0.1s',
        }}
      />
      <path d="M 80 12 C 78 7, 74 4, 70 3" stroke="var(--oak-warm)" strokeWidth="1" strokeLinecap="round"
        style={{ strokeDasharray: 12, strokeDashoffset: drawn ? 0 : 12, transition: 'stroke-dashoffset 0.4s ease-in-out 0.55s' }} />
      <path d="M 110 12 C 110 6, 114 3, 116 2" stroke="var(--oak-warm)" strokeWidth="1" strokeLinecap="round"
        style={{ strokeDasharray: 12, strokeDashoffset: drawn ? 0 : 12, transition: 'stroke-dashoffset 0.4s ease-in-out 0.65s' }} />
      <path d="M 140 12 C 142 7, 146 4, 150 3" stroke="var(--oak-warm)" strokeWidth="1" strokeLinecap="round"
        style={{ strokeDasharray: 12, strokeDashoffset: drawn ? 0 : 12, transition: 'stroke-dashoffset 0.4s ease-in-out 0.75s' }} />
    </svg>
  );
}

/* ─── Section ────────────────────────────────────────────────────── */

export default function CraftVideoTease({ language }: { language: 'ro' | 'en' }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);
  const [drawn, setDrawn] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          // Lazy playback: the video has preload="none" + poster, so nothing
          // is fetched until the section scrolls into view. Reduced-motion
          // users keep the static poster (no autoplay).
          if (!prefersReduced) {
            videoElRef.current?.play().catch(() => {
              /* autoplay can be blocked — poster stays, which is fine */
            });
          }
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [prefersReduced]);

  const copy = {
    ro: {
      eyebrow: 'Procesul nostru',
      title: 'Vedere din atelier',
      sub: 'Rumeguș, unelte și lemn — o privire scurtă peste blatul de lucru.',
    },
    en: {
      eyebrow: 'Our process',
      title: 'A view from the workshop',
      sub: 'Sawdust, tools and wood — a short look across the workbench.',
    },
  }[language];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ backgroundColor: 'var(--cream-warm)' }}
      aria-label={language === 'ro' ? 'Vedere din atelier' : 'Workshop view'}
    >
      <div className="paper-texture absolute inset-0 pointer-events-none" aria-hidden />

      <div
        className="mx-auto"
        style={{ maxWidth: 1100, padding: '110px 24px 120px' }}
      >
        {/* header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <motion.p
            className="label-caps"
            style={{ color: 'var(--copper)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {copy.eyebrow}
          </motion.p>

          <motion.h2
            className="font-caudex"
            style={{
              fontSize: 'clamp(1.9rem, 4vw, 3.2rem)',
              fontWeight: 700,
              color: 'var(--ink)',
              lineHeight: 1.15,
              maxWidth: 560,
            }}
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {copy.title}
          </motion.h2>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TwigDivider drawn={drawn} />
          </motion.div>

          <motion.p
            className="font-lora"
            style={{
              fontSize: '1rem',
              lineHeight: 1.75,
              color: 'var(--ink-soft)',
              maxWidth: 460,
            }}
            initial={prefersReduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            {copy.sub}
          </motion.p>
        </div>

        {/* video container */}
        <motion.div
          ref={videoRef}
          className="relative mx-auto"
          style={{
            borderRadius: 14,
            overflow: 'visible', /* allow ornaments to bleed */
            maxWidth: 960,
          }}
          initial={prefersReduced ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* corner ornaments */}
          {(['tl', 'tr', 'bl', 'br'] as Corner[]).map((corner, i) => (
            <CornerOrnament key={corner} corner={corner} drawn={drawn} delay={0.1 + i * 0.08} />
          ))}

          {/* 16:9 ambient loop — stock footage (Pexels, free commercial
              license — docs/stock-credits.md). Neutral content on purpose:
              tools + shavings on a workbench, no people. Muted background
              loop, lazy (preload="none" + play on intersect), poster as
              reduced-motion / fallback state. */}
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: '16/9',
              borderRadius: 14,
              border: '1px solid rgba(139,94,60,0.2)',
              boxShadow: '0 20px 70px rgba(31,24,16,0.15), 0 4px 20px rgba(31,24,16,0.08)',
              // Warm dark backdrop until the poster/first frame paints.
              background: 'linear-gradient(135deg, #2D3A1F 0%, #1F1810 45%, #2A2218 100%)',
            }}
          >
            <video
              ref={videoElRef}
              className="absolute inset-0 h-full w-full object-cover"
              src="/stock/craft-loop.mp4"
              poster="/stock/craft-loop-poster.webp"
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
              tabIndex={-1}
            />

            {/* bottom caption bar */}
            <div
              className="absolute bottom-0 inset-x-0 flex items-end"
              style={{
                padding: '40px 24px 20px',
                background: 'linear-gradient(180deg, transparent 0%, rgba(31,24,16,0.65) 100%)',
              }}
            >
              <p
                className="font-lora"
                style={{
                  fontSize: '0.85rem',
                  color: 'rgba(245,235,216,0.45)',
                  fontStyle: 'italic',
                }}
              >
                {language === 'ro'
                  ? '"Din rădăcină până în bucătăria ta."'
                  : '"From root to your kitchen."'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
