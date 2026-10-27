import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Camera, LayoutGrid, Map as MapIcon, MapPin, Search as SearchIcon, SlidersHorizontal, Sparkles, Type, UserRound } from 'lucide-react';
import { useApp } from '@/state/AppState';
import { CATEGORIES, categoryById, colourById, styleById } from '@/data/taxonomy';
import { brandById } from '@/data/stores';
import { INSPIRATIONS } from '@/data/outfits';
import { STORE_TYPES } from '@/data/taxonomy';
import { ruleEngine } from '@/services/search/ruleEngine';
import { applyIntent, emptyQuery, paramsToQuery, profileSizes, queryToParams } from '@/services/search/query';
import type { ParsedIntent, SearchHit, SearchQuery, SortKey } from '@/services/search/types';
import { analytics } from '@/services/adapters';
import { Page } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Chip, Tag } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { EmptyState, SimulatedNote } from '@/components/ui/misc';
import { SmartImage } from '@/components/ui/SmartImage';
import { GarmentIllustration } from '@/components/ui/GarmentIllustration';
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard';
import { SimMap } from '@/components/product/SimMap';
import { FiltersPanel, activeFilterCount } from './FiltersPanel';
import { VisualSearch, uploadedPreview } from './VisualSearch';
import { cx, formatDistance } from '@/lib/format';

const EXAMPLES = [
  'Procuro um casaco castanho oversized, estilo vintage, até 80 €, disponível numa loja perto de mim.',
  'Vestido de cetim bordeaux para um casamento',
  'Ténis brancos minimalistas tamanho 38',
  'Mala de pele castanha para o trabalho até 150 €',
  'Calças largas de alfaiataria cinzentas',
];

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'relevance', label: 'Relevância' },
  { id: 'distance', label: 'Distância' },
  { id: 'price_asc', label: 'Preço: mais baixo' },
  { id: 'price_desc', label: 'Preço: mais alto' },
];

export default function Search() {
  const { state, origin, originLabel, t } = useApp();
  const [params, setParams] = useSearchParams();
  const radiusDefault = state.location.radiusKm;
  const query = useMemo(() => paramsToQuery(params, radiusDefault), [params, radiusDefault]);
  const showResults = params.has('r');
  const mode = params.get('modo') === 'imagem' ? 'imagem' : 'texto';
  const [text, setText] = useState(query.text);
  const [usePrefs, setUsePrefs] = useState(state.profile.applyPrefsToSearch);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [draft, setDraft] = useState<SearchQuery>(query);
  const loadTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setText(query.text);
  }, [query.text]);
  useEffect(() => () => window.clearTimeout(loadTimer.current), []);

  const startLoading = () => {
    setLoading(true);
    window.clearTimeout(loadTimer.current);
    loadTimer.current = window.setTimeout(() => setLoading(false), 1100);
  };

  const commit = (q: SearchQuery, opts: { animate?: boolean; replace?: boolean } = {}) => {
    const p = queryToParams(q);
    p.set('r', '1');
    setParams(p, { replace: opts.replace });
    if (opts.animate) {
      startLoading();
      analytics.track('search', { text: q.text, categories: q.categories, image: q.imageRef });
    }
  };

  const withPrefs = (q: SearchQuery): SearchQuery =>
    usePrefs
      ? {
          ...q,
          sizes: q.sizes.length ? q.sizes : profileSizes(state.profile, q.categories),
          colours: q.colours.length ? q.colours : state.profile.colours,
        }
      : q;

  const fromIntent = (intent: ParsedIntent, base: Partial<SearchQuery>) => {
    let q = applyIntent({ ...emptyQuery(radiusDefault), ...base }, intent);
    q = withPrefs(q);
    return q;
  };

  // Deep links from Home ("?q=...&go=1" or "?cat=...&go=1") are interpreted once.
  useEffect(() => {
    if (!params.has('go')) return;
    const base = paramsToQuery(params, radiusDefault);
    const q = base.text ? applyIntent(base, ruleEngine.parse(base.text)) : base;
    commit(q, { animate: true, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const submitText = (e?: FormEvent) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value && !query.categories.length) return;
    commit(fromIntent(ruleEngine.parse(value), { text: value, radiusKm: query.radiusKm, availability: query.availability }), { animate: true });
  };

  const intent = useMemo(() => (query.text ? ruleEngine.parse(query.text) : null), [query.text]);
  const result = useMemo(() => (showResults ? ruleEngine.run(query, { origin }) : null), [showResults, query, origin]);

  const update = (patch: Partial<SearchQuery>) => commit({ ...query, ...patch }, { replace: true });

  const setMode = (m: 'texto' | 'imagem') => {
    const p = new URLSearchParams();
    if (m === 'imagem') p.set('modo', 'imagem');
    setParams(p);
  };

  const imageRef = query.imageRef;
  const inspiration = INSPIRATIONS.find((i) => i.id === imageRef);
  const imagePreview = imageRef === 'upload' ? uploadedPreview.src : inspiration?.image;

  /* ── Composer (no results yet) ─────────────────────────────────────────── */
  if (!showResults) {
    return (
      <Page className="animate-fade-in pt-6 lg:pt-10">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow mb-2">Pesquisa inteligente · {originLabel}</p>
          <h1 className="font-display text-[32px] leading-tight md:text-[44px]">O que imaginas vestir?</h1>

          <div role="tablist" aria-label="Modo de pesquisa" className="mt-6 inline-flex rounded-chip border border-line-strong bg-paper p-1">
            {[
              { id: 'texto' as const, label: 'Descrever', icon: Type },
              { id: 'imagem' as const, label: 'Por imagem', icon: Camera },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={mode === id}
                onClick={() => setMode(id)}
                className={cx('flex h-9 items-center gap-2 rounded-chip px-4 text-sm font-medium transition-colors', mode === id ? 'bg-ink text-ivory' : 'text-ink-soft')}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {mode === 'imagem' ? (
              <VisualSearch onSearch={(i, ref) => commit({ ...fromIntent(i, { radiusKm: query.radiusKm }), imageRef: ref }, { animate: true })} />
            ) : (
              <form onSubmit={submitText} className="space-y-5">
                <div className="rounded-card border border-line-strong bg-paper p-4 shadow-soft focus-within:border-ink">
                  <label htmlFor="q" className="sr-only">
                    Descreve a peça
                  </label>
                  <textarea
                    id="q"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) submitText(e as unknown as FormEvent);
                    }}
                    rows={3}
                    placeholder="Ex.: casaco castanho oversized, estilo vintage, até 80 €, disponível perto de mim"
                    className="w-full resize-none bg-transparent font-display text-xl leading-snug outline-none placeholder:text-[#a9a49b] md:text-2xl"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-soft">
                      <input type="checkbox" className="size-4 accent-ink" checked={usePrefs} onChange={(e) => setUsePrefs(e.target.checked)} />
                      <UserRound size={14} /> Usar os meus tamanhos e cores
                      <span className="text-muted">
                        ({state.profile.sizes.tops} · {state.profile.sizes.bottoms} · {state.profile.sizes.shoes})
                      </span>
                    </label>
                    <Button type="submit" icon={<Sparkles size={16} />} disabled={!text.trim()}>
                      Encontrar peças
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-2">Experimenta</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLES.map((ex) => (
                      <button key={ex} type="button" onClick={() => setText(ex)} className="rounded-chip bg-line/70 px-3 py-1.5 text-left text-[13px] text-ink-soft hover:bg-line">
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-2">Ou começa por uma categoria</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => commit(withPrefs({ ...emptyQuery(query.radiusKm), categories: [c.id] }), { animate: true })}
                        className="flex flex-col items-center gap-1.5 rounded-card border border-line bg-paper px-2 py-3 text-[12.5px] font-medium hover:border-ink"
                      >
                        <GarmentIllustration category={c.id} className="h-10 text-ink/80" />
                        {c.plural}
                      </button>
                    ))}
                  </div>
                </div>
                <SimulatedNote>
                  {t.search.simulated}: a interpretação do texto usa regras transparentes sobre um vocabulário de moda em português — não há um modelo de IA ligado neste protótipo.
                </SimulatedNote>
              </form>
            )}
          </div>
        </div>
      </Page>
    );
  }

  /* ── Results ───────────────────────────────────────────────────────────── */
  const hits = result?.hits ?? [];
  const related = result?.related ?? [];
  const filterCount = activeFilterCount(query);

  return (
    <div className="animate-fade-in">
      <div className="sticky top-0 z-30 border-b border-line bg-ivory/95 backdrop-blur lg:top-16">
        <Page className="py-3">
          <form onSubmit={submitText} role="search" className="flex items-center gap-2">
            {imagePreview && <SmartImage src={imagePreview} alt="Imagem de inspiração" className="size-11 shrink-0 rounded-md" />}
            <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-chip border border-line-strong bg-paper pr-1 pl-4 focus-within:border-ink">
              <SearchIcon size={16} className="shrink-0 text-muted" aria-hidden />
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                aria-label="Pesquisa"
                placeholder={imageRef ? 'Afinar com texto…' : 'Descreve a peça…'}
                className="min-w-0 flex-1 bg-transparent text-[14.5px] outline-none"
              />
              <Link to="/pesquisar?modo=imagem" aria-label="Pesquisar por imagem" className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-ink/5">
                <Camera size={17} />
              </Link>
            </div>
            <Button
              variant="secondary"
              className="relative !px-3.5 lg:hidden"
              aria-label="Filtros"
              onClick={() => {
                setDraft(query);
                setFiltersOpen(true);
              }}
            >
              <SlidersHorizontal size={16} />
              {filterCount > 0 && <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-clay text-[10px] font-bold text-white">{filterCount}</span>}
            </Button>
          </form>

          <div className="no-scrollbar -mx-4 mt-2.5 flex items-center gap-2 overflow-x-auto px-4 md:-mx-8 md:px-8 lg:hidden">
            <Chip active={query.availability === 'available_only'} onClick={() => update({ availability: query.availability === 'available_only' ? 'buyable' : 'available_only' })}>
              Disponível agora
            </Chip>
            {[5, 10, 25].map((r) => (
              <Chip key={r} active={query.radiusKm === r} onClick={() => update({ radiusKm: r })}>
                {r} km
              </Chip>
            ))}
            <Chip active={query.maxPrice === 80} onClick={() => update({ maxPrice: query.maxPrice === 80 ? null : 80 })}>
              até 80 €
            </Chip>
            {CATEGORIES.slice(0, 6).map((c) => (
              <Chip key={c.id} active={query.categories.includes(c.id)} onClick={() => update({ categories: query.categories.includes(c.id) ? query.categories.filter((x) => x !== c.id) : [...query.categories, c.id] })}>
                {c.plural}
              </Chip>
            ))}
          </div>
        </Page>
      </div>

      <Page className="pt-5 lg:grid lg:grid-cols-[264px_1fr] lg:gap-10 lg:pt-8 [&>*]:min-w-0">
        <aside className="hidden lg:block">
          <div className="sticky top-[150px] max-h-[calc(100dvh-170px)] overflow-y-auto pr-2 pb-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Filtros</h2>
              {filterCount > 0 && (
                <button className="text-[13px] text-muted underline underline-offset-4 hover:text-ink" onClick={() => commit({ ...emptyQuery(query.radiusKm), text: query.text, imageRef: query.imageRef }, { replace: true })}>
                  Limpar
                </button>
              )}
            </div>
            <FiltersPanel q={query} onChange={update} />
          </div>
        </aside>

        <section aria-live="polite" aria-busy={loading}>
          {/* Interpretation */}
          <div className="mb-5 space-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 inline-flex items-center gap-1 rounded-chip bg-clay-soft px-2 py-1 text-[11px] font-semibold tracking-wide text-clay-deep uppercase">
                <Sparkles size={11} /> {t.search.simulated}
              </span>
              <span className="text-[13px] text-muted">{imageRef ? 'Interpretámos a imagem como:' : 'Interpretámos:'}</span>
              {query.categories.map((c) => (
                <Tag key={c} onRemove={() => update({ categories: query.categories.filter((x) => x !== c) })}>
                  {categoryById[c].label}
                </Tag>
              ))}
              {query.colours.map((c) => (
                <Tag key={c} onRemove={() => update({ colours: query.colours.filter((x) => x !== c) })}>
                  <span className="size-2.5 rounded-full border border-black/10" style={{ background: colourById[c].hex }} /> {colourById[c].label}
                </Tag>
              ))}
              {query.styles.map((s) => (
                <Tag key={s} onRemove={() => update({ styles: query.styles.filter((x) => x !== s) })}>
                  {styleById[s].label}
                </Tag>
              ))}
              {query.sizes.map((s) => (
                <Tag key={s} onRemove={() => update({ sizes: query.sizes.filter((x) => x !== s) })}>
                  Tam. {s}
                </Tag>
              ))}
              {query.brands.map((b) => (
                <Tag key={b} onRemove={() => update({ brands: query.brands.filter((x) => x !== b) })}>
                  {brandById[b]?.name}
                </Tag>
              ))}
              {query.storeTypes.map((s) => (
                <Tag key={s} onRemove={() => update({ storeTypes: query.storeTypes.filter((x) => x !== s) })}>
                  {STORE_TYPES[s]}
                </Tag>
              ))}
              {query.maxPrice != null && <Tag onRemove={() => update({ maxPrice: null })}>até {query.maxPrice} €</Tag>}
              <Tag tone="clay">
                <MapPin size={11} /> {query.radiusKm} km de {originLabel}
              </Tag>
              {query.availability === 'available_only' && <Tag onRemove={() => update({ availability: 'buyable' })}>Disponível agora</Tag>}
              {intent?.keywords.slice(0, 3).map((k) => (
                <Tag key={k}>“{k}”</Tag>
              ))}
            </div>
            {intent?.city && intent.city !== state.location.city && !state.location.device && (
              <p className="text-[13px] text-ink-soft">
                Mencionaste outra cidade. Muda a localização no seletor para pesquisar lá.
              </p>
            )}
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-[15px]">
              {loading ? (
                <span className="text-muted">A procurar…</span>
              ) : (
                <>
                  <span className="font-display text-2xl">{hits.length}</span> <span className="text-muted">{hits.length === 1 ? 'peça encontrada' : 'peças encontradas'}</span>
                </>
              )}
            </h1>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="sort">
                Ordenar
              </label>
              <select id="sort" value={query.sort} onChange={(e) => update({ sort: e.target.value as SortKey })} className="h-9 rounded-chip border border-line-strong bg-paper px-3 text-[13px]">
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <div role="radiogroup" aria-label="Vista" className="flex rounded-chip border border-line-strong bg-paper p-0.5">
                {[
                  { id: 'grid' as const, icon: LayoutGrid, label: 'Lista' },
                  { id: 'map' as const, icon: MapIcon, label: 'Mapa' },
                ].map(({ id, icon: Icon, label }) => (
                  <button key={id} role="radio" aria-checked={view === id} aria-label={label} title={label} onClick={() => setView(id)} className={cx('grid h-8 w-9 place-items-center rounded-chip', view === id ? 'bg-ink text-ivory' : 'text-ink-soft')}>
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div>
              <div className="mb-6 flex items-center gap-3 rounded-card border border-line bg-paper p-4">
                <span className="relative flex size-9 shrink-0 items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-clay/25 motion-reduce:hidden" />
                  <Sparkles size={18} className="text-clay" />
                </span>
                <p className="font-display text-lg italic">{t.search.loading}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : hits.length === 0 ? (
            <EmptyResults query={query} outside={result?.outsideRadius ?? 0} onWiden={() => update({ radiusKm: 50, availability: 'buyable' })} onClear={() => commit({ ...emptyQuery(query.radiusKm), text: query.text })} />
          ) : view === 'map' ? (
            <ResultsMap hits={hits} radiusKm={query.radiusKm} originLabel={originLabel} />
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
              {hits.map((h, i) => (
                <div key={h.product.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}>
                  <ProductCard product={h.product} nearest={h.nearest} match={h.match} reasons={h.reasons} />
                </div>
              ))}
            </div>
          )}

          {!loading && related.length > 0 && (
            <div className="mt-14">
              <h2 className="font-display text-2xl">Também te pode interessar</h2>
              <p className="mt-1 mb-5 text-[13px] text-muted">Alargámos a pesquisa a outras cores e preços, mantendo o raio de {query.radiusKm} km.</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
                {related.map((h) => (
                  <ProductCard key={h.product.id} product={h.product} nearest={h.nearest} />
                ))}
              </div>
            </div>
          )}

          {!loading && (
            <SimulatedNote className="mt-10">
              Resultados gerados por um motor de regras sobre um catálogo de demonstração. A disponibilidade indicada é a reportada (fictícia) por cada loja, com a hora da última atualização na página da peça. Confirma sempre com a loja.
            </SimulatedNote>
          )}
        </section>
      </Page>

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtros"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDraft({ ...emptyQuery(query.radiusKm), text: query.text, imageRef: query.imageRef, sort: query.sort })}>
              Limpar
            </Button>
            <Button
              block
              onClick={() => {
                commit(draft, { replace: true });
                setFiltersOpen(false);
              }}
            >
              Ver {ruleEngine.run(draft, { origin }).hits.length} peças
            </Button>
          </div>
        }
      >
        <FiltersPanel q={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} />
      </Sheet>
    </div>
  );
}

function EmptyResults({ query, outside, onWiden, onClear }: { query: SearchQuery; outside: number; onWiden: () => void; onClear: () => void }) {
  return (
    <EmptyState
      illustration={<GarmentIllustration category={query.categories[0] ?? 'outerwear'} className="h-24" />}
      title="Ainda não encontrámos essa peça por perto"
      body={
        outside > 0
          ? `Há ${outside} ${outside === 1 ? 'peça que corresponde' : 'peças que correspondem'} à tua ideia em lojas fora do raio de ${query.radiusKm} km.`
          : 'Experimenta remover alguns filtros ou descrever a peça de outra forma.'
      }
      action={
        <div className="flex flex-wrap justify-center gap-2">
          {outside > 0 && (
            <Button onClick={onWiden} icon={<ArrowRight size={15} />}>
              Alargar a 50 km
            </Button>
          )}
          <Button variant="secondary" onClick={onClear}>
            Limpar filtros
          </Button>
        </div>
      }
    />
  );
}

function ResultsMap({ hits, radiusKm, originLabel }: { hits: SearchHit[]; radiusKm: number; originLabel: string }) {
  const { origin } = useApp();
  const byStore = useMemo(() => {
    const m = new Map<string, { hit: SearchHit[]; store: NonNullable<SearchHit['nearest']>['store']; distanceKm: number }>();
    for (const h of hits) {
      if (!h.nearest) continue;
      const e = m.get(h.nearest.store.id) ?? { hit: [], store: h.nearest.store, distanceKm: h.nearest.distanceKm ?? 0 };
      e.hit.push(h);
      m.set(h.nearest.store.id, e);
    }
    return [...m.values()].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [hits]);
  const [selected, setSelected] = useState<string | undefined>(byStore[0]?.store.id);
  const sel = byStore.find((s) => s.store.id === selected) ?? byStore[0];

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
      <SimMap
        origin={origin}
        originLabel={originLabel}
        radiusKm={radiusKm}
        className="aspect-square md:aspect-[4/3]"
        pins={byStore.map((s) => ({ store: s.store, distanceKm: s.distanceKm, count: s.hit.length, tone: 'success' }))}
        selectedId={sel?.store.id}
        onSelect={setSelected}
      />
      {sel && (
        <div>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">{formatDistance(sel.distanceKm)} · {sel.store.neighbourhood}</p>
              <h3 className="font-display text-2xl">{sel.store.name}</h3>
              <p className="text-[13px] text-muted">{sel.hit.length} {sel.hit.length === 1 ? 'peça' : 'peças'} da tua pesquisa (loja mais próxima com disponibilidade)</p>
            </div>
            <Link to={`/lojas/${sel.store.id}`} className="shrink-0 text-[13px] font-semibold underline underline-offset-4">
              Ver loja
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6">
            {sel.hit.map((h) => (
              <ProductCard key={h.product.id} product={h.product} nearest={h.nearest} size="sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
