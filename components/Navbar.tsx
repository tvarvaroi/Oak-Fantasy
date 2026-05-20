'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { localizedPath, type Locale } from '@/lib/i18n-routes';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type NavLink =
  | { label: string; type: 'anchor'; anchor: string }
  | { label: string; type: 'route'; routeKey: 'despre' };

const NAV_LINKS_RO: NavLink[] = [
  { label: 'Povestea noastră', type: 'anchor', anchor: '#poveste' },
  { label: 'Atelier', type: 'anchor', anchor: '#atelier' },
  { label: 'Despre', type: 'route', routeKey: 'despre' },
  { label: 'Tocătoare', type: 'anchor', anchor: '#tocatoare' },
  { label: 'Îngrijire', type: 'anchor', anchor: '#ingrijire' },
];

const NAV_LINKS_EN: NavLink[] = [
  { label: 'Our Story', type: 'anchor', anchor: '#poveste' },
  { label: 'Workshop', type: 'anchor', anchor: '#atelier' },
  { label: 'About', type: 'route', routeKey: 'despre' },
  { label: 'Boards', type: 'anchor', anchor: '#tocatoare' },
  { label: 'Care', type: 'anchor', anchor: '#ingrijire' },
];

interface NavbarProps {
  language: Locale;
  /** Called when user clicks the language toggle. Parent handles navigation. */
  onToggleLanguage: () => void;
}

export default function Navbar({ language, onToggleLanguage }: NavbarProps) {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() ?? '';

  const links = language === 'ro' ? NAV_LINKS_RO : NAV_LINKS_EN;
  const homePath = `/${language}`;
  const onHomepage = pathname === homePath || pathname === '/';
  const desprePath = localizedPath('despre', language);
  const waitlistHref = `${homePath}#waitlist`;

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

  // Anchor-link click: when we're already on the locale homepage, prevent
  // default and do a smooth scroll (preserves existing UX). When we're on
  // another route (e.g. /despre), let Next Link navigate to
  // /{locale}#anchor — the browser jumps to the section on landing
  // (globals.css `html { scroll-behavior: smooth }` keeps it smooth).
  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    anchor: string,
  ) => {
    if (anchor === '#waitlist') {
      if (onHomepage) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setMenuOpen(false);
      return;
    }
    if (onHomepage) {
      const target = document.querySelector(anchor);
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }
    setMenuOpen(false);
  };

  return (
    <header
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-3 shadow-sm' : 'py-5'
      }`}
      style={{
        backgroundColor: scrolled ? 'var(--cream-warm)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(139,94,60,0.2)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo — clicking goes to locale homepage (Link for cross-page nav). */}
        <Link
          href={homePath}
          className="flex-shrink-0 flex items-center gap-3 transition-all duration-500"
          onClick={(e) => {
            if (onHomepage) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
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
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            if (link.type === 'route') {
              const href = localizedPath(link.routeKey, language);
              const isActive = pathname === desprePath;
              return (
                <Link
                  key={link.label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="font-lora text-sm transition-colors duration-200 hover:text-oak-warm relative group"
                  style={{
                    color: isActive ? 'var(--oak-warm)' : 'var(--ink)',
                    fontFamily: 'var(--font-lora)',
                  }}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    } transition-all duration-300`}
                    style={{ backgroundColor: 'var(--oak-warm)' }}
                  />
                </Link>
              );
            }
            // anchor link
            const href = `${homePath}${link.anchor}`;
            return (
              <Link
                key={link.label}
                href={href}
                onClick={(e) => handleAnchorClick(e, link.anchor)}
                className="font-lora text-sm transition-colors duration-200 hover:text-oak-warm relative group"
                style={{ color: 'var(--ink)', fontFamily: 'var(--font-lora)' }}
              >
                {link.label}
                <span
                  className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300"
                  style={{ backgroundColor: 'var(--oak-warm)' }}
                />
              </Link>
            );
          })}
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
          <Link
            href={waitlistHref}
            onClick={(e) => handleAnchorClick(e, '#waitlist')}
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
          </Link>

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
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ backgroundColor: 'var(--cream-warm)', borderTop: '1px solid rgba(139,94,60,0.15)' }}
      >
        <nav className="flex flex-col px-6 py-4 gap-4">
          {links.map((link) => {
            if (link.type === 'route') {
              const href = localizedPath(link.routeKey, language);
              const isActive = pathname === desprePath;
              return (
                <Link
                  key={link.label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="font-lora text-base py-1 border-b"
                  style={{
                    color: isActive ? 'var(--oak-warm)' : 'var(--ink)',
                    fontFamily: 'var(--font-lora)',
                    borderColor: 'rgba(139,94,60,0.12)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {link.label}
                </Link>
              );
            }
            const href = `${homePath}${link.anchor}`;
            return (
              <Link
                key={link.label}
                href={href}
                onClick={(e) => handleAnchorClick(e, link.anchor)}
                className="font-lora text-base py-1 border-b"
                style={{
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-lora)',
                  borderColor: 'rgba(139,94,60,0.12)',
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={waitlistHref}
            onClick={(e) => handleAnchorClick(e, '#waitlist')}
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
          </Link>
        </nav>
      </div>
    </header>
  );
}
