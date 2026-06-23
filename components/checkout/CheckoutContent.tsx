'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { localizedPath, type Locale } from '@/lib/i18n-routes';
import { useCartStore, cartSubtotal } from '@/lib/store/cart';
import { useHydrated } from '@/lib/hooks/useHydrated';
import { checkoutSchema, STEP_FIELDS, type CheckoutData } from '@/lib/schemas/checkout';
import { CHECKOUT_CONTENT } from './content';
import StepIndicator from './StepIndicator';
import ShippingStep from './ShippingStep';
import PaymentStep from './PaymentStep';
import ReviewStep from './ReviewStep';

export interface CheckoutPrefill {
  isLoggedIn: boolean;
  email?: string;
  fullName?: string;
  phone?: string;
}

export default function CheckoutContent({ locale, prefill }: { locale: Locale; prefill: CheckoutPrefill }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const c = CHECKOUT_CONTENT[locale];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [placed, setPlaced] = useState(false);

  const methods = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: {
      email: prefill.email ?? '',
      fullName: prefill.fullName ?? '',
      phone: prefill.phone ?? '',
      street: '',
      city: '',
      county: '',
      postalCode: '',
      notes: '',
      paymentMethod: 'cod',
      termsAccepted: false,
    },
  });

  // Cart guard: empty after hydration → back to /cos (can't checkout nothing).
  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace(localizedPath('cos', locale));
    }
  }, [hydrated, items.length, locale, router]);

  const subtotal = cartSubtotal(items);

  const goNext = async () => {
    const valid = await methods.trigger(STEP_FIELDS[step as 1 | 2]);
    if (valid) setStep((s) => Math.min(3, s + 1) as 1 | 2 | 3);
  };

  const submitOrder = methods.handleSubmit(() => {
    // D8 — placeholder. Order creation + payment land in Task 3.4 / 3.5.
    setPlaced(true);
  });

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      void goNext();
    } else {
      void submitOrder();
    }
  };

  const toggleLanguage = () => router.push(localizedPath('checkout', locale === 'ro' ? 'en' : 'ro'));

  const ready = hydrated && items.length > 0;

  return (
    <div>
      <Navbar language={locale} onToggleLanguage={toggleLanguage} />
      <main style={{ backgroundColor: 'var(--cream-warm)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(90px, 12vw, 130px) clamp(20px, 5vw, 56px) clamp(48px, 8vw, 90px)' }}>
          <h1 className="font-caudex" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--oak-deep)', fontWeight: 700, marginBottom: 28 }}>
            {c.pageTitle}
          </h1>

          {!ready ? (
            <div style={{ minHeight: 300 }} aria-hidden />
          ) : (
            <FormProvider {...methods}>
              <form onSubmit={onFormSubmit} noValidate>
                <StepIndicator current={step} labels={[c.steps.shipping, c.steps.payment, c.steps.review]} />

                {step === 1 ? (
                  <ShippingStep content={c} locale={locale} isLoggedIn={prefill.isLoggedIn} email={prefill.email} />
                ) : null}
                {step === 2 ? <PaymentStep content={c} locale={locale} subtotalBani={subtotal} /> : null}
                {step === 3 ? <ReviewStep content={c} locale={locale} items={items} subtotalBani={subtotal} /> : null}

                {/* Nav */}
                <div className="flex items-center justify-between gap-4" style={{ marginTop: 32 }}>
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3)}
                      className="font-caudex transition-opacity hover:opacity-70"
                      style={{ color: 'var(--ink-soft)', fontSize: '0.95rem' }}
                    >
                      ← {c.back}
                    </button>
                  ) : (
                    <span />
                  )}

                  <button
                    type="submit"
                    className="font-caudex transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                    style={{
                      backgroundColor: 'var(--oak-warm)',
                      color: 'var(--cream-warm)',
                      borderRadius: 8,
                      letterSpacing: '0.03em',
                      padding: '14px 34px',
                      fontSize: '0.98rem',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 6px rgba(31,24,16,0.2)',
                    }}
                  >
                    {step < 3 ? c.continue : c.placeOrder}
                  </button>
                </div>

                {placed ? (
                  <p className="font-lora text-right" style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--ink-soft)' }} role="status">
                    {c.placeOrderComingSoon}
                  </p>
                ) : null}
              </form>
            </FormProvider>
          )}
        </div>
      </main>
      <Footer language={locale} />
    </div>
  );
}
