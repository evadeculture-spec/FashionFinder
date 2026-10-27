import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { Product, StoreAvailability } from '@/data/types';
import { brandById } from '@/data/stores';
import { colourById } from '@/data/taxonomy';
import { formatDistance, cx } from '@/lib/format';
import { SmartImage } from '../ui/SmartImage';
import { StockBadge } from '../ui/StockBadge';
import { Price } from '../ui/Price';
import { FavouriteButton } from './FavouriteButton';

const MATCH_LABEL = { strong: 'Muito próxima da tua ideia', good: 'Boa correspondência', partial: 'Alternativa' } as const;

export function ProductCard({
  product,
  nearest,
  match,
  reasons,
  size = 'md',
  className,
}: {
  product: Product;
  nearest?: StoreAvailability;
  match?: keyof typeof MATCH_LABEL;
  reasons?: string[];
  size?: 'sm' | 'md';
  className?: string;
}) {
  const brand = brandById[product.brandId];
  const tint = colourById[product.colours[0]]?.hex;
  return (
    <article className={cx('group relative', className)}>
      <Link to={`/produto/${product.id}`} className="block rounded-card focus-visible:outline-offset-4">
        <div className="relative">
          <SmartImage
            src={product.images[0]}
            alt={product.name}
            category={product.category}
            tint={tint}
            className={cx('rounded-card', size === 'sm' ? 'aspect-[4/5]' : 'aspect-[3/4]')}
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
            {product.isNew && <span className="rounded-chip bg-paper/90 px-2 py-0.5 text-[10.5px] font-semibold tracking-wide uppercase">Novo</span>}
            {product.compareAt && <span className="rounded-chip bg-clay px-2 py-0.5 text-[10.5px] font-semibold text-white">−{Math.round((1 - product.price / product.compareAt) * 100)}%</span>}
          </div>
        </div>
        <div className="mt-2.5 space-y-1 px-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[11.5px] font-medium tracking-wide text-muted uppercase">{brand?.name}</p>
              <h3 className={cx('leading-snug text-ink', size === 'sm' ? 'line-clamp-1 text-[13.5px]' : 'line-clamp-2 text-[14.5px]')}>{product.name}</h3>
            </div>
            <Price value={product.price} compareAt={product.compareAt} size="sm" className="shrink-0 pt-4" />
          </div>
          {match && (
            <p className="text-[11.5px] text-clay-deep" title={reasons?.length ? `Combina: ${reasons.join(', ')}` : undefined}>
              {MATCH_LABEL[match]}
              {reasons && reasons.length > 0 && <span className="text-muted"> · {reasons.slice(0, 2).join(', ')}</span>}
            </p>
          )}
          {nearest && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
              <StockBadge status={nearest.status} short />
              <span className="inline-flex items-center gap-1 text-[11.5px] text-muted">
                <MapPin size={11} aria-hidden />
                {nearest.distanceKm != null ? formatDistance(nearest.distanceKm) : nearest.store.neighbourhood}
                <span className="hidden truncate sm:inline">· {nearest.store.neighbourhood}</span>
              </span>
            </div>
          )}
        </div>
      </Link>
      <FavouriteButton productId={product.id} className="absolute top-2 right-2" />
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[3/4] rounded-card" />
      <div className="skeleton mt-3 h-3 w-1/3 rounded" />
      <div className="skeleton mt-2 h-4 w-3/4 rounded" />
      <div className="skeleton mt-2 h-4 w-1/2 rounded" />
    </div>
  );
}
