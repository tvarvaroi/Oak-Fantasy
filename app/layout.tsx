// Root layout — minimal passthrough. The real <html>/<body> live in
// [locale]/layout.tsx (fonts + global styles), and the non-locale segments
// (/admin, /auth) provide their own.
//
// NOTE: <SpeedInsights /> used to live HERE, as a sibling of <html>. Since
// @vercel/speed-insights@2.0.0 the component renders a <Suspense> boundary
// (it reads useSearchParams), and a Suspense boundary outside <html> cannot be
// hydrated — it caused a document-level hydration mismatch (React #418/#423)
// on EVERY page. It now lives inside <body> in [locale]/layout.tsx. Do NOT
// render elements that produce DOM/Suspense here, outside <html>.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
