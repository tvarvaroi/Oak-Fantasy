'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import EmailForm from './EmailForm';

const CuttingBoard3D = dynamic(() => import('./CuttingBoard3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div style={{ width: 160, height: 230, backgroundColor: 'var(--oak-warm)', borderRadius: 12, opacity: 0.35 }} />
    </div>
  ),
});

// ── SVG Decoratives ──────────────────────────────────────────────────────────
function TwigSVG() {
  return (
    <svg width="120" height="28" viewBox="0 0 120 28" fill="none" aria-hidden>
      <path
        d="M4 18 C12 10, 30 8, 50 14 C70 20, 88 12, 116 6"
        stroke="var(--oak-warm)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        className="svg-draw"
        style={{ strokeDasharray: 200, strokeDashoffset: 200 }}
      />
      <path
        d="M38 14 C36 8, 32 4, 28 2"
        stroke="var(--oak-warm)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        style={{ strokeDasharray: 50, strokeDashoffset: 50 }}
      />
      <path
        d="M62 16 C60 10, 68 5, 72 3"
        stroke="var(--oak-warm)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        style={{ strokeDasharray: 50, strokeDashoffset: 50 }}
      />
      <path
        d="M88 12 C90 6, 96 3, 100 4"
        stroke="var(--oak-warm)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        style={{ strokeDasharray: 50, strokeDashoffset: 50 }}
      />
    </svg>
  );
}

function OakLeafSVG() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 44 C24 44 8 32 8 20 C8 12 14 6 24 6 C34 6 40 12 40 20 C40 32 24 44 24 44Z"
        stroke="var(--forest-mid)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDasharray: 150, strokeDashoffset: 150 }}
      />
      <path
        d="M24 44 L24 10"
        stroke="var(--forest-mid)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        style={{ strokeDasharray: 40, strokeDashoffset: 40 }}
      />
      <path
        d="M24 32 L16 22 M24 26 L32 18 M24 20 L18 14"
        stroke="var(--forest-mid)"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        style={{ strokeDasharray: 80, strokeDashoffset: 80 }}
      />
    </svg>
  );
}

// ── Animated word reveal ─────────────────────────────────────────────────────
function AnimatedHeadline({ language }: { language: 'ro' | 'en' }) {
  const prefersReducedMotion = useReducedMotion();

  const line1 = language === 'ro' ? 'Tocătoare lucrate' : 'Cutting boards made';
  const line2parts = language === 'ro'
    ? ['cu ', 'mâinile', ' noastre.']
    : ['by ', 'our hands', '.'];

  const words1 = line1.split(' ');

  const wordVariants = {
    hidden: { opacity: 0, y: 18, rotate: -2 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        delay: prefersReducedMotion ? 0 : 0.6 + i * 0.08,
        duration: prefersReducedMotion ? 0.01 : 0.7,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <h1
      className="hero-headline font-caudex leading-tight"
      style={{
        fontFamily: 'var(--font-caudex)',
        fontSize: 'clamp(2.4rem, 5.5vw, 5.2rem)',
        color: 'var(--ink)',
        lineHeight: 1.1,
        letterSpacing: '-0.01em',
      }}
    >
      <span className="block">
        {words1.map((word, i) => (
          <motion.span
            key={i}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={wordVariants}
            className="inline-block mr-[0.25em]"
          >
            {word}
          </motion.span>
        ))}
      </span>
      <span className="block" style={{ paddingLeft: 'clamp(1rem, 3vw, 3rem)' }}>
        <motion.span
          custom={words1.length}
          initial="hidden"
          animate="visible"
          variants={wordVariants}
          className="inline"
        >
          {line2parts[0]}
        </motion.span>
        <motion.span
          custom={words1.length + 1}
          initial="hidden"
          animate="visible"
          variants={wordVariants}
          className="inline-block handwritten"
          style={{
            fontFamily: 'var(--font-caveat)',
            color: 'var(--oak-warm)',
            fontSize: '1.12em',
            display: 'inline-block',
            transform: 'rotate(-1deg)',
          }}
        >
          {line2parts[1]}
        </motion.span>
        <motion.span
          custom={words1.length + 2}
          initial="hidden"
          animate="visible"
          variants={wordVariants}
          className="inline"
        >
          {line2parts[2]}
        </motion.span>
      </span>
    </h1>
  );
}

// ── Background leaves decoration ─────────────────────────────────────────────
function BackgroundLeaves() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <svg
        className="absolute top-16 right-8 opacity-10"
        width="180"
        height="160"
        viewBox="0 0 180 160"
        fill="none"
      >
        <path
          d="M90 140 C90 140 20 100 20 60 C20 30 50 10 90 10 C130 10 160 30 160 60 C160 100 90 140 90 140Z"
          fill="var(--forest-mid)"
        />
      </svg>
      <svg
        className="absolute bottom-32 right-16 opacity-8"
        width="120"
        height="110"
        viewBox="0 0 120 110"
        fill="none"
      >
        <path
          d="M60 100 C60 100 10 70 10 40 C10 18 30 4 60 4 C90 4 110 18 110 40 C110 70 60 100 60 100Z"
          fill="var(--moss)"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}


// ── Main Hero ────────────────────────────────────────────────────────────────
interface HeroProps {
  language: 'ro' | 'en';
}

export default function Hero({ language }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);

  const copy = {
    eyebrow: 'STEJAR ROMÂNESC · LUCRAT MANUAL · EST. 2026',
    eyebrow_en: 'ROMANIAN OAK · HANDCRAFTED · EST. 2026',
    subhead: language === 'ro'
      ? 'Din lemn de stejar românesc, tăiat și finisat unul câte unul în atelierul nostru. Genul de obiect din bucătărie care nu se aruncă — se moștenește.'
      : 'From Romanian oak, cut and finished one by one in our workshop. The kind of kitchen object that isn\'t thrown away — it\'s inherited.',
    label: language === 'ro'
      ? 'Lansăm în octombrie. Înscrie-te și primești 15% reducere + ghidul de îngrijire.'
      : 'Launching in October. Sign up and get 15% off + the care guide.',
    social: language === 'ro'
      ? 'Deja 1,200+ pe listă · Nu trimitem spam, doar lucruri faine.'
      : 'Already 1,200+ on the list · No spam, just good things.',
    tagline: 'Făcut cu drag în România.',
    tagline_en: 'Made with love in Romania.',
  };

  // Animate SVG paths on mount
  useEffect(() => {
    if (prefersReducedMotion) return;
    const paths = document.querySelectorAll('.hero-twig path');
    paths.forEach((path, i) => {
      const el = path as SVGPathElement;
      const len = el.getTotalLength ? el.getTotalLength() : 200;
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
      el.style.transition = `stroke-dashoffset 0.8s ease-in-out ${0.2 + i * 0.1}s`;
      requestAnimationFrame(() => {
        el.style.strokeDashoffset = '0';
      });
    });
  }, [prefersReducedMotion]);

  const fadeUp = (delay: number) => ({
    initial: prefersReducedMotion ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] },
  });

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center paper-texture overflow-hidden"
      style={{ backgroundColor: 'var(--cream-warm)', paddingTop: '100px' }}
    >
      <BackgroundLeaves />

      {/* Large decorative logo — top-left, fills space between navbar and hero content */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '4px',
          left: 'clamp(16px, 3vw, 48px)',
          width: 'clamp(160px, 22vw, 320px)',
          height: 'clamp(160px, 22vw, 320px)',
          zIndex: 1,
          opacity: 0.12,
        }}
        aria-hidden
      >
        <Image
          src="/3D_Cutting_Board_Model_Design.svg"
          alt=""
          fill
          style={{
            objectFit: 'contain',
            filter: 'brightness(0) saturate(100%) sepia(30%) hue-rotate(10deg) brightness(0.35)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 lg:gap-6 items-center min-h-[80vh]">

          {/* ── LEFT: Text ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-6 lg:gap-7 max-w-2xl">

            {/* Twig + Eyebrow */}
            <div className="flex flex-col gap-3">
              <div className="hero-twig">
                <TwigSVG />
              </div>
              <motion.p
                {...fadeUp(0.4)}
                className="label-caps"
                style={{
                  color: 'var(--oak-warm)',
                  fontFamily: 'var(--font-caudex)',
                  letterSpacing: '0.18em',
                  fontSize: '0.72rem',
                }}
              >
                {language === 'ro' ? copy.eyebrow : copy.eyebrow_en}
              </motion.p>
            </div>

            {/* Headline */}
            <AnimatedHeadline language={language} />

            {/* Subhead */}
            <motion.p
              {...fadeUp(1.0)}
              className="font-lora leading-relaxed"
              style={{
                fontFamily: 'var(--font-lora)',
                fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                color: 'var(--ink-soft)',
                lineHeight: 1.7,
                maxWidth: '480px',
              }}
            >
              {copy.subhead}
            </motion.p>

            {/* Email form */}
            <motion.div {...fadeUp(1.2)} className="flex flex-col gap-2 max-w-lg">
              <p
                className="font-lora text-sm"
                style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-lora)' }}
              >
                {copy.label}
              </p>
              <EmailForm source="hero" language={language} />
              <p
                className="font-lora text-xs mt-1"
                style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-lora)', opacity: 0.75 }}
              >
                {copy.social}
              </p>
            </motion.div>
          </div>

          {/* ── RIGHT: 3D Board ──────────────────────────────────────── */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.9,
              delay: 1.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex flex-col items-center"
            style={{ height: 'clamp(400px, 55vw, 600px)' }}
          >
            {/* Subtle green leaf blur behind board */}
            <div
              className="absolute inset-0 rounded-2xl opacity-[0.06] pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 60% 40%, var(--forest-mid) 0%, transparent 70%)',
              }}
            />

            {/* 3D Canvas */}
            <div className="w-full h-full">
              <CuttingBoard3D />
            </div>

            {/* Tagline below board */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <OakLeafSVG />
              <motion.p
                {...fadeUp(1.8)}
                style={{
                  fontFamily: 'var(--font-caudex)',
                  fontStyle: 'italic',
                  fontSize: '0.92rem',
                  color: 'var(--ink-soft)',
                  letterSpacing: '0.02em',
                  textAlign: 'center',
                }}
              >
                {language === 'ro' ? copy.tagline : copy.tagline_en}
              </motion.p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: 'var(--ink-soft)' }}
        aria-hidden
      >
        <span
          className="label-caps"
          style={{ fontSize: '0.6rem', letterSpacing: '0.2em', opacity: 0.6, fontFamily: 'var(--font-caudex)' }}
        >
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="var(--oak-warm)" strokeWidth="1.5" opacity="0.5" />
            <rect x="7" y="5" width="2" height="5" rx="1" fill="var(--oak-warm)" opacity="0.8" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
