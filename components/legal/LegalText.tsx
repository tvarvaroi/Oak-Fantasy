import { Fragment, type ReactNode } from 'react';
import Link from 'next/link';

import { LEGAL_INFO } from '@/lib/legal-info';
import { FREE_SHIPPING_THRESHOLD_RON, SHIPPING_FLAT_RON } from '@/lib/config/shipping';
import { PATHNAMES, localizedPath, type Locale, type RouteKey } from '@/lib/i18n-routes';

// Inline renderer for legal copy. Resolves the tokens documented in
// ./content.ts so merchant data, contact details and shipping prices come
// from their single sources (LEGAL_INFO, lib/config/shipping) instead of
// being typed into the text. Unknown tokens throw at build time — a typo
// must never reach a public legal page as "{companyNmae}".

const linkStyle: React.CSSProperties = {
  color: 'var(--oak-warm)',
  textDecoration: 'underline',
  textUnderlineOffset: 3,
  overflowWrap: 'anywhere',
};

const ron = (bani: number) => `${bani / 100} RON`;

function plainToken(name: string, locale: Locale): string | null {
  switch (name) {
    case 'companyName':
      return LEGAL_INFO.companyName;
    case 'cui':
      return LEGAL_INFO.cui;
    case 'regCom':
      return LEGAL_INFO.regCom;
    case 'hqAddress':
      return LEGAL_INFO.hqAddress;
    case 'capital':
      return LEGAL_INFO.capitalSocial;
    case 'hours':
      return locale === 'ro' ? LEGAL_INFO.workingHours.weekdays : LEGAL_INFO.workingHoursEn.weekdays;
    case 'shippingFee':
      return ron(SHIPPING_FLAT_RON);
    case 'freeShippingFrom':
      return ron(FREE_SHIPPING_THRESHOLD_RON);
    default:
      return null;
  }
}

function isRouteKey(value: string): value is RouteKey {
  return Object.prototype.hasOwnProperty.call(PATHNAMES, value);
}

// {token} | [label](target) | **bold**
const INLINE = /(\{[a-zA-Z]+\}|\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*)/g;

export function renderLegalInline(text: string, locale: Locale): ReactNode {
  // A token whose value already ends in "." (ROOBO PELLETS S.R.L.) printed at
  // the end of a sentence gave "S.R.L.." — drop the sentence's own period
  // (2026-11-19). Also covers a bold token: **{companyName}**.
  const normalized = text.replace(/\{([a-zA-Z]+)\}(\*\*)?\./g, (match, name: string, bold?: string) =>
    plainToken(name, locale)?.endsWith('.') ? `{${name}}${bold ?? ''}` : match,
  );
  const parts = normalized.split(INLINE);
  return parts.map((part, i) => {
    if (!part) return null;

    if (part.startsWith('{') && part.endsWith('}')) {
      const name = part.slice(1, -1);
      if (name === 'email') {
        return (
          <a key={i} href={`mailto:${LEGAL_INFO.contactEmail}`} style={linkStyle}>
            {LEGAL_INFO.contactEmail}
          </a>
        );
      }
      if (name === 'phone') {
        return (
          <a key={i} href={`tel:${LEGAL_INFO.contactPhone.replace(/\s/g, '')}`} style={linkStyle}>
            {LEGAL_INFO.contactPhone}
          </a>
        );
      }
      const value = plainToken(name, locale);
      if (value === null) throw new Error(`Unknown legal copy token: ${part}`);
      return <Fragment key={i}>{value}</Fragment>;
    }

    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, target] = link;
      if (target.startsWith('route:')) {
        const key = target.slice('route:'.length);
        if (!isRouteKey(key)) throw new Error(`Unknown route in legal copy: ${target}`);
        return (
          <Link key={i} href={localizedPath(key, locale)} style={linkStyle}>
            {label}
          </Link>
        );
      }
      if (target.startsWith('#')) {
        return (
          <a key={i} href={target} style={linkStyle}>
            {label}
          </a>
        );
      }
      return (
        <a key={i} href={target} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          {label}
        </a>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      // Recurse: bold text may wrap a token, e.g. **{companyName}**.
      return (
        <strong key={i} style={{ fontWeight: 600, color: 'var(--oak-deep)' }}>
          {renderLegalInline(part.slice(2, -2), locale)}
        </strong>
      );
    }

    return <Fragment key={i}>{part}</Fragment>;
  });
}
