import { Link } from 'react-router-dom';
import type { Outfit } from '@/data/types';
import { productById } from '@/data/products';
import { colourById } from '@/data/taxonomy';
import { formatPrice, cx } from '@/lib/format';
import { SmartImage } from '../ui/SmartImage';

/* Editorial collage: one hero image plus a strip of the pieces. */
export function OutfitCard({ outfit, className, to }: { outfit: Outfit; className?: string; to?: string }) {
  const products = Object.values(outfit.items).map((id) => productById[id!]).filter(Boolean);
  const total = products.reduce((s, p) => s + p.price, 0);
  return (
    <Link to={to ?? `/looks/${outfit.id}`} className={cx('group block', className)}>
      <div className="relative overflow-hidden rounded-card bg-paper">
        <SmartImage src={outfit.cover} alt={outfit.name} label={outfit.name} className="aspect-[4/5]" imgClassName="transition-transform duration-700 group-hover:scale-[1.03]" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent p-3.5 pt-16 text-ivory">
          <p className="text-[10.5px] font-semibold tracking-[0.14em] uppercase opacity-80">{outfit.mood}</p>
          <h3 className="font-display text-xl leading-tight">{outfit.name}</h3>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex -space-x-2">
          {products.slice(0, 5).map((p) => (
            <SmartImage
              key={p.id}
              src={p.images[0]}
              alt=""
              category={p.category}
              tint={colourById[p.colours[0]]?.hex}
              className="size-8 rounded-full border-2 border-ivory"
            />
          ))}
        </div>
        <span className="text-[13px] text-muted tabular">
          {products.length} peças · <span className="font-semibold text-ink">{formatPrice(total)}</span>
        </span>
      </div>
    </Link>
  );
}
