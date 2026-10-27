import type { CategoryId, ColourId, StoreType, StyleTag, UserProfile } from '@/data/types';
import type { AvailabilityMode, ParsedIntent, SearchQuery, SortKey } from './types';

export function emptyQuery(radiusKm: number): SearchQuery {
  return {
    text: '',
    categories: [],
    colours: [],
    styles: [],
    sizes: [],
    brands: [],
    storeTypes: [],
    maxPrice: null,
    radiusKm,
    availability: 'buyable',
    sort: 'relevance',
  };
}

/** Merge a parsed natural-language intent into the structured query. */
export function applyIntent(q: SearchQuery, intent: ParsedIntent): SearchQuery {
  return {
    ...q,
    categories: intent.categories.length ? intent.categories : q.categories,
    colours: intent.colours.length ? intent.colours : q.colours,
    styles: intent.styles.length ? intent.styles : q.styles,
    sizes: intent.sizes.length ? intent.sizes : q.sizes,
    maxPrice: intent.maxPrice ?? q.maxPrice,
    availability: intent.wantsInStock ? 'available_only' : q.availability,
  };
}

/** Profile sizes for the categories in play (used by "apply my preferences"). */
export function profileSizes(profile: UserProfile, categories: CategoryId[]): string[] {
  const s = new Set<string>();
  const cats = categories.length ? categories : (['tops', 'trousers', 'shoes'] as CategoryId[]);
  for (const c of cats) {
    if (['outerwear', 'tops', 'knitwear', 'dresses'].includes(c)) s.add(profile.sizes.tops);
    if (c === 'trousers') s.add(profile.sizes.bottoms);
    if (c === 'shoes') s.add(profile.sizes.shoes);
  }
  return [...s].filter(Boolean);
}

const LIST = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);

export function queryToParams(q: SearchQuery): URLSearchParams {
  const p = new URLSearchParams();
  if (q.text) p.set('q', q.text);
  if (q.categories.length) p.set('cat', q.categories.join(','));
  if (q.colours.length) p.set('cor', q.colours.join(','));
  if (q.styles.length) p.set('estilo', q.styles.join(','));
  if (q.sizes.length) p.set('tam', q.sizes.join(','));
  if (q.brands.length) p.set('marca', q.brands.join(','));
  if (q.storeTypes.length) p.set('loja', q.storeTypes.join(','));
  if (q.maxPrice != null) p.set('max', String(q.maxPrice));
  p.set('raio', String(q.radiusKm));
  if (q.availability !== 'buyable') p.set('stock', q.availability);
  if (q.sort !== 'relevance') p.set('ordem', q.sort);
  if (q.imageRef) p.set('img', q.imageRef);
  return p;
}

export function paramsToQuery(p: URLSearchParams, fallbackRadius: number): SearchQuery {
  const max = p.get('max');
  return {
    text: p.get('q') ?? '',
    categories: LIST(p.get('cat')) as CategoryId[],
    colours: LIST(p.get('cor')) as ColourId[],
    styles: LIST(p.get('estilo')) as StyleTag[],
    sizes: LIST(p.get('tam')),
    brands: LIST(p.get('marca')),
    storeTypes: LIST(p.get('loja')) as StoreType[],
    maxPrice: max ? Number(max) : null,
    radiusKm: Number(p.get('raio')) || fallbackRadius,
    availability: (p.get('stock') as AvailabilityMode) || 'buyable',
    sort: (p.get('ordem') as SortKey) || 'relevance',
    imageRef: p.get('img') ?? undefined,
  };
}
