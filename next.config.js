/** @type {import('next').NextConfig} */
const path = require('path');

// Content-Security-Policy — REPORT-ONLY for now (SEO audit #8, decided
// 2026-07-06): violations show up in the browser console / report layer
// without breaking anything. Promote to enforcing `Content-Security-Policy`
// only after a verification window with zero unexpected violations
// (checkout + images + 3D + fonts are the break-prone surfaces).
//
// Source inventory this policy is built from:
// - Next.js hydration: inline <script> bootstrap → script-src 'unsafe-inline'
//   (nonces would force dynamic rendering on an SSG site — not worth it yet)
// - Inline style="" attributes everywhere (framer-motion, design system)
//   → style-src 'unsafe-inline'
// - next/font: self-hosted under /_next/static → font-src 'self'
// - Product images: served via /_next/image (same origin) but the raw
//   Supabase Storage host is allowed too for any direct <img> use
// - Supabase JS (auth/db from the browser): connect-src *.supabase.co
// - Vercel SpeedInsights: script from /_vercel/... (same origin on Vercel),
//   beacons to vitals.vercel-insights.com → connect-src
// - Three.js/R3F: canvas textures only — but blob: workers/images allowed
//   defensively (drei loaders use them)
// - Stripe: hosted Checkout = full-page redirect, NO Stripe JS on our pages
//   → no stripe.com sources needed
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

// Baseline security headers (zero-risk set, enforced from day one).
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy-Report-Only', value: CSP_REPORT_ONLY },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
    ];
  },
  images: {
    // Supabase Storage public URLs for product images (Task 2.4). Bucket
    // 'product-images' is public; objects are served from the project's
    // *.supabase.co host under /storage/v1/object/public/**.
    // AVIF first (better quality-per-byte than WebP), WebP fallback.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    'framer-motion',
    'gsap',
  ],
  webpack: (config) => {
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ];
    // tailwindcss 3.3.3's lib/util/validateConfig.js does an optional
    // `require("@tailwindcss/line-clamp")` (wrapped in try/catch) just to warn
    // if the now-built-in plugin is still in the config. We don't have that
    // plugin installed (line-clamp is core since TW 3.3), but webpack can't
    // tree-shake the optional require and emits "Module not found". Alias it to
    // false so webpack resolves it to an empty module — the try/catch behaviour
    // is unchanged. Eliminates the build warning (strict CI may treat it as fatal).
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tailwindcss/line-clamp': false,
    };
    return config;
  },
};

module.exports = nextConfig;
