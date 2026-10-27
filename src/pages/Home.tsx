import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Camera, ChevronDown, MapPin, Search, Sparkles, Store as StoreIcon, Wand2 } from 'lucide-react';
import { useApp } from '@/state/AppState';
import { PRODUCTS, productById } from '@/data/products';
import { OUTFITS } from '@/data/outfits';
import { img } from '@/data/images';
import { availabilityFor, bestNearby, isBuyable } from '@/services/inventory';
import { storesNear, allStoresByDistance } from '@/services/stores';
import { productsAtStore } from '@/services/inventory';
import { Page } from '@/components/layout/PageHeader';
import { Logo } from '@/components/layout/Logo';
import { SmartImage } from '@/components/ui/SmartImage';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Rail, SectionHeader, SimulatedNote } from '@/components/ui/misc';
import { StockBadge } from '@/components/ui/StockBadge';
import { ProductCard } from '@/components/product/ProductCard';
import { OutfitCard } from '@/components/product/OutfitCard';
import { StoreCard } from '@/components/product/StoreCard';
import { CategoryTile } from '@/components/product/CategoryTile';
import { LocationSheet } from '@/components/product/LocationSheet';
import { formatDistance, formatPrice } from '@/lib/format';
import type { CategoryId } from '@/data/types';

const TRENDING: { category: CategoryId; image: string }[] = [
  { category: 'outerwear', image: img.coatCamel },
  { category: 'knitwear', image: img.knit },
  { category: 'dresses', image: img.dressSlip },
  { category: 'shoes', image: img.boots },
  { category: 'bags', image: img.bagShoulder },
  { category: 'trousers', image: img.jeans },
  { category: 'jewellery', image: img.earrings },
  { category: 'accessories', image: img.sunglasses },
];

const PROMPTS = [
  'Casaco castanho oversized, vintage, até 80 €',
  'Vestido de cetim para um casamento',
  'Ténis brancos minimalistas tamanho 38',
  'Camisola de lã cru, estilo clássico',
];

export default function Home() {
  const { state, t, origin, originLabel } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [locOpen, setLocOpen] = useState(false);
  const radius = state.location.radiusKm;

  const hour = new Date().getHours();
  const greeting = hour < 13 ? t.home.greetingMorning : hour < 20 ? t.home.greetingAfternoon : t.home.greetingEvening;

  const nearby = useMemo(
    () =>
      PRODUCTS.map((p) => ({ p, near: bestNearby(availabilityFor(p, { origin }), radius) }))
        .filter((x) => x.near && isBuyable(x.near.status))
        .sort((a, b) => (a.near!.distanceKm ?? 0) - (b.near!.distanceKm ?? 0))
        .slice(0, 10),
    [origin, radius],
  );

  const recommended = useMemo(() => {
    const prof = state.profile;
    return PRODUCTS.map((p) => ({
      p,
      score:
        (prof.categories.includes(p.category) ? 3 : 0) +
        p.colours.filter((c) => prof.colours.includes(c)).length * 2 +
        (prof.brands.includes(p.brandId) ? 2 : 0) +
        (p.price <= prof.budgetMax ? 1 : -2),
      near: bestNearby(availabilityFor(p, { origin })),
    }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [state.profile, origin]);

  const stores = useMemo(() => {
    const inRadius = storesNear(origin, radius);
    return (inRadius.length ? inRadius : allStoresByDistance(origin).slice(0, 3)).slice(0, 6);
  }, [origin, radius]);

  const recent = state.recentlyViewed.map((id) => productById[id]).filter(Boolean).slice(0, 8);
  const heroProduct = productById['p-casaco-vintage-castanho'];
  const heroAvail = bestNearby(availabilityFor(heroProduct, { origin }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    nav(q.trim() ? `/pesquisar?q=${encodeURIComponent(q.trim())}&go=1` : '/pesquisar');
  };

  return (
    <div className="animate-fade-in">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between px-4 pt-4 lg:hidden">
        <Logo />
        <button onClick={() => setLocOpen(true)} className="flex h-9 items-center gap-1 rounded-chip border border-line-strong bg-paper px-3 text-[13px]">
          <MapPin size={14} /> {originLabel} <ChevronDown size={14} />
        </button>
      </div>

      {/* Hero */}
      <Page className="pt-6 lg:pt-10">
        <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14 [&>*]:min-w-0">
          <div className="animate-fade-up">
            <p className="eyebrow mb-3">
              {greeting}, {state.profile.name} · {originLabel}
            </p>
            <h1 className="font-display text-[34px] leading-[1.08] md:text-[52px] xl:text-[60px]">
              A tua próxima peça favorita está <em className="text-clay-deep">mais perto</em> do que imaginas.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft md:text-base">
              Descreve o que queres vestir ou mostra uma imagem. Encontramos peças semelhantes em lojas físicas perto de ti — e dizemos-te o que as lojas reportam ter em stock.
            </p>

            <form onSubmit={submit} className="mt-6 max-w-xl" role="search">
              <label htmlFor="home-search" className="sr-only">
                Pesquisar peças
              </label>
              <div className="flex items-center gap-2 rounded-chip border border-line-strong bg-paper p-1.5 pl-4 shadow-soft focus-within:border-ink">
                <Search size={18} className="shrink-0 text-muted" aria-hidden />
                <input
                  id="home-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t.home.searchPlaceholder}
                  className="h-10 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#9a958c]"
                />
                <Link to="/pesquisar?modo=imagem" aria-label={t.home.heroSecondary} className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-ink/5">
                  <Camera size={18} />
                </Link>
                <Button type="submit" className="hidden sm:inline-flex">
                  Procurar
                </Button>
              </div>
            </form>
            <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
              {PROMPTS.map((p) => (
                <Link key={p} to={`/pesquisar?q=${encodeURIComponent(p)}&go=1`} className="shrink-0 rounded-chip bg-line/70 px-3 py-1.5 text-[12.5px] text-ink-soft hover:bg-line">
                  “{p}”
                </Link>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink to="/pesquisar" size="lg" icon={<Sparkles size={16} />}>
                {t.home.heroCta}
              </ButtonLink>
              <ButtonLink to="/pesquisar?modo=imagem" size="lg" variant="secondary" icon={<Camera size={16} />}>
                {t.home.heroSecondary}
              </ButtonLink>
            </div>
          </div>

          {/* Editorial collage that explains the concept: inspiration → nearby store */}
          <div className="relative mx-auto w-full max-w-[560px] animate-fade-up [animation-delay:80ms]">
            <div className="grid grid-cols-[1.25fr_1fr] gap-3">
              <SmartImage src={img.heroMain} alt="Editorial: casaco de inspiração vintage em contexto urbano" label="Imagina" className="row-span-2 aspect-[3/4.4] rounded-card" eager />
              <SmartImage src={img.heroAlt} alt="Detalhe de peças em tons terra" label="Descobre" className="aspect-[4/5] rounded-card" eager />
              <SmartImage src={img.rack} alt="Interior de uma loja de roupa" label="Veste" className="aspect-[4/5] rounded-card" />
            </div>
            <Link
              to={`/produto/${heroProduct.id}`}
              className="absolute -bottom-5 left-3 flex w-[86%] max-w-[330px] items-center gap-3 rounded-card border border-line bg-paper/95 p-2.5 pr-3.5 shadow-lift backdrop-blur transition-transform hover:-translate-y-0.5 sm:left-6"
            >
              <SmartImage src={heroProduct.images[0]} alt="" category="outerwear" tint="#6B4A35" className="size-14 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">{heroProduct.name}</p>
                <p className="truncate text-[11.5px] text-muted">
                  {heroAvail ? `${heroAvail.store.name} · ${formatDistance(heroAvail.distanceKm)}` : 'Maré Vintage'}
                </p>
                {heroAvail && <StockBadge status={heroAvail.status} short className="mt-1" />}
              </div>
              <span className="font-semibold tabular">{formatPrice(heroProduct.price)}</span>
            </Link>
          </div>
        </section>
      </Page>

      {/* How it works */}
      <Page className="mt-16 lg:mt-20">
        <ol className="grid gap-3 sm:grid-cols-3">
          {[
            { n: '01', t: 'Imagina', d: 'Escreve uma ideia ou escolhe uma imagem de inspiração.', icon: Wand2 },
            { n: '02', t: 'Descobre', d: 'Vê peças semelhantes de várias lojas físicas, por distância.', icon: Search },
            { n: '03', t: 'Veste', d: 'Confirma a disponibilidade reportada e vai à loja experimentar.', icon: StoreIcon },
          ].map(({ n, t: title, d, icon: Icon }) => (
            <li key={n} className="flex gap-4 rounded-card border border-line bg-paper p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sage-soft">
                <Icon size={18} />
              </span>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-taupe">{n}</p>
                <p className="font-display text-lg">{title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Page>

      {/* Trending */}
      <Page className="mt-14">
        <SectionHeader eyebrow="Em alta esta semana" title="Categorias para explorar" action={{ label: 'Pesquisar', to: '/pesquisar' }} />
        <Rail className="md:grid md:grid-cols-8 md:overflow-visible">
          {TRENDING.map((c) => (
            <CategoryTile key={c.category} category={c.category} image={c.image} to={`/pesquisar?cat=${c.category}&go=1`} />
          ))}
        </Rail>
      </Page>

      {/* Nearby availability */}
      <Page className="mt-14">
        <SectionHeader
          eyebrow={`Até ${state.location.radiusKm} km de ${originLabel}`}
          title="Disponível perto de ti"
          action={{ label: 'Ver tudo', to: `/pesquisar?raio=${radius}&stock=available_only&ordem=distance&go=1` }}
        />
        {nearby.length ? (
          <Rail>
            {nearby.map(({ p, near }) => (
              <ProductCard key={p.id} product={p} nearest={near} className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[18.6%]" />
            ))}
          </Rail>
        ) : (
          <div className="rounded-card border border-dashed border-line-strong bg-paper p-6 text-center text-sm text-muted">
            Ainda não temos lojas de demonstração neste raio.{' '}
            <button onClick={() => setLocOpen(true)} className="font-semibold text-ink underline underline-offset-4">
              Alarga o raio ou muda de cidade
            </button>
            .
          </div>
        )}
        <SimulatedNote className="mt-4">
          Disponibilidade com base em dados de demonstração reportados pelas lojas. Confirma sempre com a loja antes de te deslocares.
        </SimulatedNote>
      </Page>

      {/* Outfit inspiration — editorial band */}
      <section className="mt-16 bg-[#EDE8DF] py-12">
        <Page>
          <SectionHeader eyebrow="Inspiração" title={<>Looks completos, <em>de várias lojas</em></>} action={{ label: 'Todos os looks', to: '/looks' }} />
          <Rail>
            {OUTFITS.slice(0, 6).map((o) => (
              <OutfitCard key={o.id} outfit={o} className="w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-[calc((100%-36px)/4)]" />
            ))}
          </Rail>
        </Page>
      </section>

      {/* Stores */}
      <Page className="mt-14">
        <SectionHeader eyebrow="Comércio local" title="Lojas perto de ti" action={{ label: 'Ver mapa', to: '/lojas' }} />
        <Rail>
          {stores.map(({ store, distanceKm }) => {
            const count = productsAtStore(store.id, PRODUCTS).filter((x) => isBuyable(x.availability.status)).length;
            return (
              <StoreCard
                key={store.id}
                store={store}
                distanceKm={distanceKm}
                compact
                className="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-[calc((100%-24px)/3)]"
                footer={<p className="text-[12.5px] text-ink-soft"><span className="font-semibold text-ink">{count} peças</span> disponíveis segundo a loja</p>}
              />
            );
          })}
        </Rail>
      </Page>

      {/* Recommended */}
      <Page className="mt-14">
        <SectionHeader eyebrow="Com base nas tuas preferências" title="Escolhidas para ti" action={{ label: 'Ajustar', to: '/perfil' }} />
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4">
          {recommended.map(({ p, near }) => (
            <ProductCard key={p.id} product={p} nearest={near} />
          ))}
        </div>
      </Page>

      {/* Recently viewed */}
      {recent.length > 0 && (
        <Page className="mt-14">
          <SectionHeader eyebrow="Continua onde ficaste" title="Vistos recentemente" />
          <Rail>
            {recent.map((p) => (
              <ProductCard key={p.id} product={p} size="sm" className="w-[38%] shrink-0 snap-start sm:w-[24%] lg:w-[14%]" />
            ))}
          </Rail>
        </Page>
      )}

      {/* Premium + partners */}
      <Page className="mt-16 grid gap-4 md:grid-cols-[1.5fr_1fr]">
        <Link to="/premium" className="group relative overflow-hidden rounded-card bg-ink text-ivory">
          <SmartImage src={img.giftBox} alt="" className="absolute inset-0 !bg-ink opacity-40" imgClassName="transition-transform duration-700 group-hover:scale-105" />
          <div className="relative flex min-h-[260px] flex-col justify-end p-6 md:p-8">
            <p className="eyebrow !text-clay-soft">VESTA+</p>
            <h3 className="mt-1 max-w-md font-display text-3xl leading-tight">Alertas de preço, pesquisas guardadas e a Mystery Box.</h3>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
              Conhecer o plano · 4,99 €/mês <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
        <Link to="/parceiros" className="group flex flex-col justify-between rounded-card border border-line bg-paper p-6 md:p-8">
          <div>
            <p className="eyebrow">Para lojas</p>
            <h3 className="mt-1 font-display text-2xl leading-tight">Tens uma loja física? Mostra o teu stock a quem está perto.</h3>
          </div>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold">
            Ver portal de parceiros <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </Page>

      <LocationSheet open={locOpen} onClose={() => setLocOpen(false)} />
    </div>
  );
}
