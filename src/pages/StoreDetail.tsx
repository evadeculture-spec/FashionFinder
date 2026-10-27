import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, MapPin, Navigation, Phone } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { brandById, storeById } from '@/data/stores';
import { CATEGORIES, STORE_TYPES, cityById } from '@/data/taxonomy';
import type { CategoryId, DisplayStatus } from '@/data/types';
import { useApp } from '@/state/AppState';
import { STATUS_META, SOURCE_LABEL, productsAtStore } from '@/services/inventory';
import { distanceKm, directionsUrl } from '@/services/geo';
import { hoursTable, openState } from '@/services/stores';
import { analytics } from '@/services/adapters';
import { Page, PageHeader, DesktopBack } from '@/components/layout/PageHeader';
import { SmartImage } from '@/components/ui/SmartImage';
import { Chip } from '@/components/ui/Chip';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState, SimulatedNote } from '@/components/ui/misc';
import { ProductCard } from '@/components/product/ProductCard';
import { cx, formatDistance } from '@/lib/format';

export default function StoreDetail() {
  const { id = '' } = useParams();
  const store = storeById[id];
  const { origin, originLabel } = useApp();
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [status, setStatus] = useState<DisplayStatus | 'all'>('all');
  const items = useMemo(() => (store ? productsAtStore(store.id, PRODUCTS) : []), [store]);

  if (!store) {
    return (
      <>
        <PageHeader />
        <EmptyState title="Loja não encontrada" body="Esta loja não faz parte da demonstração." action={<ButtonLink to="/lojas">Ver lojas</ButtonLink>} />
      </>
    );
  }

  const open = openState(store);
  const d = distanceKm(origin, store);
  const cats = CATEGORIES.filter((c) => items.some((i) => i.product.category === c.id));
  const filtered = items
    .filter((i) => !cat || i.product.category === cat)
    .filter((i) => status === 'all' || i.availability.status === status)
    .sort((a, b) => STATUS_META[a.availability.status].rank - STATUS_META[b.availability.status].rank);
  const counts = items.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.availability.status]: (acc[i.availability.status] ?? 0) + 1 }), {});
  const lastUpdate = items.map((i) => i.availability.lastUpdatedAt).sort().pop();

  return (
    <div className="animate-fade-in">
      <PageHeader title={store.name} />
      <div className="relative">
        <SmartImage src={store.image} alt={store.name} label={store.name} className="aspect-[16/10] max-h-[440px] w-full md:aspect-[21/8]" eager />
      </div>
      <Page className="relative -mt-10 md:-mt-16">
        <DesktopBack />
        <div className="grid gap-6 rounded-card border border-line bg-paper p-5 shadow-soft md:grid-cols-[1.4fr_1fr] md:p-8">
          <div>
            <p className="eyebrow">{STORE_TYPES[store.type]} · {store.neighbourhood}</p>
            <h1 className="mt-1 font-display text-[30px] leading-tight md:text-[40px]">{store.name}</h1>
            <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-ink-soft">{store.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {store.brandIds.map((b) => (
                <span key={b} className="rounded-chip bg-ivory px-2.5 py-1 text-xs">
                  {brandById[b].name}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={directionsUrl(store)}
                target="_blank"
                rel="noreferrer"
                onClick={() => analytics.track('directions', { storeId: store.id })}
                className="inline-flex h-11 items-center gap-2 rounded-chip bg-ink px-5 text-sm font-medium text-ivory hover:bg-ink-soft"
              >
                <Navigation size={15} /> Como chegar
              </a>
              <span className="inline-flex h-11 items-center gap-2 rounded-chip border border-dashed border-line-strong px-4 text-[13px] text-muted" title="Contacto não disponível na demonstração">
                <Phone size={14} /> Contacto indisponível (demo)
              </span>
            </div>
          </div>
          <div className="space-y-4 text-[13.5px]">
            <p className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0" />
              <span>
                {store.address}
                <br />
                <span className="text-muted">
                  {formatDistance(d)} de {originLabel} · {cityById[store.city].name}
                </span>
              </span>
            </p>
            <div>
              <p className={cx('mb-2 flex items-center gap-2 font-medium', open.open ? 'text-success' : '')}>
                <Clock size={15} /> {open.label}
              </p>
              <table className="w-full text-[13px]">
                <tbody>
                  {hoursTable(store).map((h) => (
                    <tr key={h.day} className={cx(h.today && 'font-semibold')}>
                      <td className="py-0.5 pr-3 text-muted">{h.day}</td>
                      <td className="py-0.5 text-right tabular">{h.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="rounded-md bg-ivory px-3 py-2 text-xs text-muted">
              Stock: {SOURCE_LABEL[items[0]?.availability.source ?? 'store_manual']}.
              {lastUpdate && <> Última atualização {new Date(lastUpdate).toLocaleString('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.</>}
            </p>
          </div>
        </div>

        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-[26px]">Peças nesta loja</h2>
            <p className="text-[13px] text-muted">
              {counts.available ?? 0} disponíveis · {counts.low ?? 0} últimas unidades · {counts.unconfirmed ?? 0} por confirmar
            </p>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
            <Chip active={!cat} onClick={() => setCat(null)}>
              Tudo ({items.length})
            </Chip>
            {cats.map((c) => (
              <Chip key={c.id} active={cat === c.id} onClick={() => setCat(cat === c.id ? null : c.id)}>
                {c.plural}
              </Chip>
            ))}
            <span className="mx-1 hidden w-px bg-line-strong md:block" />
            {(['available', 'low', 'unconfirmed'] as DisplayStatus[]).map((s) => (
              <Chip key={s} active={status === s} onClick={() => setStatus(status === s ? 'all' : s)}>
                {STATUS_META[s].short}
              </Chip>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map(({ product, availability }) => (
              <ProductCard key={product.id} product={product} nearest={{ ...availability, distanceKm: d }} />
            ))}
          </div>
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted">Nenhuma peça com estes filtros.</p>}
        </section>
        <SimulatedNote className="mt-8">Loja fictícia criada para demonstração. Nenhuma parceria comercial real é implicada.</SimulatedNote>
      </Page>
    </div>
  );
}
