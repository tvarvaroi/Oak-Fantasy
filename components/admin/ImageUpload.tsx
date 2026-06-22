'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2 } from 'lucide-react';

import { createClient } from '@/lib/supabase-client';

// Self-contained product image upload (D7). Uploads straight from the browser
// to the public 'product-images' Storage bucket using the admin's authenticated
// session (RLS "Admin insert/delete product images" gates it — D4). Stores the
// resulting public URLs; the catalog never references external URLs. Removing
// an image also deletes the object from Storage (no orphan files).

const BUCKET = 'product-images';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (D7)
const ACCEPT = 'image/jpeg,image/png,image/webp';
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function pathFromPublicUrl(url: string): string | null {
  const marker = `/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}

function validate(file: File): string | null {
  if (!EXT_BY_MIME[file.type]) return 'Format acceptat: JPG, PNG sau WebP.';
  if (file.size > MAX_BYTES) return 'Fișierul depășește 5 MB.';
  return null;
}

async function uploadFile(file: File): Promise<string> {
  const supabase = createClient();
  const ext = EXT_BY_MIME[file.type];
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function removeFromStorage(url: string): Promise<void> {
  const path = pathFromPublicUrl(url);
  if (!path) return;
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove([path]);
}

function Thumb({ url, onRemove }: { url: string; onRemove: () => void }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 96, height: 96, borderRadius: 8, border: '1px solid rgba(92,58,32,0.2)' }}
    >
      <Image src={url} alt="" fill sizes="96px" style={{ objectFit: 'cover' }} />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Șterge imaginea"
        className="absolute top-1 right-1 flex items-center justify-center transition-opacity hover:opacity-90"
        style={{ width: 22, height: 22, borderRadius: 999, backgroundColor: 'rgba(31,24,16,0.78)', color: '#fff' }}
      >
        <X size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function DropButton({
  label,
  busy,
  onPick,
}: {
  label: string;
  busy: boolean;
  onPick: (files: FileList) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => ref.current?.click()}
        className="flex flex-col items-center justify-center gap-1.5 transition-colors hover:bg-[rgba(184,115,51,0.06)] disabled:opacity-60"
        style={{
          width: 96,
          height: 96,
          borderRadius: 8,
          border: '1px dashed var(--oak-warm)',
          color: 'var(--oak-warm)',
        }}
      >
        {busy ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} strokeWidth={1.75} />}
        <span className="font-lora" style={{ fontSize: '0.68rem', textAlign: 'center', lineHeight: 1.2 }}>
          {busy ? 'Se încarcă…' : label}
        </span>
      </button>
      <input
        ref={ref}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) onPick(e.target.files);
          e.target.value = '';
        }}
      />
    </>
  );
}

export default function ImageUpload({
  heroUrl,
  galleryUrls,
  onHeroChange,
  onGalleryChange,
}: {
  heroUrl: string;
  galleryUrls: string[];
  onHeroChange: (url: string) => void;
  onGalleryChange: (urls: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleHero = async (files: FileList) => {
    const file = files[0];
    const invalid = validate(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      if (heroUrl) await removeFromStorage(heroUrl);
      onHeroChange(await uploadFile(file));
    } catch {
      setError('Încărcarea a eșuat. Verifică conexiunea și încearcă din nou.');
    } finally {
      setBusy(false);
    }
  };

  const handleGallery = async (files: FileList) => {
    const list = Array.from(files);
    for (const f of list) {
      const invalid = validate(f);
      if (invalid) {
        setError(invalid);
        return;
      }
    }
    setError(null);
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const f of list) uploaded.push(await uploadFile(f));
      onGalleryChange([...galleryUrls, ...uploaded]);
    } catch {
      setError('Încărcarea a eșuat. Verifică conexiunea și încearcă din nou.');
    } finally {
      setBusy(false);
    }
  };

  const removeHero = async () => {
    const url = heroUrl;
    onHeroChange('');
    await removeFromStorage(url);
  };

  const removeGallery = async (url: string) => {
    onGalleryChange(galleryUrls.filter((u) => u !== url));
    await removeFromStorage(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-caps mb-2" style={{ color: 'var(--ink-soft)', fontSize: '0.62rem' }}>
          Imagine principală (thumbnail)
        </p>
        <div className="flex flex-wrap gap-3">
          {heroUrl ? <Thumb url={heroUrl} onRemove={removeHero} /> : null}
          <DropButton label={heroUrl ? 'Înlocuiește' : 'Încarcă'} busy={busy} onPick={handleHero} />
        </div>
      </div>

      <div>
        <p className="label-caps mb-2" style={{ color: 'var(--ink-soft)', fontSize: '0.62rem' }}>
          Galerie (opțional)
        </p>
        <div className="flex flex-wrap gap-3">
          {galleryUrls.map((url) => (
            <Thumb key={url} url={url} onRemove={() => removeGallery(url)} />
          ))}
          <DropButton label="Adaugă" busy={busy} onPick={handleGallery} />
        </div>
      </div>

      {error ? (
        <p className="font-lora" style={{ fontSize: '0.82rem', color: '#9F2D20' }} role="alert">
          {error}
        </p>
      ) : null}
      <p className="font-lora" style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', opacity: 0.8 }}>
        JPG, PNG sau WebP · maximum 5 MB per imagine.
      </p>
    </div>
  );
}
