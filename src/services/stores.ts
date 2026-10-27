import type { GeoPoint, Store } from '@/data/types';
import { STORES } from '@/data/stores';
import { distanceKm } from './geo';

const DAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/** Opening state from mock hours, using the viewer's local clock. */
export function openState(store: Store, at = new Date()) {
  const today = store.hours[at.getDay()];
  const hhmm = `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;
  if (today && hhmm >= today.open && hhmm < today.close) return { open: true, label: `Aberta · fecha às ${today.close}` };
  if (today && hhmm < today.open) return { open: false, label: `Fechada · abre às ${today.open}` };
  for (let i = 1; i <= 7; i++) {
    const d = (at.getDay() + i) % 7;
    const h = store.hours[d];
    if (h) return { open: false, label: `Fechada · abre ${i === 1 ? 'amanhã' : DAYS[d]} às ${h.open}` };
  }
  return { open: false, label: 'Horário por confirmar' };
}

export function hoursTable(store: Store) {
  return [1, 2, 3, 4, 5, 6, 0].map((d) => ({
    day: DAYS[d].charAt(0).toUpperCase() + DAYS[d].slice(1),
    hours: store.hours[d] ? `${store.hours[d]!.open} – ${store.hours[d]!.close}` : 'Encerrada',
    today: d === new Date().getDay(),
  }));
}

export function storesNear(origin: GeoPoint, radiusKm: number) {
  return STORES.map((s) => ({ store: s, distanceKm: distanceKm(origin, s) }))
    .filter((x) => x.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function allStoresByDistance(origin: GeoPoint) {
  return STORES.map((s) => ({ store: s, distanceKm: distanceKm(origin, s) })).sort((a, b) => a.distanceKm - b.distanceKm);
}
