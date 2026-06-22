'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { Switch } from '@/components/ui/switch';
import {
  FieldLabel,
  FieldError,
  ServerError,
  inputBaseStyle,
  errorInputStyle,
} from '@/components/auth/fields';
import ImageUpload from '@/components/admin/ImageUpload';
import {
  productSchema,
  baniToRon,
  TIERS,
  STATUSES,
  SHAPES,
  type ProductFormInput,
  type ProductFormOutput,
} from '@/lib/schemas/product';
import { createProduct, updateProduct } from '@/lib/admin/product-actions';
import type { AdminProduct } from '@/lib/admin/products';

// ── slug helper ────────────────────────────────────────────────────────────
// Romanian comma-below diacritics -> ASCII. Any other non-ASCII (incl. rare
// legacy cedilla forms) falls through to the [^a-z0-9] pass below and becomes
// a hyphen — an acceptable slug fallback.
const DIACRITICS: Record<string, string> = {
  ă: 'a', â: 'a', î: 'i', ș: 's', ț: 't',
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ăâîșț]/g, (c) => DIACRITICS[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── DB row -> form defaults (bani -> RON, nulls -> '', dims -> fields) ───────
function toFormDefaults(p?: AdminProduct): ProductFormInput {
  if (!p) {
    return {
      name_ro: '', name_en: '', slug: '', sku: '',
      tier: 'core', status: 'draft',
      price_ron: '', compare_at_price_ron: '',
      short_description_ro: '', short_description_en: '',
      long_description_ro: '', long_description_en: '',
      shape: '', length_cm: '', width_cm: '', thickness_cm: '', diameter_cm: '',
      weight_kg: '', production_time_minutes: '',
      has_engraving_option: false, engraving_price_ron: '',
      meta_title_ro: '', meta_title_en: '', meta_description_ro: '', meta_description_en: '',
      sort_order: '', hero_image_url: '', gallery_image_urls: [],
    };
  }

  const dim = (p.dimensions ?? {}) as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === 'number' ? String(v) : '');

  return {
    name_ro: p.name_ro, name_en: p.name_en, slug: p.slug, sku: p.sku,
    tier: p.tier as ProductFormInput['tier'],
    status: p.status as ProductFormInput['status'],
    price_ron: String(baniToRon(p.price_ron)),
    compare_at_price_ron: p.compare_at_price_ron != null ? String(baniToRon(p.compare_at_price_ron)) : '',
    short_description_ro: p.short_description_ro ?? '',
    short_description_en: p.short_description_en ?? '',
    long_description_ro: p.long_description_ro ?? '',
    long_description_en: p.long_description_en ?? '',
    shape: (dim.shape === 'round' || dim.shape === 'rectangular' ? dim.shape : '') as ProductFormInput['shape'],
    length_cm: num(dim.length), width_cm: num(dim.width),
    thickness_cm: num(dim.thickness), diameter_cm: num(dim.diameter),
    weight_kg: p.weight_kg != null ? String(p.weight_kg) : '',
    production_time_minutes: p.production_time_minutes != null ? String(p.production_time_minutes) : '',
    has_engraving_option: p.has_engraving_option,
    engraving_price_ron: p.engraving_price_ron != null ? String(baniToRon(p.engraving_price_ron)) : '',
    meta_title_ro: p.meta_title_ro ?? '', meta_title_en: p.meta_title_en ?? '',
    meta_description_ro: p.meta_description_ro ?? '', meta_description_en: p.meta_description_en ?? '',
    sort_order: String(p.sort_order),
    hero_image_url: p.hero_image_url ?? '',
    gallery_image_urls: p.gallery_image_urls ?? [],
  };
}

// ── section heading ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset
      style={{
        border: '1px solid rgba(92,58,32,0.18)',
        borderRadius: 10,
        padding: '20px 22px',
        backgroundColor: 'var(--paper-aged)',
      }}
    >
      <legend className="label-caps" style={{ color: 'var(--copper)', padding: '0 8px', fontSize: '0.62rem' }}>
        {title}
      </legend>
      <div className="flex flex-col gap-5">{children}</div>
    </fieldset>
  );
}

export default function ProductForm({ product }: { product?: AdminProduct }) {
  const router = useRouter();
  const mode = product ? 'edit' : 'create';
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormOutput>({
    // Cast: the schema's input (form strings) differs from its transformed
    // output (coerced numbers); the 3-generic useForm models that, but
    // zodResolver's inference needs the explicit resolver type here.
    resolver: zodResolver(productSchema) as Resolver<ProductFormInput, unknown, ProductFormOutput>,
    defaultValues: toFormDefaults(product),
    mode: 'onTouched',
  });

  // Auto-slug from name_ro until the founder edits the slug manually (create).
  const nameRo = watch('name_ro');
  useEffect(() => {
    if (!slugTouched && nameRo) {
      setValue('slug', slugify(nameRo), { shouldValidate: false });
    }
  }, [nameRo, slugTouched, setValue]);

  const heroUrl = watch('hero_image_url') ?? '';
  const galleryUrls = watch('gallery_image_urls') ?? [];
  const shape = watch('shape');
  const hasEngraving = watch('has_engraving_option');

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = product ? await updateProduct(product.id, values) : await createProduct(values);
    if (!res.ok) {
      setServerError(res.error);
      if (res.fieldErrors) {
        for (const [field, message] of Object.entries(res.fieldErrors)) {
          setError(field as keyof ProductFormInput, { message });
        }
      }
      return;
    }
    router.push('/admin/produse');
    router.refresh();
  });

  // ── small field helpers ────────────────────────────────────────────────────
  const text = (
    name: keyof ProductFormInput,
    label: string,
    opts?: { optional?: string; placeholder?: string; type?: string; step?: string },
  ) => (
    <div>
      <FieldLabel htmlFor={name} optional={opts?.optional}>
        {label}
      </FieldLabel>
      <input
        id={name}
        type={opts?.type ?? 'text'}
        step={opts?.step}
        placeholder={opts?.placeholder}
        style={errors[name] ? errorInputStyle : inputBaseStyle}
        {...register(name)}
      />
      <FieldError message={errors[name]?.message as string | undefined} />
    </div>
  );

  const area = (name: keyof ProductFormInput, label: string) => (
    <div>
      <FieldLabel htmlFor={name} optional="opțional">
        {label}
      </FieldLabel>
      <textarea
        id={name}
        rows={3}
        style={{ ...(errors[name] ? errorInputStyle : inputBaseStyle), resize: 'vertical' }}
        {...register(name)}
      />
      <FieldError message={errors[name]?.message as string | undefined} />
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6" style={{ maxWidth: 820 }}>
      <Section title="Identitate">
        <div className="grid gap-5 sm:grid-cols-2">
          {text('name_ro', 'Nume (RO)', { placeholder: 'Tocător Bucătărie Mediu' })}
          {text('name_en', 'Nume (EN)', { placeholder: 'Medium Kitchen Board' })}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <input
              id="slug"
              style={errors.slug ? errorInputStyle : inputBaseStyle}
              {...register('slug', { onChange: () => setSlugTouched(true) })}
            />
            <FieldError message={errors.slug?.message} />
          </div>
          {text('sku', 'SKU', { placeholder: 'OF-03' })}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="tier">Tier</FieldLabel>
            <select id="tier" style={inputBaseStyle} {...register('tier')}>
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <FieldError message={errors.tier?.message} />
          </div>
          <div>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <select id="status" style={inputBaseStyle} {...register('status')}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <FieldError message={errors.status?.message} />
          </div>
        </div>
      </Section>

      <Section title="Preț (în RON)">
        <div className="grid gap-5 sm:grid-cols-2">
          {text('price_ron', 'Preț (RON)', { type: 'number', step: '0.01', placeholder: '380' })}
          {text('compare_at_price_ron', 'Preț tăiat (RON)', {
            optional: 'opțional', type: 'number', step: '0.01',
          })}
        </div>
      </Section>

      <Section title="Descrieri">
        <div className="grid gap-5 sm:grid-cols-2">
          {area('short_description_ro', 'Descriere scurtă (RO)')}
          {area('short_description_en', 'Descriere scurtă (EN)')}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {area('long_description_ro', 'Descriere lungă (RO)')}
          {area('long_description_en', 'Descriere lungă (EN)')}
        </div>
      </Section>

      <Section title="Dimensiuni (cm)">
        <div>
          <FieldLabel htmlFor="shape" optional="opțional">
            Formă
          </FieldLabel>
          <select id="shape" style={inputBaseStyle} {...register('shape')}>
            <option value="">— alege —</option>
            {SHAPES.map((s) => (
              <option key={s} value={s}>
                {s === 'rectangular' ? 'dreptunghiular' : 'rotund'}
              </option>
            ))}
          </select>
        </div>
        {shape === 'round' ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {text('diameter_cm', 'Diametru (cm)', { optional: 'opțional', type: 'number', step: '0.1' })}
            {text('thickness_cm', 'Grosime (cm)', { optional: 'opțional', type: 'number', step: '0.1' })}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-3">
            {text('length_cm', 'Lungime (cm)', { optional: 'opțional', type: 'number', step: '0.1' })}
            {text('width_cm', 'Lățime (cm)', { optional: 'opțional', type: 'number', step: '0.1' })}
            {text('thickness_cm', 'Grosime (cm)', { optional: 'opțional', type: 'number', step: '0.1' })}
          </div>
        )}
      </Section>

      <Section title="Producție">
        <div className="grid gap-5 sm:grid-cols-2">
          {text('weight_kg', 'Greutate (kg)', { optional: 'opțional', type: 'number', step: '0.01' })}
          {text('production_time_minutes', 'Timp producție (minute)', {
            optional: 'opțional', type: 'number', step: '1',
          })}
        </div>
      </Section>

      <Section title="Gravare">
        <Controller
          control={control}
          name="has_engraving_option"
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Permite gravare" />
              <span className="font-lora" style={{ color: 'var(--ink)', fontSize: '0.9rem' }}>
                Permite gravare laser
              </span>
            </div>
          )}
        />
        {hasEngraving
          ? text('engraving_price_ron', 'Preț gravare (RON)', { type: 'number', step: '0.01', placeholder: '120' })
          : null}
      </Section>

      <Section title="Imagini">
        <ImageUpload
          heroUrl={heroUrl}
          galleryUrls={galleryUrls}
          onHeroChange={(url) => setValue('hero_image_url', url, { shouldDirty: true })}
          onGalleryChange={(urls) => setValue('gallery_image_urls', urls, { shouldDirty: true })}
        />
      </Section>

      <Section title="SEO (opțional)">
        <div className="grid gap-5 sm:grid-cols-2">
          {text('meta_title_ro', 'Meta titlu (RO)', { optional: 'opțional' })}
          {text('meta_title_en', 'Meta titlu (EN)', { optional: 'opțional' })}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {area('meta_description_ro', 'Meta descriere (RO)')}
          {area('meta_description_en', 'Meta descriere (EN)')}
        </div>
      </Section>

      <Section title="Ordine">
        {text('sort_order', 'Ordine afișare', { optional: 'opțional', type: 'number', step: '1' })}
      </Section>

      <ServerError message={serverError} />

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="font-caudex transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{
            backgroundColor: 'var(--oak-warm)',
            color: 'var(--cream-warm)',
            borderRadius: 6,
            letterSpacing: '0.04em',
            padding: '12px 32px',
            fontSize: '0.95rem',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 4px rgba(31,24,16,0.18)',
          }}
        >
          {isSubmitting
            ? 'Se salvează…'
            : mode === 'create'
              ? 'Creează produsul'
              : 'Salvează modificările'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/produse')}
          className="font-caudex transition-opacity hover:opacity-80"
          style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}
        >
          Anulează
        </button>
      </div>
    </form>
  );
}
