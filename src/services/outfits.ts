import { PRODUCTS, productById } from '@/data/products';
import { SLOT_CATEGORIES, slotForCategory } from '@/data/taxonomy';
import type { ColourId, GeoPoint, Outfit, OutfitSlot, Product, StoreAvailability } from '@/data/types';
import { availabilityFor, bestNearby, isBuyable } from './inventory';

/* Rule-based outfit composer. Scores candidates by shared style tags, a simple
   neutral-colour harmony rule, nearby availability and budget. This is a
   styling heuristic, not a measured "compatibility" score. */

const NEUTRALS: ColourId[] = ['black', 'white', 'ecru', 'camel', 'brown', 'grey', 'navy', 'gold', 'silver'];

export interface ComposeContext {
  origin: GeoPoint;
  radiusKm: number;
  budget?: number | null;
}

export function slotsFor(anchor: Product): OutfitSlot[] {
  return anchor.category === 'dresses'
    ? ['dress', 'outerwear', 'shoes', 'bag', 'accessory']
    : ['outerwear', 'top', 'bottom', 'shoes', 'bag', 'accessory'];
}

function harmony(a: Product, b: Product) {
  const aNeutral = a.colours.some((c) => NEUTRALS.includes(c));
  const bNeutral = b.colours.some((c) => NEUTRALS.includes(c));
  return aNeutral || bNeutral ? 6 : 0;
}

export function candidatesFor(slot: OutfitSlot, anchor: Product, ctx: ComposeContext, exclude: string[] = []) {
  const cats = SLOT_CATEGORIES[slot];
  return PRODUCTS.filter((p) => cats.includes(p.category) && p.id !== anchor.id && !exclude.includes(p.id))
    .map((p) => {
      const near = bestNearby(availabilityFor(p, { origin: ctx.origin }), ctx.radiusKm);
      const styleOverlap = p.styles.filter((s) => anchor.styles.includes(s)).length;
      const genderOk = anchor.gender === 'unisex' || p.gender === 'unisex' || p.gender === anchor.gender;
      let score = styleOverlap * 10 + harmony(anchor, p) + (genderOk ? 4 : -20);
      if (near && isBuyable(near.status)) score += 10;
      else if (!near) score -= 8;
      return { product: p, score, near };
    })
    .sort((a, b) => b.score - a.score);
}

/** Builds variant `n` of an outfit around an anchor product. */
export function composeOutfit(anchor: Product, ctx: ComposeContext, variant = 0): Outfit {
  const items: Outfit['items'] = {};
  const anchorSlot = slotForCategory(anchor.category);
  items[anchorSlot] = anchor.id;
  let spent = anchor.price;
  for (const slot of slotsFor(anchor)) {
    if (items[slot]) continue;
    const list = candidatesFor(slot, anchor, ctx);
    // Rotate through the top candidates so each variant feels different.
    const pool = list.slice(0, 4);
    const pick =
      pool.find((c, i) => i >= variant % Math.max(1, pool.length) && (!ctx.budget || spent + c.product.price <= ctx.budget)) ??
      pool[variant % Math.max(1, pool.length)];
    if (pick) {
      items[slot] = pick.product.id;
      spent += pick.product.price;
    }
  }
  return {
    id: `gen-${anchor.id}-${variant}`,
    name: ['Look do dia', 'Versão cidade', 'Versão fim de semana', 'Versão noite'][variant % 4],
    mood: 'Gerado pelas regras de estilo VESTA',
    occasion: 'Sugestão',
    cover: anchor.images[0],
    items,
    origin: 'user',
  };
}

export interface OutfitSummary {
  products: { slot: OutfitSlot; product: Product; near?: StoreAvailability }[];
  total: number;
  storesCount: number;
  buyableNearby: number;
}

export function summarise(outfit: Outfit, ctx: ComposeContext): OutfitSummary {
  const products = (Object.entries(outfit.items) as [OutfitSlot, string][])
    .filter(([, id]) => productById[id])
    .map(([slot, id]) => {
      const product = productById[id];
      return { slot, product, near: bestNearby(availabilityFor(product, { origin: ctx.origin }), ctx.radiusKm) };
    });
  return {
    products,
    total: products.reduce((s, x) => s + x.product.price, 0),
    storesCount: new Set(products.map((x) => x.near?.store.id).filter(Boolean)).size,
    buyableNearby: products.filter((x) => x.near && isBuyable(x.near.status)).length,
  };
}

/** Editorial looks that include a product. */
export function looksWith(productId: string, outfits: Outfit[]) {
  return outfits.filter((o) => Object.values(o.items).includes(productId));
}

export function similarProducts(p: Product, n = 6) {
  return PRODUCTS.filter((x) => x.id !== p.id)
    .map((x) => ({
      x,
      s:
        (x.category === p.category ? 20 : 0) +
        x.styles.filter((s) => p.styles.includes(s)).length * 6 +
        x.colours.filter((c) => p.colours.includes(c)).length * 4 -
        Math.abs(x.price - p.price) / 20,
    }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map(({ x }) => x);
}
