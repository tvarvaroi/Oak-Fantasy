'use client';

// Vercel Web Analytics (2026-11-20). Client wrapper because `beforeSend` is a
// function and cannot be passed from the server layout.
//
// - Rendered only in production builds: in development the package loads a
//   debug script from va.vercel-scripts.com (an external host our CSP does not
//   allow) and only logs to the console.
// - In production the script and the beacons are same-origin
//   (/_vercel/insights/* or the build-generated path), so the CSP needs no
//   extra source.
// - `beforeSend` drops /admin and strips every identifier from the URL — see
//   lib/analytics/redact-url.ts.

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next';
import { redactAnalyticsUrl } from '@/lib/analytics/redact-url';

function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = redactAnalyticsUrl(event.url);
  return url === null ? null : { ...event, url };
}

export default function WebAnalytics() {
  if (process.env.NODE_ENV !== 'production') return null;
  return <Analytics beforeSend={beforeSend} />;
}
