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
import { CARD_PAYMENTS_ENABLED, DEFAULT_PAYMENT_METHOD } from '@/lib/config/payments';
import { placeOrder } from '@/lib/orders/place-order';
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

// Step flow (2026-10-15, founder decision: ramburs only). With card payments
// dormant the "Plată" step is gone: Livrare → Rezumat. With the flag on, the
// original 3-step flow (Livrare → Plată → Rezumat) comes back untouched.
type StepKind = 'shipping' | 'payment' | 'review';
const STEPS: StepKind[] = CARD_PAYMENTS_ENABLED
  ? ['shipping', 'payment', 'review']
  : ['shipping', 'review'];
// Fields validated before leaving each step (review has the terms checkbox,
// validated by the final submit).
const FIELDS_BY_KIND: Record<StepKind, (keyof CheckoutData)[]> = {
  shipping: STEP_FIELDS[1],
  payment: STEP_FIELDS[2],
  review: [],
};

export default function CheckoutContent({ locale, prefill }: { locale: Locale; prefill: CheckoutPrefill }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const c = CHECKOUT_CONTENT[locale];

  const [step, setStep] = useState(1); // 1-based index into STEPS
  const kind = STEPS[step - 1];
  const lastStep = STEPS.length;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      paymentMethod: DEFAULT_PAYMENT_METHOD,
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
    const fields = FIELDS_BY_KIND[kind];
    const valid = fields.length ? await methods.trigger(fields) : true;
    if (valid) setStep((s) => Math.min(lastStep, s + 1));
  };

  const submitOrder = methods.handleSubmit(async (data) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await placeOrder({
        checkout: data,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, engravingText: i.engraving?.text })),
        locale,
      });
      if (!res.ok) {
        const map: Record<string, string> = {
          unavailable: c.errors.unavailable,
          out_of_stock: c.errors.outOfStock,
          stripe_unconfigured: c.errors.paymentUnavailable,
          stripe_failed: c.errors.paymentUnavailable,
          stripe_no_url: c.errors.paymentUnavailable,
        };
        setError(map[res.error] ?? c.errors.generic);
        setSubmitting(false);
        return;
      }
      // Success — redirect (keep submitting=true through the navigation).
      if (res.mode === 'stripe') {
        window.location.href = res.url;
      } else {
        router.push(res.path);
      }
    } catch {
      setError(c.errors.generic);
      setSubmitting(false);
    }
  });

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < lastStep) {
      void goNext();
    } else {
      void submitOrder();
    }
  };

  const stepLabels = STEPS.map((k) => c.steps[k]);

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
                <StepIndicator current={step} labels={stepLabels} />

                {kind === 'shipping' ? (
                  <ShippingStep content={c} locale={locale} isLoggedIn={prefill.isLoggedIn} email={prefill.email} />
                ) : null}
                {/* PaymentStep stays dormant: only mounted when card payments are enabled. */}
                {kind === 'payment' ? <PaymentStep content={c} locale={locale} subtotalBani={subtotal} /> : null}
                {kind === 'review' ? <ReviewStep content={c} locale={locale} items={items} subtotalBani={subtotal} /> : null}

                {/* Nav */}
                <div className="flex items-center justify-between gap-4" style={{ marginTop: 32 }}>
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => Math.max(1, s - 1))}
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
                    disabled={submitting}
                    className="font-caudex transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
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
                    {step < lastStep ? c.continue : submitting ? c.placing : c.placeOrder}
                  </button>
                </div>

                {error ? (
                  <p className="font-lora text-right" style={{ marginTop: 12, fontSize: '0.85rem', color: '#9F2D20' }} role="alert">
                    {error}
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
