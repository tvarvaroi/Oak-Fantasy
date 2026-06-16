import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type WaitlistEntry = {
  email: string;
  language: 'ro' | 'en';
  source: 'hero' | 'waitlist';
};

export async function addToWaitlist(entry: WaitlistEntry) {
  // 2026-06-15: table renamed waitlist → email_subscribers (Etapa 2.1 schema
   // decision D3). The TypeScript symbols (WaitlistEntry, addToWaitlist) keep
   // the user-facing brand vocabulary; only the DB target changed.
  const { error } = await supabase.from('email_subscribers').insert(entry);
  if (error) {
    if (error.code === '23505') {
      // Unique violation — email already exists
      return { success: true, alreadyExists: true };
    }
    throw error;
  }
  return { success: true, alreadyExists: false };
}
