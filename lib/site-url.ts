import { LEGAL_INFO } from '@/lib/legal-info';

// Single source of truth for the public origin (2026-11-19, domain switch).
//
// Every absolute URL the site emits — canonical, hreflang, Open Graph,
// JSON-LD, sitemap, links inside transactional emails, Stripe return URLs —
// is built from SITE_URL (public/llms.txt is static text; it is guarded by
// tests/e2e/domain.spec.ts instead). It is derived from
// LEGAL_INFO.brandDomain (the same constant the legal texts print), apex
// domain, no `www`, no trailing slash.
//
// Deliberately NOT read from an env var: a stale NEXT_PUBLIC_APP_URL on Vercel
// (it used to point at the old Vercel alias) would silently put the old
// domain back into customer emails. Preview/local deployments therefore also
// link to production — acceptable, they never send real customer email.
//
// Browser-side auth redirects (password reset) intentionally use
// window.location.origin instead, so the PKCE verifier cookie and the
// callback live on the same host — see components/auth/ForgotPasswordForm.tsx.
export const SITE_URL = `https://${LEGAL_INFO.brandDomain}`;
