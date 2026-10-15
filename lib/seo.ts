// Shared SEO constants (2026-10-15, QA & Polish #16).
//
// OG_IMAGE_DEFAULT: the composed 1200×630 OpenGraph card (product photo +
// brand coin + tagline) generated once with `next/og` ImageResponse and
// committed as a static asset. Used by the [locale] layout (homepage) and
// every interior page that has no image of its own. Product detail pages
// keep their own product photo as og:image.
//
// Before: all pages pointed at the square 1254×1254 brand JPEG while
// declaring width 1200 / height 630 — a ratio mismatch that rendered as a
// cropped/letterboxed logo in link previews.
export const OG_IMAGE_DEFAULT = '/og/oak-fantasy-og.png';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
