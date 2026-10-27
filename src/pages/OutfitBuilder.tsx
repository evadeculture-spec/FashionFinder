import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Bookmark, Check, MapPin, Plus, RefreshCw, Repeat2, Trash2, Wallet } from 'lucide-react';
import { productById } from '@/data/products';
import { outfitById } from '@/data/outfits';
import { SLOT_LABELS, colourById, slotForCategory } from '@/data/taxonomy';
import { brandById } from '@/data/stores';
import type { Outfit, OutfitSlot, Product } from '@/data/types';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { candidatesFor, composeOutfit, slotsFor, summarise } from '@/services/outfits';
import { Page, PageHeader, DesktopBack } from '@/components/layout/PageHeader';
import { SmartImage } from '@/components/ui/SmartImage';
import { Button } from '@/components/ui/Button';
import { StockBadge } from '@/components/ui/StockBadge';
import { Sheet } from '@/components/ui/Sheet';
import { EmptyState, SimulatedNote } from '@/components/ui/misc';
import { Price } from '@/components/ui/Price';
import { ButtonLink } from '@/components/ui/Button';
import { cx, formatDistance, formatPrice, uid } from '@/lib/format';

const BUDGETS = [null, 200, 300, 450, 600] as const;

export default function OutfitBuilder() {
  const { id, outfitId } = useParams();
  const { origin, state, dispatch, originLabel, isPlus } = useApp();
  const toast = useToast();
  const nav = useNavigate();

  const base: Outfit | undefined = outfitId ? (outfitById[outfitId] ?? state.savedOutfits.find((o) => o.id === outfitId)) : undefined;
  const anchor: Product | undefined = id ? productById[id] : base ? productById[Object.values(base.items)[0]!] : undefined;

  const [budget, setBudget] = useState<number | null>(null);
  const [variant, setVariant] = useState(0);
  const ctx = useMemo(() => ({ origin, radiusKm: state.location.radiusKm, budget }), [origin, state.location.radiusKm, budget]);
  const [outfit, setOutfit] = useState<Outfit | undefined>(() => base ?? (anchor ? composeOutfit(anchor, ctx, 0) : undefined));
  const [swapSlot, setSwapSlot] = useState<OutfitSlot | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    setOutfit(base ?? (anchor ? composeOutfit(anchor, ctx, 0) : undefined));
    setVariant(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, outfitId]);

  if (!anchor || !outfit) {
    return (
      <>
        <PageHeader />
        <EmptyState title="Look não encontrado" body="Escolhe uma peça para começar a combinar." action={<ButtonLink to="/looks">Ver looks</ButtonLink>} />
      </>
    );
  }

  const summary = summarise(outfit, ctx);
  const anchorSlot = slotForCategory(anchor.category);
  const slots = slotsFor(anchor).filter((s) => !(s === 'dress' && anchorSlot !== 'dress'));
  const isEditorial = base?.origin === 'editorial';
  const alreadySaved = state.savedOutfits.some((o) => o.id === outfit.id);

  const regenerate = () => {
    const v = variant + 1;
    setVariant(v);
    setOutfit(composeOutfit(anchor, ctx, v));
  };

  const applyBudget = (b: number | null) => {
    setBudget(b);
    setOutfit(composeOutfit(anchor, { ...ctx, budget: b }, variant));
  };

  const setItem = (slot: OutfitSlot, productId: string | null) => {
    setOutfit((o) => {
      if (!o) return o;
      const items = { ...o.items };
      if (productId) items[slot] = productId;
      else delete items[slot];
      return { ...o, items, id: o.origin === 'editorial' ? `copy-${o.id}` : o.id, origin: 'user' };
    });
  };

  const save = () => {
    if (!isPlus && !alreadySaved && state.savedOutfits.length >= 5) {
      toast({ message: 'Chegaste ao limite de 5 looks do plano gratuito', tone: 'info', action: { label: 'VESTA+', to: '/premium' } });
      return;
    }
    const finalName = name.trim() || (isEditorial ? `${base!.name} (a minha versão)` : `Look com ${anchor.name.toLowerCase()}`);
    const id = outfit.id.startsWith('u-') ? outfit.id : uid('u');
    const saved: Outfit = { ...outfit, id, name: finalName, origin: 'user', mood: outfit.mood, cover: productById[Object.values(outfit.items)[0]!].images[0], createdAt: new Date().toISOString() };
    dispatch({ type: 'saveOutfit', outfit: saved });
    setOutfit(saved);
    setSaveOpen(false);
    toast({ message: 'Look guardado', tone: 'success', action: { label: 'Ver', to: '/guardados?tab=looks' } });
  };

  const items = summary.products;
  const stores = [...new Map(items.filter((i) => i.near).map((i) => [i.near!.store.id, i.near!])).values()].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  return (
    <div className="animate-fade-in">
      <PageHeader title={isEditorial ? base!.name : 'Montar look'} />
      <Page className="pt-4 lg:pt-8">
        <DesktopBack />
        <div className="mb-6">
          <p className="eyebrow">{isEditorial ? `${base!.mood} · ${base!.occasion}` : `A partir de ${anchor.name}`}</p>
          <h1 className="mt-1 font-display text-[30px] leading-tight md:text-[42px]">{outfit.origin === 'user' && alreadySaved ? outfit.name : isEditorial ? base!.name : 'O teu look, de várias lojas'}</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 [&>*]:min-w-0">
          {/* Collage */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Collage items={items.map((i) => i.product)} cover={isEditorial ? base!.cover : undefined} />
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat label="Total do look" value={formatPrice(summary.total)} />
              <Stat label="Lojas" value={String(summary.storesCount)} />
              <Stat label={`Disponíveis até ${state.location.radiusKm} km`} value={`${summary.buyableNearby}/${items.length}`} />
            </div>
          </div>

          {/* Pieces */}
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[13px] text-muted">
                <Wallet size={14} /> Orçamento:
              </span>
              {BUDGETS.map((b) => (
                <button
                  key={String(b)}
                  onClick={() => applyBudget(b)}
                  aria-pressed={budget === b}
                  className={cx('h-8 rounded-chip border px-3 text-[12.5px] font-medium', budget === b ? 'border-ink bg-ink text-ivory' : 'border-line-strong bg-paper')}
                >
                  {b == null ? 'Livre' : `até ${b} €`}
                </button>
              ))}
            </div>
            {budget != null && summary.total > budget && (
              <p className="mb-3 rounded-md bg-warning-soft px-3 py-2 text-[13px] text-warning">
                Este look ultrapassa o orçamento em {formatPrice(summary.total - budget)}. Troca uma peça ou gera outra combinação.
              </p>
            )}

            <ul className="space-y-2.5">
              {slots.map((slot) => {
                const it = items.find((i) => i.slot === slot);
                const locked = slot === anchorSlot && it?.product.id === anchor.id;
                return (
                  <li key={slot} className="rounded-card border border-line bg-paper p-3">
                    <p className="eyebrow mb-2 !text-[10px]">{SLOT_LABELS[slot]}</p>
                    {it ? (
                      <div className="flex items-center gap-3">
                        <Link to={`/produto/${it.product.id}`} className="shrink-0">
                          <SmartImage src={it.product.images[0]} alt="" category={it.product.category} tint={colourById[it.product.colours[0]].hex} className="h-20 w-16 rounded-md" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link to={`/produto/${it.product.id}`} className="line-clamp-1 text-[14.5px] font-medium hover:underline">
                            {it.product.name}
                          </Link>
                          <p className="text-xs text-muted">{brandById[it.product.brandId].name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <Price value={it.product.price} size="sm" />
                            {it.near ? (
                              <>
                                <StockBadge status={it.near.status} short />
                                <span className="text-[11.5px] text-muted">
                                  {it.near.store.name} · {formatDistance(it.near.distanceKm)}
                                </span>
                              </>
                            ) : (
                              <span className="text-[11.5px] text-muted">Sem loja até {state.location.radiusKm} km</span>
                            )}
                          </div>
                        </div>
                        {!locked ? (
                          <div className="flex shrink-0 flex-col gap-1">
                            <button onClick={() => setSwapSlot(slot)} className="inline-flex h-8 items-center gap-1 rounded-chip border border-line-strong px-2.5 text-xs font-medium hover:border-ink">
                              <Repeat2 size={13} /> Trocar
                            </button>
                            <button onClick={() => setItem(slot, null)} aria-label={`Remover ${SLOT_LABELS[slot]}`} className="inline-flex h-8 items-center justify-center gap-1 rounded-chip px-2.5 text-xs text-muted hover:text-danger">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="shrink-0 rounded-chip bg-ivory px-2 py-1 text-[11px] text-muted">Peça base</span>
                        )}
                      </div>
                    ) : (
                      <button onClick={() => setSwapSlot(slot)} className="flex w-full items-center gap-2 rounded-md border border-dashed border-line-strong px-3 py-3 text-[13px] text-muted hover:border-ink hover:text-ink">
                        <Plus size={15} /> Adicionar {SLOT_LABELS[slot].toLowerCase()}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="lg" icon={alreadySaved ? <Check size={16} /> : <Bookmark size={16} />} onClick={() => {
                setName(alreadySaved ? outfit.name : '');
                setSaveOpen(true);
              }}>
                {alreadySaved ? 'Guardado' : 'Guardar look'}
              </Button>
              <Button size="lg" variant="secondary" icon={<RefreshCw size={16} />} onClick={regenerate}>
                Ver outra combinação
              </Button>
            </div>

            {stores.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-xl">Onde encontrar as peças</h2>
                <p className="mb-3 text-[13px] text-muted">Lojas mais próximas de {originLabel} com cada peça.</p>
                <ol className="space-y-2">
                  {stores.map((s, i) => {
                    const here = items.filter((it) => it.near?.store.id === s.store.id);
                    return (
                      <li key={s.store.id}>
                        <Link to={`/lojas/${s.store.id}`} className="flex items-center gap-3 rounded-card border border-line bg-paper p-3 hover:border-ink/40">
                          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-ivory">{i + 1}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{s.store.name}</p>
                            <p className="truncate text-xs text-muted">{here.map((h) => h.product.name).join(' · ')}</p>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted">
                            <MapPin size={12} /> {formatDistance(s.distanceKm)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            <SimulatedNote className="mt-6">
              Combinações sugeridas por regras de estilo (estilos partilhados, cores neutras, disponibilidade no raio e orçamento). Não são uma medida científica de compatibilidade.
            </SimulatedNote>
          </div>
        </div>
      </Page>

      <Sheet open={swapSlot != null} onClose={() => setSwapSlot(null)} title={swapSlot ? `Trocar ${SLOT_LABELS[swapSlot].toLowerCase()}` : ''} wide>
        {swapSlot && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {candidatesFor(swapSlot, anchor, ctx)
              .slice(0, 12)
              .map(({ product: p, near }) => {
                const current = outfit.items[swapSlot] === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setItem(swapSlot, p.id);
                      setSwapSlot(null);
                    }}
                    aria-pressed={current}
                    className={cx('rounded-card border bg-paper p-2 text-left transition', current ? 'border-ink' : 'border-line hover:border-ink/40')}
                  >
                    <SmartImage src={p.images[0]} alt="" category={p.category} tint={colourById[p.colours[0]].hex} className="aspect-[4/5] rounded-md" />
                    <p className="mt-2 line-clamp-1 text-[13px] font-medium">{p.name}</p>
                    <div className="mt-0.5 flex items-center justify-between gap-1">
                      <span className="text-[13px] font-semibold tabular">{formatPrice(p.price)}</span>
                      {near && <span className="text-[11px] text-muted">{formatDistance(near.distanceKm)}</span>}
                    </div>
                    {near && <StockBadge status={near.status} short className="mt-1" />}
                  </button>
                );
              })}
          </div>
        )}
      </Sheet>

      <Sheet
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title="Guardar look"
        footer={
          <Button block onClick={save}>
            Guardar
          </Button>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-3"
        >
          <label htmlFor="look-name" className="block text-[13px] font-medium text-ink-soft">
            Nome do look
          </label>
          <input id="look-name" className="field" autoFocus placeholder={isEditorial ? `${base!.name} (a minha versão)` : 'Ex.: Jantar de sexta'} value={name} onChange={(e) => setName(e.target.value)} />
          <p className="text-xs text-muted">
            {items.length} peças · {formatPrice(summary.total)} · fica nos teus Guardados.
          </p>
          {!isPlus ? (
            <p className="text-xs text-muted">
              Plano gratuito: até 5 looks guardados ({state.savedOutfits.length}/5).{' '}
              <button type="button" className="font-semibold underline" onClick={() => nav('/premium')}>
                VESTA+ é ilimitado
              </button>
            </p>
          ) : null}
        </form>
      </Sheet>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-paper px-2 py-3">
      <p className="font-display text-xl tabular">{value}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-muted">{label}</p>
    </div>
  );
}

/* Editorial collage: asymmetric grid that reads like a magazine flat-lay. */
function Collage({ items, cover }: { items: Product[]; cover?: string }) {
  const [a, ...rest] = items;
  return (
    <div className="grid aspect-[4/5] grid-cols-6 grid-rows-6 gap-2 rounded-card bg-[#EDE8DF] p-2 md:aspect-[5/5]">
      <div className="relative col-span-4 row-span-6 overflow-hidden rounded-md">
        <SmartImage src={cover ?? a?.images[0]} alt={a?.name ?? ''} category={a?.category} tint={a ? colourById[a.colours[0]].hex : undefined} className="h-full w-full" />
        {a && (
          <span className="absolute bottom-2 left-2 rounded-chip bg-paper/90 px-2 py-1 text-[11px] font-medium">
            {cover ? 'Look editorial' : a.name}
          </span>
        )}
      </div>
      {rest.slice(0, 3).map((p, i) => (
        <div key={p.id} className={cx('relative col-span-2 overflow-hidden rounded-md', i === 0 ? 'row-span-2' : 'row-span-2')}>
          <SmartImage src={p.images[0]} alt={p.name} category={p.category} tint={colourById[p.colours[0]].hex} className="h-full w-full" />
        </div>
      ))}
      {rest.length < 3 && Array.from({ length: 3 - rest.length }).map((_, i) => <div key={i} className="col-span-2 row-span-2 rounded-md border border-dashed border-taupe/50" />)}
    </div>
  );
}
