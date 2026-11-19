import localFont from 'next/font/local';

// Brand fonts, self-hosted from the repo (2026-11-19). `next/font/google`
// downloaded CSS + font files from Google on EVERY build and failed
// intermittently ("An error occurred in next/font", see gotchas.md); the build
// no longer touches the network for fonts.
//
// Files: assets/fonts/*.woff2 — Google Fonts TTFs subset with fontTools to
// Latin + Latin-1 + Latin Extended-A + Romanian comma-below Ș ș Ț ț + general
// punctuation (– — „ ” … ·), €, ™, ←↑→↓ where the font has them; all OpenType
// layout features kept. Same weights as before, normal style only. Licences:
// SIL Open Font License 1.1 (assets/fonts/OFL-*.txt). Rebuild recipe:
// assets/fonts/README.md.
//
// Declared ONCE: the [locale] layout and the admin layout import these.

export const caudex = localFont({
  src: [
    { path: '../assets/fonts/caudex-400.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/caudex-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-caudex',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

export const caveat = localFont({
  src: [
    { path: '../assets/fonts/caveat-400.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/caveat-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-caveat',
  display: 'swap',
  // Rare handwritten accent: not worth a preload on every page.
  preload: false,
  adjustFontFallback: 'Arial',
});

export const lora = localFont({
  src: [
    { path: '../assets/fonts/lora-400.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/lora-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-lora',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

/** className for <html>: exposes the three CSS variables. */
export const fontVariables = `${caudex.variable} ${caveat.variable} ${lora.variable}`;
