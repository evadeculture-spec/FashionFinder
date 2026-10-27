import { INSPIRATIONS } from '@/data/outfits';
import { COLOURS } from '@/data/taxonomy';
import type { CategoryId, ColourId } from '@/data/types';
import type { ParsedIntent } from './types';

/* SIMULATED visual search.
   - Curated inspiration images carry pre-annotated attributes.
   - Uploaded images get a genuine (but simple) on-device dominant-colour
     analysis via <canvas>. The garment type comes from the user.
   No image leaves the browser and no vision model is called. */

export function intentFromInspiration(id: string): ParsedIntent | null {
  const insp = INSPIRATIONS.find((i) => i.id === id);
  if (!insp) return null;
  return {
    categories: [insp.detected.category],
    colours: insp.detected.colours,
    styles: insp.detected.styles,
    sizes: [],
    maxPrice: null,
    city: null,
    nearMe: true,
    wantsInStock: false,
    keywords: [],
  };
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Nearest palette colours to a set of sampled pixels (top 2). */
function nearestColours(samples: number[][]): ColourId[] {
  const tally = new Map<ColourId, number>();
  const palette = COLOURS.filter((c) => c.id !== 'gold' && c.id !== 'silver').map((c) => ({ id: c.id, rgb: hexToRgb(c.hex) }));
  for (const [r, g, b] of samples) {
    let best = palette[0];
    let bestD = Infinity;
    for (const c of palette) {
      const d = (r - c.rgb[0]) ** 2 * 0.3 + (g - c.rgb[1]) ** 2 * 0.59 + (b - c.rgb[2]) ** 2 * 0.11;
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    tally.set(best.id, (tally.get(best.id) ?? 0) + 1);
  }
  return [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([id]) => id);
}

/** Samples the central area of an image (where the garment usually is). */
export function analyseImageColours(src: string): Promise<ColourId[]> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      try {
        const size = 48;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve([]);
        ctx.drawImage(image, 0, 0, size, size);
        const { data } = ctx.getImageData(size * 0.2, size * 0.15, size * 0.6, size * 0.7);
        const samples: number[][] = [];
        for (let i = 0; i < data.length; i += 4 * 3) samples.push([data[i], data[i + 1], data[i + 2]]);
        resolve(nearestColours(samples));
      } catch {
        resolve([]);
      }
    };
    image.onerror = () => resolve([]);
    image.src = src;
  });
}

export function intentFromUpload(category: CategoryId | null, colours: ColourId[]): ParsedIntent {
  return {
    categories: category ? [category] : [],
    colours,
    styles: [],
    sizes: [],
    maxPrice: null,
    city: null,
    nearMe: true,
    wantsInStock: false,
    keywords: [],
  };
}
