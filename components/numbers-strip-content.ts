import type { Locale } from '@/lib/i18n-routes';

export interface Stat {
  from: number;
  to: number;
  prefix: string;
  suffix: string;
  label: string;
  caption: string;
}

export interface NumbersStripContent {
  ariaLabel: string;
  numberLocale: string;
  stats: Stat[];
}

export const numbersStripContent: Record<Locale, NumbersStripContent> = {
  ro: {
    ariaLabel: 'Cifre',
    numberLocale: 'ro-RO',
    stats: [
      { from: 0, to: 1200, prefix: '', suffix: '+',     label: 'pe listă',         caption: 'Persoane care așteaptă' },
      { from: 0, to: 100,  prefix: '', suffix: '%',     label: 'stejar românesc',  caption: 'Material provenit local' },
      { from: 0, to: 8,    prefix: '', suffix: 'h',     label: 'per tocător',      caption: 'Ore de lucru manual' },
      { from: 0, to: 20,   prefix: '', suffix: '+ ani', label: 'de meșteșug',      caption: 'Experiență în atelier' },
    ],
  },
  en: {
    ariaLabel: 'Numbers',
    numberLocale: 'en-US',
    stats: [
      { from: 0, to: 1200, prefix: '', suffix: '+',       label: 'on the list',  caption: 'People waiting' },
      { from: 0, to: 100,  prefix: '', suffix: '%',       label: 'Romanian oak', caption: 'Locally sourced material' },
      { from: 0, to: 8,    prefix: '', suffix: 'h',       label: 'per board',    caption: 'Hours of handwork' },
      { from: 0, to: 20,   prefix: '', suffix: '+ years', label: 'of craft',     caption: 'Workshop experience' },
    ],
  },
};
