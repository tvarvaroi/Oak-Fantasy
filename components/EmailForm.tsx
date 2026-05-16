'use client';

import { useState, FormEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { addToWaitlist } from '@/lib/supabase';

interface EmailFormProps {
  source: 'hero' | 'waitlist';
  language: 'ro' | 'en';
  large?: boolean;
}

export default function EmailForm({ source, language, large = false }: EmailFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const prefersReducedMotion = useReducedMotion();

  const copy = {
    placeholder: language === 'ro' ? 'adresa ta de email' : 'your email address',
    button: language === 'ro' ? 'Anunță-mă' : 'Notify me',
    loading: language === 'ro' ? 'Se trimite...' : 'Sending...',
    success: language === 'ro' ? 'Mulțumim! Vom păstra legătura.' : 'Thank you! We\'ll be in touch.',
    errorInvalid: language === 'ro' ? 'Introdu o adresă validă de email.' : 'Please enter a valid email.',
    errorGeneric: language === 'ro' ? 'A apărut o eroare. Încearcă din nou.' : 'Something went wrong. Try again.',
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg(copy.errorInvalid);
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      await addToWaitlist({ email, language, source });
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMsg(copy.errorGeneric);
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`flex items-center gap-3 ${large ? 'py-4' : 'py-3'}`}
        style={{ color: 'var(--forest-mid)' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke="var(--forest-mid)" strokeWidth="1.5" />
          <path d="M6 10l3 3 5-6" stroke="var(--forest-mid)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-lora" style={{ fontFamily: 'var(--font-lora)', fontSize: large ? '1.05rem' : '0.9rem' }}>
          {copy.success}
        </span>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`flex gap-2 ${large ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row'}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
          placeholder={copy.placeholder}
          required
          className={`flex-1 font-lora outline-none transition-all duration-200 focus:ring-1 ${
            large ? 'px-5 py-3.5 text-base' : 'px-4 py-2.5 text-sm'
          }`}
          style={{
            fontFamily: 'var(--font-lora)',
            backgroundColor: 'var(--cream-warm)',
            color: 'var(--ink)',
            border: `1px solid ${status === 'error' ? '#c0392b' : 'var(--oak-warm)'}`,
            borderRadius: '6px',
            boxShadow: 'inset 0 1px 3px rgba(31,24,16,0.07)',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className={`font-caudex transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-60 whitespace-nowrap ${
            large ? 'px-8 py-3.5 text-base' : 'px-6 py-2.5 text-sm'
          }`}
          style={{
            backgroundColor: 'var(--oak-warm)',
            color: 'var(--cream-warm)',
            borderRadius: '6px',
            fontFamily: 'var(--font-caudex)',
            letterSpacing: '0.04em',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 4px rgba(31,24,16,0.18)',
          }}
        >
          {status === 'loading' ? copy.loading : copy.button}
        </button>
      </div>
      {status === 'error' && errorMsg && (
        <p className="mt-1.5 text-xs font-lora" style={{ color: '#c0392b', fontFamily: 'var(--font-lora)' }}>
          {errorMsg}
        </p>
      )}
    </form>
  );
}
