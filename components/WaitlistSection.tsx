'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import EmailForm from './EmailForm';

/* ─── Oak branch SVG — draws itself on scroll entry ─────────────
   A sinuous branch with three small leaf sprigs. All strokes are
   animated via stroke-dashoffset driven by IntersectionObserver.
──────────────────────────────────────────────────────────────── */

interface BranchProps {
  drawn: boolean;
}

function OakBranch({ drawn }: BranchProps) {
  /* Each segment gets its own dasharray / dashoffset + CSS transition
     with an increasing delay so it reads left → right */
  const seg = (dashLen: number, delay: number, width = 1.6) => ({
    strokeDasharray: dashLen,
    strokeDashoffset: drawn ? 0 : dashLen,
    transition: `stroke-dashoffset 0.85s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
    strokeWidth: width,
  });

  return (
    <svg
      viewBox="0 0 480 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ width: '100%', maxWidth: 480, overflow: 'visible' }}
    >
      {/* main branch */}
      <path
        d="M 10 72 C 60 65, 110 78, 160 68 C 210 58, 250 75, 300 65 C 350 55, 400 70, 470 62"
        stroke="var(--oak-warm)"
        strokeLinecap="round"
        fill="none"
        style={seg(620, 0, 2)}
      />

      {/* left sprig stem */}
      <path
        d="M 90 70 C 85 58, 78 48, 72 38"
        stroke="var(--oak-warm)"
        strokeLinecap="round"
        fill="none"
        style={seg(42, 0.3, 1.4)}
      />
      {/* left leaf A */}
      <path
        d="M 72 38 C 64 30, 58 34, 62 42 C 66 50, 74 48, 72 38 Z"
        stroke="var(--forest-mid)"
        strokeLinejoin="round"
        fill="none"
        style={seg(50, 0.48, 1.2)}
      />
      {/* left leaf B */}
      <path
        d="M 72 38 C 80 30, 86 34, 82 42 C 78 50, 70 48, 72 38 Z"
        stroke="var(--forest-mid)"
        strokeLinejoin="round"
        fill="none"
        style={seg(50, 0.56, 1.2)}
      />
      {/* left leaf vein */}
      <path
        d="M 72 38 L 73 46"
        stroke="var(--forest-mid)"
        strokeLinecap="round"
        fill="none"
        style={seg(10, 0.64, 0.8)}
      />

      {/* centre sprig stem */}
      <path
        d="M 230 66 C 226 50, 220 36, 214 22"
        stroke="var(--oak-warm)"
        strokeLinecap="round"
        fill="none"
        style={seg(58, 0.55, 1.4)}
      />
      {/* centre leaf A */}
      <path
        d="M 214 22 C 204 12, 196 18, 202 28 C 208 38, 218 36, 214 22 Z"
        stroke="var(--forest-mid)"
        strokeLinejoin="round"
        fill="none"
        style={seg(55, 0.72, 1.2)}
      />
      {/* centre leaf B */}
      <path
        d="M 214 22 C 224 12, 232 18, 226 28 C 220 38, 212 36, 214 22 Z"
        stroke="var(--forest-mid)"
        strokeLinejoin="round"
        fill="none"
        style={seg(55, 0.8, 1.2)}
      />
      {/* centre leaf vein */}
      <path
        d="M 214 22 L 215 32"
        stroke="var(--forest-mid)"
        strokeLinecap="round"
        fill="none"
        style={seg(12, 0.88, 0.8)}
      />

      {/* right sprig stem */}
      <path
        d="M 370 64 C 367 52, 362 42, 356 30"
        stroke="var(--oak-warm)"
        strokeLinecap="round"
        fill="none"
        style={seg(46, 0.7, 1.4)}
      />
      {/* right leaf A */}
      <path
        d="M 356 30 C 346 20, 340 26, 346 36 C 352 46, 360 44, 356 30 Z"
        stroke="var(--forest-mid)"
        strokeLinejoin="round"
        fill="none"
        style={seg(52, 0.88, 1.2)}
      />
      {/* right leaf B */}
      <path
        d="M 356 30 C 366 20, 372 26, 366 36 C 360 46, 354 44, 356 30 Z"
        stroke="var(--forest-mid)"
        strokeLinejoin="round"
        fill="none"
        style={seg(52, 0.96, 1.2)}
      />
      {/* right leaf vein */}
      <path
        d="M 356 30 L 357 40"
        stroke="var(--forest-mid)"
        strokeLinecap="round"
        fill="none"
        style={seg(12, 1.04, 0.8)}
      />

      {/* small acorn on branch — circle + cap */}
      <circle cx="300" cy="65" r="5" stroke="var(--copper)" strokeWidth="1.2" fill="none"
        style={seg(35, 0.85, 1.2)} />
      <path d="M 295 65 C 296 60, 304 60, 305 65" stroke="var(--copper)" strokeLinecap="round" fill="none"
        style={seg(14, 0.95, 1.2)} />
      <line x1="300" y1="60" x2="300" y2="56" stroke="var(--copper)" strokeLinecap="round"
        style={seg(6, 1.02, 1)} />
    </svg>
  );
}

/* ─── Section ────────────────────────────────────────────────────── */

export default function WaitlistSection({ language }: { language: 'ro' | 'en' }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [drawn, setDrawn] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const el = sectionRef.current;
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

  const copy = {
    ro: {
      eyebrow: 'Lista de așteptare',
      headline: 'Înscrie-te pe listă.',
      sub: 'Lansăm în octombrie. Primii pe listă primesc 15% reducere și ghidul nostru de îngrijire a lemnului — gratuit.',
      formLabel: 'Adresa ta de email',
      social: 'Alături de 1.200+ oameni care iubesc lucrurile făcute cu mâna.',
      privacy: 'Nu trimitem spam. Niciodată.',
    },
    en: {
      eyebrow: 'Waitlist',
      headline: 'Join the list.',
      sub: 'Launching in October. First on the list get 15% off and our wood care guide — free.',
      formLabel: 'Your email address',
      social: 'Joined by 1,200+ people who love handmade things.',
      privacy: "We don't send spam. Ever.",
    },
  }[language];

  return (
    <section
      ref={sectionRef}
      id="waitlist"
      className="relative overflow-hidden"
      style={{ backgroundColor: 'var(--paper-aged)' }}
      aria-label={language === 'ro' ? 'Lista de așteptare' : 'Waitlist'}
    >
      <div className="paper-texture absolute inset-0 pointer-events-none" aria-hidden />

      {/* top border */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,94,60,0.3) 30%, rgba(139,94,60,0.3) 70%, transparent)' }} aria-hidden />

      <div
        className="mx-auto flex flex-col items-center text-center"
        style={{ maxWidth: 680, padding: '100px 24px 110px' }}
      >
        {/* eyebrow */}
        <motion.p
          className="label-caps mb-6"
          style={{ color: 'var(--copper)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {copy.eyebrow}
        </motion.p>

        {/* oak branch ornament */}
        <motion.div
          className="mb-8 w-full"
          initial={prefersReduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <OakBranch drawn={drawn} />
        </motion.div>

        {/* headline — big Caudex italic */}
        <motion.h2
          className="font-caudex mb-6"
          style={{
            fontSize: 'clamp(2.6rem, 6.5vw, 5rem)',
            fontWeight: 700,
            fontStyle: 'italic',
            color: 'var(--ink)',
            lineHeight: 1.08,
            letterSpacing: '-0.015em',
          }}
          initial={prefersReduced ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {copy.headline}
        </motion.h2>

        {/* subhead */}
        <motion.p
          className="font-lora mb-10"
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.76,
            color: 'var(--ink-soft)',
            maxWidth: 480,
          }}
          initial={prefersReduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {copy.sub}
        </motion.p>

        {/* form — large variant */}
        <motion.div
          className="w-full max-w-lg"
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className="font-lora text-sm mb-2.5 text-left"
            style={{ color: 'var(--ink-soft)' }}
          >
            {copy.formLabel}
          </p>
          <EmailForm source="waitlist" language={language} large />
        </motion.div>

        {/* social proof + privacy */}
        <motion.div
          className="flex flex-col items-center gap-2 mt-7"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* small avatars strip placeholder */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2" aria-hidden>
              {[
                ['#8B5E3C', '#C9A66B'],
                ['#5A6B3C', '#8FA068'],
                ['#5C3A20', '#B87333'],
                ['#2D3A1F', '#5A6B3C'],
              ].map(([bg, border], i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: 28,
                    height: 28,
                    backgroundColor: bg,
                    border: `2px solid ${border}`,
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
            <p
              className="font-lora text-sm"
              style={{ color: 'var(--ink-soft)' }}
            >
              {copy.social}
            </p>
          </div>
          <p
            className="font-lora text-xs"
            style={{ color: 'var(--ink-soft)', opacity: 0.55 }}
          >
            {copy.privacy}
          </p>
        </motion.div>
      </div>

      {/* bottom border */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,94,60,0.3) 30%, rgba(139,94,60,0.3) 70%, transparent)' }} aria-hidden />
    </section>
  );
}
