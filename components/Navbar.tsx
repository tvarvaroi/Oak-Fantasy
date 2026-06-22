'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import { createClient } from '@/lib/supabase-client';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type NavRouteKey = 'despre' | 'atelier' | 'tocatoare' | 'contact';
type NavLink = { label: string; type: 'route'; routeKey: NavRouteKey };

// 2026-06-18 (Task 1.4 — IA Foundation): primary nav reduced to 4 clean
// route links. The homepage-only anchors "Povestea noastră" (#poveste) and
// "Îngrijire" (#ingrijire) were stripped from the primary nav — clicking
// them from an interior page meant a full-page reload + scroll, which reads
// as "go home and scroll" rather than the user's intent. The section IDs
// remain in the homepage DOM, so direct #anchor URLs / external shares still
// work. "Contact" added (was reachable only via Footer — UX gap found in
// the post-Sprint-1 smoke test).
//   Earlier: 2026-05-27 #atelier -> /atelier route; 2026-05-23 #tocatoare
//   -> /tocatoare route.
const NAV_LINKS_RO: NavLink[] = [
  { label: 'Atelier', type: 'route', routeKey: 'atelier' },
  { label: 'Tocătoare', type: 'route', routeKey: 'tocatoare' },
  { label: 'Despre', type: 'route', routeKey: 'despre' },
  { label: 'Contact', type: 'route', routeKey: 'contact' },
];

const NAV_LINKS_EN: NavLink[] = [
  { label: 'Workshop', type: 'route', routeKey: 'atelier' },
  { label: 'Cutting Boards', type: 'route', routeKey: 'tocatoare' },
  { label: 'About', type: 'route', routeKey: 'despre' },
  { label: 'Contact', type: 'route', routeKey: 'contact' },
];

interface NavbarProps {
  language: Locale;
  /** Called when user clicks the language toggle. Parent handles navigation. */
  onToggleLanguage: () => void;
  /**
   * Set true on pages whose hero has a dark background (e.g. /atelier).
   * Navbar adapts text/icon colors to cream when transparent + dark hero,
   * and reverts to ink once scrolled past the hero (own cream bg takes over).
   * Default false (cream hero pages keep ink text throughout).
   */
  darkHero?: boolean;
}

export default function Navbar({
  language,
  onToggleLanguage,
  darkHero = false,
}: NavbarProps) {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(false);
  const pathname = usePathname() ?? '';

  // Minimal auth-state awareness (Task 2.2): show a Sign-out affordance when
  // logged in. Browser client reads the cookie session + subscribes to
  // changes so login/logout reflect without a hard refresh.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const links = language === 'ro' ? NAV_LINKS_RO : NAV_LINKS_EN;
  const homePath = `/${language}`;
  const onHomepage = pathname === homePath || pathname === '/';
  const waitlistHref = `${homePath}#waitlist`;

  // FIX 1 (2026-05-28): Navbar text adapts to cream when transparent over a
  // dark hero (currently only /atelier). Once scrolled past 100px the Navbar
  // gets its own cream-warm bg + shadow, so text reverts to ink regardless
  // of what's behind it. SSR-safe: derived from props/state, no observer.
  const onDark = darkHero && !scrolled;
  const navInk = onDark ? 'var(--cream-warm)' : 'var(--ink)';
  const navInkSoft = onDark ? 'rgba(245, 235, 216, 0.72)' : 'var(--ink-soft)';
  const navAccent = onDark ? 'var(--copper)' : 'var(--oak-warm)';
  const colorTransition = prefersReducedMotion ? undefined : 'color 0.3s ease';

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // FIX 1 (2026-05-28): scroll listener must run regardless of
    // prefers-reduced-motion. Reduced motion only suppresses CSS transitions
    // (handled separately via colorTransition); the scrolled STATE itself
    // must update so the navbar bg/text colors switch correctly. Before this
    // fix, reduced-motion users got a permanently transparent navbar and on
    // /atelier the active link stayed copper forever.
    const onScroll = () => {
      const past = window.scrollY > 100;
      setScrolled(past);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
                color: navInk,
                letterSpacing: '0.02em',
                transition: prefersReducedMotion
                  ? 'font-size 0.4s ease'
                  : 'font-size 0.4s ease, color 0.3s ease',
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
              {language === 'ro' ? 'stejar · manual' : 'oak · handmade'}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const href = localizedPath(link.routeKey, language);
            const isActive = pathname === href;
            return (
              <Link
                key={link.label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="font-lora text-sm transition-colors duration-200 hover:text-oak-warm relative group"
                style={{
                  color: isActive ? navAccent : navInk,
                  fontFamily: 'var(--font-lora)',
                  transition: colorTransition,
                }}
              >
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  } transition-all duration-300`}
                  style={{ backgroundColor: navAccent }}
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
            style={{
              color: navInkSoft,
              fontFamily: 'var(--font-caudex)',
              letterSpacing: '0.15em',
              transition: colorTransition,
            }}
          >
            {language === 'ro' ? (
              <span>
                <span
                  className="text-oak-warm font-bold"
                  style={{ color: navAccent, transition: colorTransition }}
                >
                  RO
                </span>{' '}
                | EN
              </span>
            ) : (
              <span>
                RO |{' '}
                <span
                  className="text-oak-warm font-bold"
                  style={{ color: navAccent, transition: colorTransition }}
                >
                  EN
                </span>
              </span>
            )}
          </button>

          {/* Sign out — only when authenticated (Task 2.2 minimal logout) */}
          {authed && (
            <form action="/auth/signout" method="post" className="hidden md:block">
              <input type="hidden" name="locale" value={language} />
              <button
                type="submit"
                className="label-caps text-xs font-caudex transition-colors duration-200 hover:text-oak-warm"
                style={{
                  color: navInkSoft,
                  fontFamily: 'var(--font-caudex)',
                  letterSpacing: '0.15em',
                  transition: colorTransition,
                }}
              >
                {language === 'ro' ? 'Ieși' : 'Sign out'}
              </button>
            </form>
          )}

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

          {/* Mobile hamburger — FIX 2 (D4): 44px+ touch target (WCAG 2.5.5). */}
          <button
            className="md:hidden flex flex-col items-center justify-center gap-1.5 p-3 min-w-[44px] min-h-[44px]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
              style={{ backgroundColor: navInk, transition: prefersReducedMotion ? undefined : 'background-color 0.3s ease, transform 0.3s ease' }}
            />
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
              style={{ backgroundColor: navInk, transition: prefersReducedMotion ? undefined : 'background-color 0.3s ease, opacity 0.3s ease' }}
            />
            <span
              className={`block w-6 h-0.5 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
              style={{ backgroundColor: navInk, transition: prefersReducedMotion ? undefined : 'background-color 0.3s ease, transform 0.3s ease' }}
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
            const href = localizedPath(link.routeKey, language);
            const isActive = pathname === href;
            return (
              <Link
                key={link.label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="font-lora text-base py-3 border-b min-h-[44px] flex items-center"
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
          {authed && (
            <form action="/auth/signout" method="post" className="mt-1">
              <input type="hidden" name="locale" value={language} />
              <button
                type="submit"
                className="w-full text-center py-3 font-caudex text-sm min-h-[44px]"
                style={{
                  color: 'var(--ink-soft)',
                  fontFamily: 'var(--font-caudex)',
                  letterSpacing: '0.04em',
                }}
              >
                {language === 'ro' ? 'Ieși din cont' : 'Sign out'}
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
