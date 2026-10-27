import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { DEFAULT_PROFILE } from '@/data/outfits';
import { cityById } from '@/data/taxonomy';
import type { BillingCycle, CityId, GeoPoint, Outfit, Purchase, Subscription, UserProfile, WardrobeItem } from '@/data/types';
import { MESSAGES, type Messages } from '@/i18n';
import { img } from '@/data/images';

/* Prototype persistence: one versioned localStorage document. Swap the
   load/save functions for an API client when a backend exists. */

const KEY = 'vesta:state:v1';

export interface LocationState {
  city: CityId;
  radiusKm: number;
  /** Present only after the user explicitly shared their device position. */
  device?: GeoPoint;
}

export interface AppState {
  auth: { signedIn: boolean };
  profile: UserProfile;
  location: LocationState;
  favourites: string[];
  favouriteOutfits: string[];
  savedOutfits: Outfit[];
  wardrobe: WardrobeItem[];
  purchases: Purchase[];
  subscription: Subscription;
  recentlyViewed: string[];
  mysteryBox: { requestedAt?: string; option?: 'delivery' | 'pickup'; storeId?: string } | null;
  onboarded: boolean;
}

const daysAgo = (d: number) => new Date(Date.now() - d * 86400_000).toISOString();

function initialState(): AppState {
  return {
    auth: { signedIn: true },
    profile: DEFAULT_PROFILE,
    location: { city: DEFAULT_PROFILE.city, radiusKm: DEFAULT_PROFILE.radiusKm },
    favourites: ['p-sobretudo-camelo', 'p-mala-ombro'],
    favouriteOutfits: ['o-outono-baixa'],
    savedOutfits: [],
    wardrobe: [
      { id: 'w-seed-1', productId: 'p-jeans-direitos', name: 'Jeans de corte direito', category: 'trousers', colour: 'blue', size: '28', addedAt: daysAgo(40), source: 'purchase' },
      { id: 'w-seed-2', productId: 'p-tshirt-organica', name: 'T-shirt em algodão orgânico', category: 'tops', colour: 'white', size: 'M', addedAt: daysAgo(30), source: 'discovered' },
      { id: 'w-seed-3', name: 'Casaco de malha da avó', category: 'knitwear', colour: 'ecru', image: img.knitB, notes: 'Herdado. Lavar à mão.', addedAt: daysAgo(90), source: 'manual' },
      { id: 'w-seed-4', productId: 'p-tenis-brancos', name: 'Ténis minimalistas em pele', category: 'shoes', colour: 'white', size: '38', addedAt: daysAgo(12), source: 'purchase' },
    ],
    purchases: [
      { id: 'pu-seed-1', productId: 'p-jeans-direitos', name: 'Jeans de corte direito', storeId: 'st-saldanha', storeName: 'Galeria Avenidas', date: daysAgo(40).slice(0, 10), price: 79, size: '28', colour: 'blue', addedToWardrobe: true },
      { id: 'pu-seed-2', productId: 'p-tenis-brancos', name: 'Ténis minimalistas em pele', storeId: 'st-saldanha', storeName: 'Galeria Avenidas', date: daysAgo(12).slice(0, 10), price: 99, size: '38', colour: 'white', notes: 'Troca possível até 30 dias.', addedToWardrobe: true },
    ],
    subscription: { plan: 'free', simulated: true },
    recentlyViewed: ['p-casaco-vintage-castanho', 'p-vestido-linho', 'p-mocassins'],
    mysteryBox: null,
    onboarded: false,
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = initialState();
    return { ...base, ...parsed, profile: { ...base.profile, ...parsed.profile } };
  } catch {
    return initialState();
  }
}

type Action =
  | { type: 'toggleFavourite'; id: string }
  | { type: 'toggleFavouriteOutfit'; id: string }
  | { type: 'saveOutfit'; outfit: Outfit }
  | { type: 'removeOutfit'; id: string }
  | { type: 'addWardrobe'; item: WardrobeItem }
  | { type: 'removeWardrobe'; id: string }
  | { type: 'addPurchase'; purchase: Purchase }
  | { type: 'updatePurchase'; id: string; patch: Partial<Purchase> }
  | { type: 'removePurchase'; id: string }
  | { type: 'updateProfile'; patch: Partial<UserProfile> }
  | { type: 'setLocation'; patch: Partial<LocationState> }
  | { type: 'viewed'; id: string }
  | { type: 'subscribe'; cycle: BillingCycle }
  | { type: 'cancelSubscription' }
  | { type: 'requestMysteryBox'; option: 'delivery' | 'pickup'; storeId?: string }
  | { type: 'cancelMysteryBox' }
  | { type: 'signIn'; name: string; email: string }
  | { type: 'signOut' }
  | { type: 'onboarded' }
  | { type: 'reset' };

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'toggleFavourite':
      return { ...s, favourites: s.favourites.includes(a.id) ? s.favourites.filter((x) => x !== a.id) : [a.id, ...s.favourites] };
    case 'toggleFavouriteOutfit':
      return {
        ...s,
        favouriteOutfits: s.favouriteOutfits.includes(a.id) ? s.favouriteOutfits.filter((x) => x !== a.id) : [a.id, ...s.favouriteOutfits],
      };
    case 'saveOutfit':
      return { ...s, savedOutfits: [a.outfit, ...s.savedOutfits.filter((o) => o.id !== a.outfit.id)] };
    case 'removeOutfit':
      return { ...s, savedOutfits: s.savedOutfits.filter((o) => o.id !== a.id), favouriteOutfits: s.favouriteOutfits.filter((x) => x !== a.id) };
    case 'addWardrobe':
      return { ...s, wardrobe: [a.item, ...s.wardrobe] };
    case 'removeWardrobe':
      return { ...s, wardrobe: s.wardrobe.filter((w) => w.id !== a.id) };
    case 'addPurchase':
      return { ...s, purchases: [a.purchase, ...s.purchases] };
    case 'updatePurchase':
      return { ...s, purchases: s.purchases.map((p) => (p.id === a.id ? { ...p, ...a.patch } : p)) };
    case 'removePurchase':
      return { ...s, purchases: s.purchases.filter((p) => p.id !== a.id) };
    case 'updateProfile': {
      const profile = { ...s.profile, ...a.patch };
      const location = {
        ...s.location,
        ...(a.patch.city ? { city: a.patch.city, device: undefined } : {}),
        ...(a.patch.radiusKm ? { radiusKm: a.patch.radiusKm } : {}),
      };
      return { ...s, profile, location };
    }
    case 'setLocation':
      return { ...s, location: { ...s.location, ...a.patch } };
    case 'viewed':
      return { ...s, recentlyViewed: [a.id, ...s.recentlyViewed.filter((x) => x !== a.id)].slice(0, 12) };
    case 'subscribe':
      return { ...s, subscription: { plan: 'plus', cycle: a.cycle, since: new Date().toISOString(), simulated: true } };
    case 'cancelSubscription':
      return { ...s, subscription: { plan: 'free', simulated: true } };
    case 'requestMysteryBox':
      return { ...s, mysteryBox: { requestedAt: new Date().toISOString(), option: a.option, storeId: a.storeId } };
    case 'cancelMysteryBox':
      return { ...s, mysteryBox: null };
    case 'signIn':
      return { ...s, auth: { signedIn: true }, profile: { ...s.profile, name: a.name, email: a.email } };
    case 'signOut':
      return { ...s, auth: { signedIn: false } };
    case 'onboarded':
      return { ...s, onboarded: true };
    case 'reset':
      return initialState();
  }
}

interface Ctx {
  state: AppState;
  dispatch: (a: Action) => void;
  origin: GeoPoint;
  originLabel: string;
  t: Messages;
  isFavourite: (id: string) => boolean;
  isPlus: boolean;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or disabled — the prototype keeps working in memory */
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.lang = state.profile.language;
  }, [state.profile.language]);

  const city = cityById[state.location.city];
  const origin = state.location.device ?? city;
  const originLabel = state.location.device ? 'A tua localização' : city.name;
  const isFavourite = useCallback((id: string) => state.favourites.includes(id), [state.favourites]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      dispatch,
      origin,
      originLabel,
      t: MESSAGES[state.profile.language],
      isFavourite,
      isPlus: state.subscription.plan === 'plus',
    }),
    [state, origin, originLabel, isFavourite],
  );
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside <AppStateProvider>');
  return ctx;
}
