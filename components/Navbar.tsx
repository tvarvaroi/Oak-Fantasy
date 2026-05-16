'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const NAV_LINKS_RO = [
  { label: 'Povestea noastră', href: '#poveste' },
  { label: 'Atelier', href: '#atelier' },
  { label: 'Tocătoare', href: '#tocatoare' },
  { label: 'Îngrijire', href: '#ingrijire' },
];

const NAV_LINKS_EN = [
  { label: 'Our Story', href: '#poveste' },
  { label: 'Workshop', href: '#atelier' },
  { label: 'Boards', href: '#tocatoare' },
  { label: 'Care', href: '#ingrijire' },
];

interface NavbarProps {
  language: 'ro' | 'en';
  /** Called when user clicks the language toggle. Parent handles navigation. */
  onToggleLanguage: () => void;
}

export default function Navbar({ language, onToggleLanguage }: NavbarProps) {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const links = language === 'ro' ? NAV_LINKS_RO : NAV_LINKS_EN;

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || prefersReducedMotion) return;

    const onScroll = () => {
      const past = window.scrollY > 100;
      setScrolled(past);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [prefersReducedMotion]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === '#waitlist') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setMenuOpen(false);
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
      setMenuOpen(false);
    }
  };

  return (
    <header
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'py-3 shadow-sm'
          : 'py-5'
      }`}
      style={{
        backgroundColor: scrolled ? 'var(--cream-warm)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(139,94,60,0.2)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex-shrink-0 flex items-center gap-3 transition-all duration-500" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <Image
            ref={logoRef as any}
            src="/3D_Cutting_Board_Model_Design.svg"
            alt="Oak Fantasy logo"
            width={100}
            height={100}
            className={`transition-all duration-500 ${
              scrolled ? 'w-16 h-16' : 'w-[100px] h-[100px]'
            }`}
            priority
          />
          <div className="flex flex-col leading-none transition-all duration-400">
            <span
              className="font-caudex"
              style={{
                fontSize: scrolled ? '1.6rem' : '2.4rem',
                fontWeight: 700,
                color: 'var(--ink)',
                letterSpacing: '0.02em',
                transition: 'font-size 0.4s ease',
                lineHeight: 1.1,
              }}
            >
              Oak Fantasy
            </span>
            <span
              className="font-caveat"
              style={{
                fontSize: '1.4rem',
                color: 'var(--copper)',
                letterSpacing: '0.03em',
                marginTop: scrolled ? 0 : 3,
                opacity: scrolled ? 0 : 1,
                maxHeight: scrolled ? 0 : '2rem',
                overflow: 'hidden',
                transition: 'opacity 0.3s ease, max-height 0.4s ease, margin-top 0.4s ease',
                lineHeight: 1,
              }}
            >
              stejar · manual
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="font-lora text-sm transition-colors duration-200 hover:text-oak-warm relative group"
              style={{ color: scrolled ? 'var(--ink)' : 'var(--ink)', fontFamily: 'var(--font-lora)' }}
            >
              {link.label}
              <span
                className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300"
                style={{ backgroundColor: 'var(--oak-warm)' }}
              />
            </a>
          ))}
        </nav>

        {/* Right: Language + CTA */}
        <div className="flex items-center gap-4">
          {/* Language toggle */}
          <button
            onClick={onToggleLanguage}
            className="label-caps text-xs font-caudex transition-colors duration-200 hover:text-oak-warm"
            style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-caudex)', letterSpacing: '0.15em' }}
          >
            {language === 'ro' ? (
              <span><span className="text-oak-warm font-bold" style={{ color: 'var(--oak-warm)' }}>RO</span> | EN</span>
            ) : (
              <span>RO | <span className="text-oak-warm font-bold" style={{ color: 'var(--oak-warm)' }}>EN</span></span>
            )}
          </button>

          {/* CTA */}
          <a
            href="#waitlist"
            onClick={(e) => handleNavClick(e, '#waitlist')}
            className="hidden md:inline-flex items-center px-5 py-2.5 text-sm font-caudex transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: 'var(--oak-warm)',
              color: 'var(--cream-warm)',
              borderRadius: '6px',
              fontFamily: 'var(--font-caudex)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 4px rgba(31,24,16,0.18)',
              letterSpacing: '0.04em',
            }}
          >
            {language === 'ro' ? 'Pre-comandă' : 'Pre-order'}
          </a>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
              style={{ backgroundColor: 'var(--ink)' }}
            />
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
              style={{ backgroundColor: 'var(--ink)' }}
            />
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
              style={{ backgroundColor: 'var(--ink)' }}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-400 ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ backgroundColor: 'var(--cream-warm)', borderTop: '1px solid rgba(139,94,60,0.15)' }}
      >
        <nav className="flex flex-col px-6 py-4 gap-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="font-lora text-base py-1 border-b"
              style={{
                color: 'var(--ink)',
                fontFamily: 'var(--font-lora)',
                borderColor: 'rgba(139,94,60,0.12)',
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#waitlist"
            onClick={(e) => handleNavClick(e, '#waitlist')}
            className="mt-2 text-center py-3 font-caudex text-sm"
            style={{
              backgroundColor: 'var(--oak-warm)',
              color: 'var(--cream-warm)',
              borderRadius: '6px',
              fontFamily: 'var(--font-caudex)',
              letterSpacing: '0.04em',
            }}
          >
            {language === 'ro' ? 'Pre-comandă' : 'Pre-order'}
          </a>
        </nav>
      </div>
    </header>
  );
}
