import { NextResponse } from 'next/server';
import { Resend } from 'resend';

import ContactAdminEmail from '@/emails/ContactAdminEmail';
import ContactAutoReplyEmail from '@/emails/ContactAutoReplyEmail';
import { LEGAL_INFO } from '@/lib/legal-info';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import {
  SUBJECT_LABELS,
  contactFormSchema,
} from '@/lib/schemas/contact';

// Force the route to run on the Node runtime so React Email's render and
// the Resend SDK behave consistently.
export const runtime = 'nodejs';
// Never cache responses — this is a write endpoint.
export const dynamic = 'force-dynamic';

const MAX_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;
const MIN_FORM_FILL_MS = 2000;

const RESEND_SANDBOX_DOMAIN = 'onboarding@resend.dev';

function envOr(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.length > 0 ? v : fallback;
}

// Standard JSON response helper — keeps headers consistent.
function json(
  data: Record<string, unknown>,
  init: { status: number; headers?: Record<string, string> } = { status: 200 },
) {
  return NextResponse.json(data, {
    status: init.status,
    headers: { 'Cache-Control': 'no-store', ...init.headers },
  });
}

export async function POST(request: Request) {
  // ── Rate limit ────────────────────────────────────────────────────────
  // See lib/rate-limit.ts for honest threat-model notes. This protects
  // against accidental double-submit on a warm function; not a real
  // defense in production. SECURITY_CHECKLIST §6 tracks the Upstash
  // migration as a pre-launch blocker.
  const ip = getClientIp(request);
  const rl = rateLimit(`contact:${ip}`, MAX_PER_HOUR, HOUR_MS);
  if (!rl.success) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
    return json(
      { error: 'rate_limited', retryAfter },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      },
    );
  }

  // ── Parse + validate ─────────────────────────────────────────────────
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.errors.forEach((issue) => {
      const key = issue.path.join('.') || '_root';
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    });
    return json(
      { error: 'validation', fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // ── Bot defense layer 1: honeypot ─────────────────────────────────────
  // Real users never see the `website` field. If anything is in it, we
  // simulate success so the bot doesn't learn it was rejected, but skip
  // all real work.
  if (data.website && data.website.length > 0) {
    console.warn(`[contact] honeypot triggered ip=${ip} name=${data.name}`);
    return json({ success: true });
  }

  // ── Bot defense layer 2: timing check ─────────────────────────────────
  // Anything submitted faster than 2 seconds after page mount is treated
  // as a bot. Same silent-success response so we don't leak the heuristic.
  if (
    typeof data.elapsedMs === 'number' &&
    data.elapsedMs < MIN_FORM_FILL_MS
  ) {
    console.warn(
      `[contact] timing-check triggered ip=${ip} elapsedMs=${data.elapsedMs}`,
    );
    return json({ success: true });
  }

  // ── Resend configuration ──────────────────────────────────────────────
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY missing — cannot send email');
    return json({ error: 'server_misconfigured' }, { status: 500 });
  }

  const fromEmail = envOr('RESEND_FROM_EMAIL', RESEND_SANDBOX_DOMAIN);
  const adminEmail = envOr('RESEND_ADMIN_EMAIL', 'tvarvaroi@gmail.com');
  const isTestMode = fromEmail === RESEND_SANDBOX_DOMAIN;

  const resend = new Resend(apiKey);

  const submittedAt = new Date().toISOString();
  const subjectLabel = SUBJECT_LABELS[data.locale][data.subject];

  // ── 1. Admin notification ─────────────────────────────────────────────
  try {
    const adminResult = await resend.emails.send({
      from: `${LEGAL_INFO.brandName} <${fromEmail}>`,
      to: adminEmail,
      replyTo: data.email,
      subject: `[${LEGAL_INFO.brandName}] ${subjectLabel} — ${data.name}`,
      react: ContactAdminEmail({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        subject: data.subject,
        message: data.message,
        locale: data.locale,
        submittedAt,
        ip,
        testMode: isTestMode,
      }),
    });

    if (adminResult.error) {
      console.error('[contact] admin email failed:', adminResult.error);
      return json({ error: 'send_failed' }, { status: 500 });
    }
  } catch (err) {
    console.error('[contact] admin email exception:', err);
    return json({ error: 'send_failed' }, { status: 500 });
  }

  // ── 2. User auto-reply (skipped in Resend sandbox / test mode) ────────
  // Resend free + unverified domain only allows sends to the account
  // owner's email. Sending to a stranger fails with 403/422. Until
  // oakfantasy.ro is verified in Resend, we just log and move on — the
  // user UI still shows success because the admin got the message and
  // will reply manually. SECURITY_CHECKLIST §1.1 tracks the domain setup
  // as a pre-launch blocker.
  if (!isTestMode) {
    try {
      const replyResult = await resend.emails.send({
        from: `${LEGAL_INFO.brandName} <${fromEmail}>`,
        to: data.email,
        subject:
          data.locale === 'ro'
            ? `Mulțumim pentru mesaj — ${LEGAL_INFO.brandName}`
            : `Thanks for your message — ${LEGAL_INFO.brandName}`,
        react: ContactAutoReplyEmail({
          name: data.name,
          locale: data.locale,
        }),
      });

      if (replyResult.error) {
        // Don't fail the request — admin email already went through. The
        // founder will see the warning banner in the admin email and
        // reply manually.
        console.warn(
          '[contact] auto-reply failed (non-fatal):',
          replyResult.error,
        );
      }
    } catch (err) {
      console.warn('[contact] auto-reply exception (non-fatal):', err);
    }
  } else {
    console.warn(
      `[contact] TEST MODE: auto-reply to ${data.email} skipped. Pre-launch: setup ${LEGAL_INFO.brandDomain} domain in Resend.`,
    );
  }

  return json({ success: true });
}
