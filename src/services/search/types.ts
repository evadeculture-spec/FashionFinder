import type { CategoryId, CityId, ColourId, DisplayStatus, Product, StoreAvailability, StoreType, StyleTag } from '@/data/types';

export type SortKey = 'relevance' | 'distance' | 'price_asc' | 'price_desc';
export type AvailabilityMode = 'any' | 'buyable' | 'available_only';

/** Everything that defines a search. Serialisable to URL params. */
export interface SearchQuery {
  text: string;
  categories: CategoryId[];
  colours: ColourId[];
  styles: StyleTag[];
  sizes: string[];
  brands: string[];
  storeTypes: StoreType[];
  maxPrice: number | null;
  radiusKm: number;
  availability: AvailabilityMode;
  sort: SortKey;
  /** Inspiration image id or 'upload' when the query came from visual search. */
  imageRef?: string;
}

export interface ParsedIntent {
  categories: CategoryId[];
  colours: ColourId[];
  styles: StyleTag[];
  sizes: string[];
  maxPrice: number | null;
  city: CityId | null;
  nearMe: boolean;
  wantsInStock: boolean;
  keywords: string[];
}

export interface SearchHit {
  product: Product;
  score: number;
  /** Human-readable reasons — shown instead of an invented percentage. */
  reasons: string[];
  match: 'strong' | 'good' | 'partial';
  nearest?: StoreAvailability;
  nearestStatus: DisplayStatus | null;
}

export interface SearchResult {
  hits: SearchHit[];
  /** Relaxed suggestions when strict results are few. */
  related: SearchHit[];
  outsideRadius: number;
}

/** Interface the UI depends on. A real AI/embedding backend can implement this later. */
export interface SearchEngine {
  parse(text: string): ParsedIntent;
  run(q: SearchQuery, ctx: { origin: { lat: number; lng: number } }): SearchResult;
}
