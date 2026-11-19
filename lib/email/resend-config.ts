// SERVER ONLY. Shared Resend configuration for every transactional email
// (orders, /contact, /la-comanda). One place that reads the env, so the three
// senders cannot drift apart (2026-11-19, domain switch).
//
// Env (Vercel → Project → Settings → Environment Variables, Production):
//   RESEND_API_KEY      required; without it every email is skipped (logged).
//   RESEND_FROM_EMAIL   bare address on a domain verified in Resend, e.g.
//                       `comenzi@oakfantasy.ro`. The display name is added
//                       here ("Oak Fantasy <…>"); a value already written as
//                       `Name <address>` is tolerated (only the address is
//                       kept). Unset → Resend sandbox `onboarding@resend.dev`
//                       = TEST MODE (client emails are redirected to the admin).
//   RESEND_ADMIN_EMAIL  ONE bare address that receives admin notifications.
//                       Unset → founder's address below.
//
// Customer-facing emails set Reply-To to LEGAL_INFO.contactEmail: the sending
// domain has no mailbox, so a customer pressing "Reply" must reach a real inbox.

import { LEGAL_INFO } from '@/lib/legal-info';

export const RESEND_SANDBOX_FROM = 'onboarding@resend.dev';
const FALLBACK_ADMIN_EMAIL = 'tvarvaroi@gmail.com';

function readEnv(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v ? v : undefined;
}

/** `Name <a@b.ro>` → `a@b.ro`; a bare address is returned trimmed. */
export function bareAddress(value: string): string {
  const m = value.match(/<([^<>]+)>/);
  return (m ? m[1] : value).trim();
}

export interface ResendConfig {
  apiKey: string | undefined;
  /** Bare sender address. */
  fromEmail: string;
  /** Header value: `Oak Fantasy <fromEmail>`. */
  from: string;
  adminEmail: string;
  /** Sandbox sender — customer emails must not go to customers. */
  isTestMode: boolean;
  /** Reply-To for every customer-facing email. */
  customerReplyTo: string;
}

export function resendConfig(): ResendConfig {
  const fromEmail = bareAddress(readEnv('RESEND_FROM_EMAIL') ?? RESEND_SANDBOX_FROM);
  const adminEmail = bareAddress(readEnv('RESEND_ADMIN_EMAIL') ?? FALLBACK_ADMIN_EMAIL);
  return {
    apiKey: readEnv('RESEND_API_KEY'),
    fromEmail,
    from: `${LEGAL_INFO.brandName} <${fromEmail}>`,
    adminEmail,
    isTestMode: fromEmail === RESEND_SANDBOX_FROM,
    customerReplyTo: LEGAL_INFO.contactEmail,
  };
}
