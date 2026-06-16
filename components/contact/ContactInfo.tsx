'use client';

import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import { LEGAL_INFO, isPlaceholderMode } from '@/lib/legal-info';
import type { Locale } from '@/lib/i18n-routes';

import type { ContactCopy } from './content';

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3.5">
      <span
        className="mt-1 flex h-7 w-7 items-center justify-center"
        style={{
          color: 'var(--oak-warm)',
          backgroundColor: 'var(--cream-warm)',
          border: '1px solid rgba(139,94,60,0.25)',
          borderRadius: 4,
        }}
        aria-hidden
      >
        {icon}
      </span>
      <div className="flex flex-col gap-0.5">
        <span
          className="label-caps"
          style={{ color: 'var(--ink-soft)', fontSize: '0.62rem' }}
        >
          {label}
        </span>
        <div
          className="font-lora"
          style={{
            color: 'var(--ink)',
            fontSize: '0.96rem',
            lineHeight: 1.55,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ContactInfo({
  copy,
  locale,
}: {
  copy: ContactCopy['info'];
  locale: Locale;
}) {
  const prefersReduced = useReducedMotion();
  const hours = locale === 'ro' ? LEGAL_INFO.workingHours : LEGAL_INFO.workingHoursEn;

  return (
    <motion.aside
      initial={prefersReduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
      style={{
        backgroundColor: 'var(--paper-aged)',
        border: '1px solid rgba(139,94,60,0.22)',
        borderRadius: 6,
        padding: '32px 28px',
      }}
      aria-label={copy.sectionLabel}
    >
      <div className="paper-texture absolute inset-0 pointer-events-none rounded-[6px]" aria-hidden />

      <div className="relative flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <p
            className="label-caps"
            style={{ color: 'var(--copper)', fontSize: '0.62rem' }}
          >
            {copy.sectionLabel}
          </p>
          <div
            style={{
              width: 36,
              height: 1,
              backgroundColor: 'var(--copper)',
              opacity: 0.45,
            }}
            aria-hidden
          />
        </div>

        <InfoRow icon={<Mail size={15} strokeWidth={1.8} />} label={copy.emailLabel}>
          <a
            href={`mailto:${LEGAL_INFO.contactEmail}`}
            style={{ color: 'var(--ink)', textDecoration: 'none' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--oak-warm)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)')}
          >
            {LEGAL_INFO.contactEmail}
          </a>
        </InfoRow>

        <InfoRow icon={<Phone size={15} strokeWidth={1.8} />} label={copy.phoneLabel}>
          {LEGAL_INFO.contactPhone.startsWith('[') ? (
            <span style={{ color: 'var(--ink-soft)', fontStyle: 'italic' }}>
              {LEGAL_INFO.contactPhone}
            </span>
          ) : (
            <a
              href={`tel:${LEGAL_INFO.contactPhone.replace(/\s+/g, '')}`}
              style={{ color: 'var(--ink)', textDecoration: 'none' }}
            >
              {LEGAL_INFO.contactPhone}
            </a>
          )}
        </InfoRow>

        <InfoRow icon={<MapPin size={15} strokeWidth={1.8} />} label={copy.workshopLabel}>
          {LEGAL_INFO.workshopAddress.startsWith('[') ? (
            <span style={{ color: 'var(--ink-soft)', fontStyle: 'italic' }}>
              {LEGAL_INFO.workshopAddress}
            </span>
          ) : (
            <span>{LEGAL_INFO.workshopAddress}</span>
          )}
        </InfoRow>

        <InfoRow icon={<Clock size={15} strokeWidth={1.8} />} label={copy.hoursLabel}>
          <span style={{ display: 'block' }}>{hours.weekdays}</span>
          <span
            style={{
              display: 'block',
              color: hours.saturday.includes('[') ? 'var(--ink-soft)' : 'var(--ink)',
              fontStyle: hours.saturday.includes('[') ? 'italic' : 'normal',
            }}
          >
            {hours.saturday}
          </span>
          <span style={{ display: 'block' }}>{hours.sunday}</span>
        </InfoRow>

        {isPlaceholderMode && (
          <p
            className="font-lora"
            style={{
              marginTop: 4,
              padding: '10px 12px',
              fontSize: '0.78rem',
              lineHeight: 1.55,
              color: 'var(--ink-soft)',
              backgroundColor: 'rgba(184,115,51,0.08)',
              border: '1px dashed rgba(139,94,60,0.4)',
              borderRadius: 4,
            }}
          >
            {copy.placeholderBanner}
          </p>
        )}

        <p
          className="font-caveat"
          style={{
            marginTop: 2,
            fontSize: '1.2rem',
            color: 'var(--oak-warm)',
            transform: 'rotate(-1deg)',
            transformOrigin: 'left center',
            lineHeight: 1.3,
          }}
        >
          {copy.sign}
        </p>
      </div>
    </motion.aside>
  );
}
