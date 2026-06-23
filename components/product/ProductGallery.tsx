'use client';

import { useState } from 'react';
import Image from 'next/image';

// Product gallery: large main image + thumbnail strip (click swaps the main).
// No images → decorative SVG placeholder (same stencil as the catalog card).
// State starts at index 0 deterministically — no hydration concern.

export default function ProductGallery({
  images,
  alt,
  photoBadge,
  thumbAria,
}: {
  images: string[];
  alt: string;
  photoBadge: string;
  thumbAria: string;
}) {
  const [active, setActive] = useState(0);

  const frame: React.CSSProperties = {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid rgba(92,58,32,0.18)',
    background:
      'radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.35), transparent 55%), linear-gradient(135deg, var(--paper-aged), var(--cream-warm))',
  };

  if (images.length === 0) {
    return (
      <div style={frame}>
        <span
          className="label-caps"
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            backgroundColor: 'rgba(31,24,16,0.78)',
            color: 'var(--cream-warm)',
            padding: '5px 11px',
            borderRadius: 100,
            fontSize: '0.58rem',
            zIndex: 1,
          }}
        >
          {photoBadge}
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/3D_Cutting_Board_Model_Design.svg"
            alt=""
            aria-hidden
            style={{ width: '42%', height: '42%', borderRadius: '50%', background: 'var(--cream-warm)', objectFit: 'cover' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div style={frame}>
        <Image
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 560px"
          quality={90}
          style={{ objectFit: 'cover' }}
        />
      </div>

      {images.length > 1 ? (
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={thumbAria}
              aria-current={i === active}
              className="relative overflow-hidden transition-opacity hover:opacity-90"
              style={{
                width: 72,
                height: 72,
                borderRadius: 8,
                border: i === active ? '2px solid var(--oak-warm)' : '1px solid rgba(92,58,32,0.2)',
              }}
            >
              <Image src={url} alt="" fill sizes="72px" quality={80} style={{ objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
