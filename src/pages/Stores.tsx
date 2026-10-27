import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LayoutList, Map as MapIcon, MapPin } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { CITIES, RADII, STORE_TYPES } from '@/data/taxonomy';
import type { StoreType } from '@/data/types';
import { useApp } from '@/state/AppState';
import { allStoresByDistance } from '@/services/stores';
import { isBuyable, productsAtStore } from '@/services/inventory';
import { Page, PageHeader } from '@/components/layout/PageHeader';
import { StoreCard } from '@/components/product/StoreCard';
import { SimMap } from '@/components/product/SimMap';
import { LocationSheet } from '@/components/product/LocationSheet';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { EmptyState, Segmented, SimulatedNote } from '@/components/ui/misc';
import { SmartImage } from '@/components/ui/SmartImage';
import { colourById } from '@/data/taxonomy';
import { cx, formatDistance } from '@/lib/format';

export default function Stores() {
  const { state, dispatch, origin, originLabel } = useApp();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [type, setType] = useState<StoreType | null>(null);
  const [locOpen, setLocOpen] = useState(false);
  const [selected, setSelected] = useState<string | undefined>();
  const radius = state.location.radiusKm;

  const all = useMemo(() => allStoresByDistance(origin), [origin]);
  const stores = all.filter((s) => s.distanceKm <= radius && (!type || s.store.type === type));
  const enriched = stores.map((s) => {
    const items = productsAtStore(s.store.id, PRODUCTS);
    return { ...s, items, buyable: items.filter((i) => isBuyable(i.availability.status)) };
  });
  const nearestOutside = all.find((s) => s.distanceKm > radius);
  const sel = enriched.find((s) => s.store.id === selected) ?? enriched[0];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Lojas perto de ti" />
      <Page className="pt-4 lg:pt-10">
        <p className="eyebrow">Comércio local</p>
        <h1 className="mt-1 font-display text-[32px] leading-tight md:text-[44px]">Lojas perto de ti</h1>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
          <button onClick={() => setLocOpen(true)} className="flex h-11 items-center gap-2 rounded-chip border border-line-strong bg-paper px-4 text-sm hover:border-ink">
            <MapPin size={15} /> {originLabel} <ChevronDown size={15} />
          </button>
          <div className="md:w-[360px]">
            <Segmented label="Raio" options={RADII} value={radius as (typeof RADII)[number]} onChange={(r) => dispatch({ type: 'setLocation', patch: { radiusKm: r } })} format={(v) => `${v} km`} />
          </div>
          <div role="radiogroup" aria-label="Vista" className="flex rounded-chip border border-line-strong bg-paper p-1 md:ml-auto">
            {[
              { id: 'list' as const, label: 'Lista', icon: LayoutList },
              { id: 'map' as const, label: 'Mapa', icon: MapIcon },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} role="radio" aria-checked={view === id} onClick={() => setView(id)} className={cx('flex h-8 items-center gap-1.5 rounded-chip px-3 text-[13px] font-medium', view === id ? 'bg-ink text-ivory' : 'text-ink-soft')}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          <Chip active={!type} onClick={() => setType(null)}>
            Todas
          </Chip>
          {(Object.entries(STORE_TYPES) as [StoreType, string][]).map(([id, label]) => (
            <Chip key={id} active={type === id} onClick={() => setType(type === id ? null : id)}>
              {label}
            </Chip>
          ))}
        </div>

        <p className="mt-5 text-[13px] text-muted">
          {enriched.length} {enriched.length === 1 ? 'loja' : 'lojas'} até {radius} km de {originLabel}
        </p>

        {enriched.length === 0 ? (
          <EmptyState
            title="Sem lojas neste raio"
            body={nearestOutside ? `A loja de demonstração mais próxima fica a ${formatDistance(nearestOutside.distanceKm)} (${nearestOutside.store.name}).` : 'Experimenta outra cidade.'}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => dispatch({ type: 'setLocation', patch: { radiusKm: 50 } })}>Alargar a 50 km</Button>
                <Button variant="secondary" onClick={() => setLocOpen(true)}>
                  Mudar de cidade
                </Button>
              </div>
            }
          />
        ) : view === 'map' ? (
          <div className="mt-4 grid gap-5 lg:grid-cols-[1.3fr_1fr] [&>*]:min-w-0">
            <SimMap
              origin={origin}
              originLabel={originLabel}
              radiusKm={radius}
              className="aspect-square md:aspect-[4/3]"
              pins={enriched.map((s) => ({ store: s.store, distanceKm: s.distanceKm, count: s.buyable.length, tone: s.buyable.length ? 'success' : 'neutral' }))}
              selectedId={sel?.store.id}
              onSelect={setSelected}
            />
            {sel && (
              <StoreCard
                store={sel.store}
                distanceKm={sel.distanceKm}
                footer={<StorePreview items={sel.buyable} storeId={sel.store.id} />}
              />
            )}
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enriched.map((s) => (
              <StoreCard key={s.store.id} store={s.store} distanceKm={s.distanceKm} footer={<StorePreview items={s.buyable} storeId={s.store.id} />} />
            ))}
          </div>
        )}

        <div className="mt-10">
          <p className="eyebrow mb-2">Cidades com lojas de demonstração</p>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <Chip key={c.id} active={!state.location.device && state.location.city === c.id} onClick={() => dispatch({ type: 'setLocation', patch: { city: c.id, device: undefined } })}>
                {c.name}
              </Chip>
            ))}
          </div>
        </div>
        <SimulatedNote className="mt-6">Lojas fictícias com horários e stock de demonstração. As direções abrem no Google Maps com as coordenadas aproximadas.</SimulatedNote>
      </Page>
      <LocationSheet open={locOpen} onClose={() => setLocOpen(false)} />
    </div>
  );
}

function StorePreview({ items, storeId }: { items: ReturnType<typeof productsAtStore>; storeId: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex -space-x-2">
        {items.slice(0, 4).map(({ product: p }) => (
          <SmartImage key={p.id} src={p.images[0]} alt="" category={p.category} tint={colourById[p.colours[0]].hex} className="size-9 rounded-full border-2 border-paper" />
        ))}
      </div>
      <Link to={`/lojas/${storeId}`} className="text-[12.5px] text-ink-soft hover:text-ink">
        <span className="font-semibold text-ink">{items.length}</span> peças disponíveis →
      </Link>
    </div>
  );
}
