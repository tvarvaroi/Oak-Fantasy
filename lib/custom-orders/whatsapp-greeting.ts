import { waLink } from '@/lib/whatsapp';

// First message the founder sends when opening the customer's WhatsApp chat
// from admin (detail page button + admin email). Written in the language of
// the page the request came from (custom_orders.locale).
const GREETING = {
  ro: (name: string) => `Bună, ${name}, sunt de la Oak Fantasy. Am primit ideea ta de pe site.`,
  en: (name: string) => `Hi ${name}, this is Oak Fantasy. We got your idea from our website.`,
} as const;

export function customerGreeting(
  phone: string,
  name: string,
  locale: string,
): string | null {
  const lang = locale === 'en' ? 'en' : 'ro';
  return waLink(phone, GREETING[lang](name.trim()));
}
