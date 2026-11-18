// Romanian phone normalization + wa.me deep links (2026-11-18, custom orders).
//
// The accepted shapes mirror the permissive checkout rule (lib/schemas/
// checkout.ts, D5): 0xxxxxxxxx or +40xxxxxxxxx, with spaces, dots, dashes and
// parentheses ignored. Normalized form is +40XXXXXXXXX — what custom_orders
// stores (DB CHECK) and what wa.me needs (digits only, international).

const SEPARATORS = /[\s.\-()]/g;

/** '0712 345 678' | '+40 712-345-678' -> '+40712345678'; anything else -> null. */
export function normalizeRoPhone(input: string): string | null {
  const compact = input.replace(SEPARATORS, '');
  if (/^\+40\d{9}$/.test(compact)) return compact;
  if (/^0\d{9}$/.test(compact)) return `+4${compact}`;
  return null;
}

/** '+40712345678' -> '0712 345 678' (admin display). Falls back to the input. */
export function formatRoPhone(phone: string): string {
  const normalized = normalizeRoPhone(phone);
  if (!normalized) return phone;
  const local = `0${normalized.slice(3)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

/**
 * wa.me chat link for a Romanian number, optionally with a prefilled message.
 * Returns null when the number can't be normalized (caller renders plain text).
 */
export function waLink(phone: string, message?: string): string | null {
  const normalized = normalizeRoPhone(phone);
  if (!normalized) return null;
  const base = `https://wa.me/${normalized.slice(1)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
