'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import { createClient } from '@/lib/supabase-client';
import CartIcon from '@/components/cart/CartIcon';
import CartDrawer from '@/components/cart/CartDrawer';

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
  const closeBtnRef = useRef<HTMLButtonElement>(null);
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

  // Menu drawer (2026-07-03 Navbar redesign): Esc to close + body scroll lock
  // while open + focus the close button — same pattern as CartDrawer.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  const menuLabel = language === 'ro' ? 'Meniu' : 'Menu';
  const drawerTransition = prefersReducedMotion
    ? undefined
    : 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)';

  return (
    <>
    <header
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-3 shadow-sm' : 'py-4 lg:py-5'
      }`}
      style={{
        backgroundColor: scrolled ? 'var(--cream-warm)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(139,94,60,0.2)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo — clicking goes to locale homepage (Link for cross-page nav).
            2026-07-03: smaller below lg so the bar breathes on phones/tablets;
            the Caveat tagline only shows from md up. */}
        <Link
          href={homePath}
          className="flex-shrink-0 flex items-center gap-2.5 lg:gap-3 transition-all duration-500"
          onClick={(e) => {
            if (onHomepage) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <Image
            src="/3D_Cutting_Board_Model_Design.svg"
            alt="Oak Fantasy logo"
            width={100}
            height={100}
            className={`transition-all duration-500 ${
              scrolled
                ? 'w-12 h-12 lg:w-16 lg:h-16'
                : 'w-14 h-14 lg:w-[100px] lg:h-[100px]'
            }`}
            priority
          />
          <div className="flex flex-col leading-none transition-all duration-400">
            <span
              className="font-caudex"
              style={{
                fontSize: scrolled
                  ? 'clamp(1.25rem, 3.5vw, 1.6rem)'
                  : 'clamp(1.5rem, 4.5vw, 2.4rem)',
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
              className="font-caveat hidden md:block"
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

        {/* Desktop Nav — from lg up. 2026-07-03: breakpoint raised md -> lg;
            at 768-1023 the full nav was physically cramped (design-qa audit),
            so tablets get the same drawer pattern as phones. */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {links.map((link) => {
            const href = localizedPath(link.routeKey, language);
            const isActive = pathname === href;
            return (
              <Link
                key={link.label}
                href={href}
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

        {/* Right cluster. Below lg only cart + hamburger stay on the bar
            (max 3 visible elements incl. logo — founder decision); language,
            auth and the CTA live in the drawer. */}
        <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4">
          {/* Language toggle — desktop only; in the drawer below lg */}
          <button
            onClick={onToggleLanguage}
            className="hidden lg:block label-caps text-xs font-caudex transition-colors duration-200 hover:text-oak-warm"
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

          {/* Cart (Task 3.2) — visible on all breakpoints; opens the drawer. */}
          <CartIcon locale={language} color={navInk} colorTransition={colorTransition} />

          {/* Sign out — only when authenticated (Task 2.2 minimal logout) */}
          {authed && (
            <form action="/auth/signout" method="post" className="hidden lg:block">
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

          {/* CTA — routes to the live catalog (store sells now; the old
              Pre-comandă → #waitlist anchor predated checkout). */}
          <Link
            href={localizedPath('tocatoare', language)}
            className="hidden lg:inline-flex items-center px-5 py-2.5 text-sm font-caudex transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: 'var(--oak-warm)',
              color: 'var(--cream-warm)',
              borderRadius: '6px',
              fontFamily: 'var(--font-caudex)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 4px rgba(31,24,16,0.18)',
              letterSpacing: '0.04em',
            }}
          >
            {language === 'ro' ? 'Cumpără' : 'Shop'}
          </Link>

          {/* Hamburger — below lg. FIX 2 (D4): 44px+ touch target (WCAG 2.5.5). */}
          <button
            className="lg:hidden flex flex-col items-center justify-center gap-1.5 p-3 min-w-[44px] min-h-[44px]"
            onClick={() => setMenuOpen(true)}
            aria-label={menuLabel}
            aria-expanded={menuOpen}
          >
            <span
              className="block w-6 h-0.5"
              style={{ backgroundColor: navInk, transition: prefersReducedMotion ? undefined : 'background-color 0.3s ease' }}
            />
            <span
              className="block w-6 h-0.5"
              style={{ backgroundColor: navInk, transition: prefersReducedMotion ? undefined : 'background-color 0.3s ease' }}
            />
            <span
              className="block w-6 h-0.5"
              style={{ backgroundColor: navInk, transition: prefersReducedMotion ? undefined : 'background-color 0.3s ease' }}
            />
          </button>
        </div>
      </div>
    </header>

    {/* ── Menu drawer (mobile + tablet, < lg) ─────────────────────────────
        Same interaction pattern as CartDrawer (Esc, backdrop click, scroll
        lock). Z-order discipline: navbar 50 < menu 55/56 < cart drawer 60/61
        — the cart drawer always wins if both are open. */}
    <div
      onClick={() => setMenuOpen(false)}
      aria-hidden
      className="lg:hidden"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(31,24,16,0.4)',
        opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? 'auto' : 'none',
        transition: prefersReducedMotion ? undefined : 'opacity 0.3s ease',
        zIndex: 55,
      }}
    />
    <aside
      aria-label={menuLabel}
      aria-hidden={!menuOpen}
      className="lg:hidden"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100dvh',
        width: 'min(340px, 85vw)',
        backgroundColor: 'var(--cream-warm)',
        boxShadow: menuOpen ? '-8px 0 32px rgba(31,24,16,0.18)' : 'none',
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: drawerTransition,
        zIndex: 56,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Drawer header */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '18px 22px', borderBottom: '1px solid rgba(92,58,32,0.18)' }}
      >
        <span
          className="font-caudex"
          style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--oak-deep)' }}
        >
          {menuLabel}
        </span>
        <button
          ref={closeBtnRef}
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label={language === 'ro' ? 'Închide meniul' : 'Close menu'}
          className="flex items-center justify-center min-w-[44px] min-h-[44px] transition-opacity hover:opacity-70"
          style={{ color: 'var(--ink-soft)' }}
        >
          <X size={22} strokeWidth={1.75} />
        </button>
      </div>

      {/* Drawer nav links */}
      <nav className="flex flex-col" style={{ padding: '10px 22px', flex: 1, overflowY: 'auto' }}>
        {links.map((link) => {
          const href = localizedPath(link.routeKey, language);
          const isActive = pathname === href;
          return (
            <Link
              key={link.label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="font-lora min-h-[48px] flex items-center"
              style={{
                fontSize: '1.05rem',
                color: isActive ? 'var(--oak-warm)' : 'var(--ink)',
                fontFamily: 'var(--font-lora)',
                fontWeight: isActive ? 600 : 400,
                borderBottom: '1px solid rgba(139,94,60,0.12)',
                padding: '10px 0',
              }}
            >
              {link.label}
            </Link>
          );
        })}

        {/* Language toggle row */}
        <button
          onClick={() => {
            setMenuOpen(false);
            onToggleLanguage();
          }}
          className="label-caps text-xs font-caudex min-h-[48px] flex items-center"
          style={{
            color: 'var(--ink-soft)',
            fontFamily: 'var(--font-caudex)',
            letterSpacing: '0.15em',
            padding: '10px 0',
            borderBottom: '1px solid rgba(139,94,60,0.12)',
          }}
        >
          {language === 'ro' ? (
            <span>
              <span className="font-bold" style={{ color: 'var(--oak-warm)' }}>RO</span> | EN
            </span>
          ) : (
            <span>
              RO | <span className="font-bold" style={{ color: 'var(--oak-warm)' }}>EN</span>
            </span>
          )}
        </button>
      </nav>

      {/* Drawer footer: CTA + sign out */}
      <div style={{ padding: '16px 22px 22px', borderTop: '1px solid rgba(92,58,32,0.18)' }}>
        <Link
          href={localizedPath('tocatoare', language)}
          onClick={() => setMenuOpen(false)}
          className="block text-center font-caudex transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
          style={{
            backgroundColor: 'var(--oak-warm)',
            color: 'var(--cream-warm)',
            borderRadius: 8,
            padding: '13px',
            fontSize: '0.95rem',
            letterSpacing: '0.04em',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 4px rgba(31,24,16,0.18)',
          }}
        >
          {language === 'ro' ? 'Cumpără' : 'Shop'}
        </Link>
        {authed && (
          <form action="/auth/signout" method="post" className="mt-2">
            <input type="hidden" name="locale" value={language} />
            <button
              type="submit"
              className="w-full text-center font-caudex text-sm min-h-[44px]"
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
      </div>
    </aside>
    <CartDrawer locale={language} />
    </>
  );
}
