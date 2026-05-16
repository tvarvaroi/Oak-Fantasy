'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

/* ─── "— familia noastră" SVG signature ───────────────────────────
   The text is rendered as a single SVG path so we can drive
   stroke-dashoffset to simulate a pen writing it. The path was
   hand-tuned to match Caveat-style cursive letterforms.
──────────────────────────────────────────────────────────────── */
function SignatureSVG({ signing }: { signing: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setLength(pathRef.current.getTotalLength());
    }
  }, []);

  /* cursive path for "— familia noastră" hand-drawn style */
  const d = [
    /* em-dash */
    'M 4 38 L 28 38',
    /* f */
    'M 38 26 C 36 22 34 20 34 26 L 34 50 M 30 34 L 42 34',
    /* a */
    'M 52 44 C 52 36 44 34 44 40 C 44 46 50 48 52 46 L 52 50',
    /* m */
    'M 56 44 L 56 34 C 60 30 66 32 66 38 L 66 44 C 70 30 76 32 76 38 L 76 44',
    /* i */
    'M 80 44 L 80 34 M 80 28 L 80 27',
    /* l */
    'M 86 44 L 86 22',
    /* i */
    'M 92 44 L 92 34 M 92 28 L 92 27',
    /* a */
    'M 104 44 C 104 36 96 34 96 40 C 96 46 102 48 104 46 L 104 50',
    /* space */
    /* n */
    'M 112 44 L 112 34 C 116 30 124 32 124 38 L 124 44',
    /* o */
    'M 136 40 C 136 34 128 34 128 40 C 128 46 136 46 136 40',
    /* a */
    'M 148 44 C 148 36 140 34 140 40 C 140 46 146 48 148 46 L 148 50',
    /* s */
    'M 158 36 C 154 32 150 36 154 40 C 158 44 154 48 150 46',
    /* t */
    'M 162 44 L 162 26 M 158 34 L 168 34',
    /* r */
    'M 172 44 L 172 34 C 174 30 180 30 180 34',
    /* ă */
    'M 192 44 C 192 36 184 34 184 40 C 184 46 190 48 192 46 L 192 50 M 186 28 C 186 24 192 24 192 28',
  ].join(' ');

  const dashVal = length > 0 ? (signing ? 0 : length) : length;

  return (
    <svg
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      style={{ maxWidth: 320 }}
      aria-label="familia noastră"
    >
      <path
        ref={pathRef}
        d={d}
        stroke="var(--oak-warm)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{
          strokeDasharray: length > 0 ? length : undefined,
          strokeDashoffset: length > 0 ? dashVal : undefined,
          transition: length > 0 && signing
            ? 'stroke-dashoffset 2.4s cubic-bezier(0.4, 0, 0.2, 1) 0.3s'
            : 'none',
        }}
      />
    </svg>
  );
}

/* ─── Single animated line ───────────────────────────────────────── */
function RevealLine({
  line,
  scrollYProgress,
  lineStart,
  lineEnd,
}: {
  line: string;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  lineStart: number;
  lineEnd: number;
}) {
  const prefersReduced = useReducedMotion();
  const opacity = useTransform(scrollYProgress, [lineStart, lineEnd], [0, 1]);
  const y = useTransform(scrollYProgress, [lineStart, lineEnd], [18, 0]);
  return (
    <motion.span style={prefersReduced ? {} : { opacity, y, display: 'block' }}>
      {line}
    </motion.span>
  );
}

/* ─── Paragraph block with line-by-line scroll reveal ───────────── */
function RevealLines({
  lines,
  scrollYProgress,
  startAt,
  endAt,
}: {
  lines: string[];
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  startAt: number;
  endAt: number;
}) {
  const count = lines.length;
  return (
    <div className="flex flex-col" style={{ gap: '0.55em' }}>
      {lines.map((line, i) => {
        const lineStart = startAt + (i / count) * (endAt - startAt) * 0.7;
        const lineEnd = lineStart + (endAt - startAt) * 0.3;
        return (
          <RevealLine
            key={i}
            line={line}
            scrollYProgress={scrollYProgress}
            lineStart={lineStart}
            lineEnd={lineEnd}
          />
        );
      })}
    </div>
  );
}

/* ─── Main section ───────────────────────────────────────────────── */

const copy = {
  ro: {
    eyebrow: 'Atelierul',
    title: ['Un loc unde', 'lemnul capătă', 'suflet.'],
    body1: [
      'Intrați în atelierul nostru din inima Transilvaniei.',
      'Miros de rumeguș proaspăt, lumina de după-amiază filtrată',
      'prin geam, sunetul rindelei pe stejar — asta e Oak Fantasy',
      'înainte să fie un produs.',
    ],
    body2: [
      'Fiecare tocător trece prin aceleași mâini de la început',
      'până la capăt. Nu există operatorul numărul unu sau doi.',
      'Există muncitorul care știe că un tocător bun',
      'va sta pe masa cuiva zeci de ani.',
    ],
    quote:
      '"Un obiect bun nu se termină când iese din atelier — începe."',
    signature: '— familia noastră',
  },
  en: {
    eyebrow: 'The Workshop',
    title: ['A place where', 'wood gains', 'a soul.'],
    body1: [
      'Step into our workshop in the heart of Transylvania.',
      'Fresh sawdust scent, afternoon light filtered',
      'through the window, the sound of a plane on oak — this is Oak',
      'Fantasy before it becomes a product.',
    ],
    body2: [
      'Every cutting board passes through the same hands',
      'from start to finish. There is no operator one or two.',
      'There is the craftsman who knows a good board',
      'will sit on someone\'s table for decades.',
    ],
    quote:
      '"A good object doesn\'t end when it leaves the workshop — it begins."',
    signature: '— our family',
  },
};

export default function WorkshopSection({ language }: { language: 'ro' | 'en' }) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const sigRef = useRef<HTMLDivElement>(null);
  const [signing, setSigning] = useState(false);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  /* parallax: image moves up slowly as user scrolls down */
  const imageY = useTransform(scrollYProgress, [0, 1], ['4%', '-8%']);

  /* signature IntersectionObserver */
  useEffect(() => {
    const el = sigRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSigning(true);
          obs.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const c = copy[language];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ backgroundColor: 'var(--cream-warm)' }}
      aria-label={language === 'ro' ? 'Atelierul nostru' : 'Our workshop'}
    >
      {/* paper grain overlay */}
      <div className="paper-texture absolute inset-0 pointer-events-none" aria-hidden />

      <div
        className="mx-auto relative"
        style={{ maxWidth: 1200, padding: '110px 24px 120px' }}
      >
        {/* asymmetric 55/45 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-0 lg:gap-10 items-start">

          {/* ── LEFT: image ──────────────────────────────────────── */}
          <div
            ref={imageRef}
            className="relative overflow-hidden rounded-xl order-2 lg:order-1"
            style={{
              aspectRatio: '4/5',
              maxHeight: 640,
              boxShadow: '0 24px 80px rgba(31,24,16,0.18), 0 4px 16px rgba(31,24,16,0.10)',
            }}
          >
            <motion.div
              className="absolute inset-0"
              style={prefersReduced ? {} : { y: imageY }}
            >
              <Image
                src="/workshop.webp"
                alt={
                  language === 'ro'
                    ? 'Atelier Oak Fantasy — mâini lucrând stejar'
                    : 'Oak Fantasy workshop — hands working oak'
                }
                fill
                priority
                className="object-cover"
                style={{ objectPosition: 'center 30%' }}
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </motion.div>

            {/* subtle warm vignette */}
            <div
              className="absolute inset-0 pointer-events-none rounded-xl"
              style={{
                background:
                  'linear-gradient(180deg, transparent 55%, rgba(31,24,16,0.28) 100%)',
              }}
              aria-hidden
            />

            {/* floating label on image */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-6 left-6"
            >
              <span
                className="label-caps px-3 py-1.5 rounded"
                style={{
                  backgroundColor: 'rgba(245,235,216,0.92)',
                  color: 'var(--oak-deep)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(139,94,60,0.2)',
                }}
              >
                {language === 'ro' ? 'Transilvania · Atelier propriu' : 'Transylvania · Own workshop'}
              </span>
            </motion.div>
          </div>

          {/* ── RIGHT: text — starts 80px below image top ──────── */}
          <div
            className="flex flex-col order-1 lg:order-2"
            style={{ paddingTop: 'clamp(0px, 80px, 80px)' }}
          >
            {/* eyebrow */}
            <motion.p
              className="label-caps mb-5"
              style={{ color: 'var(--copper)' }}
              initial={prefersReduced ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {c.eyebrow}
            </motion.p>

            {/* title */}
            <div className="mb-8">
              {c.title.map((line, i) => (
                <motion.h2
                  key={i}
                  className="font-caudex block"
                  style={{
                    fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    lineHeight: 1.15,
                    letterSpacing: '-0.01em',
                  }}
                  initial={prefersReduced ? false : { opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.7,
                    delay: 0.1 + i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {line}
                </motion.h2>
              ))}
            </div>

            {/* divider */}
            <div
              className="mb-8"
              style={{
                width: 40,
                height: 1,
                backgroundColor: 'var(--oak-warm)',
                opacity: 0.4,
              }}
            />

            {/* body 1 — scroll-driven line reveal */}
            <div
              className="font-lora mb-6"
              style={{
                fontSize: '1.02rem',
                lineHeight: 1.78,
                color: 'var(--ink-soft)',
              }}
            >
              <RevealLines
                lines={c.body1}
                scrollYProgress={scrollYProgress}
                startAt={0.08}
                endAt={0.45}
              />
            </div>

            {/* body 2 */}
            <div
              className="font-lora mb-10"
              style={{
                fontSize: '1.02rem',
                lineHeight: 1.78,
                color: 'var(--ink-soft)',
              }}
            >
              <RevealLines
                lines={c.body2}
                scrollYProgress={scrollYProgress}
                startAt={0.28}
                endAt={0.6}
              />
            </div>

            {/* pull quote */}
            <motion.blockquote
              initial={prefersReduced ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative pl-5 mb-10"
              style={{
                borderLeft: '2px solid var(--oak-warm)',
              }}
            >
              <p
                className="font-lora"
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.65,
                  color: 'var(--ink)',
                  fontStyle: 'italic',
                }}
              >
                {c.quote}
              </p>
            </motion.blockquote>

            {/* signature */}
            <div ref={sigRef} className="flex flex-col gap-2" style={{ maxWidth: 280 }}>
              {/* handwritten Caveat text above SVG path */}
              <motion.p
                initial={prefersReduced ? false : { opacity: 0 }}
                animate={signing ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                  fontFamily: 'var(--font-caveat)',
                  fontSize: '1.55rem',
                  fontWeight: 600,
                  color: 'var(--oak-warm)',
                  lineHeight: 1,
                  transform: 'rotate(-1.5deg)',
                  transformOrigin: 'left center',
                  letterSpacing: '0.01em',
                }}
              >
                {c.signature}
              </motion.p>
              {/* animated underline drawn as SVG */}
              <svg
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
                style={{ maxWidth: 240 }}
                aria-hidden
              >
                <motion.path
                  d="M 4 6 C 40 2, 80 10, 120 5 C 160 1, 185 8, 196 6"
                  stroke="var(--copper)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={signing ? { pathLength: 1, opacity: 0.7 } : {}}
                  transition={{ duration: 1.2, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
