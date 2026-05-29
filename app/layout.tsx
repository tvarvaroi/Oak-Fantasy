import { SpeedInsights } from '@vercel/speed-insights/next';

// Root layout — minimal passthrough; the real <html>/<body> live in
// [locale]/layout.tsx where fonts + global styles are bound. SpeedInsights
// is mounted HERE so it survives locale switches (RO ↔ EN) without remount
// + duplicate vitals init; the [locale] layout re-mounts on locale change.
// The component returns null and only injects its script via useEffect, so
// living outside <body> in the React tree is fine.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SpeedInsights />
    </>
  );
}
