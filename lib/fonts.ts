import { Caudex, Caveat, Lora } from 'next/font/google';

// Brand fonts, declared ONCE (2026-11-19). The [locale] layout, the admin
// layout and the root 404 all import these instances. Declaring the same
// Google font in several files made `next build` fail intermittently inside
// next/font's shared download cache ("Cannot read properties of null
// (reading '1')" in google/loader.js) — see _brain/notes/gotchas.md.
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
