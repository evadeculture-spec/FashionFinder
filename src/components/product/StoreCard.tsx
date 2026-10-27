import { Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import type { Store } from '@/data/types';
import { STORE_TYPES, cityById } from '@/data/taxonomy';
import { formatDistance, cx } from '@/lib/format';
import { SmartImage } from '../ui/SmartImage';
import { openState } from '@/services/stores';

export function StoreCard({
  store,
  distanceKm,
  footer,
  compact,
  className,
}: {
  store: Store;
  distanceKm?: number | null;
  footer?: React.ReactNode;
  compact?: boolean;
  className?: string;
}) {
  const open = openState(store);
  return (
    <article className={cx('overflow-hidden rounded-card border border-line bg-paper', className)}>
      <Link to={`/lojas/${store.id}`} className="block">
        <SmartImage src={store.image} alt={store.name} label={store.name} className={compact ? 'aspect-[16/9]' : 'aspect-[16/10]'} />
        <div className="space-y-1.5 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="eyebrow !text-[10px]">{STORE_TYPES[store.type]}</p>
              <h3 className="truncate text-[15px] font-semibold">{store.name}</h3>
            </div>
            {distanceKm != null && <span className="shrink-0 rounded-chip bg-ivory px-2 py-0.5 text-xs font-semibold tabular">{formatDistance(distanceKm)}</span>}
          </div>
          <p className="flex items-center gap-1.5 text-[12.5px] text-muted">
            <MapPin size={12} aria-hidden /> {store.neighbourhood}, {cityById[store.city].name}
          </p>
          <p className={cx('flex items-center gap-1.5 text-[12.5px]', open.open ? 'text-success' : 'text-muted')}>
            <Clock size={12} aria-hidden /> {open.label}
          </p>
        </div>
      </Link>
      {footer && <div className="border-t border-line px-3.5 py-3">{footer}</div>}
    </article>
  );
}
