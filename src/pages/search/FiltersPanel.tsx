import { BRANDS } from '@/data/stores';
import { CATEGORIES, COLOURS, RADII, STORE_TYPES, STYLES } from '@/data/taxonomy';
import type { StoreType } from '@/data/types';
import type { AvailabilityMode, SearchQuery } from '@/services/search/types';
import { Chip } from '@/components/ui/Chip';
import { Segmented } from '@/components/ui/misc';
import { formatPrice } from '@/lib/format';

const SIZE_GROUPS = [
  { label: 'Roupa', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  { label: 'Calças (cintura)', sizes: ['26', '28', '30', '32', '36', '38', '40', '42'] },
  { label: 'Calçado (EU)', sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'] },
];

const AVAILABILITY: { id: AvailabilityMode; label: string; hint: string }[] = [
  { id: 'available_only', label: 'Disponível agora', hint: 'Disponível ou últimas unidades, com dados recentes' },
  { id: 'buyable', label: 'Incluir por confirmar', hint: 'Exclui apenas lojas sem stock' },
  { id: 'any', label: 'Todas as lojas', hint: 'Inclui lojas sem stock reportado' },
];

const PRICE_STEPS = [30, 50, 80, 100, 150, 250];

function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export function FiltersPanel({ q, onChange }: { q: SearchQuery; onChange: (patch: Partial<SearchQuery>) => void }) {
  return (
    <div className="space-y-7">
      <Group title="Distância">
        <Segmented label="Raio" options={RADII} value={q.radiusKm as (typeof RADII)[number]} onChange={(r) => onChange({ radiusKm: r })} format={(v) => `${v} km`} />
      </Group>

      <Group title="Disponibilidade">
        <div className="space-y-2">
          {AVAILABILITY.map((a) => (
            <label key={a.id} className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-paper p-3 has-[:checked]:border-ink">
              <input type="radio" name="availability" className="mt-1 accent-ink" checked={q.availability === a.id} onChange={() => onChange({ availability: a.id })} />
              <span>
                <span className="block text-sm font-medium">{a.label}</span>
                <span className="block text-xs text-muted">{a.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </Group>

      <Group title="Preço máximo" aside={q.maxPrice != null ? formatPrice(q.maxPrice) : 'Sem limite'}>
        <div className="flex flex-wrap gap-2">
          <Chip active={q.maxPrice == null} onClick={() => onChange({ maxPrice: null })}>
            Sem limite
          </Chip>
          {PRICE_STEPS.map((p) => (
            <Chip key={p} active={q.maxPrice === p} onClick={() => onChange({ maxPrice: p })}>
              até {p} €
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Categoria">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Chip key={c.id} active={q.categories.includes(c.id)} onClick={() => onChange({ categories: toggle(q.categories, c.id) })}>
              {c.plural}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Tamanho">
        <div className="space-y-3">
          {SIZE_GROUPS.map((g) => (
            <div key={g.label}>
              <p className="mb-1.5 text-xs text-muted">{g.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {g.sizes.map((s) => (
                  <Chip key={g.label + s} className="min-w-11 justify-center !px-2.5" active={q.sizes.includes(s)} onClick={() => onChange({ sizes: toggle(q.sizes, s) })}>
                    {s}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Group>

      <Group title="Cor">
        <div className="flex flex-wrap gap-2">
          {COLOURS.map((c) => (
            <Chip key={c.id} swatch={c.hex} active={q.colours.includes(c.id)} onClick={() => onChange({ colours: toggle(q.colours, c.id) })}>
              {c.label}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Estilo">
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <Chip key={s.id} active={q.styles.includes(s.id)} onClick={() => onChange({ styles: toggle(q.styles, s.id) })}>
              {s.label}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Marca">
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((b) => (
            <Chip key={b.id} active={q.brands.includes(b.id)} onClick={() => onChange({ brands: toggle(q.brands, b.id) })}>
              {b.name}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Tipo de loja">
        <div className="flex flex-wrap gap-2">
          {(Object.entries(STORE_TYPES) as [StoreType, string][]).map(([id, label]) => (
            <Chip key={id} active={q.storeTypes.includes(id)} onClick={() => onChange({ storeTypes: toggle(q.storeTypes, id) })}>
              {label}
            </Chip>
          ))}
        </div>
      </Group>
    </div>
  );
}

function Group({ title, aside, children }: { title: string; aside?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 flex w-full items-center justify-between">
        <span className="text-[13px] font-semibold">{title}</span>
        {aside && <span className="text-xs text-muted">{aside}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

export function activeFilterCount(q: SearchQuery) {
  return (
    q.categories.length + q.colours.length + q.styles.length + q.sizes.length + q.brands.length + q.storeTypes.length + (q.maxPrice != null ? 1 : 0) + (q.availability !== 'buyable' ? 1 : 0)
  );
}
