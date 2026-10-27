import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, Scale, Trash2, X } from 'lucide-react';
import { productById } from '@/data/products';
import { outfitById } from '@/data/outfits';
import { brandById } from '@/data/stores';
import { colourById } from '@/data/taxonomy';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { availabilityFor, bestNearby } from '@/services/inventory';
import { Page, PageHeader } from '@/components/layout/PageHeader';
import { ProductCard } from '@/components/product/ProductCard';
import { OutfitCard } from '@/components/product/OutfitCard';
import { EmptyState } from '@/components/ui/misc';
import { ButtonLink, Button } from '@/components/ui/Button';
import { SmartImage } from '@/components/ui/SmartImage';
import { StockBadge } from '@/components/ui/StockBadge';
import { GarmentIllustration } from '@/components/ui/GarmentIllustration';
import { cx, formatDistance, formatPrice } from '@/lib/format';

type Tab = 'pecas' | 'looks' | 'comparar';

export default function Saved() {
  const { state, dispatch, origin } = useApp();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) || 'pecas';
  const [compare, setCompare] = useState<string[]>([]);
  const products = state.favourites.map((id) => productById[id]).filter(Boolean);
  const looks = [
    ...state.savedOutfits,
    ...state.favouriteOutfits.map((id) => outfitById[id]).filter(Boolean),
  ];
  const withNear = useMemo(() => products.map((p) => ({ p, near: bestNearby(availabilityFor(p, { origin }), state.location.radiusKm) ?? bestNearby(availabilityFor(p, { origin })) })), [products, origin, state.location.radiusKm]);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'pecas', label: 'Peças', count: products.length },
    { id: 'looks', label: 'Looks', count: looks.length },
    { id: 'comparar', label: 'Comparar' },
  ];

  const toggleCompare = (id: string) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]));

  return (
    <div className="animate-fade-in">
      <PageHeader title="Guardados" back={false} />
      <Page className="pt-4 lg:pt-10">
        <p className="eyebrow">A tua lista de desejos</p>
        <h1 className="mt-1 font-display text-[32px] md:text-[44px]">Guardados</h1>
        <p className="mt-1 text-[13px] text-muted">Peças e looks que queres ver na loja. O que já tens vive no <Link to="/guarda-roupa" className="underline underline-offset-4">guarda-roupa</Link>.</p>

        <div role="tablist" className="mt-6 flex gap-6 border-b border-line">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setParams(t.id === 'pecas' ? {} : { tab: t.id }, { replace: true })}
              className={cx('-mb-px border-b-2 pb-3 text-[14.5px] transition-colors', tab === t.id ? 'border-ink font-semibold text-ink' : 'border-transparent text-muted hover:text-ink')}
            >
              {t.label}
              {t.count != null && <span className="ml-1.5 text-xs text-muted tabular">{t.count}</span>}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'pecas' &&
            (products.length ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 lg:grid-cols-5">
                {withNear.map(({ p, near }) => (
                  <div key={p.id}>
                    <ProductCard product={p} nearest={near} />
                    <div className="mt-2 flex gap-1.5">
                      <button onClick={() => toggleCompare(p.id)} aria-pressed={compare.includes(p.id)} className={cx('inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-chip border text-xs font-medium', compare.includes(p.id) ? 'border-ink bg-ink text-ivory' : 'border-line-strong')}>
                        <Scale size={13} /> {compare.includes(p.id) ? 'A comparar' : 'Comparar'}
                      </button>
                      <button
                        onClick={() => {
                          dispatch({ type: 'toggleFavourite', id: p.id });
                          setCompare((c) => c.filter((x) => x !== p.id));
                          toast({ message: 'Removida dos guardados', tone: 'info' });
                        }}
                        aria-label={`Remover ${p.name}`}
                        className="grid size-8 place-items-center rounded-chip border border-line-strong text-muted hover:text-danger"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                illustration={<Heart size={40} strokeWidth={1.2} />}
                title="Ainda não guardaste nada"
                body="Toca no coração de uma peça para a guardar aqui e voltar a ela mais tarde."
                action={<ButtonLink to="/pesquisar">Descobrir peças</ButtonLink>}
              />
            ))}

          {tab === 'looks' &&
            (looks.length ? (
              <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                {looks.map((o) => (
                  <div key={o.id}>
                    <OutfitCard outfit={o} />
                    <div className="mt-2 flex items-center justify-between text-xs text-muted">
                      <span>{o.origin === 'user' ? 'Criado por ti' : 'Look editorial'}</span>
                      <button
                        onClick={() => {
                          dispatch(o.origin === 'user' ? { type: 'removeOutfit', id: o.id } : { type: 'toggleFavouriteOutfit', id: o.id });
                          toast({ message: 'Look removido', tone: 'info' });
                        }}
                        className="inline-flex items-center gap-1 hover:text-danger"
                      >
                        <X size={13} /> Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                illustration={<GarmentIllustration category="dresses" className="h-24" />}
                title="Sem looks guardados"
                body="Abre um look editorial ou cria o teu a partir de qualquer peça."
                action={<ButtonLink to="/looks">Ver looks</ButtonLink>}
              />
            ))}

          {tab === 'comparar' && <Compare ids={compare} onPick={() => setParams({}, { replace: true })} onRemove={(id) => setCompare((c) => c.filter((x) => x !== id))} />}
        </div>

        {tab === 'pecas' && compare.length > 0 && (
          <div className="fixed inset-x-4 bottom-[calc(80px+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-chip bg-ink py-2 pr-2 pl-5 text-ivory shadow-lift lg:bottom-8">
            <span className="text-sm">{compare.length}/3 para comparar</span>
            <Button variant="light" size="sm" onClick={() => setParams({ tab: 'comparar' }, { replace: true })} disabled={compare.length < 2}>
              Comparar
            </Button>
          </div>
        )}
      </Page>
    </div>
  );
}

function Compare({ ids, onPick, onRemove }: { ids: string[]; onPick: () => void; onRemove: (id: string) => void }) {
  const { origin, state } = useApp();
  if (ids.length < 2)
    return (
      <EmptyState
        illustration={<Scale size={40} strokeWidth={1.2} />}
        title="Escolhe 2 ou 3 peças"
        body="Na lista de peças guardadas, toca em “Comparar” para as ver lado a lado."
        action={<Button onClick={onPick}>Escolher peças</Button>}
      />
    );
  const rows = ids.map((id) => {
    const p = productById[id];
    const near = bestNearby(availabilityFor(p, { origin }), state.location.radiusKm) ?? bestNearby(availabilityFor(p, { origin }));
    return { p, near };
  });
  const cheapest = Math.min(...rows.map((r) => r.p.price));
  const closest = Math.min(...rows.map((r) => r.near?.distanceKm ?? 999));
  const line = 'border-t border-line py-3 pr-3 align-top text-[13px]';
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
      <table className="w-full min-w-[560px] table-fixed">
        <thead>
          <tr>
            <th className="w-28" />
            {rows.map(({ p }) => (
              <th key={p.id} className="pr-3 pb-3 text-left align-top font-normal">
                <Link to={`/produto/${p.id}`}>
                  <SmartImage src={p.images[0]} alt="" category={p.category} tint={colourById[p.colours[0]].hex} className="aspect-[4/5] rounded-md" />
                  <p className="mt-2 line-clamp-2 text-sm font-medium">{p.name}</p>
                </Link>
                <button onClick={() => onRemove(p.id)} className="mt-1 text-xs text-muted hover:text-danger">
                  Retirar
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className={cx(line, 'text-left font-normal text-muted')}>Preço</th>
            {rows.map(({ p }) => (
              <td key={p.id} className={line}>
                <span className="font-semibold tabular">{formatPrice(p.price)}</span>
                {p.price === cheapest && <span className="ml-1.5 rounded-chip bg-success-soft px-1.5 py-0.5 text-[10.5px] text-success">Mais barata</span>}
              </td>
            ))}
          </tr>
          <tr>
            <th className={cx(line, 'text-left font-normal text-muted')}>Marca</th>
            {rows.map(({ p }) => (
              <td key={p.id} className={line}>{brandById[p.brandId].name}</td>
            ))}
          </tr>
          <tr>
            <th className={cx(line, 'text-left font-normal text-muted')}>Loja mais próxima</th>
            {rows.map(({ p, near }) => (
              <td key={p.id} className={line}>
                {near ? (
                  <>
                    {near.store.name}
                    <br />
                    <span className="text-muted tabular">{formatDistance(near.distanceKm)}</span>
                    {near.distanceKm === closest && <span className="ml-1.5 rounded-chip bg-success-soft px-1.5 py-0.5 text-[10.5px] text-success">Mais perto</span>}
                  </>
                ) : (
                  '—'
                )}
              </td>
            ))}
          </tr>
          <tr>
            <th className={cx(line, 'text-left font-normal text-muted')}>Disponibilidade</th>
            {rows.map(({ p, near }) => (
              <td key={p.id} className={line}>{near ? <StockBadge status={near.status} short updatedAt={near.lastUpdatedAt} /> : '—'}</td>
            ))}
          </tr>
          <tr>
            <th className={cx(line, 'text-left font-normal text-muted')}>Material</th>
            {rows.map(({ p }) => (
              <td key={p.id} className={line}>{p.material}</td>
            ))}
          </tr>
          <tr>
            <th className={cx(line, 'text-left font-normal text-muted')}>Tamanhos</th>
            {rows.map(({ p }) => (
              <td key={p.id} className={line}>{p.sizes.join(' · ')}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
