import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Check, Clock, Info, MapPin, Navigation, Receipt, Share2, Shirt, Sparkles, Store as StoreIcon } from 'lucide-react';
import { productById } from '@/data/products';
import { brandById } from '@/data/stores';
import { OUTFITS } from '@/data/outfits';
import { categoryById, colourById, styleById, cityById } from '@/data/taxonomy';
import type { ColourId, StoreAvailability } from '@/data/types';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { SOURCE_LABEL, STATUS_META, availabilityFor, bestNearby, displayStatus, isBuyable } from '@/services/inventory';
import { directionsUrl } from '@/services/geo';
import { looksWith, similarProducts } from '@/services/outfits';
import { openState } from '@/services/stores';
import { analytics } from '@/services/adapters';
import { Page, PageHeader } from '@/components/layout/PageHeader';
import { SmartImage } from '@/components/ui/SmartImage';
import { Button, ButtonLink, IconButton } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { StockBadge } from '@/components/ui/StockBadge';
import { EmptyState, Rail, SectionHeader, SimulatedNote } from '@/components/ui/misc';
import { Sheet } from '@/components/ui/Sheet';
import { FavouriteButton } from '@/components/product/FavouriteButton';
import { ProductCard } from '@/components/product/ProductCard';
import { OutfitCard } from '@/components/product/OutfitCard';
import { PurchaseSheet } from '@/components/product/PurchaseSheet';
import { cx, formatDistance, timeAgo, uid } from '@/lib/format';

export default function ProductDetail() {
  const { id = '' } = useParams();
  const product = productById[id];
  const { origin, state, dispatch, t, originLabel } = useApp();
  const toast = useToast();
  const nav = useNavigate();
  const [colour, setColour] = useState<ColourId | undefined>(product?.colours[0]);
  const [size, setSize] = useState<string | undefined>(product?.sizes.length === 1 ? product.sizes[0] : undefined);
  const [imgIdx, setImgIdx] = useState(0);
  const [storeSheet, setStoreSheet] = useState<StoreAvailability | null>(null);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const storesRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!product) return;
    dispatch({ type: 'viewed', id: product.id });
    analytics.track('product_view', { productId: product.id });
    setColour(product.colours[0]);
    setSize(product.sizes.length === 1 ? product.sizes[0] : undefined);
    setImgIdx(0);
  }, [product, dispatch]);

  const availability = useMemo(
    () => (product ? availabilityFor(product, { origin, colour, sizes: size ? [size] : undefined }) : []),
    [product, origin, colour, size],
  );
  const allAvailability = useMemo(() => (product ? availabilityFor(product, { origin, colour }) : []), [product, origin, colour]);
  const nearest = bestNearby(availability, state.location.radiusKm) ?? bestNearby(availability);

  if (!product) {
    return (
      <>
        <PageHeader />
        <EmptyState title="Peça não encontrada" body="Esta peça pode ter sido retirada do catálogo de demonstração." action={<ButtonLink to="/pesquisar">Pesquisar peças</ButtonLink>} />
      </>
    );
  }

  const brand = brandById[product.brandId];
  const tint = colourById[colour ?? product.colours[0]].hex;
  const looks = looksWith(product.id, OUTFITS);
  const similar = similarProducts(product, 8);
  const inWardrobe = state.wardrobe.some((w) => w.productId === product.id);

  // Which sizes are reported available at any store within radius (for the selected colour).
  const sizeStatus = (s: string) => {
    const recs = allAvailability.filter((a) => (a.distanceKm ?? 0) <= state.location.radiusKm).flatMap((a) => a.records.filter((r) => r.size === s));
    if (!recs.length) return 'none';
    return recs.some((r) => isBuyable(displayStatus(r))) ? 'ok' : 'out';
  };

  const addToWardrobe = () => {
    if (inWardrobe) {
      nav('/guarda-roupa');
      return;
    }
    dispatch({
      type: 'addWardrobe',
      item: { id: uid('w'), productId: product.id, name: product.name, category: product.category, colour, size, addedAt: new Date().toISOString(), source: 'discovered' },
    });
    toast({ message: 'Adicionada ao teu guarda-roupa', tone: 'success', action: { label: 'Ver', to: '/guarda-roupa' } });
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast({ message: 'Ligação copiada', tone: 'info' });
      }
    } catch {
      /* user cancelled */
    }
  };

  const goToStores = () => {
    if (nearest) setStoreSheet(nearest);
    else storesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="animate-fade-in pb-16 lg:pb-0">
      <PageHeader
        actions={
          <>
            <IconButton label="Partilhar" onClick={share}>
              <Share2 size={18} />
            </IconButton>
          </>
        }
      />

      <Page className="lg:pt-8">
        <nav aria-label="Localização na página" className="mb-5 hidden text-[13px] text-muted lg:block">
          <Link to="/" className="hover:text-ink">Descobrir</Link> / <Link to={`/pesquisar?cat=${product.category}&go=1`} className="hover:text-ink">{categoryById[product.category].plural}</Link> /{' '}
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14 [&>*]:min-w-0">
          {/* Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="-mx-4 md:mx-0">
              <div className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto md:hidden" onScroll={(e) => setImgIdx(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
                {product.images.map((src, i) => (
                  <SmartImage key={src + i} src={src} alt={`${product.name} — imagem ${i + 1}`} category={product.category} tint={tint} className="aspect-[4/5] w-full shrink-0 snap-center" eager={i === 0} />
                ))}
              </div>
              <div className="mt-2 flex justify-center gap-1.5 md:hidden" aria-hidden>
                {product.images.map((_, i) => (
                  <span key={i} className={cx('h-1.5 rounded-full transition-all', i === imgIdx ? 'w-5 bg-ink' : 'w-1.5 bg-line-strong')} />
                ))}
              </div>
            </div>
            <div className="hidden gap-3 md:grid md:grid-cols-[72px_1fr]">
              <div className="flex flex-col gap-2">
                {product.images.map((src, i) => (
                  <button key={src + i} onClick={() => setImgIdx(i)} aria-label={`Ver imagem ${i + 1}`} aria-pressed={i === imgIdx} className={cx('overflow-hidden rounded-md ring-offset-2 ring-offset-ivory', i === imgIdx && 'ring-2 ring-ink')}>
                    <SmartImage src={src} alt="" category={product.category} tint={tint} className="aspect-[4/5]" />
                  </button>
                ))}
              </div>
              <SmartImage src={product.images[imgIdx]} alt={product.name} category={product.category} tint={tint} className="aspect-[4/5] rounded-card" eager />
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="eyebrow">{brand.name}</p>
            <h1 className="mt-1.5 font-display text-[30px] leading-tight md:text-[38px]">{product.name}</h1>
            <div className="mt-3 flex items-center justify-between">
              <Price value={product.price} compareAt={product.compareAt} size="lg" />
              <FavouriteButton productId={product.id} variant="plain" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.styles.map((s) => (
                <span key={s} className="rounded-chip bg-line/70 px-2.5 py-1 text-xs text-ink-soft">
                  {styleById[s].label}
                </span>
              ))}
            </div>

            {/* Colour */}
            <div className="mt-7">
              <p className="mb-2 text-[13px]">
                Cor: <span className="font-semibold">{colour ? colourById[colour].label : '—'}</span>
              </p>
              <div className="flex gap-2.5">
                {product.colours.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColour(c)}
                    aria-label={colourById[c].label}
                    aria-pressed={colour === c}
                    className={cx('size-9 rounded-full border border-black/10 ring-offset-2 ring-offset-ivory transition', colour === c ? 'ring-2 ring-ink' : 'hover:scale-105')}
                    style={{ background: colourById[c].hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            {product.sizes.length > 1 && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-[13px]">
                  <p>
                    Tamanho: <span className="font-semibold">{size ?? 'escolhe um'}</span>
                  </p>
                  <span className="text-muted">Disponibilidade até {state.location.radiusKm} km</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const st = sizeStatus(s);
                    return (
                      <button
                        key={s}
                        onClick={() => setSize(size === s ? undefined : s)}
                        aria-pressed={size === s}
                        className={cx(
                          'relative h-11 min-w-12 rounded-md border px-3 text-sm font-medium tabular transition-colors',
                          size === s ? 'border-ink bg-ink text-ivory' : 'border-line-strong bg-paper hover:border-ink',
                          st !== 'ok' && size !== s && 'text-muted',
                        )}
                      >
                        {s}
                        {st === 'ok' && <span className={cx('absolute top-1 right-1 size-1.5 rounded-full', size === s ? 'bg-ivory' : 'bg-success')} aria-label="disponível por perto" />}
                        {st !== 'ok' && <span className="absolute inset-x-2 top-1/2 h-px -rotate-12 bg-current opacity-40" aria-label="sem disponibilidade por perto" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Availability summary */}
            <div className="mt-7 rounded-card border border-line bg-paper p-4">
              {nearest ? (
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ivory">
                    <StoreIcon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <StockBadge status={nearest.status} />
                    <p className="mt-1.5 text-[15px] font-semibold">{nearest.store.name}</p>
                    <p className="text-[13px] text-muted">
                      {formatDistance(nearest.distanceKm)} de {originLabel} · {nearest.store.neighbourhood}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                      <Clock size={12} /> Atualizado {timeAgo(nearest.lastUpdatedAt)} · {SOURCE_LABEL[nearest.source]}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  Nenhuma loja de demonstração tem esta combinação de cor e tamanho. Experimenta outra cor ou tamanho.
                </p>
              )}
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button size="lg" block icon={<MapPin size={16} />} onClick={goToStores}>
                  {t.product.primaryCta}
                </Button>
                <Button size="lg" variant="secondary" block icon={inWardrobe ? <Check size={16} /> : <Shirt size={16} />} onClick={addToWardrobe}>
                  {inWardrobe ? 'No teu guarda-roupa' : t.product.secondaryCta}
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
                <button onClick={() => setPurchaseOpen(true)} className="inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline">
                  <Receipt size={14} /> Registar compra
                </button>
                <Link to={`/produto/${product.id}/looks`} className="inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline">
                  <Sparkles size={14} /> Criar look com esta peça
                </Link>
              </div>
            </div>

            <div className="mt-7 space-y-3 text-[14.5px] leading-relaxed text-ink-soft">
              <p>{product.description}</p>
              <dl className="grid grid-cols-[110px_1fr] gap-y-1.5 text-[13px]">
                <dt className="text-muted">Material</dt>
                <dd>{product.material}</dd>
                <dt className="text-muted">Categoria</dt>
                <dd>{categoryById[product.category].label}</dd>
                <dt className="text-muted">Marca</dt>
                <dd>
                  {brand.name} — <span className="text-muted">{brand.tagline}</span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Stores */}
        <section ref={storesRef} className="mt-14 scroll-mt-24" aria-labelledby="stores-title">
          <SectionHeader eyebrow={size ? `Tamanho ${size} · ${colour ? colourById[colour].label : ''}` : colour ? colourById[colour].label : undefined} title={<span id="stores-title">Lojas com esta peça</span>} />
          {availability.length ? (
            <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-paper">
              {availability.map((a) => {
                const open = openState(a.store);
                const inRadius = (a.distanceKm ?? 0) <= state.location.radiusKm;
                return (
                  <li key={a.store.id}>
                    <button onClick={() => setStoreSheet(a)} className="flex w-full items-center gap-4 p-4 text-left hover:bg-ivory/60">
                      <SmartImage src={a.store.image} alt="" label="" className="hidden size-16 shrink-0 rounded-md sm:block" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{a.store.name}</p>
                          {!inRadius && <span className="rounded-chip bg-line px-2 py-0.5 text-[10.5px] text-muted">Fora do raio</span>}
                        </div>
                        <p className="text-[13px] text-muted">
                          {formatDistance(a.distanceKm)} · {a.store.neighbourhood}, {cityById[a.store.city].name} · <span className={open.open ? 'text-success' : ''}>{open.label}</span>
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <StockBadge status={a.status} updatedAt={a.lastUpdatedAt} />
                          {a.sizesAvailable.length > 0 && !size && <span className="text-xs text-muted">Tamanhos: {a.sizesAvailable.join(', ')}</span>}
                        </div>
                      </div>
                      <ArrowRight size={16} className="shrink-0 text-muted" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-card border border-dashed border-line-strong bg-paper p-6 text-center text-sm text-muted">Sem lojas para esta combinação.</p>
          )}
          <SimulatedNote className="mt-4">
            Disponibilidade simulada: as lojas e quantidades são fictícias. Dados com mais de 72 h passam a “por confirmar”, mesmo que indiquem stock — nunca mostramos stock antigo como garantido.
          </SimulatedNote>
        </section>

        {/* Looks */}
        <section className="mt-14">
          <SectionHeader eyebrow="Como usar" title="Looks com esta peça" action={{ label: 'Montar o meu look', to: `/produto/${product.id}/looks` }} />
          {looks.length ? (
            <Rail>
              {looks.map((o) => (
                <OutfitCard key={o.id} outfit={o} className="w-[70%] shrink-0 snap-start sm:w-[40%] lg:w-[24%]" />
              ))}
              <Link to={`/produto/${product.id}/looks`} className="flex w-[70%] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line-strong bg-paper p-6 text-center sm:w-[40%] lg:w-[24%]">
                <Sparkles size={22} className="text-clay" />
                <span className="font-display text-xl">Criar combinações</span>
                <span className="text-[13px] text-muted">Peças de várias lojas, dentro do teu raio.</span>
              </Link>
            </Rail>
          ) : (
            <ButtonLink to={`/produto/${product.id}/looks`} variant="secondary" icon={<Sparkles size={15} />}>
              Montar um look com esta peça
            </ButtonLink>
          )}
        </section>

        {/* Similar */}
        <section className="mt-14">
          <SectionHeader eyebrow="Alternativas" title="Peças semelhantes" />
          <Rail>
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} nearest={bestNearby(availabilityFor(p, { origin }))} className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[18.6%]" />
            ))}
          </Rail>
        </section>
      </Page>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-40 border-t border-line bg-ivory/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <Price value={product.price} size="sm" />
            {nearest && <p className="truncate text-[11.5px] text-muted">{STATUS_META[nearest.status].short} · {formatDistance(nearest.distanceKm)}</p>}
          </div>
          <Button onClick={goToStores} icon={<MapPin size={15} />}>
            Ver loja
          </Button>
        </div>
      </div>

      <StoreAvailabilitySheet a={storeSheet} onClose={() => setStoreSheet(null)} productName={product.name} selectedSize={size} />
      <PurchaseSheet open={purchaseOpen} onClose={() => setPurchaseOpen(false)} product={product} defaultSize={size} defaultColour={colour} />
    </div>
  );
}

function StoreAvailabilitySheet({ a, onClose, productName, selectedSize }: { a: StoreAvailability | null; onClose: () => void; productName: string; selectedSize?: string }) {
  if (!a) return null;
  const open = openState(a.store);
  const bySize = a.records.reduce<Record<string, ReturnType<typeof displayStatus>>>((acc, r) => {
    const st = displayStatus(r);
    if (!acc[r.size] || STATUS_META[st].rank < STATUS_META[acc[r.size]].rank) acc[r.size] = st;
    return acc;
  }, {});
  return (
    <Sheet
      open
      onClose={onClose}
      title="Disponibilidade na loja"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <a
            href={directionsUrl(a.store)}
            target="_blank"
            rel="noreferrer"
            onClick={() => analytics.track('directions', { storeId: a.store.id })}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-chip bg-ink px-5 text-sm font-medium text-ivory hover:bg-ink-soft"
          >
            <Navigation size={15} /> Direções
          </a>
          <ButtonLink to={`/lojas/${a.store.id}`} variant="secondary" onClick={onClose}>
            Ver loja
          </ButtonLink>
        </div>
      }
    >
      <SmartImage src={a.store.image} alt={a.store.name} label={a.store.name} className="aspect-[16/8] rounded-card" />
      <div className="mt-4">
        <p className="eyebrow">{productName}</p>
        <h3 className="mt-1 font-display text-2xl">{a.store.name}</h3>
        <p className="mt-1 text-[13px] text-muted">{a.store.address}</p>
        <p className={cx('mt-1 text-[13px]', open.open ? 'text-success' : 'text-muted')}>{open.label}</p>
      </div>

      <div className="mt-5 rounded-card border border-line bg-paper p-4">
        <StockBadge status={a.status} />
        <dl className="mt-3 grid grid-cols-[120px_1fr] gap-y-2 text-[13px]">
          <dt className="text-muted">Última atualização</dt>
          <dd>{timeAgo(a.lastUpdatedAt)} · {new Date(a.lastUpdatedAt).toLocaleString('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</dd>
          <dt className="text-muted">Fonte</dt>
          <dd>{SOURCE_LABEL[a.source]}</dd>
          <dt className="text-muted">Verificação</dt>
          <dd>{a.verification === 'store_confirmed' ? 'Confirmado pela equipa da loja' : 'Reportado automaticamente pelo sistema da loja'}</dd>
        </dl>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-[13px] font-semibold">Por tamanho</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Object.entries(bySize).map(([s, st]) => (
            <div key={s} className={cx('rounded-md border p-2 text-center', s === selectedSize ? 'border-ink' : 'border-line bg-paper')}>
              <p className="text-sm font-semibold tabular">{s}</p>
              <p className="text-[11px] text-muted">{STATUS_META[st].short}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted">
        <Info size={14} className="mt-0.5 shrink-0" />
        Dados de demonstração. Numa versão real, recomendamos ligar para a loja ou pedir reserva antes de te deslocares.
      </p>
    </Sheet>
  );
}
