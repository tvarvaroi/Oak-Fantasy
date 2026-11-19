'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion, animate } from 'framer-motion';
import type { Locale } from '@/lib/i18n-routes';
import { numbersStripContent, type Stat } from './numbers-strip-content';

/* ─── Single animated counter ───────────────────────────────────── */

function Counter({
  stat,
  play,
  index,
  numberLocale,
}: {
  stat: Stat;
  play: boolean;
  index: number;
  numberLocale: string;
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

  // Text stat (no count-up), e.g. "Lemn masiv": smaller type, kept on one line
  // so two words fit a quarter column (number size wrapped it at 1440), but the same box height as the numbers so labels and
  // captions stay on one baseline across the row.
  if (stat.display) {
    return (
      <div
        className="font-caudex flex items-end justify-center text-center"
        style={{
          minHeight: 'clamp(2.8rem, 5.5vw, 5rem)',
          fontSize: 'clamp(1.6rem, 2.6vw, 2.4rem)',
          fontWeight: 700,
          color: 'var(--cream-warm)',
          lineHeight: 1.05,
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
        }}
      >
        {stat.display}
      </div>
    );
  }

  /* format thousands per locale */
  const formatted =
    stat.to >= 1000
      ? display.toLocaleString(numberLocale)
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

export default function NumbersStrip({
  language,
  productCount,
}: {
  language: Locale;
  /** Live active-product count; null hides the "modele" stat. */
  productCount: number | null;
}) {
  const ref = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(false);
  const prefersReduced = useReducedMotion();
  const { ariaLabel, numberLocale, stats: baseStats } = numbersStripContent[language];
  const stats = baseStats
    .filter((s) => s.live !== 'productCount' || productCount)
    .map((s) => (s.live === 'productCount' && productCount ? { ...s, to: productCount } : s));

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
      aria-label={ariaLabel}
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
        {/* From lg each item wrapper is display:contents, so the dividers are
            grid items too: 4 stats + 3 dividers = 7 tracks. A plain
            grid-cols-4 put two stats per row with the right half empty
            (fixed 2026-11-19). Keep in step with the stat count: 3 stats
            (product count unavailable) = 5 tracks. */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-0 ${
            stats.length === 3
              ? 'lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)_1px_minmax(0,1fr)]'
              : 'lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)_1px_minmax(0,1fr)_1px_minmax(0,1fr)]'
          }`}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              // 3 stats (no live product count) on the 2-col sm grid: the
              // last one takes the full row instead of leaving half empty.
              className={`flex lg:contents ${stats.length === 3 && i === 2 ? 'sm:col-span-2' : ''}`}
            >
              {/* vertical divider before each item except first */}
              {i > 0 && <VerticalDivider />}

              <motion.div
                className="flex-1 flex flex-col items-center text-center px-6 py-10 lg:py-8 gap-3 relative"
                initial={prefersReduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.65,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {/* divider between rows: 1 column below sm (above items 2–4), 2 columns sm–lg (above the second row only) */}
                {i > 0 && (
                  <div
                    className={`${i === 1 ? 'block sm:hidden' : 'block lg:hidden'} absolute top-0 left-1/2 -translate-x-1/2`}
                    style={{
                      width: 40,
                      height: 1,
                      backgroundColor: 'rgba(184,115,51,0.25)',
                    }}
                    aria-hidden
                  />
                )}

                <Counter stat={stat} play={play} index={i} numberLocale={numberLocale} />

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
                  {stat.label}
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
                  {stat.caption}
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
