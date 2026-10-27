import type { InventoryRecord, InventorySource, ReportedStatus } from './types';
import { PRODUCTS } from './products';
import { storeById } from './stores';

/* Deterministic MOCK inventory. Generated from product × store × size × colour
   with a seeded hash so results are stable across reloads. Timestamps are
   relative to page load to keep "updated 3 h ago" labels meaningful in demos.
   None of this reflects real stock at any real shop. */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const HOUR = 3600_000;
const now = Date.now();

const SOURCE_BY_FEED: Record<string, InventorySource> = {
  'api-demo': 'pos_api_demo',
  csv: 'csv_feed',
  manual: 'store_manual',
};

/** Typical staleness per feed type, in hours [min, max]. */
const AGE_BY_FEED: Record<string, [number, number]> = {
  'api-demo': [0.2, 6],
  csv: [8, 30],
  manual: [20, 160],
};

function build(): InventoryRecord[] {
  const out: InventoryRecord[] = [];
  for (const p of PRODUCTS) {
    for (const storeId of p.storeIds) {
      const store = storeById[storeId];
      const [minAge, maxAge] = AGE_BY_FEED[store.feed];
      // One timestamp per product×store: feeds update a SKU group at once.
      const ageH = minAge + hash(`${p.id}|${storeId}|age`) * (maxAge - minAge);
      const lastUpdatedAt = new Date(now - ageH * HOUR).toISOString();
      const vintage = store.type === 'vintage';
      // Vintage stores carry one size/colour per piece.
      const sizes = vintage ? [p.sizes[Math.floor(hash(p.id + storeId) * p.sizes.length)]] : p.sizes;
      const colours = vintage ? [p.colours[0]] : p.colours;

      for (const size of sizes) {
        for (const colour of colours) {
          const r = hash(`${p.id}|${storeId}|${size}|${colour}`);
          let status: ReportedStatus;
          let quantity: number | null;
          if (store.feed === 'manual' && r > 0.85) {
            status = 'unknown';
            quantity = null;
          } else if (r < 0.2) {
            status = 'out_of_stock';
            quantity = 0;
          } else if (r < 0.42) {
            status = 'low_stock';
            quantity = 1 + Math.floor(r * 5) % 2;
          } else {
            status = 'in_stock';
            quantity = vintage ? 1 : 3 + Math.floor(r * 10);
          }
          out.push({
            productId: p.id,
            storeId,
            size,
            colour,
            status,
            quantity: store.feed === 'manual' ? null : quantity,
            lastUpdatedAt,
            source: SOURCE_BY_FEED[store.feed],
            verification:
              store.feed === 'api-demo' ? 'feed_reported' : store.feed === 'csv' ? 'feed_reported' : 'store_confirmed',
          });
        }
      }
    }
  }
  return out;
}

export const INVENTORY: InventoryRecord[] = build();

/* Demo-scenario overrides: the hero query ("casaco castanho vintage em Lisboa")
   should resolve to a recently confirmed piece. */
for (const rec of INVENTORY) {
  if (rec.productId === 'p-casaco-vintage-castanho' && rec.storeId === 'st-lxf') {
    rec.status = 'in_stock';
    rec.lastUpdatedAt = new Date(now - 3 * HOUR).toISOString();
  }
  if (rec.productId === 'p-casaco-vintage-castanho' && rec.storeId === 'st-foz') {
    rec.status = 'low_stock';
  }
}
