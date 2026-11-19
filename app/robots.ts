import type { MetadataRoute } from 'next';

// ⚠️ VARIANT A — PRE-LAUNCH LOCKDOWN (SEO audit fix #2). ⚠️
//
// oakfantasy.ro is connected (2026-11-19) and every canonical/hreflang/sitemap
// URL points at it, but the shop is not launched yet, so ALL crawlers stay
// blocked. The founder decides the launch; until then this file does not change.
//
// ═══ MUST-FLIP-AT-LAUNCH (only on the founder's explicit "lansăm") ═══
// Variant B: allow all, disallow /admin, /api, /auth + transactional pages
// (cos/cart, checkout, multumim/thank-you, auth pages), and add
// sitemap = `${SITE_URL}/sitemap.xml` + host. Prepared as a separate
// commit (branch launch/robots-allow). Tracked in
// _brain/notes/SECURITY_CHECKLIST.md (pre-launch) and gotchas.md.
// ═════════════════════════════════════════════════════════════════════

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
    // No sitemap reference while everything is blocked (Variant A). The
    // sitemap itself (app/sitemap.ts) is already built and live for launch.
  };
}
