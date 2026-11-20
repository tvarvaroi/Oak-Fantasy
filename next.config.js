/** @type {import('next').NextConfig} */
const path = require('path');

// Content-Security-Policy (SEO audit #8). Report-Only from 2026-07-06; ENFORCED
// in production from 2026-11-19 after a live check of 25 pages on
// oakfantasy.ro with zero Report-Only violations (scripts/smoke-domain.mjs).
//   - production build on Vercel Production (and local `next start`): enforced
//   - Vercel Preview: Report-Only (keeps the Vercel toolbar / comments working)
//   - `next dev`: Report-Only + 'unsafe-eval' (dev React refresh uses eval)
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
// - Stripe: hosted Checkout = full-page redirect, NO Stripe JS on our pages
//   → no stripe.com sources needed
// - 2026-10-15: Three.js/R3F removed from the site (hero is a static logo
//   now) → the defensive `blob:` worker allowance for drei loaders is gone.
const IS_DEV = process.env.NODE_ENV !== 'production';
const ENFORCE_CSP = !IS_DEV && process.env.VERCEL_ENV !== 'preview';

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${IS_DEV ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com",
  "worker-src 'self'",
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
  {
    key: ENFORCE_CSP ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only',
    value: CSP,
  },
];

// Domain switch (2026-11-19): the old production alias permanently redirects
// to the apex domain, path + query preserved, so old links, bookmarks and any
// stale email link land on oakfantasy.ro. Exact host match only — preview
// deployments (other *.vercel.app hosts) keep working. next.config is CJS and
// cannot import lib/site-url.ts; tests/e2e/domain.spec.ts asserts this
// destination stays equal to SITE_URL.
const LEGACY_HOST = 'oak-fantasy.vercel.app';
const CANONICAL_ORIGIN = 'https://oakfantasy.ro';

const nextConfig = {
  reactStrictMode: true,
  // 404 for dotted junk paths (/.env, /x.php, /wp-login.php …), 2026-11-19.
  // The middleware matcher skips dotted paths, so they used to reach the
  // [locale] layout with locale=".env"; its notFound() then rendered the root
  // app/not-found.tsx through Next's error shell, which loads NO stylesheet
  // (unstyled page). afterFiles rewrites run after public files and app
  // metadata routes (llms.txt, images, robots.txt, sitemap.xml are served
  // first) and before dynamic routes, so only unmatched paths are sent to
  // /ro/<path> → app/[locale]/[...rest] → the branded, localized 404 (status 404).
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          // Non-dotted paths never get here: middleware already redirected them
          // to /ro/…; this catches dotted ones at any depth (/wp-admin/x.php).
          // robots.txt/sitemap.xml/favicon/icons/manifest are app metadata routes:
          // `next dev` matches them
          // AFTER afterFiles rewrites, so they are excluded explicitly.
          // The lookahead sees the REST of the path, so each excluded segment
          // must be followed by "/" or the end (`en$` alone let /en/about through).
          source: '/:first((?!(?:ro|en|_next|api|auth|admin|robots\.txt|sitemap\.xml|favicon\.ico|icon\.png|apple-icon\.png|manifest\.webmanifest)(?:/|$))[^/]+)/:rest*',
          destination: '/ro/:first/:rest*',
        },
      ],
      fallback: [],
    };
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: LEGACY_HOST }],
        destination: `${CANONICAL_ORIGIN}/:path*`,
        permanent: true,
      },
    ];
  },
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
  transpilePackages: ['framer-motion', 'gsap'],
  experimental: {
    // Build warning root cause (2026-10-15): `@react-email/components` is a
    // barrel that re-exports <Tailwind>, which imports `tailwindcss` at
    // runtime; tailwindcss/lib/lib/load-config.js has a dynamic require()
    // that webpack flags as "Critical dependency: the request of a dependency
    // is an expression" when bundled into the /api/contact route handler.
    // We never use <Tailwind> in emails/ (inline palette). Keeping the
    // package external makes Node require() it from node_modules at runtime
    // instead of bundling it — warning gone, output identical.
    serverComponentsExternalPackages: ['@react-email/components', '@react-email/tailwind'],
  },
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
