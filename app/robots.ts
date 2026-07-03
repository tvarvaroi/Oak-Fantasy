import type { MetadataRoute } from 'next';

// ⚠️ VARIANT A — PRE-LAUNCH LOCKDOWN (SEO audit fix #2). ⚠️
//
// We are live only on the oak-fantasy.vercel.app preview domain while every
// page's canonical/hreflang already points at https://oakfantasy.ro (which
// does not resolve yet). Indexing the vercel.app origin has zero upside and
// real downside (duplicate-domain content at DNS cutover), so ALL crawlers
// are blocked.
//
// ═══ MUST-FLIP-BEFORE-LAUNCH ═══
// In the SAME PR that connects oakfantasy.ro (Vercel → Domains), replace this
// with Variant B: allow all, disallow /admin,/api,/auth + transactional pages
// (cos/cart, checkout, multumim/thank-you, auth pages), and add
// `sitemap: 'https://oakfantasy.ro/sitemap.xml'` + host. Tracked in
// _brain/notes/SECURITY_CHECKLIST.md (pre-launch) and gotchas.md.
// ════════════════════════════════

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
