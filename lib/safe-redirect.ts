// Open-redirect guard for user-supplied "where to go next" values
// (/auth/signout `redirectTo`, /auth/callback `next`). 2026-11-19.
//
// `startsWith('/') && !startsWith('//')` is not enough: browsers and the URL
// parser treat `\` as `/` and drop tab/newline characters, so `/\evil.com`
// or `/\t/evil.com` resolve to https://evil.com. Instead we reject backslashes
// and control characters outright, resolve the value against the current
// origin and accept it only if the origin did not change. Returns a
// same-origin path (pathname + search + hash) or the fallback.
export function safeRedirectPath(value: unknown, fallback: string, base: string): string {
  if (typeof value !== 'string' || !value.startsWith('/')) return fallback;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  let origin: string;
  let url: URL;
  try {
    origin = new URL(base).origin;
    url = new URL(value, origin);
  } catch {
    return fallback;
  }
  if (url.origin !== origin) return fallback;
  return `${url.pathname}${url.search}${url.hash}`;
}
