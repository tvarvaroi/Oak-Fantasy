// SERVER ONLY. Admin email for a new /la-comanda request (2026-11-18).
//
// Best-effort, same contract as lib/orders/send-order-emails.ts: every failure
// is caught and logged; this function NEVER throws, so the request (already
// saved in custom_orders) and the visitor's confirmation never depend on
// Resend. The admin sidebar badge is the primary signal; email is a bonus.
//
// Recipient: RESEND_ADMIN_EMAIL (fallback: founder gmail, same as /api/contact).
// Sender: RESEND_FROM_EMAIL (fallback: Resend sandbox onboarding@resend.dev,
// which only delivers to the Resend account owner — fine for an admin email).

import { Resend } from 'resend';

import CustomOrderAdmin from '@/emails/CustomOrderAdmin';
import { LEGAL_INFO } from '@/lib/legal-info';
import { formatRoPhone } from '@/lib/whatsapp';
import { customerGreeting } from './whatsapp-greeting';

const RESEND_SANDBOX_DOMAIN = 'onboarding@resend.dev';

function envOr(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.length > 0 ? v : fallback;
}

function appOrigin(): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  return (env || 'https://oak-fantasy.vercel.app').replace(/\/$/, '');
}

export async function notifyAdminOfCustomOrder(request: {
  id: string;
  name: string;
  phone: string;
  idea: string;
  locale: 'ro' | 'en';
  createdAt: string;
}): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('[custom-order] RESEND_API_KEY missing — admin email skipped');
      return;
    }

    const fromEmail = envOr('RESEND_FROM_EMAIL', RESEND_SANDBOX_DOMAIN);
    const adminEmail = envOr('RESEND_ADMIN_EMAIL', 'tvarvaroi@gmail.com');
    const submittedAt = new Intl.DateTimeFormat('ro-RO', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Bucharest',
    }).format(new Date(request.createdAt));

    const result = await new Resend(apiKey).emails.send({
      from: `${LEGAL_INFO.brandName} <${fromEmail}>`,
      to: adminEmail,
      subject: `[${LEGAL_INFO.brandName}] Cerere la comandă — ${request.name}`,
      react: CustomOrderAdmin({
        name: request.name,
        phoneDisplay: formatRoPhone(request.phone),
        whatsappUrl: customerGreeting(request.phone, request.name, request.locale),
        idea: request.idea,
        locale: request.locale,
        submittedAt,
        adminUrl: `${appOrigin()}/admin/comenzi-custom/${request.id}`,
      }),
    });

    if (result.error) {
      console.error('[custom-order] admin email failed (non-fatal):', result.error);
    }
  } catch (err) {
    console.error('[custom-order] admin email exception (non-fatal):', err);
  }
}
