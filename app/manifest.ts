import type { MetadataRoute } from 'next';

// Web app manifest (2026-11-20): Android "Add to home screen" + install prompt.
// Icons: the full logo badge on the brand cream (public/icon-192.png,
// public/icon-512.png). Colours mirror the tokens in app/globals.css —
// a manifest cannot reference CSS variables: cream-warm #F5EBD8.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Oak Fantasy',
    short_name: 'Oak Fantasy',
    description: 'Tocătoare din lemn masiv, lucrate în atelierul nostru din România.',
    lang: 'ro',
    start_url: '/ro',
    scope: '/',
    display: 'standalone',
    background_color: '#F5EBD8',
    theme_color: '#F5EBD8',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
