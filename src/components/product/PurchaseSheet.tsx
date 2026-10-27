import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CategoryId, ColourId, Product } from '@/data/types';
import { STORES, storeById } from '@/data/stores';
import { CATEGORIES, colourById } from '@/data/taxonomy';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { todayISO, uid } from '@/lib/format';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Field } from '../ui/misc';

/* Registers a purchase the user made themselves. VESTA does not read
   retailer receipts or payment data — everything here is user-entered. */
export function PurchaseSheet({
  open,
  onClose,
  product,
  defaultSize,
  defaultColour,
}: {
  open: boolean;
  onClose: () => void;
  product?: Product;
  defaultSize?: string;
  defaultColour?: ColourId;
}) {
  const { dispatch } = useApp();
  const toast = useToast();
  const nav = useNavigate();
  const blank = () => ({
    name: product?.name ?? '',
    category: (product?.category ?? 'tops') as CategoryId,
    storeId: product?.storeIds[0] ?? '',
    storeOther: '',
    date: todayISO(),
    price: product ? String(product.price) : '',
    size: defaultSize ?? '',
    colour: (defaultColour ?? product?.colours[0] ?? '') as ColourId | '',
    notes: '',
    toWardrobe: true,
  });
  const [f, setF] = useState(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setF(blank());
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!f.name.trim()) err.name = 'Indica o nome da peça.';
    const price = Number(f.price.replace(',', '.'));
    if (!f.price || Number.isNaN(price) || price < 0) err.price = 'Indica um preço válido.';
    if (price > 20000) err.price = 'O valor parece demasiado alto.';
    if (!f.date) err.date = 'Indica a data.';
    else if (f.date > todayISO()) err.date = 'A data não pode ser no futuro.';
    if (!f.storeId && !f.storeOther.trim()) err.store = 'Indica a loja.';
    setErrors(err);
    if (Object.keys(err).length) return;

    const storeName = f.storeId === 'other' || !f.storeId ? f.storeOther.trim() : storeById[f.storeId].name;
    const purchaseId = uid('pu');
    dispatch({
      type: 'addPurchase',
      purchase: {
        id: purchaseId,
        productId: product?.id,
        name: f.name.trim(),
        storeId: f.storeId && f.storeId !== 'other' ? f.storeId : undefined,
        storeName,
        date: f.date,
        price,
        size: f.size || undefined,
        colour: f.colour || undefined,
        notes: f.notes.trim() || undefined,
        image: product?.images[0],
        addedToWardrobe: f.toWardrobe,
      },
    });
    if (f.toWardrobe) {
      dispatch({
        type: 'addWardrobe',
        item: {
          id: uid('w'),
          productId: product?.id,
          name: f.name.trim(),
          category: product?.category ?? f.category,
          colour: f.colour || undefined,
          size: f.size || undefined,
          addedAt: new Date().toISOString(),
          source: 'purchase',
        },
      });
    }
    onClose();
    toast({ message: f.toWardrobe ? 'Compra registada e adicionada ao guarda-roupa' : 'Compra registada', tone: 'success', action: { label: 'Ver', to: '/compras' } });
    if (!product) nav('/compras');
  };

  const storeOptions = product ? STORES.filter((s) => product.storeIds.includes(s.id)) : STORES;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Registar compra"
      footer={
        <Button block type="submit" form="purchase-form">
          Guardar compra
        </Button>
      }
    >
      <form id="purchase-form" onSubmit={submit} className="space-y-4" noValidate>
        <p className="text-[13px] text-muted">Regista uma peça que compraste. Os dados ficam só neste dispositivo.</p>
        <Field label="Peça" htmlFor="pf-name">
          <input id="pf-name" className="field" value={f.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} />
          {errors.name && <Err>{errors.name}</Err>}
        </Field>
        {!product && (
          <Field label="Categoria" htmlFor="pf-cat">
            <select id="pf-cat" className="field" value={f.category} onChange={(e) => set('category', e.target.value as CategoryId)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Loja" htmlFor="pf-store">
          <select id="pf-store" className="field" value={f.storeId} onChange={(e) => set('storeId', e.target.value)}>
            {!product && <option value="">Escolher loja…</option>}
            {storeOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.neighbourhood}
              </option>
            ))}
            <option value="other">Outra loja…</option>
          </select>
          {(f.storeId === 'other' || !f.storeId) && (
            <input className="field mt-2" placeholder="Nome da loja" value={f.storeOther} onChange={(e) => set('storeOther', e.target.value)} aria-label="Nome da loja" />
          )}
          {errors.store && <Err>{errors.store}</Err>}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data da compra" htmlFor="pf-date">
            <input id="pf-date" type="date" max={todayISO()} className="field" value={f.date} onChange={(e) => set('date', e.target.value)} aria-invalid={!!errors.date} />
            {errors.date && <Err>{errors.date}</Err>}
          </Field>
          <Field label="Preço pago (€)" htmlFor="pf-price">
            <input id="pf-price" inputMode="decimal" className="field tabular" value={f.price} onChange={(e) => set('price', e.target.value)} aria-invalid={!!errors.price} />
            {errors.price && <Err>{errors.price}</Err>}
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tamanho (opcional)" htmlFor="pf-size">
            {product ? (
              <select id="pf-size" className="field" value={f.size} onChange={(e) => set('size', e.target.value)}>
                <option value="">—</option>
                {product.sizes.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            ) : (
              <input id="pf-size" className="field" value={f.size} onChange={(e) => set('size', e.target.value)} />
            )}
          </Field>
          <Field label="Cor (opcional)" htmlFor="pf-colour">
            <select id="pf-colour" className="field" value={f.colour} onChange={(e) => set('colour', e.target.value as ColourId)}>
              <option value="">—</option>
              {(product?.colours ?? (Object.keys(colourById) as ColourId[])).map((c) => (
                <option key={c} value={c}>
                  {colourById[c].label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Notas (opcional)" htmlFor="pf-notes">
          <textarea id="pf-notes" rows={2} className="field resize-none" placeholder="Ex.: troca possível até 30 dias" value={f.notes} onChange={(e) => set('notes', e.target.value)} />
        </Field>
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" className="size-4 accent-ink" checked={f.toWardrobe} onChange={(e) => set('toWardrobe', e.target.checked)} />
          Adicionar também ao meu guarda-roupa
        </label>
      </form>
    </Sheet>
  );
}

const Err = ({ children }: { children: string }) => (
  <p role="alert" className="mt-1 text-xs text-danger">
    {children}
  </p>
);
