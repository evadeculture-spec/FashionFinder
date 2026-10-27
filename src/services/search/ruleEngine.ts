import { PRODUCTS } from '@/data/products';
import { brandById } from '@/data/stores';
import { CATEGORIES, CITIES, COLOURS, STYLES, categoryById, colourById, styleById } from '@/data/taxonomy';
import type { CategoryId, ColourId, StyleTag } from '@/data/types';
import { normalise } from '@/lib/format';
import { STATUS_META, availabilityFor, bestNearby, isBuyable } from '../inventory';
import type { ParsedIntent, SearchEngine, SearchHit, SearchQuery, SearchResult } from './types';

/* Transparent, rule-based stand-in for an AI search service.
   It reads pt-PT phrases against a fixed vocabulary — no model is called. */

const STOPWORDS = new Set(
  'procuro quero um uma uns umas numa num nuns numas de do da dos das em no na nos nas onde algum alguma qualquer para com sem e ou o a os as que me mim perto loja lojas disponivel disponiveis ate euros eur estilo tipo algo peca pecas tamanho cor muito mais menos bom boa'.split(' '),
);

function findTerms<T extends { id: string; terms: string[] }>(text: string, list: T[]): T['id'][] {
  const found: T['id'][] = [];
  for (const item of list) {
    if (item.terms.some((t) => new RegExp(`(^|[^\\p{L}])${normalise(t)}([^\\p{L}]|$)`, 'u').test(text))) {
      found.push(item.id);
    }
  }
  return found;
}

export function parseIntent(raw: string): ParsedIntent {
  const text = normalise(raw);
  // "casaco de malha" is knitwear, not outerwear.
  let categories = findTerms(text, CATEGORIES) as CategoryId[];
  if (text.includes('casaco de malha')) categories = categories.filter((c) => c !== 'outerwear');
  const colours = findTerms(text, COLOURS) as ColourId[];
  const styles = findTerms(text, STYLES) as StyleTag[];

  let maxPrice: number | null = null;
  const priceRe = /(?:ate|max(?:imo)?|menos de|abaixo de|por)\s*(\d{1,4})(?:[.,]\d+)?\s*(?:€|eur|euros)?|(\d{1,4})\s*(?:€|eur\b|euros)/;
  const pm = text.match(priceRe);
  if (pm) maxPrice = Number(pm[1] ?? pm[2]);

  const sizes: string[] = [];
  const sm = raw.match(/\b(?:tamanho|tam\.?|size)\s*(XXS|XS|S|M|L|XL|XXL|\d{2})\b/i);
  if (sm) sizes.push(sm[1].toUpperCase());

  const city = CITIES.find((c) => text.includes(normalise(c.name)))?.id ?? null;
  const nearMe = /perto|proxim|aqui|ao pe|nesta zona/.test(text);
  const wantsInStock = /disponivel|disponiveis|em stock|hoje|agora|ja\b/.test(text);

  const consumed = new Set<string>();
  [...CATEGORIES, ...COLOURS, ...STYLES].forEach((x) => x.terms.forEach((t) => normalise(t).split(' ').forEach((w) => consumed.add(w))));
  const keywords = text
    .replace(/[^\p{L}\d\s-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !consumed.has(w) && !/^\d+$/.test(w));

  return { categories, colours, styles, sizes, maxPrice, city, nearMe, wantsInStock, keywords };
}

function scoreProduct(p: (typeof PRODUCTS)[number], q: SearchQuery, keywords: string[]) {
  let score = 0;
  const reasons: string[] = [];
  if (q.categories.includes(p.category)) {
    score += 30;
    reasons.push(categoryById[p.category].label);
  }
  const colourHits = p.colours.filter((c) => q.colours.includes(c));
  if (colourHits.length) {
    score += 22;
    reasons.push(colourById[colourHits[0]].label);
  }
  const styleHits = p.styles.filter((s) => q.styles.includes(s));
  score += styleHits.length * 12;
  styleHits.forEach((s) => reasons.push(styleById[s].label));

  if (keywords.length) {
    const hay = normalise([p.name, p.description, p.material, ...p.keywords, brandById[p.brandId]?.name].join(' '));
    for (const k of keywords) {
      if (hay.includes(k)) {
        score += 9;
        if (reasons.length < 4) reasons.push(`“${k}”`);
      }
    }
  }
  if (q.maxPrice != null && p.price <= q.maxPrice) {
    score += 6;
    reasons.push(`até ${q.maxPrice} €`);
  }
  if (p.isNew) score += 1;
  return { score, reasons };
}

function strictMatch(p: (typeof PRODUCTS)[number], q: SearchQuery) {
  if (q.categories.length && !q.categories.includes(p.category)) return false;
  if (q.colours.length && !p.colours.some((c) => q.colours.includes(c))) return false;
  if (q.brands.length && !q.brands.includes(p.brandId)) return false;
  if (q.maxPrice != null && p.price > q.maxPrice) return false;
  if (q.sizes.length && !p.sizes.some((s) => q.sizes.includes(s) || s === 'Único')) return false;
  return true;
}

function run(q: SearchQuery, ctx: { origin: { lat: number; lng: number } }): SearchResult {
  const keywords = q.text ? parseIntent(q.text).keywords : [];
  let outsideRadius = 0;

  const evaluate = (p: (typeof PRODUCTS)[number]): SearchHit | null => {
    const sizes = q.sizes.length ? [...q.sizes, 'Único'] : undefined;
    let avail = availabilityFor(p, { origin: ctx.origin, sizes });
    if (q.storeTypes.length) avail = avail.filter((a) => q.storeTypes.includes(a.store.type));
    const inRadius = avail.filter((a) => (a.distanceKm ?? 0) <= q.radiusKm);
    const eligible = inRadius.filter((a) =>
      q.availability === 'any' ? true : q.availability === 'buyable' ? a.status !== 'out' : isBuyable(a.status),
    );
    if (!eligible.length) {
      if (avail.length) outsideRadius++;
      return null;
    }
    const nearest = bestNearby(eligible);
    const { score, reasons } = scoreProduct(p, q, keywords);
    const statusBoost = nearest ? (3 - STATUS_META[nearest.status].rank) * 2 : 0;
    const total = score + statusBoost;
    return {
      product: p,
      score: total,
      reasons,
      match: total >= 55 ? 'strong' : total >= 30 ? 'good' : 'partial',
      nearest,
      nearestStatus: nearest?.status ?? null,
    };
  };

  const strict: SearchHit[] = [];
  for (const p of PRODUCTS) {
    if (!strictMatch(p, q)) continue;
    const hit = evaluate(p);
    if (hit) strict.push(hit);
  }
  const outsideStrict = outsideRadius;
  // With free text but no structured intent, drop items that match nothing.
  const hasIntent = q.categories.length || q.colours.length || q.styles.length || q.brands.length;
  const hits = !hasIntent && keywords.length ? strict.filter((h) => h.score > 1) : strict;

  const sorters: Record<SearchQuery['sort'], (a: SearchHit, b: SearchHit) => number> = {
    relevance: (a, b) => b.score - a.score || a.product.price - b.product.price,
    distance: (a, b) => (a.nearest?.distanceKm ?? 999) - (b.nearest?.distanceKm ?? 999),
    price_asc: (a, b) => a.product.price - b.product.price,
    price_desc: (a, b) => b.product.price - a.product.price,
  };
  hits.sort(sorters[q.sort]);

  let related: SearchHit[] = [];
  if (hits.length < 6) {
    // Relax colour & price, keep category, so the user is never left empty-handed.
    const relaxed: SearchQuery = { ...q, colours: [], maxPrice: null, sizes: [] };
    const seen = new Set(hits.map((h) => h.product.id));
    related = PRODUCTS.filter((p) => !seen.has(p.id) && strictMatch(p, relaxed))
      .map((p) => evaluate(p))
      .filter((h): h is SearchHit => !!h)
      .sort(sorters.relevance)
      .slice(0, 8);
    if (related.length < 4 && q.categories.length) {
      const more = PRODUCTS.filter((p) => !seen.has(p.id) && !related.some((r) => r.product.id === p.id))
        .map((p) => evaluate(p))
        .filter((h): h is SearchHit => !!h && h.score > 0)
        .sort(sorters.relevance)
        .slice(0, 8 - related.length);
      related = [...related, ...more];
    }
  }

  return { hits, related, outsideRadius: outsideStrict };
}

export const ruleEngine: SearchEngine = { parse: parseIntent, run };
