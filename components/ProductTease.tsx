'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── Product data ───────────────────────────────────────────────── */

interface Product {
  image: string;
  labelRo: string;
  labelEn: string;
  nameRo: string;
  nameEn: string;
  descRo: string;
  descEn: string;
  dimensionsRo: string;
  dimensionsEn: string;
  tagRo: string;
  tagEn: string;
}

const products: Product[] = [
  {
    image: '/product-herbs.webp',
    labelRo: 'Tocător · Clasic',
    labelEn: 'Cutting Board · Classic',
    nameRo: 'Stejar Simplu',
    nameEn: 'Plain Oak',
    descRo: 'Un tocător drept, finisat cu ulei de in. Liniile lemnului vorbesc singure — fără ornamente, fără surplus.',
    descEn: 'A straight board, finished in linseed oil. The wood grain speaks for itself — no ornament, no excess.',
    dimensionsRo: '38 × 24 × 2,5 cm',
    dimensionsEn: '38 × 24 × 2.5 cm',
    tagRo: 'Cel mai cerut',
    tagEn: 'Most requested',
  },
  {
    image: '/product-bread.webp',
    labelRo: 'Tocător · Pâine',
    labelEn: 'Cutting Board · Bread',
    nameRo: 'Pâine și Casă',
    nameEn: 'Bread & Home',
    descRo: 'Caneluri adânci prind firimiturile. Mâner sculptat manual. Conceput pentru pâinea de casă coptă duminica.',
    descEn: 'Deep channels catch crumbs. Hand-carved handle. Designed for Sunday home-baked bread.',
    dimensionsRo: '44 × 26 × 3 cm',
    dimensionsEn: '44 × 26 × 3 cm',
    tagRo: 'Nou',
    tagEn: 'New',
  },
  {
    image: '/product-fruit.webp',
    labelRo: 'Platou · Servire',
    labelEn: 'Board · Serving',
    nameRo: 'Masa de Seară',
    nameEn: 'Evening Table',
    descRo: 'Mai mult platou, mai puțin tocător. Servit cu brânzeturi, fructe și vin — îl pui direct pe masă.',
    descEn: 'More platter, less board. Served with cheeses, fruit and wine — set it straight on the table.',
    dimensionsRo: '50 × 28 × 2 cm',
    dimensionsEn: '50 × 28 × 2 cm',
    tagRo: 'Cel mai potrivit cadou',
    tagEn: 'Best gift',
  },
  {
    image: '/product-set.webp',
    labelRo: 'Set · Familie',
    labelEn: 'Set · Family',
    nameRo: 'Setul Familiei',
    nameEn: 'The Family Set',
    descRo: 'Trei tocătoare, trei mărimi, aceeași fibră de stejar. O investiție pentru bucătăria din care mâncați în fiecare zi.',
    descEn: 'Three boards, three sizes, the same oak grain. An investment for the kitchen you eat from every day.',
    dimensionsRo: 'S / M / L — set complet',
    dimensionsEn: 'S / M / L — complete set',
    tagRo: 'Ediție limitată',
    tagEn: 'Limited edition',
  },
];

/* ─── Single card ────────────────────────────────────────────────── */

function ProductCard({
  product,
  language,
  index,
}: {
  product: Product;
  language: 'ro' | 'en';
  index: number;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.article
      className="product-card group relative flex-shrink-0 flex flex-col cursor-pointer"
      style={{
        width: 'clamp(280px, 30vw, 360px)',
        borderRadius: 12,
        backgroundColor: '#2a2218',
        border: '1px solid rgba(184,115,51,0.18)',
        overflow: 'hidden',
      }}
      initial={prefersReduced ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={
        prefersReduced
          ? {}
          : {
              y: -10,
              boxShadow:
                '0 0 0 1.5px rgba(184,115,51,0.65), 0 24px 60px rgba(0,0,0,0.55), 0 0 40px rgba(184,115,51,0.12)',
              transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
            }
      }
    >
      {/* image */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '3/2.2' }}
      >
        <motion.div
          className="absolute inset-0"
          whileHover={prefersReduced ? {} : { scale: 1.06 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          <Image
            src={product.image}
            alt={language === 'ro' ? product.nameRo : product.nameEn}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 360px"
          />
        </motion.div>

        {/* image overlay gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(31,24,16,0.0) 50%, rgba(31,24,16,0.55) 100%)',
          }}
          aria-hidden
        />

        {/* tag badge */}
        <div
          className="absolute top-4 left-4"
        >
          <span
            className="label-caps px-2.5 py-1 rounded"
            style={{
              backgroundColor: 'rgba(184,115,51,0.88)',
              color: '#F5EBD8',
              fontSize: '0.6rem',
              letterSpacing: '0.18em',
              backdropFilter: 'blur(4px)',
            }}
          >
            {language === 'ro' ? product.tagRo : product.tagEn}
          </span>
        </div>
      </div>

      {/* content */}
      <div className="flex flex-col flex-1 p-6 pt-5 gap-3">
        {/* label */}
        <span
          className="label-caps block"
          style={{ color: 'var(--copper)', fontSize: '0.6rem', letterSpacing: '0.2em' }}
        >
          {language === 'ro' ? product.labelRo : product.labelEn}
        </span>

        {/* name */}
        <h3
          className="font-caudex"
          style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'var(--cream-warm)',
            lineHeight: 1.2,
          }}
        >
          {language === 'ro' ? product.nameRo : product.nameEn}
        </h3>

        {/* divider */}
        <div
          style={{
            width: 28,
            height: 1,
            backgroundColor: 'var(--copper)',
            opacity: 0.4,
          }}
        />

        {/* description */}
        <p
          className="font-lora flex-1"
          style={{
            fontSize: '0.93rem',
            lineHeight: 1.72,
            color: 'rgba(245,235,216,0.7)',
          }}
        >
          {language === 'ro' ? product.descRo : product.descEn}
        </p>

        {/* dimensions */}
        <div
          className="flex items-center gap-2 pt-2"
          style={{
            borderTop: '1px solid rgba(184,115,51,0.15)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <rect x="1" y="1" width="12" height="12" rx="1.5" stroke="var(--copper)" strokeWidth="1" opacity="0.5" />
            <path d="M1 5h12M5 1v12" stroke="var(--copper)" strokeWidth="0.8" opacity="0.4" />
          </svg>
          <span
            className="font-lora"
            style={{ fontSize: '0.8rem', color: 'rgba(245,235,216,0.45)', letterSpacing: '0.03em' }}
          >
            {language === 'ro' ? product.dimensionsRo : product.dimensionsEn}
          </span>
        </div>
      </div>

      {/* copper border glow — visible on hover via group */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100"
        style={{
          boxShadow: 'inset 0 0 0 1.5px rgba(184,115,51,0.5)',
          transition: 'opacity 0.28s ease',
          borderRadius: 12,
        }}
        aria-hidden
      />
    </motion.article>
  );
}

/* ─── Section ────────────────────────────────────────────────────── */

export default function ProductTease({ language }: { language: 'ro' | 'en' }) {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;

    const section = sectionRef.current;
    const trigger = triggerRef.current;
    const track = trackRef.current;
    if (!section || !trigger || !track) return;

    /* only activate on desktop (≥ 1024px) */
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const cards = track.querySelectorAll<HTMLElement>('.product-card');
      if (!cards.length) return;

      /* total horizontal travel = sum of card widths + gaps - viewport width */
      const totalWidth = track.scrollWidth;
      const viewportWidth = window.innerWidth;
      const distance = totalWidth - viewportWidth + 96; /* 96px end padding */

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trigger,
          start: 'top top',
          end: () => `+=${distance}`,
          pin: true,
          anticipatePin: 1,
          scrub: 1.2,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 1 / (cards.length - 1),
            duration: { min: 0.3, max: 0.6 },
            delay: 0.05,
            ease: 'power2.inOut',
          },
        },
      });

      tl.to(track, { x: -distance, ease: 'none' });

      return () => {
        tl.kill();
      };
    });

    return () => mm.revert();
  }, [prefersReduced]);

  const copy = {
    ro: {
      eyebrow: 'Produsele noastre',
      title: ['Fiecare bucată,', 'unică.'],
      sub: 'Tocătoarele noastre nu sunt produse în serie. Fiecare iese din atelier cu propria față a lemnului.',
      cta: 'Înscrie-te pentru acces timpuriu',
    },
    en: {
      eyebrow: 'Our products',
      title: ['Every piece,', 'unique.'],
      sub: "Our boards aren't mass-produced. Each leaves the workshop with its own face of wood.",
      cta: 'Sign up for early access',
    },
  }[language];

  return (
    <section
      ref={sectionRef}
      style={{ backgroundColor: 'var(--bark)' }}
      aria-label={language === 'ro' ? 'Produsele noastre' : 'Our products'}
    >
      {/* ── Header (always visible, outside pin) ───────────────── */}
      <div
        className="mx-auto"
        style={{ maxWidth: 1200, padding: '100px 40px 60px' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="flex flex-col gap-4">
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

            <div>
              {copy.title.map((line, i) => (
                <motion.h2
                  key={i}
                  className="font-caudex block"
                  style={{
                    fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                    fontWeight: 700,
                    color: 'var(--cream-warm)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.01em',
                  }}
                  initial={prefersReduced ? false : { opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  {line}
                </motion.h2>
              ))}
            </div>
          </div>

          <motion.p
            className="font-lora lg:max-w-xs lg:text-right"
            style={{
              fontSize: '0.97rem',
              lineHeight: 1.75,
              color: 'rgba(245,235,216,0.6)',
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {copy.sub}
          </motion.p>
        </div>

        {/* thin copper rule */}
        <motion.div
          className="mt-10"
          style={{
            height: 1,
            background: 'linear-gradient(90deg, var(--copper), transparent)',
            opacity: 0.3,
          }}
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
        />
      </div>

      {/* ── Horizontal scroll gallery (desktop pinned, mobile stack) ── */}
      <div ref={triggerRef} className="overflow-hidden" style={{ minHeight: '100vh' }}>
        {/* Desktop: horizontal track */}
        <div
          ref={trackRef}
          className="hidden lg:flex items-center"
          style={{
            paddingLeft: 'clamp(40px, 6vw, 100px)',
            paddingRight: 'clamp(40px, 6vw, 100px)',
            paddingTop: 20,
            paddingBottom: 60,
            gap: 'clamp(20px, 2.5vw, 32px)',
            width: 'max-content',
            minHeight: '100vh',
          }}
        >
          {products.map((p, i) => (
            <ProductCard key={p.nameRo} product={p} language={language} index={i} />
          ))}

          {/* end CTA card */}
          <motion.div
            className="flex-shrink-0 flex flex-col items-start justify-end"
            style={{
              width: 'clamp(220px, 18vw, 280px)',
              minHeight: 420,
              paddingBottom: 8,
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="flex flex-col gap-6">
              <div
                style={{
                  width: 40,
                  height: 1,
                  backgroundColor: 'var(--copper)',
                  opacity: 0.4,
                }}
              />
              <p
                className="font-caveat"
                style={{
                  fontSize: '1.6rem',
                  color: 'rgba(245,235,216,0.5)',
                  lineHeight: 1.3,
                  transform: 'rotate(-1deg)',
                  transformOrigin: 'left center',
                }}
              >
                {language === 'ro' ? 'mai multe\nîn curând...' : 'more\ncoming soon...'}
              </p>
              <motion.a
                href="#waitlist"
                className="label-caps inline-flex items-center gap-2 group/cta"
                style={{
                  color: 'var(--cream-warm)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.18em',
                  textDecoration: 'none',
                }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                {copy.cta}
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
                  <path d="M1 5h14M10 1l4 4-4 4" stroke="var(--copper)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Mobile: vertical stack */}
        <div
          className="flex lg:hidden flex-col"
          style={{
            padding: '0 20px 80px',
            gap: 20,
          }}
        >
          {products.map((p, i) => (
            <motion.article
              key={p.nameRo}
              className="group relative flex flex-col rounded-xl overflow-hidden"
              style={{
                backgroundColor: '#2a2218',
                border: '1px solid rgba(184,115,51,0.18)',
              }}
              initial={prefersReduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* image */}
              <div className="relative" style={{ aspectRatio: '16/9' }}>
                <Image
                  src={p.image}
                  alt={language === 'ro' ? p.nameRo : p.nameEn}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(31,24,16,0.5) 100%)' }}
                  aria-hidden
                />
                <div className="absolute top-3 left-3">
                  <span
                    className="label-caps px-2 py-1 rounded"
                    style={{ backgroundColor: 'rgba(184,115,51,0.88)', color: '#F5EBD8', fontSize: '0.58rem', letterSpacing: '0.16em' }}
                  >
                    {language === 'ro' ? p.tagRo : p.tagEn}
                  </span>
                </div>
              </div>

              {/* content */}
              <div className="p-5 flex flex-col gap-2">
                <span className="label-caps block" style={{ color: 'var(--copper)', fontSize: '0.58rem' }}>
                  {language === 'ro' ? p.labelRo : p.labelEn}
                </span>
                <h3 className="font-caudex" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--cream-warm)', lineHeight: 1.2 }}>
                  {language === 'ro' ? p.nameRo : p.nameEn}
                </h3>
                <p className="font-lora" style={{ fontSize: '0.9rem', lineHeight: 1.68, color: 'rgba(245,235,216,0.65)' }}>
                  {language === 'ro' ? p.descRo : p.descEn}
                </p>
                <p className="font-lora" style={{ fontSize: '0.76rem', color: 'rgba(245,235,216,0.38)', marginTop: 4 }}>
                  {language === 'ro' ? p.dimensionsRo : p.dimensionsEn}
                </p>
              </div>
            </motion.article>
          ))}

          {/* mobile CTA */}
          <motion.a
            href="#waitlist"
            className="label-caps inline-flex items-center justify-center gap-2 mt-2 py-4"
            style={{ color: 'var(--cream-warm)', fontSize: '0.68rem', letterSpacing: '0.18em', textDecoration: 'none', borderTop: '1px solid rgba(184,115,51,0.2)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {copy.cta}
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
              <path d="M1 5h14M10 1l4 4-4 4" stroke="var(--copper)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.a>
        </div>
      </div>

      {/* bottom fade to cream */}
      <div
        style={{
          height: 80,
          background: 'linear-gradient(180deg, var(--bark) 0%, var(--cream-warm) 100%)',
        }}
        aria-hidden
      />
    </section>
  );
}
