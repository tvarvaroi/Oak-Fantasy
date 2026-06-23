// Path-localized routing for the custom i18n setup.
//
// The project uses route-based i18n: app/[locale]/<segment>. The Next.js
// route folder name is the canonical (RO) slug. EN exposes a localized public
// URL whose slug differs; middleware.ts rewrites the localized EN URL onto the
// canonical RO segment and redirects wrong-locale slugs to avoid duplicates.
//
//   RO public: /ro/despre   -> serves app/[locale]/despre (locale=ro)
//   EN public: /en/about    -> rewritten to /en/despre (same route folder)

export const LOCALES = ['ro', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ro';

/**
 * Localized first-path-segment per route key.
 * `ro` doubles as the internal Next.js route folder name
 * (app/[locale]/<ro slug>/page.tsx).
 */
export const PATHNAMES = {
  despre: { ro: 'despre', en: 'about' },
  atelier: { ro: 'atelier', en: 'workshop' },
  tocatoare: { ro: 'tocatoare', en: 'cutting-boards' },
  // `contact` slug intentionally identical across locales — same word
  // in RO and EN. Codified explicitly so the route is registered with
  // the middleware audit and shows up in localizedPath().
  contact: { ro: 'contact', en: 'contact' },
  // Cart (Task 3.2). RO /cos, EN /cart — middleware rewrites EN onto the
  // canonical /cos route folder.
  cos: { ro: 'cos', en: 'cart' },
  // Checkout (Task 3.3). Same word RO/EN.
  checkout: { ro: 'checkout', en: 'checkout' },
  // Legal pages. RO/EN slugs differ to match natural reading
  // conventions in each market. Folder names follow RO slug per the
  // PATHNAMES contract above.
  terms: { ro: 'termeni', en: 'terms' },
  privacy: { ro: 'confidentialitate', en: 'privacy' },
  returns: { ro: 'retur', en: 'returns' },
  // Auth pages (Task 2.2). `login` shared across locales; the rest use
  // natural EN slugs. Folder names follow the RO slug.
  login: { ro: 'login', en: 'login' },
  register: { ro: 'inregistrare', en: 'register' },
  forgotPassword: { ro: 'parola-uitata', en: 'forgot-password' },
  resetPassword: { ro: 'reset-parola', en: 'reset-password' },
} as const;

export type RouteKey = keyof typeof PATHNAMES;

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Public, locale-prefixed URL for a route. ('despre','en') -> '/en/about' */
export function localizedPath(key: RouteKey, locale: Locale): string {
  return `/${locale}/${PATHNAMES[key][locale]}`;
}

/**
 * Canonical internal path Next.js actually serves (RO slug for every locale).
 * ('despre','en') -> '/en/despre'
 */
export function canonicalPath(key: RouteKey, locale: Locale): string {
  return `/${locale}/${PATHNAMES[key].ro}`;
}

/**
 * Resolve a first path segment (after the locale prefix) to its route key,
 * whichever locale's slug was used. 'about' -> 'despre', 'despre' -> 'despre'.
 * Returns null for unknown segments (homepage, future routes).
 */
export function routeKeyForSlug(slug: string): RouteKey | null {
  for (const key of Object.keys(PATHNAMES) as RouteKey[]) {
    const map = PATHNAMES[key];
    if (slug === map.ro || slug === map.en) return key;
  }
  return null;
}
