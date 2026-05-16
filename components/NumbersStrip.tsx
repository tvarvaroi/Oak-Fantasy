'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion, animate } from 'framer-motion';

/* ─── Stat data ──────────────────────────────────────────────────── */

interface Stat {
  /* the numeric portion that counts up */
  from: number;
  to: number;
  /* suffix appended after the number */
  suffix: string;
  /* prefix before the number (empty for most) */
  prefix: string;
  labelRo: string;
  labelEn: string;
  captionRo: string;
  captionEn: string;
}

const stats: Stat[] = [
  {
    from: 0,
    to: 1200,
    suffix: '+',
    prefix: '',
    labelRo: 'pe listă',
    labelEn: 'on the list',
    captionRo: 'Persoane care aşteaptă',
    captionEn: 'People waiting',
  },
  {
    from: 0,
    to: 100,
    suffix: '%',
    prefix: '',
    labelRo: 'stejar românesc',
    labelEn: 'Romanian oak',
    captionRo: 'Material provenit local',
    captionEn: 'Locally sourced material',
  },
  {
    from: 0,
    to: 8,
    suffix: 'h',
    prefix: '',
    labelRo: 'per tocător',
    labelEn: 'per board',
    captionRo: 'Ore de lucru manual',
    captionEn: 'Hours of handwork',
  },
  {
    from: 0,
    to: 20,
    suffix: '+ ani',
    prefix: '',
    labelRo: 'de meşteşug',
    labelEn: 'of craft',
    captionRo: 'Experienţă în atelier',
    captionEn: 'Workshop experience',
  },
];

/* ─── Single animated counter ───────────────────────────────────── */

function Counter({
  stat,
  play,
  index,
}: {
  stat: Stat;
  play: boolean;
  index: number;
}) {
  const prefersReduced = useReducedMotion();
  const [display, setDisplay] = useState(stat.from);
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (!play || hasPlayed.current) return;
    hasPlayed.current = true;

    if (prefersReduced) {
      setDisplay(stat.to);
      return;
    }

    const controls = animate(stat.from, stat.to, {
      duration: 1.4,
      delay: index * 0.12,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        setDisplay(Math.round(v));
      },
    });

    return () => controls.stop();
  }, [play, prefersReduced, stat.from, stat.to, index]);

  /* format thousands with comma */
  const formatted =
    stat.to >= 1000
      ? display.toLocaleString('ro-RO')
      : String(display);

  return (
    <div
      className="font-caudex tabular-nums"
      style={{
        fontSize: 'clamp(2.8rem, 5.5vw, 5rem)',
        fontWeight: 700,
        color: 'var(--cream-warm)',
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}
    >
      {stat.prefix}
      {formatted}
      <span style={{ color: 'var(--copper)' }}>{stat.suffix}</span>
    </div>
  );
}

/* ─── Thin decorative divider SVG ────────────────────────────────── */
function VerticalDivider() {
  return (
    <div
      className="hidden lg:block self-stretch"
      style={{
        width: 1,
        background:
          'linear-gradient(180deg, transparent, rgba(184,115,51,0.3) 30%, rgba(184,115,51,0.3) 70%, transparent)',
      }}
      aria-hidden
    />
  );
}

/* ─── Section ────────────────────────────────────────────────────── */

export default function NumbersStrip({ language }: { language: 'ro' | 'en' }) {
  const ref = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ backgroundColor: 'var(--forest-deep)' }}
      aria-label={language === 'ro' ? 'Cifre' : 'Numbers'}
    >
      {/* subtle paper grain */}
      <div className="paper-texture absolute inset-0 pointer-events-none" aria-hidden />

      {/* top rule */}
      <div
        style={{
          height: 1,
          background:
            'linear-gradient(90deg, transparent, rgba(184,115,51,0.35) 25%, rgba(184,115,51,0.35) 75%, transparent)',
        }}
        aria-hidden
      />

      <div
        className="mx-auto"
        style={{ maxWidth: 1200, padding: '80px 32px' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 lg:gap-0">
          {stats.map((stat, i) => (
            <div key={stat.labelRo} className="flex lg:contents">
              {/* vertical divider before each item except first */}
              {i > 0 && <VerticalDivider />}

              <motion.div
                className="flex flex-col items-center text-center px-6 py-10 lg:py-8 gap-3 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.65,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {/* mobile divider between rows */}
                {i > 0 && (
                  <div
                    className="block lg:hidden absolute top-0 left-1/2 -translate-x-1/2"
                    style={{
                      width: 40,
                      height: 1,
                      backgroundColor: 'rgba(184,115,51,0.25)',
                    }}
                    aria-hidden
                  />
                )}

                <Counter stat={stat} play={play} index={i} />

                {/* label */}
                <p
                  className="label-caps"
                  style={{
                    color: 'var(--copper)',
                    fontSize: '0.62rem',
                    letterSpacing: '0.2em',
                    marginTop: 6,
                  }}
                >
                  {language === 'ro' ? stat.labelRo : stat.labelEn}
                </p>

                {/* caption */}
                <p
                  className="font-lora"
                  style={{
                    fontSize: '0.88rem',
                    color: 'rgba(245,235,216,0.45)',
                    lineHeight: 1.5,
                  }}
                >
                  {language === 'ro' ? stat.captionRo : stat.captionEn}
                </p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* bottom rule */}
      <div
        style={{
          height: 1,
          background:
            'linear-gradient(90deg, transparent, rgba(184,115,51,0.35) 25%, rgba(184,115,51,0.35) 75%, transparent)',
        }}
        aria-hidden
      />
    </section>
  );
}
