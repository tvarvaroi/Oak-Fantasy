'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

/* ─── Bottom decorative branch ───────────────────────────────────
   A wide oak-leaf-branch SVG that draws across the full width
   as it enters the viewport.
──────────────────────────────────────────────────────────────── */

function BottomBranch({ drawn }: { drawn: boolean }) {
  const seg = (len: number, delay: number, w = 1.3) => ({
    strokeDasharray: len,
    strokeDashoffset: drawn ? 0 : len,
    transition: `stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
    strokeWidth: w,
  });

  return (
    <svg
      viewBox="0 0 900 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ width: '100%', display: 'block' }}
    >
      {/* main branch */}
      <path
        d="M 0 40 C 80 32, 160 46, 240 38 C 320 30, 400 44, 450 38
           C 500 32, 580 46, 660 38 C 740 30, 820 44, 900 36"
        stroke="rgba(139,94,60,0.3)"
        strokeLinecap="round"
        fill="none"
        style={seg(1200, 0, 1.5)}
      />

      {/* leaf cluster 1 — left */}
      <path d="M 160 44 C 155 34, 148 28, 144 22" stroke="rgba(90,107,60,0.4)" strokeLinecap="round" fill="none" style={seg(30, 0.3, 1)} />
      <path d="M 144 22 C 136 14, 130 20, 136 30 C 142 40, 150 38, 144 22 Z" stroke="rgba(90,107,60,0.4)" fill="none" style={seg(48, 0.45, 1)} />
      <path d="M 144 22 C 152 14, 158 20, 152 30 C 146 40, 142 38, 144 22 Z" stroke="rgba(90,107,60,0.4)" fill="none" style={seg(48, 0.52, 1)} />

      {/* leaf cluster 2 — centre-left */}
      <path d="M 340 38 C 337 28, 332 20, 328 12" stroke="rgba(90,107,60,0.4)" strokeLinecap="round" fill="none" style={seg(34, 0.45, 1)} />
      <path d="M 328 12 C 320 4, 314 10, 320 20 C 326 30, 334 28, 328 12 Z" stroke="rgba(90,107,60,0.4)" fill="none" style={seg(48, 0.6, 1)} />
      <path d="M 328 12 C 336 4, 342 10, 336 20 C 330 30, 326 28, 328 12 Z" stroke="rgba(90,107,60,0.4)" fill="none" style={seg(48, 0.68, 1)} />

      {/* acorn centre */}
      <circle cx="450" cy="38" r="4.5" stroke="rgba(184,115,51,0.35)" fill="none" style={seg(30, 0.6, 1)} />
      <path d="M 446 38 C 447 34, 453 34, 454 38" stroke="rgba(184,115,51,0.35)" strokeLinecap="round" fill="none" style={seg(12, 0.72, 1)} />
      <line x1="450" y1="34" x2="450" y2="30" stroke="rgba(184,115,51,0.35)" strokeLinecap="round" style={seg(5, 0.78, 1)} />

      {/* leaf cluster 3 — centre-right */}
      <path d="M 560 38 C 558 28, 554 20, 550 12" stroke="rgba(90,107,60,0.4)" strokeLinecap="round" fill="none" style={seg(34, 0.55, 1)} />
      <path d="M 550 12 C 542 4, 536 10, 542 20 C 548 30, 556 28, 550 12 Z" stroke="rgba(90,107,60,0.4)" fill="none" style={seg(48, 0.7, 1)} />
      <path d="M 550 12 C 558 4, 564 10, 558 20 C 552 30, 548 28, 550 12 Z" stroke="rgba(90,107,60,0.4)" fill="none" style={seg(48, 0.78, 1)} />

      {/* leaf cluster 4 — right */}
      <path d="M 740 40 C 737 30, 732 22, 728 14" stroke="rgba(90,107,60,0.4)" strokeLinecap="round" fill="none" style={seg(34, 0.65, 1)} />
      <path d="M 728 14 C 720 6, 714 12, 720 22 C 726 32, 734 30, 728 14 Z" stroke="rgba(90,107,60,0.4)" fill="none" style={seg(48, 0.8, 1)} />
      <path d="M 728 14 C 736 6, 742 12, 736 22 C 730 32, 726 30, 728 14 Z" stroke="rgba(90,107,60,0.4)" fill="none" style={seg(48, 0.88, 1)} />
    </svg>
  );
}

/* ─── Footer nav links ───────────────────────────────────────────── */

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <a
      href={href}
      className="font-lora block transition-colors duration-200"
      style={{
        fontSize: '0.92rem',
        color: 'rgba(245,235,216,0.55)',
        textDecoration: 'none',
        lineHeight: 1.6,
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(245,235,216,0.9)')}
      onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(245,235,216,0.55)')}
    >
      {children}
    </a>
  );
}

/* ─── Social icon ────────────────────────────────────────────────── */

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

/* ─── Main Footer ────────────────────────────────────────────────── */

export default function Footer({ language }: { language: 'ro' | 'en' }) {
  const branchRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const el = branchRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const nav = {
    ro: {
      colBrand: 'Brand',
      colNav: 'Navigare',
      colContact: 'Contact',
      navLinks: [
        { label: 'Atelierul nostru', href: '#workshop' },
        { label: 'Produse', href: '#products' },
        { label: 'Povestea noastră', href: '#story' },
        { label: 'Lista de așteptare', href: '#waitlist' },
      ],
      contactLines: [
        'atelier@oakfantasy.ro',
        'Transilvania, România',
        'Program: Luni–Vineri, 9–17',
      ],
      tagline: 'Făcut cu drag în România.',
      copy: `© ${new Date().getFullYear()} Oak Fantasy. Toate drepturile rezervate.`,
      brandDesc: 'Tocătoare din stejar românesc, lucrate manual în atelierul nostru din inima Transilvaniei.',
      microTagline: 'stejar · manual · România',
    },
    en: {
      colBrand: 'Brand',
      colNav: 'Navigation',
      colContact: 'Contact',
      navLinks: [
        { label: 'Our Workshop', href: '#workshop' },
        { label: 'Products', href: '#products' },
        { label: 'Our Story', href: '#story' },
        { label: 'Waitlist', href: '#waitlist' },
      ],
      contactLines: [
        'atelier@oakfantasy.ro',
        'Transylvania, Romania',
        'Hours: Mon–Fri, 9–17',
      ],
      tagline: 'Made with love in Romania.',
      copy: `© ${new Date().getFullYear()} Oak Fantasy. All rights reserved.`,
      brandDesc: 'Romanian oak cutting boards, handcrafted in our workshop in the heart of Transylvania.',
      microTagline: 'oak · handmade · Romania',
    },
  }[language];

  return (
    <footer
      className="relative overflow-hidden"
      style={{ backgroundColor: 'var(--bark)' }}
      aria-label="Footer"
    >
      <div className="paper-texture absolute inset-0 pointer-events-none" aria-hidden />

      {/* top rule */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,94,60,0.25) 30%, rgba(139,94,60,0.25) 70%, transparent)' }} aria-hidden />

      <div
        className="mx-auto"
        style={{ maxWidth: 1200, padding: '72px 32px 0' }}
      >
        {/* ── Three column grid ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 pb-14">

          {/* col 1 — Brand */}
          <motion.div
            className="flex flex-col gap-6"
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="label-caps"
              style={{ color: 'var(--copper)', fontSize: '0.6rem' }}
            >
              {nav.colBrand}
            </p>

            {/* logo — clean SVG stencil on cream coin (consistent with Navbar
                reference + ProductCard medallion). 2026-05-29 brand unification:
                JPEG with green ring replaced by the SVG asset used throughout
                the rest of the brand. */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'var(--cream-warm)',
              }}
            >
              <Image
                src="/3D_Cutting_Board_Model_Design.svg"
                alt="Oak Fantasy logo"
                width={100}
                height={100}
              />
            </div>

            {/* brand name */}
            <div>
              <p
                className="font-caudex"
                style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--cream-warm)', lineHeight: 1.1 }}
              >
                Oak Fantasy
              </p>
              <p
                className="font-caveat"
                style={{ fontSize: '0.9rem', color: 'var(--copper)', marginTop: 2 }}
              >
                {nav.microTagline}
              </p>
            </div>

            <p
              className="font-lora"
              style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'rgba(245,235,216,0.45)', maxWidth: 260 }}
            >
              {nav.brandDesc}
            </p>

            {/* instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80"
              style={{ color: 'rgba(245,235,216,0.5)', textDecoration: 'none', width: 'fit-content' }}
              aria-label="Instagram"
            >
              <InstagramIcon />
              <span className="font-lora" style={{ fontSize: '0.82rem' }}>@oakfantasy.ro</span>
            </a>
          </motion.div>

          {/* col 2 — Navigation */}
          <motion.div
            className="flex flex-col gap-6"
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="label-caps"
              style={{ color: 'var(--copper)', fontSize: '0.6rem' }}
            >
              {nav.colNav}
            </p>
            <nav className="flex flex-col gap-3" aria-label="Footer navigation">
              {nav.navLinks.map(link => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </nav>
          </motion.div>

          {/* col 3 — Contact */}
          <motion.div
            className="flex flex-col gap-6"
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="label-caps"
              style={{ color: 'var(--copper)', fontSize: '0.6rem' }}
            >
              {nav.colContact}
            </p>
            <div className="flex flex-col gap-3">
              {nav.contactLines.map((line, i) => (
                <p
                  key={i}
                  className="font-lora"
                  style={{ fontSize: '0.92rem', color: 'rgba(245,235,216,0.55)', lineHeight: 1.55 }}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* copper divider */}
            <div style={{ width: 32, height: 1, backgroundColor: 'var(--copper)', opacity: 0.3 }} aria-hidden />

            {/* craft note */}
            <p
              className="font-caveat"
              style={{
                fontSize: '1.25rem',
                color: 'rgba(245,235,216,0.35)',
                transform: 'rotate(-1deg)',
                transformOrigin: 'left center',
                lineHeight: 1.3,
              }}
            >
              {language === 'ro' ? 'Lucrăm cu drag\npentru voi.' : 'Made with care\nfor you.'}
            </p>
          </motion.div>
        </div>

        {/* ── Oak branch illustration ─────────────────────────── */}
        <div ref={branchRef} style={{ marginBottom: 0 }}>
          <BottomBranch drawn={drawn} />
        </div>

        {/* ── Bottom bar ─────────────────────────────────────── */}
        <div
          style={{
            borderTop: '1px solid rgba(139,94,60,0.15)',
            padding: '20px 0 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {/* centred tagline */}
          <p
            className="font-caudex"
            style={{
              fontSize: '0.95rem',
              fontStyle: 'italic',
              color: 'rgba(245,235,216,0.45)',
              letterSpacing: '0.04em',
              textAlign: 'center',
            }}
          >
            {nav.tagline}
          </p>

          <p
            className="font-lora"
            style={{
              fontSize: '0.75rem',
              color: 'rgba(245,235,216,0.22)',
              textAlign: 'center',
            }}
          >
            {nav.copy}
          </p>

          {/* Vecteezy attribution — REQUIRED by their free-PNG license for the
              treeline.webp hero backdrop used on /tocatoare (and future pages). */}
          <p
            className="font-lora"
            style={{
              fontSize: '0.7rem',
              color: 'rgba(245,235,216,0.22)',
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            <a
              href="https://www.vecteezy.com/free-png/tree"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              Tree PNGs by Vecteezy
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
