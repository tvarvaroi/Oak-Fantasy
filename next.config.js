/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
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
