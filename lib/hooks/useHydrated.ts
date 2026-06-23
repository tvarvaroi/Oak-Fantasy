'use client';

import { useEffect, useState } from 'react';

// Returns false during SSR + the first client render, true after mount. Use it
// to gate any UI derived from client-only state (persisted Zustand cart) so the
// server HTML and the first client render match — preventing the persisted-store
// hydration mismatch (React #418), the global lesson from the SpeedInsights saga.
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
