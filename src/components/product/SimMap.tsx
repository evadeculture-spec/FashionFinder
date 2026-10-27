import { useMemo } from 'react';
import { Navigation } from 'lucide-react';
import type { GeoPoint, Store } from '@/data/types';
import { cx } from '@/lib/format';

/* Illustrative map. No map provider is configured, so stores are projected
   onto a stylised plane around the search origin. Positions are approximate
   and it is labelled as such. Replace with Mapbox/Google Maps in production. */

export interface MapPin {
  store: Store;
  distanceKm: number;
  tone?: 'success' | 'warning' | 'neutral' | 'danger';
  count?: number;
}

const TONE = { success: '#387A58', warning: '#A8691D', neutral: '#20201E', danger: '#A4473A' };

export function SimMap({
  origin,
  radiusKm,
  pins,
  selectedId,
  onSelect,
  className,
  originLabel,
}: {
  origin: GeoPoint;
  radiusKm: number;
  pins: MapPin[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
  originLabel: string;
}) {
  const span = Math.max(1.5, radiusKm) * 1.15;
  const projected = useMemo(
    () =>
      pins.map((p) => {
        const dx = (p.store.lng - origin.lng) * 111.32 * Math.cos((origin.lat * Math.PI) / 180);
        const dy = (p.store.lat - origin.lat) * 110.57;
        const x = 50 + (dx / span) * 50;
        const y = 50 - (dy / span) * 50;
        return { ...p, x, y, visible: x > 3 && x < 97 && y > 3 && y < 97 };
      }),
    [pins, origin, span],
  );

  return (
    <div className={cx('relative overflow-hidden rounded-card border border-line bg-[#EEEAE2]', className)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id="blocks" width="9" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
            <rect width="9" height="7" fill="#EEEAE2" />
            <rect x="0.6" y="0.6" width="7.8" height="5.8" rx="0.6" fill="#E6E1D7" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#blocks)" />
        {/* river */}
        <path d="M-5 78 C 20 70, 35 88, 55 80 S 85 70, 105 76 L105 105 L-5 105 Z" fill="#D5DED8" />
        {/* avenues */}
        <path d="M-5 30 L105 46" stroke="#F7F5F0" strokeWidth="1.8" />
        <path d="M30 -5 L44 105" stroke="#F7F5F0" strokeWidth="1.4" />
        <path d="M72 -5 L60 80" stroke="#F7F5F0" strokeWidth="1.2" />
        <path d="M-5 60 Q 40 52 105 20" stroke="#F7F5F0" strokeWidth="1" />
        {/* parks */}
        <ellipse cx="78" cy="22" rx="9" ry="6" fill="#DCE3D3" />
        <ellipse cx="16" cy="44" rx="6" ry="5" fill="#DCE3D3" />
      </svg>

      {/* radius ring */}
      <div
        className="absolute rounded-full border border-dashed border-clay/60 bg-clay/5"
        style={{ left: `${50 - (radiusKm / span) * 50}%`, top: `${50 - (radiusKm / span) * 50}%`, width: `${(radiusKm / span) * 100}%`, height: `${(radiusKm / span) * 100}%` }}
        aria-hidden
      />

      {/* origin */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: '50%', top: '50%' }}>
        <span className="relative flex size-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink/30 motion-reduce:hidden" />
          <span className="relative inline-flex size-4 rounded-full border-2 border-white bg-ink" />
        </span>
        <span className="absolute top-5 left-1/2 -translate-x-1/2 rounded bg-paper/90 px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap shadow-soft">
          {originLabel}
        </span>
      </div>

      {projected
        .filter((p) => p.visible)
        .map((p) => {
          const active = p.store.id === selectedId;
          return (
            <button
              key={p.store.id}
              type="button"
              onClick={() => onSelect?.(p.store.id)}
              aria-label={`${p.store.name}, ${p.distanceKm.toFixed(1)} km`}
              aria-pressed={active}
              className={cx('absolute -translate-x-1/2 -translate-y-full transition-transform', active ? 'z-20 scale-110' : 'z-10 hover:scale-105')}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <span
                className={cx('flex items-center gap-1 rounded-chip px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-white shadow-lift', active && 'ring-2 ring-white')}
                style={{ background: TONE[p.tone ?? 'neutral'] }}
              >
                {p.count != null ? p.count : <Navigation size={10} />}
                <span className={cx(active ? 'inline' : 'hidden sm:inline')}>{p.store.name.length > 22 ? p.store.name.slice(0, 20) + '…' : p.store.name}</span>
              </span>
              <span className="mx-auto block h-1.5 w-0.5" style={{ background: TONE[p.tone ?? 'neutral'] }} />
            </button>
          );
        })}

      <span className="absolute bottom-2 left-2 rounded bg-paper/90 px-2 py-1 text-[10.5px] text-muted">
        Mapa ilustrativo · posições aproximadas · raio {radiusKm} km
      </span>
    </div>
  );
}
