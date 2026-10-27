/* Integration seams for production. Nothing here is connected: the prototype
   uses the mock implementations in src/data and src/services. Each interface
   names the shape a real provider must return so the UI does not change.

   ┌──────────────────────┬───────────────────────────────────────────────┐
   │ Seam                 │ Likely production provider                    │
   ├──────────────────────┼───────────────────────────────────────────────┤
   │ CatalogueSource      │ Retailer product feeds (Google Merchant XML,  │
   │                      │ Shopify/WooCommerce APIs, CSV uploads)        │
   │ InventorySource      │ Store POS / ERP APIs, partner-portal uploads  │
   │ SearchEngine         │ Embedding search + LLM query understanding    │
   │ VisualSearch         │ Image embeddings (e.g. CLIP-style) service    │
   │ Directions           │ Google Maps / Apple Maps / Mapbox             │
   │ Affiliate            │ Awin, CJ, Rakuten (click attribution)         │
   │ Analytics            │ Privacy-first product analytics               │
   │ Auth / Billing       │ OIDC provider · Stripe or Adyen               │
   └──────────────────────┴───────────────────────────────────────────────┘ */

import type { InventoryRecord, Product, Store } from '@/data/types';
import type { SearchEngine } from './search/types';

export interface CatalogueSource {
  listProducts(params: { updatedSince?: string }): Promise<Product[]>;
  listStores(): Promise<Store[]>;
}

export interface InventorySource {
  /** Must return per product/store/size/colour records with lastUpdatedAt + source. */
  getInventory(params: { productIds?: string[]; storeIds?: string[] }): Promise<InventoryRecord[]>;
}

export interface VisualSearch {
  /** Returns attribute guesses for an image; never send images without consent. */
  describe(image: Blob): Promise<{ category?: string; colours: string[]; styles: string[]; confidence: number }>;
}

export interface AnalyticsSink {
  track(event: 'product_view' | 'store_click' | 'directions' | 'save' | 'search', props: Record<string, unknown>): void;
}

export type { SearchEngine };

/** Local no-op analytics: events are only logged in development. */
export const analytics: AnalyticsSink = {
  track(event, props) {
    if (import.meta.env.DEV) console.debug('[analytics:demo]', event, props);
  },
};
