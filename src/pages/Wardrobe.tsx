import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, Plus, Receipt, Sparkles, Trash2 } from 'lucide-react';
import { productById } from '@/data/products';
import { CATEGORIES, COLOURS, categoryById, colourById } from '@/data/taxonomy';
import type { CategoryId, ColourId, WardrobeItem } from '@/data/types';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { Page, PageHeader } from '@/components/layout/PageHeader';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { EmptyState, Field } from '@/components/ui/misc';
import { SmartImage } from '@/components/ui/SmartImage';
import { GarmentIllustration } from '@/components/ui/GarmentIllustration';
import { OutfitCard } from '@/components/product/OutfitCard';
import { cx, formatDate, formatPrice, uid } from '@/lib/format';

/* Wardrobe filter groups as requested: tops, trousers, outerwear, shoes, bags, accessories. */
const FILTERS: { id: string; label: string; cats: CategoryId[] }[] = [
  { id: 'all', label: 'Tudo', cats: [] },
  { id: 'tops', label: 'Tops', cats: ['tops', 'knitwear'] },
  { id: 'trousers', label: 'Calças', cats: ['trousers'] },
  { id: 'outerwear', label: 'Casacos', cats: ['outerwear'] },
  { id: 'dresses', label: 'Vestidos', cats: ['dresses'] },
  { id: 'shoes', label: 'Calçado', cats: ['shoes'] },
  { id: 'bags', label: 'Malas', cats: ['bags'] },
  { id: 'accessories', label: 'Acessórios', cats: ['accessories', 'jewellery'] },
];

const SOURCE_LABEL: Record<WardrobeItem['source'], string> = { purchase: 'Compra registada', manual: 'Adicionada manualmente', discovered: 'Descoberta na VESTA' };

export default function Wardrobe() {
  const { state, dispatch, isPlus } = useApp();
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<WardrobeItem | null>(null);

  const f = FILTERS.find((x) => x.id === filter)!;
  const items = state.wardrobe.filter((w) => !f.cats.length || f.cats.includes(w.category));
  const spent = state.purchases.reduce((s, p) => s + p.price, 0);
  const grouped = useMemo(() => {
    const map = new Map<CategoryId, WardrobeItem[]>();
    for (const w of items) map.set(w.category, [...(map.get(w.category) ?? []), w]);
    return CATEGORIES.filter((c) => map.has(c.id)).map((c) => ({ c, list: map.get(c.id)! }));
  }, [items]);
  const limitReached = !isPlus && state.wardrobe.length >= 50;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Guarda-roupa" back={false} />

      <section className="relative overflow-hidden bg-[#EDE8DF]">
        <Page className="grid items-end gap-6 py-8 md:grid-cols-[1fr_auto] lg:py-12">
          <div>
            <p className="eyebrow">O teu closet digital</p>
            <h1 className="mt-1 font-display text-[34px] leading-tight md:text-[48px]">Guarda-roupa</h1>
            <dl className="mt-5 flex gap-8">
              <Stat value={String(state.wardrobe.length)} label="peças" />
              <Stat value={String(state.savedOutfits.length)} label="looks" />
              <Stat value={formatPrice(spent)} label="em compras registadas" />
            </dl>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button icon={<Plus size={16} />} onClick={() => (limitReached ? toast({ message: 'Limite de 50 peças no plano gratuito', tone: 'info', action: { label: 'VESTA+', to: '/premium' } }) : setAddOpen(true))}>
              Adicionar peça
            </Button>
            <ButtonLink to="/compras" variant="secondary" icon={<Receipt size={16} />}>
              Compras
            </ButtonLink>
          </div>
        </Page>
        {/* Hanging rail motif */}
        <svg className="pointer-events-none absolute top-6 right-0 hidden h-40 w-[45%] text-ink/15 lg:block" viewBox="0 0 400 160" aria-hidden>
          <line x1="0" y1="20" x2="400" y2="20" stroke="currentColor" strokeWidth="3" />
          {[40, 110, 180, 250, 320].map((x) => (
            <path key={x} d={`M${x} 20 q 0 -12 10 -12 q 10 0 10 12 l 30 26 l -80 0 z`} fill="none" stroke="currentColor" strokeWidth="2" transform={`translate(${-20} 0)`} />
          ))}
        </svg>
      </section>

      <Page className="pt-5">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {FILTERS.map((x) => {
            const n = state.wardrobe.filter((w) => !x.cats.length || x.cats.includes(w.category)).length;
            return (
              <Chip key={x.id} active={filter === x.id} onClick={() => setFilter(x.id)}>
                {x.label} <span className="opacity-60 tabular">{n}</span>
              </Chip>
            );
          })}
        </div>

        {items.length === 0 ? (
          <EmptyState
            illustration={<GarmentIllustration category={(f.cats[0] ?? 'tops') as CategoryId} className="h-24" />}
            title={filter === 'all' ? 'O teu guarda-roupa está vazio' : `Sem ${f.label.toLowerCase()} no guarda-roupa`}
            body="Adiciona peças que já tens, regista compras ou guarda o que descobres na VESTA."
            action={<Button onClick={() => setAddOpen(true)}>Adicionar peça</Button>}
          />
        ) : (
          <div className="mt-6 space-y-10">
            {grouped.map(({ c, list }) => (
              <section key={c.id}>
                <div className="mb-3 flex items-center gap-3">
                  <h2 className="font-display text-xl">{c.plural}</h2>
                  <span className="h-px flex-1 bg-line-strong" />
                  <span className="text-xs text-muted tabular">{list.length}</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                  {list.map((w) => {
                    const p = w.productId ? productById[w.productId] : undefined;
                    return (
                      <button key={w.id} onClick={() => setDetail(w)} className="group text-left">
                        <SmartImage
                          src={w.image ?? p?.images[0]}
                          alt={w.name}
                          category={w.category}
                          tint={w.colour ? colourById[w.colour].hex : undefined}
                          className="aspect-[3/4] rounded-md bg-paper"
                          imgClassName="transition-transform duration-500 group-hover:scale-105"
                        />
                        <p className="mt-1.5 line-clamp-1 text-[12.5px]">{w.name}</p>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {state.savedOutfits.length > 0 && (
          <section className="mt-14">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-display text-xl">Looks guardados</h2>
              <span className="h-px flex-1 bg-line-strong" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {state.savedOutfits.map((o) => (
                <OutfitCard key={o.id} outfit={o} />
              ))}
            </div>
          </section>
        )}
      </Page>

      <AddItemSheet open={addOpen} onClose={() => setAddOpen(false)} />

      <Sheet open={!!detail} onClose={() => setDetail(null)} title={detail?.name ?? ''}>
        {detail && (
          <ItemDetail
            item={detail}
            onRemove={() => {
              dispatch({ type: 'removeWardrobe', id: detail.id });
              setDetail(null);
              toast({ message: 'Peça removida do guarda-roupa', tone: 'info' });
            }}
          />
        )}
      </Sheet>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dd className="font-display text-2xl tabular">{value}</dd>
      <dt className="text-xs text-muted">{label}</dt>
    </div>
  );
}

function ItemDetail({ item, onRemove }: { item: WardrobeItem; onRemove: () => void }) {
  const p = item.productId ? productById[item.productId] : undefined;
  return (
    <div className="space-y-4">
      <SmartImage src={item.image ?? p?.images[0]} alt={item.name} category={item.category} tint={item.colour ? colourById[item.colour].hex : undefined} className="aspect-[4/3] rounded-card" />
      <dl className="grid grid-cols-[110px_1fr] gap-y-2 text-[13.5px]">
        <dt className="text-muted">Categoria</dt>
        <dd>{categoryById[item.category].label}</dd>
        {item.colour && (
          <>
            <dt className="text-muted">Cor</dt>
            <dd>{colourById[item.colour].label}</dd>
          </>
        )}
        {item.size && (
          <>
            <dt className="text-muted">Tamanho</dt>
            <dd>{item.size}</dd>
          </>
        )}
        <dt className="text-muted">Origem</dt>
        <dd>{SOURCE_LABEL[item.source]}</dd>
        <dt className="text-muted">Adicionada</dt>
        <dd>{formatDate(item.addedAt)}</dd>
        {item.notes && (
          <>
            <dt className="text-muted">Notas</dt>
            <dd>{item.notes}</dd>
          </>
        )}
      </dl>
      <div className="flex flex-wrap gap-2 pt-2">
        {p && (
          <>
            <ButtonLink to={`/produto/${p.id}/looks`} icon={<Sparkles size={15} />}>
              Combinar
            </ButtonLink>
            <ButtonLink to={`/produto/${p.id}`} variant="secondary">
              Ver peça
            </ButtonLink>
          </>
        )}
        <Button variant="ghost" icon={<Trash2 size={15} />} onClick={onRemove} className="text-danger">
          Remover
        </Button>
      </div>
    </div>
  );
}

/** Downscales an uploaded photo so it fits comfortably in localStorage. */
function downscale(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const max = 480;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    image.onerror = reject;
    image.src = url;
  });
}

function AddItemSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useApp();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId>('tops');
  const [colour, setColour] = useState<ColourId | ''>('');
  const [size, setSize] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [error, setError] = useState('');

  const reset = () => {
    setName('');
    setCategory('tops');
    setColour('');
    setSize('');
    setNotes('');
    setImage(undefined);
    setError('');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Dá um nome à peça.');
    dispatch({
      type: 'addWardrobe',
      item: { id: uid('w'), name: name.trim(), category, colour: colour || undefined, size: size || undefined, notes: notes.trim() || undefined, image, addedAt: new Date().toISOString(), source: 'manual' },
    });
    toast({ message: 'Peça adicionada ao guarda-roupa', tone: 'success' });
    reset();
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Adicionar peça" footer={<Button block type="submit" form="add-item">Adicionar</Button>}>
      <form id="add-item" onSubmit={submit} className="space-y-4" noValidate>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => fileRef.current?.click()} className="relative grid h-28 w-22 shrink-0 place-items-center overflow-hidden rounded-md border border-dashed border-line-strong bg-paper text-muted hover:border-ink">
            {image ? <img src={image} alt="Fotografia da peça" className="absolute inset-0 h-full w-full object-cover" /> : <ImagePlus size={20} />}
          </button>
          <p className="text-[13px] text-muted">Fotografia opcional. É reduzida e guardada apenas neste dispositivo.</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Fotografia da peça"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) setImage(await downscale(file).catch(() => undefined));
            }}
          />
        </div>
        <Field label="Nome" htmlFor="wi-name">
          <input id="wi-name" className="field" placeholder="Ex.: Camisa de seda verde" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!error} />
          {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
        </Field>
        <Field label="Categoria" htmlFor="wi-cat">
          <select id="wi-cat" className="field" value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cor" htmlFor="wi-colour">
            <select id="wi-colour" className="field" value={colour} onChange={(e) => setColour(e.target.value as ColourId)}>
              <option value="">—</option>
              {COLOURS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tamanho" htmlFor="wi-size">
            <input id="wi-size" className="field" value={size} onChange={(e) => setSize(e.target.value)} />
          </Field>
        </div>
        <Field label="Notas" htmlFor="wi-notes">
          <textarea id="wi-notes" rows={2} className="field resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <p className={cx('text-xs text-muted')}>
          Também podes <Link to="/compras" className="underline" onClick={onClose}>registar uma compra</Link> — fica no histórico e no guarda-roupa.
        </p>
      </form>
    </Sheet>
  );
}
