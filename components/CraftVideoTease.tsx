'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

/* ─── Ambient slideshow (2026-10-15, QA & Polish #6) ─────────────────
   Replaces the Pexels video loop: 5 stock stills from /public/stock/
   (same Pexels License, see docs/stock-credits.md) crossfading every
   SLIDE_MS with a FADE_S opacity transition. Reduced motion = the first
   photo, static. All frames are stacked in the DOM so the markup is
   identical on server and client; only the timer is client-side.
   `navigator.webdriver` (set by Playwright) also freezes the first frame
   so design-qa captures and visual-regression baselines are deterministic.
──────────────────────────────────────────────────────────────── */

type Slide = { src: string; altRo: string; altEn: string };

const SLIDES: Slide[] = [
  {
    src: '/stock/atelier-tool-planer.webp',
    altRo: 'Placă de lemn trecută printr-un rindeluitor electric, cu așchii',
    altEn: 'Wooden board passing through an electric planer, with shavings',
  },
  {
    src: '/stock/atelier-tool-clamps.webp',
    altRo: 'Prese cu șuruburi strângând plăci de lemn la lipire',
    altEn: 'Screw clamps holding glued wooden boards',
  },
  {
    src: '/stock/atelier-place-sawdust.webp',
    altRo: 'Rumeguș și unelte pe un banc de lucru din lemn',
    altEn: 'Sawdust and tools on a wooden workbench',
  },
  {
    src: '/stock/atelier-tool-hand-tools.webp',
    altRo: 'Dălți cu mânere de lemn pe un suport de perete',
    altEn: 'Wooden-handled chisels on a wall rack',
  },
  {
    src: '/stock/atelier-tool-sander.webp',
    altRo: 'Șlefuitor orbital pe o placă de stejar',
    altEn: 'Orbital sander on an oak board',
  },
];

const SLIDE_MS = 5000;
const FADE_S = 1;

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
  const frameRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState(0);
  const prefersReduced = useReducedMotion();

  // Ornaments draw once on first intersect; the slideshow only advances
  // while the frame is actually on screen (and the tab is visible).
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setDrawn(true);
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || prefersReduced) return;
    if (typeof navigator !== 'undefined' && navigator.webdriver) return; // deterministic captures
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setActive((i) => (i + 1) % SLIDES.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [inView, prefersReduced]);

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

        {/* slideshow container */}
        <motion.div
          ref={frameRef}
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

          {/* 16:9 ambient slideshow — stock stills (Pexels License, see
              docs/stock-credits.md). Neutral content on purpose: tools,
              shavings and a workbench, no people, no faces. */}
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: '16/9',
              borderRadius: 14,
              border: '1px solid rgba(139,94,60,0.2)',
              boxShadow: '0 20px 70px rgba(31,24,16,0.15), 0 4px 20px rgba(31,24,16,0.08)',
              // Warm dark backdrop until the first frame paints.
              background: 'linear-gradient(135deg, var(--forest-deep) 0%, var(--bark) 45%, var(--ink) 100%)',
            }}
            role="group"
            aria-roledescription={language === 'ro' ? 'galerie foto' : 'photo slideshow'}
            aria-label={language === 'ro' ? 'Imagini din atelier' : 'Workshop photos'}
          >
            {SLIDES.map((slide, i) => (
              <div
                key={slide.src}
                className="absolute inset-0"
                style={{
                  opacity: i === active ? 1 : 0,
                  transition: prefersReduced ? 'none' : `opacity ${FADE_S}s ease-in-out`,
                }}
                aria-hidden={i !== active}
              >
                <Image
                  src={slide.src}
                  alt={language === 'ro' ? slide.altRo : slide.altEn}
                  fill
                  sizes="(max-width: 1000px) 100vw, 960px"
                  quality={80}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}

            {/* warm scrim so the caption stays legible on light frames */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(31,24,16,0.12) 0%, rgba(31,24,16,0.05) 40%, rgba(31,24,16,0.35) 100%)' }}
              aria-hidden
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
