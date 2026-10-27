import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Receipt, Shirt, Trash2 } from 'lucide-react';
import { productById } from '@/data/products';
import { colourById } from '@/data/taxonomy';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { Page, PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState, SimulatedNote } from '@/components/ui/misc';
import { SmartImage } from '@/components/ui/SmartImage';
import { PurchaseSheet } from '@/components/product/PurchaseSheet';
import { formatDate, formatPrice, uid } from '@/lib/format';

export default function Purchases() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const sorted = useMemo(() => [...state.purchases].sort((a, b) => b.date.localeCompare(a.date)), [state.purchases]);
  const groups = useMemo(() => {
    const m = new Map<string, typeof sorted>();
    for (const p of sorted) {
      const k = new Date(p.date).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
      m.set(k, [...(m.get(k) ?? []), p]);
    }
    return [...m.entries()];
  }, [sorted]);
  const total = state.purchases.reduce((s, p) => s + p.price, 0);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Compras" />
      <Page className="pt-4 lg:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Histórico pessoal</p>
            <h1 className="mt-1 font-display text-[32px] md:text-[44px]">Compras registadas</h1>
            <p className="mt-1 text-[13px] text-muted">
              {state.purchases.length} compras · {formatPrice(total)} no total
            </p>
          </div>
          <Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>
            Registar compra
          </Button>
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            illustration={<Receipt size={40} strokeWidth={1.2} />}
            title="Ainda sem compras"
            body="Regista as peças que compras para manter o teu guarda-roupa e histórico em dia."
            action={<Button onClick={() => setOpen(true)}>Registar compra</Button>}
          />
        ) : (
          <div className="mt-8 space-y-8">
            {groups.map(([month, list]) => (
              <section key={month}>
                <h2 className="eyebrow mb-3 capitalize">{month}</h2>
                <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-paper">
                  {list.map((p) => {
                    const product = p.productId ? productById[p.productId] : undefined;
                    return (
                      <li key={p.id} className="flex items-center gap-4 p-4">
                        <SmartImage
                          src={p.image ?? product?.images[0]}
                          alt=""
                          category={product?.category ?? 'tops'}
                          tint={p.colour ? colourById[p.colour].hex : undefined}
                          className="h-20 w-16 shrink-0 rounded-md"
                        />
                        <div className="min-w-0 flex-1">
                          {product ? (
                            <Link to={`/produto/${product.id}`} className="font-medium hover:underline">
                              {p.name}
                            </Link>
                          ) : (
                            <p className="font-medium">{p.name}</p>
                          )}
                          <p className="text-[13px] text-muted">
                            {p.storeName} · {formatDate(p.date)}
                          </p>
                          <p className="text-xs text-muted">
                            {[p.size && `Tam. ${p.size}`, p.colour && colourById[p.colour].label].filter(Boolean).join(' · ')}
                            {p.notes && <> · <em>{p.notes}</em></>}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs">
                            {p.addedToWardrobe ? (
                              <Link to="/guarda-roupa" className="inline-flex items-center gap-1 text-success">
                                <Shirt size={12} /> No guarda-roupa
                              </Link>
                            ) : (
                              <button
                                className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
                                onClick={() => {
                                  dispatch({ type: 'addWardrobe', item: { id: uid('w'), productId: p.productId, name: p.name, category: product?.category ?? 'tops', colour: p.colour, size: p.size, addedAt: new Date().toISOString(), source: 'purchase' } });
                                  dispatch({ type: 'updatePurchase', id: p.id, patch: { addedToWardrobe: true } });
                                  toast({ message: 'Adicionada ao guarda-roupa', tone: 'success', action: { label: 'Ver', to: '/guarda-roupa' } });
                                }}
                              >
                                <Shirt size={12} /> Adicionar ao guarda-roupa
                              </button>
                            )}
                            <button
                              className="inline-flex items-center gap-1 text-muted hover:text-danger"
                              onClick={() => {
                                dispatch({ type: 'removePurchase', id: p.id });
                                toast({ message: 'Compra removida', tone: 'info' });
                              }}
                            >
                              <Trash2 size={12} /> Remover
                            </button>
                          </div>
                        </div>
                        <span className="shrink-0 font-semibold tabular">{formatPrice(p.price)}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
        <SimulatedNote className="mt-8">
          As compras são introduzidas por ti. A VESTA não acede a recibos, contas de lojas nem dados de pagamento.
        </SimulatedNote>
      </Page>
      <PurchaseSheet open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
