import { useState } from 'react';
import type { CategoryId } from '@/data/types';
import { cx } from '@/lib/format';
import { GarmentIllustration } from './GarmentIllustration';
import { ImageOff } from 'lucide-react';

/* Remote image with a graceful, art-directed fallback: a tinted surface with
   a garment line illustration (products) or a quiet monogram (editorial). */
export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  category,
  tint,
  label,
  eager,
}: {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  category?: CategoryId;
  tint?: string;
  label?: string;
  eager?: boolean;
}) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error');
  return (
    <div className={cx('relative overflow-hidden bg-line', className)} style={tint ? { backgroundColor: `color-mix(in srgb, ${tint} 16%, #F1EEE8)` } : undefined}>
      {state !== 'loaded' && (
        <div className={cx('absolute inset-0 grid place-items-center', state === 'loading' && 'skeleton')} aria-hidden>
          {state === 'error' &&
            (category ? (
              <GarmentIllustration category={category} tint={tint} className="h-[52%] max-h-40 text-ink/70" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-ink/40">
                <ImageOff size={22} strokeWidth={1.4} />
                {label && <span className="font-display text-sm italic">{label}</span>}
              </div>
            ))}
        </div>
      )}
      {src && state !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={cx(
            'h-full w-full object-cover transition-opacity duration-500',
            state === 'loaded' ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      )}
      {state === 'error' && <span className="sr-only">{alt}</span>}
    </div>
  );
}
