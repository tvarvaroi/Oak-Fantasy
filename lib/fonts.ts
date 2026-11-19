import { Caudex, Caveat, Lora } from 'next/font/google';

// Brand fonts, declared ONCE (2026-11-19): the [locale] layout and the admin
// layout import these instances instead of each calling Caudex()/Lora()/
// Caveat() with copy-pasted options, so the two can never drift apart.
export const caudex = Caudex({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-caudex',
  display: 'swap',
});

export const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-caveat',
  display: 'swap',
});

export const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-lora',
  display: 'swap',
});

/** className for <html>: exposes the three CSS variables. */
export const fontVariables = `${caudex.variable} ${caveat.variable} ${lora.variable}`;
