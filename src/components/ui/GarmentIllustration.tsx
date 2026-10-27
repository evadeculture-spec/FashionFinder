import type { CategoryId } from '@/data/types';

/* Line-art garment illustrations. Used as image fallbacks and in
   illustration-led empty states, so a failed image still looks intentional. */

const PATHS: Record<CategoryId, string> = {
  outerwear:
    'M38 14 L50 30 L62 14 L78 20 L92 70 L82 74 L76 50 L76 108 L24 108 L24 50 L18 74 L8 70 L22 20 Z M50 30 L50 108 M38 14 L44 40 L50 30 L56 40 L62 14 M30 78 L40 78 M60 78 L70 78',
  tops: 'M36 16 Q50 26 64 16 L86 26 L94 48 L78 54 L74 44 L74 104 L26 104 L26 44 L22 54 L6 48 L14 26 Z',
  knitwear:
    'M36 16 Q50 28 64 16 L84 24 L94 86 L80 88 L74 48 L74 104 L26 104 L26 48 L20 88 L6 86 L16 24 Z M26 96 L74 96 M8 80 L20 82 M80 82 L92 80 M40 18 Q50 24 60 18',
  trousers: 'M28 12 L72 12 L80 108 L58 108 L50 40 L42 108 L20 108 Z M28 22 L72 22 M50 22 L50 40',
  dresses: 'M38 10 L44 10 L50 20 L56 10 L62 10 L60 34 Q72 44 70 52 L86 108 L14 108 L30 52 Q28 44 40 34 Z M30 52 L70 52',
  shoes: 'M14 82 L14 40 L34 40 L36 62 Q60 66 82 74 Q92 78 90 90 L14 90 Z M14 82 L90 82 M22 40 L22 30 L34 30 L34 40',
  bags: 'M18 46 L82 46 L88 104 L12 104 Z M34 46 Q34 18 50 18 Q66 18 66 46 M18 60 L82 60 M46 66 L54 66',
  jewellery:
    'M34 30 m-18 0 a18 22 0 1 0 36 0 a18 22 0 1 0 -36 0 M78 64 m-16 0 a16 20 0 1 0 32 0 a16 20 0 1 0 -32 0 M34 8 L34 14 M78 40 L78 46',
  accessories:
    'M6 52 L94 52 M10 52 Q10 78 30 78 Q46 78 46 56 M54 56 Q54 78 70 78 Q90 78 90 52 M46 56 Q50 50 54 56 M6 52 L2 44 M94 52 L98 44',
};

export function GarmentIllustration({
  category,
  tint = '#B7AA9A',
  className = '',
  strokeWidth = 1.6,
}: {
  category: CategoryId;
  tint?: string;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true" fill="none">
      <path d={PATHS[category]} fill={tint} fillOpacity={0.22} stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
