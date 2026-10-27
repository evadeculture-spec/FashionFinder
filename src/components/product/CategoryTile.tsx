import { Link } from 'react-router-dom';
import type { CategoryId } from '@/data/types';
import { categoryById } from '@/data/taxonomy';
import { SmartImage } from '../ui/SmartImage';

export function CategoryTile({ category, image, to }: { category: CategoryId; image: string; to: string }) {
  const c = categoryById[category];
  return (
    <Link to={to} className="group block w-[132px] shrink-0 snap-start md:w-auto">
      <SmartImage src={image} alt="" category={category} className="aspect-[4/5] rounded-card" imgClassName="transition-transform duration-700 group-hover:scale-105" />
      <p className="mt-2 text-[13.5px] font-medium">{c.plural}</p>
    </Link>
  );
}
