import type { ColourId, DisplayStatus, GeoPoint, InventoryRecord, Product, StoreAvailability } from '@/data/types';
import { INVENTORY } from '@/data/inventory';
import { storeById } from '@/data/stores';
import { distanceKm } from './geo';

/* Availability rules. A reported positive quantity is never shown as
   "available" once the record is older than FRESH_HOURS — it becomes
   "por confirmar" instead, because old data is not proof of current stock. */

export const FRESH_HOURS = 72;
const STALE_OUT_HOURS = 24 * 7;

export const STATUS_META: Record<DisplayStatus, { label: string; short: string; tone: 'success' | 'warning' | 'neutral' | 'danger'; rank: number }> = {
  available: { label: 'Disponível segundo a loja', short: 'Disponível', tone: 'success', rank: 0 },
  low: { label: 'Últimas unidades', short: 'Últimas', tone: 'warning', rank: 1 },
  unconfirmed: { label: 'Disponibilidade por confirmar', short: 'Por confirmar', tone: 'neutral', rank: 2 },
  out: { label: 'Sem stock nesta loja', short: 'Sem stock', tone: 'danger', rank: 3 },
};

export const SOURCE_LABEL: Record<InventoryRecord['source'], string> = {
  pos_api_demo: 'Ligação ao sistema da loja (demo)',
  csv_feed: 'Ficheiro de stock enviado pela loja',
  store_manual: 'Atualização manual pela equipa da loja',
};

export function displayStatus(rec: InventoryRecord, now = Date.now()): DisplayStatus {
  const ageH = (now - new Date(rec.lastUpdatedAt).getTime()) / 3600_000;
  switch (rec.status) {
    case 'in_stock':
      return ageH > FRESH_HOURS ? 'unconfirmed' : 'available';
    case 'low_stock':
      return ageH > FRESH_HOURS ? 'unconfirmed' : 'low';
    case 'out_of_stock':
      return ageH > STALE_OUT_HOURS ? 'unconfirmed' : 'out';
    default:
      return 'unconfirmed';
  }
}

const byProduct = new Map<string, InventoryRecord[]>();
for (const r of INVENTORY) {
  const list = byProduct.get(r.productId) ?? [];
  list.push(r);
  byProduct.set(r.productId, list);
}

export interface AvailabilityFilter {
  sizes?: string[];
  colour?: ColourId;
  origin?: GeoPoint;
}

/** Availability of a product per store, best status first then nearest. */
export function availabilityFor(product: Product, f: AvailabilityFilter = {}): StoreAvailability[] {
  const records = byProduct.get(product.id) ?? [];
  const groups = new Map<string, InventoryRecord[]>();
  for (const r of records) {
    if (f.colour && r.colour !== f.colour) continue;
    if (f.sizes?.length && !f.sizes.includes(r.size)) continue;
    const g = groups.get(r.storeId) ?? [];
    g.push(r);
    groups.set(r.storeId, g);
  }
  const result: StoreAvailability[] = [];
  for (const [storeId, recs] of groups) {
    const store = storeById[storeId];
    const statuses = recs.map((r) => displayStatus(r));
    const best = statuses.reduce((a, b) => (STATUS_META[a].rank <= STATUS_META[b].rank ? a : b));
    const sizesAvailable = [
      ...new Set(recs.filter((r) => ['available', 'low'].includes(displayStatus(r))).map((r) => r.size)),
    ];
    result.push({
      store,
      status: best,
      distanceKm: f.origin ? distanceKm(f.origin, store) : null,
      lastUpdatedAt: recs[0].lastUpdatedAt,
      source: recs[0].source,
      verification: recs[0].verification,
      sizesAvailable,
      records: recs,
    });
  }
  return result.sort(
    (a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0) || STATUS_META[a.status].rank - STATUS_META[b.status].rank,
  );
}

/** Nearest store whose status is at least `min` (by rank). */
export function bestNearby(list: StoreAvailability[], radiusKm?: number): StoreAvailability | undefined {
  const inRadius = radiusKm == null ? list : list.filter((a) => (a.distanceKm ?? 0) <= radiusKm);
  return [...inRadius].sort(
    (a, b) => STATUS_META[a.status].rank - STATUS_META[b.status].rank || (a.distanceKm ?? 0) - (b.distanceKm ?? 0),
  )[0];
}

export const isBuyable = (s: DisplayStatus) => s === 'available' || s === 'low';

/** Products ranged at a store, with their aggregated status there. */
export function productsAtStore(storeId: string, products: Product[]) {
  return products
    .filter((p) => p.storeIds.includes(storeId))
    .map((p) => ({ product: p, availability: availabilityFor(p).find((a) => a.store.id === storeId)! }))
    .filter((x) => x.availability);
}
