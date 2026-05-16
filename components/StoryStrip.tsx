'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/* ─── SVG ornaments ─────────────────────────────────────────────── */

function OakLeafSVG({ drawn }: { drawn: boolean }) {
  return (
    <svg
      viewBox="0 0 120 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-24 h-24 mx-auto"
    >
      <path
        d="M60 125 C60 100 58 80 60 60"
        stroke="var(--oak-warm)"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          strokeDasharray: 80,
          strokeDashoffset: drawn ? 0 : 80,
          transition: 'stroke-dashoffset 0.8s ease-in-out 0.0s',
        }}
      />
      <path
        d="M60 60 C55 52 42 48 36 38 C30 28 32 14 40 10 C48 6 55 12 60 20 C65 12 72 6 80 10 C88 14 90 28 84 38 C78 48 65 52 60 60Z"
        stroke="var(--forest-mid)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
        style={{
          strokeDasharray: 260,
          strokeDashoffset: drawn ? 0 : 260,
          transition: 'stroke-dashoffset 1.0s ease-in-out 0.15s',
        }}
      />
      <path
        d="M60 58 L60 20"
        stroke="var(--forest-mid)"
        strokeWidth="1.2"
        strokeLinecap="round"
        style={{
          strokeDasharray: 40,
          strokeDashoffset: drawn ? 0 : 40,
          transition: 'stroke-dashoffset 0.6s ease-in-out 0.35s',
        }}
      />
      <path
        d="M60 50 C55 46 48 44 44 40"
        stroke="var(--forest-mid)"
        strokeWidth="1"
        strokeLinecap="round"
        style={{
          strokeDasharray: 30,
          strokeDashoffset: drawn ? 0 : 30,
          transition: 'stroke-dashoffset 0.5s ease-in-out 0.45s',
        }}
      />
      <path
        d="M60 40 C55 36 48 34 43 30"
        stroke="var(--forest-mid)"
        strokeWidth="1"
        strokeLinecap="round"
        style={{
          strokeDasharray: 30,
          strokeDashoffset: drawn ? 0 : 30,
          transition: 'stroke-dashoffset 0.5s ease-in-out 0.52s',
        }}
      />
      <path
        d="M60 50 C65 46 72 44 76 40"
        stroke="var(--forest-mid)"
        strokeWidth="1"
        strokeLinecap="round"
        style={{
          strokeDasharray: 30,
          strokeDashoffset: drawn ? 0 : 30,
          transition: 'stroke-dashoffset 0.5s ease-in-out 0.45s',
        }}
      />
      <path
        d="M60 40 C65 36 72 34 77 30"
        stroke="var(--forest-mid)"
        strokeWidth="1"
        strokeLinecap="round"
        style={{
          strokeDasharray: 30,
          strokeDashoffset: drawn ? 0 : 30,
          transition: 'stroke-dashoffset 0.5s ease-in-out 0.52s',
        }}
      />
      <ellipse
        cx="60"
        cy="124"
        rx="5"
        ry="4"
        stroke="var(--oak-warm)"
        strokeWidth="1.5"
        fill="none"
        style={{
          strokeDasharray: 32,
          strokeDashoffset: drawn ? 0 : 32,
          transition: 'stroke-dashoffset 0.5s ease-in-out 0.6s',
        }}
      />
      <path
        d="M55 124 Q60 120 65 124"
        stroke="var(--oak-warm)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        style={{
          strokeDasharray: 20,
          strokeDashoffset: drawn ? 0 : 20,
          transition: 'stroke-dashoffset 0.4s ease-in-out 0.72s',
        }}
      />
    </svg>
  );
}

function CuttingBoardSVG({ drawn }: { drawn: boolean }) {
  return (
    <svg
      viewBox="0 0 140 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-24 h-24 mx-auto"
    >
      <rect
        x="10"
        y="22"
        width="90"
        height="70"
        rx="8"
        stroke="var(--oak-warm)"
        strokeWidth="2"
        style={{
          strokeDasharray: 340,
          strokeDashoffset: drawn ? 0 : 340,
          transition: 'stroke-dashoffset 1.0s ease-in-out 0.0s',
        }}
      />
      <rect
        x="88"
        y="42"
        width="36"
        height="28"
        rx="7"
        stroke="var(--oak-deep)"
        strokeWidth="1.8"
        style={{
          strokeDasharray: 132,
          strokeDashoffset: drawn ? 0 : 132,
          transition: 'stroke-dashoffset 0.7s ease-in-out 0.3s',
        }}
      />
      <circle
        cx="106"
        cy="56"
        r="4.5"
        stroke="var(--oak-deep)"
        strokeWidth="1.5"
        style={{
          strokeDasharray: 30,
          strokeDashoffset: drawn ? 0 : 30,
          transition: 'stroke-dashoffset 0.4s ease-in-out 0.5s',
        }}
      />
      <path
        d="M20 40 Q55 37 80 40"
        stroke="var(--copper)"
        strokeWidth="1"
        strokeLinecap="round"
        style={{
          strokeDasharray: 65,
          strokeDashoffset: drawn ? 0 : 65,
          transition: 'stroke-dashoffset 0.5s ease-in-out 0.55s',
        }}
      />
      <path
        d="M20 52 Q55 49 82 52"
        stroke="var(--copper)"
        strokeWidth="1"
        strokeLinecap="round"
        style={{
          strokeDasharray: 67,
          strokeDashoffset: drawn ? 0 : 67,
          transition: 'stroke-dashoffset 0.5s ease-in-out 0.63s',
        }}
      />
      <path
        d="M20 64 Q55 61 82 64"
        stroke="var(--copper)"
        strokeWidth="1"
        strokeLinecap="round"
        style={{
          strokeDasharray: 67,
          strokeDashoffset: drawn ? 0 : 67,
          transition: 'stroke-dashoffset 0.5s ease-in-out 0.71s',
        }}
      />
      <path
        d="M20 76 Q55 73 80 76"
        stroke="var(--copper)"
        strokeWidth="1"
        strokeLinecap="round"
        style={{
          strokeDasharray: 65,
          strokeDashoffset: drawn ? 0 : 65,
          transition: 'stroke-dashoffset 0.5s ease-in-out 0.79s',
        }}
      />
    </svg>
  );
}

function HeartLeavesSVG({ drawn }: { drawn: boolean }) {
  return (
    <svg
      viewBox="0 0 120 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-24 h-24 mx-auto"
    >
      <path
        d="M60 105 C40 88 14 74 14 50 C14 34 27 24 40 24 C50 24 57 30 60 37 C63 30 70 24 80 24 C93 24 106 34 106 50 C106 74 80 88 60 105Z"
        stroke="var(--oak-warm)"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
        style={{
          strokeDasharray: 330,
          strokeDashoffset: drawn ? 0 : 330,
          transition: 'stroke-dashoffset 1.1s ease-in-out 0.0s',
        }}
      />
      <path
        d="M24 38 C17 29 18 16 26 14 C34 12 38 25 32 34 C27 41 20 43 24 38Z"
        stroke="var(--forest-mid)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
        style={{
          strokeDasharray: 85,
          strokeDashoffset: drawn ? 0 : 85,
          transition: 'stroke-dashoffset 0.6s ease-in-out 0.3s',
        }}
      />
      <path
        d="M24 38 L26 14"
        stroke="var(--forest-mid)"
        strokeWidth="0.9"
        strokeLinecap="round"
        style={{
          strokeDasharray: 26,
          strokeDashoffset: drawn ? 0 : 26,
          transition: 'stroke-dashoffset 0.4s ease-in-out 0.52s',
        }}
      />
      <path
        d="M96 38 C103 29 102 16 94 14 C86 12 82 25 88 34 C93 41 100 43 96 38Z"
        stroke="var(--forest-mid)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
        style={{
          strokeDasharray: 85,
          strokeDashoffset: drawn ? 0 : 85,
          transition: 'stroke-dashoffset 0.6s ease-in-out 0.35s',
        }}
      />
      <path
        d="M96 38 L94 14"
        stroke="var(--forest-mid)"
        strokeWidth="0.9"
        strokeLinecap="round"
        style={{
          strokeDasharray: 26,
          strokeDashoffset: drawn ? 0 : 26,
          transition: 'stroke-dashoffset 0.4s ease-in-out 0.55s',
        }}
      />
      <path
        d="M50 24 C52 15 56 9 60 7 C64 9 68 15 70 24"
        stroke="var(--forest-mid)"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
        style={{
          strokeDasharray: 44,
          strokeDashoffset: drawn ? 0 : 44,
          transition: 'stroke-dashoffset 0.5s ease-in-out 0.62s',
        }}
      />
      <circle
        cx="60"
        cy="6"
        r="3.5"
        stroke="var(--copper)"
        strokeWidth="1.4"
        fill="none"
        style={{
          strokeDasharray: 24,
          strokeDashoffset: drawn ? 0 : 24,
          transition: 'stroke-dashoffset 0.35s ease-in-out 0.75s',
        }}
      />
    </svg>
  );
}

/* ─── Column data ───────────────────────────────────────────────── */

interface Column {
  Ornament: React.ComponentType<{ drawn: boolean }>;
  titleRo: string;
  titleEn: string;
  bodyRo: string;
  bodyEn: string;
  labelRo: string;
  labelEn: string;
}

const columns: Column[] = [
  {
    Ornament: OakLeafSVG,
    labelRo: 'Origine',
    labelEn: 'Origin',
    titleRo: 'Stejar din Carpați',
    titleEn: 'Carpathian Oak',
    bodyRo:
      'Fiecare bucată de lemn vine din păduri certificate din munții Bucegi și Apuseni — crăci doborâte natural, uscate lent, respectate din rădăcină până în fibră.',
    bodyEn:
      'Every plank comes from certified forests in the Bucegi and Apuseni mountains — naturally felled, slow-dried, honoured from root to grain.',
  },
  {
    Ornament: CuttingBoardSVG,
    labelRo: 'Meșteșug',
    labelEn: 'Craft',
    titleRo: 'Lucrat manual',
    titleEn: 'Made by hand',
    bodyRo:
      'Atelierul nostru din inima Transilvaniei cioplește, șlefuiește și finisează fiecare tocător cu mâinile — fără linii de producție, fără grabă, fără compromis.',
    bodyEn:
      'Our workshop in the heart of Transylvania shapes, sands and finishes every board by hand — no production lines, no rush, no compromise.',
  },
  {
    Ornament: HeartLeavesSVG,
    labelRo: 'Suflet',
    labelEn: 'Soul',
    titleRo: 'Făcut cu drag',
    titleEn: 'Made with love',
    bodyRo:
      'Nu vindem produse. Trimitem în casele voastre un obiect care va fi moștenit — pentru că un tocător bun se încarcă de povești cu fiecare tăietură.',
    bodyEn:
      "We don't sell products. We send into your homes an object meant to be inherited — because a good board fills with stories with every cut.",
  },
];

/* ─── Single column card ─────────────────────────────────────────── */

function StoryCard({
  col,
  language,
  index,
}: {
  col: Column;
  language: 'ro' | 'en';
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.72,
        delay: index * 0.14,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="flex flex-col items-center text-center px-6 py-10 md:py-12"
    >
      <div className="mb-7">
        <col.Ornament drawn={drawn} />
      </div>

      <span
        className="label-caps mb-3 block"
        style={{ color: 'var(--copper)' }}
      >
        {language === 'ro' ? col.labelRo : col.labelEn}
      </span>

      <h3
        className="font-caudex mb-4"
        style={{
          fontSize: '1.3rem',
          fontWeight: 700,
          color: 'var(--ink)',
          lineHeight: 1.25,
        }}
      >
        {language === 'ro' ? col.titleRo : col.titleEn}
      </h3>

      <div
        className="mb-5"
        style={{
          width: 36,
          height: 1,
          backgroundColor: 'var(--oak-warm)',
          opacity: 0.45,
        }}
      />

      <p
        className="font-lora"
        style={{
          fontSize: '1rem',
          lineHeight: 1.78,
          color: 'var(--ink-soft)',
          maxWidth: 270,
        }}
      >
        {language === 'ro' ? col.bodyRo : col.bodyEn}
      </p>
    </motion.div>
  );
}

/* ─── Section ────────────────────────────────────────────────────── */

export default function StoryStrip({ language }: { language: 'ro' | 'en' }) {
  return (
    <section
      className="paper-texture relative overflow-hidden"
      style={{ backgroundColor: 'var(--paper-aged)' }}
      aria-label={language === 'ro' ? 'Povestea noastră' : 'Our story'}
    >
      {/* top rule */}
      <div
        style={{
          height: 1,
          background:
            'linear-gradient(90deg, transparent, var(--oak-warm) 25%, var(--oak-warm) 75%, transparent)',
          opacity: 0.3,
        }}
      />

      <div
        className="mx-auto"
        style={{ maxWidth: 1100, padding: '100px 24px 110px' }}
      >
        {/* eyebrow */}
        <motion.p
          className="label-caps text-center mb-14 block"
          style={{ color: 'var(--forest-mid)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {language === 'ro' ? 'Atelierul nostru' : 'Our workshop'}
        </motion.p>

        {/* columns */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {columns.map((col, i) => (
            <div key={col.labelRo} className="relative">
              {/* vertical divider between columns — desktop only */}
              {i < columns.length - 1 && (
                <div
                  className="hidden md:block absolute top-10 bottom-10 right-0 pointer-events-none"
                  style={{
                    width: 1,
                    background:
                      'linear-gradient(180deg, transparent, var(--oak-warm) 20%, var(--oak-warm) 80%, transparent)',
                    opacity: 0.22,
                  }}
                />
              )}
              {/* horizontal divider between rows — mobile only */}
              {i > 0 && (
                <div
                  className="block md:hidden mx-auto mb-2"
                  style={{
                    width: 48,
                    height: 1,
                    backgroundColor: 'var(--oak-warm)',
                    opacity: 0.3,
                  }}
                />
              )}
              <StoryCard col={col} language={language} index={i} />
            </div>
          ))}
        </div>
      </div>

      {/* bottom rule */}
      <div
        style={{
          height: 1,
          background:
            'linear-gradient(90deg, transparent, var(--oak-warm) 25%, var(--oak-warm) 75%, transparent)',
          opacity: 0.3,
        }}
      />
    </section>
  );
}
