import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Globe, LogOut, Receipt, RotateCcw, Sparkles, Store as StoreIcon, Info } from 'lucide-react';
import { BRANDS } from '@/data/stores';
import { CATEGORIES, CITIES, COLOURS, RADII } from '@/data/taxonomy';
import type { CategoryId, ColourId, UserProfile } from '@/data/types';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { Page, PageHeader } from '@/components/layout/PageHeader';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Field, Segmented, Toggle } from '@/components/ui/misc';
import { Sheet } from '@/components/ui/Sheet';
import { formatPrice } from '@/lib/format';

const TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const BOTTOM_SIZES = ['24', '26', '28', '30', '32', '34', '36', '38', '40', '42'];
const SHOE_SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
const BUDGETS = [50, 80, 100, 150, 250, 400];

export default function Profile() {
  const { state, dispatch, isPlus } = useApp();
  const toast = useToast();
  const nav = useNavigate();
  const [resetOpen, setResetOpen] = useState(false);
  const p = state.profile;
  const update = (patch: Partial<UserProfile>) => dispatch({ type: 'updateProfile', patch });
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  if (!state.auth.signedIn) {
    return (
      <>
        <PageHeader title="Perfil" back={false} />
        <Page className="max-w-lg py-16 text-center">
          <h1 className="font-display text-3xl">Entra na tua conta</h1>
          <p className="mt-2 text-sm text-muted">Guarda peças, looks e o teu guarda-roupa em qualquer dispositivo.</p>
          <div className="mt-6 flex justify-center gap-2">
            <ButtonLink to="/entrar">Entrar</ButtonLink>
            <ButtonLink to="/entrar?registo=1" variant="secondary">
              Criar conta
            </ButtonLink>
          </div>
        </Page>
      </>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Perfil" back={false} />
      <Page className="max-w-4xl pt-4 lg:pt-10">
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-sage-soft font-display text-2xl">{p.name.charAt(0)}</span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[28px] leading-tight">{p.name}</h1>
            <p className="truncate text-[13px] text-muted">{p.email}</p>
          </div>
          {isPlus ? (
            <span className="rounded-chip bg-clay-soft px-3 py-1 text-xs font-semibold text-clay-deep">VESTA+</span>
          ) : (
            <ButtonLink to="/premium" size="sm" variant="clay" icon={<Sparkles size={14} />}>
              VESTA+
            </ButtonLink>
          )}
        </div>

        <nav className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { to: '/compras', label: 'Compras', icon: Receipt },
            { to: '/lojas', label: 'Lojas', icon: StoreIcon },
            { to: '/premium', label: isPlus ? 'Subscrição' : 'VESTA+', icon: Sparkles },
            { to: '/parceiros', label: 'Para lojas', icon: StoreIcon },
          ].map(({ to, label, icon: Icon }) => (
            <Link key={to + label} to={to} className="flex items-center gap-2 rounded-card border border-line bg-paper p-3 text-sm font-medium hover:border-ink/40">
              <Icon size={16} /> {label}
              <ChevronRight size={14} className="ml-auto text-muted" />
            </Link>
          ))}
        </nav>

        <Section title="Dados pessoais" description="Só pedimos o essencial.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" htmlFor="pr-name">
              <input id="pr-name" className="field" value={p.name} onChange={(e) => update({ name: e.target.value })} />
            </Field>
            <Field label="Email" htmlFor="pr-email">
              <input id="pr-email" type="email" className="field" value={p.email} onChange={(e) => update({ email: e.target.value })} />
            </Field>
          </div>
        </Section>

        <Section title="Tamanhos" description="Usados para filtrar resultados quando ativas “usar as minhas preferências”.">
          <SizeRow label="Tops e casacos" options={TOP_SIZES} value={p.sizes.tops} onChange={(v) => update({ sizes: { ...p.sizes, tops: v } })} />
          <SizeRow label="Calças (cintura)" options={BOTTOM_SIZES} value={p.sizes.bottoms} onChange={(v) => update({ sizes: { ...p.sizes, bottoms: v } })} />
          <SizeRow label="Calçado (EU)" options={SHOE_SIZES} value={p.sizes.shoes} onChange={(v) => update({ sizes: { ...p.sizes, shoes: v } })} />
          <Toggle
            checked={p.applyPrefsToSearch}
            onChange={(v) => update({ applyPrefsToSearch: v })}
            label="Aplicar tamanhos e cores às pesquisas"
            description="Podes sempre remover os filtros nos resultados."
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              update({ applyPrefsToSearch: true });
              nav(`/pesquisar?cat=${p.categories.join(',')}&cor=${p.colours.join(',')}&tam=${[p.sizes.tops, p.sizes.bottoms, p.sizes.shoes].join(',')}&go=1`);
            }}
          >
            Pesquisar com as minhas preferências
          </Button>
        </Section>

        <Section title="Estilo" description="Ajuda-nos a escolher o que aparece em “Escolhidas para ti”.">
          <p className="mb-2 text-[13px] font-medium text-ink-soft">Cores preferidas</p>
          <div className="flex flex-wrap gap-2">
            {COLOURS.map((c) => (
              <Chip key={c.id} swatch={c.hex} active={p.colours.includes(c.id)} onClick={() => update({ colours: toggle<ColourId>(p.colours, c.id) })}>
                {c.label}
              </Chip>
            ))}
          </div>
          <p className="mt-5 mb-2 text-[13px] font-medium text-ink-soft">Categorias favoritas</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c.id} active={p.categories.includes(c.id)} onClick={() => update({ categories: toggle<CategoryId>(p.categories, c.id) })}>
                {c.plural}
              </Chip>
            ))}
          </div>
          <p className="mt-5 mb-2 text-[13px] font-medium text-ink-soft">Marcas preferidas</p>
          <div className="flex flex-wrap gap-2">
            {BRANDS.map((b) => (
              <Chip key={b.id} active={p.brands.includes(b.id)} onClick={() => update({ brands: toggle(p.brands, b.id) })}>
                {b.name}
              </Chip>
            ))}
          </div>
          <p className="mt-5 mb-2 text-[13px] font-medium text-ink-soft">Orçamento habitual por peça · até {formatPrice(p.budgetMax)}</p>
          <div className="flex flex-wrap gap-2">
            {BUDGETS.map((b) => (
              <Chip key={b} active={p.budgetMax === b} onClick={() => update({ budgetMax: b })}>
                até {b} €
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Localização" description="Nunca pedimos a tua localização sem tocares em “Usar a minha localização”.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cidade preferida" htmlFor="pr-city">
              <select id="pr-city" className="field" value={p.city} onChange={(e) => update({ city: e.target.value as UserProfile['city'] })}>
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-ink-soft">Raio por defeito</p>
              <Segmented label="Raio por defeito" options={RADII} value={p.radiusKm as (typeof RADII)[number]} onChange={(r) => update({ radiusKm: r })} format={(v) => `${v} km`} />
            </div>
          </div>
        </Section>

        <Section title="Idioma" description="Interface em português (Portugal). Espanhol em preparação para o lançamento em Espanha.">
          <div className="flex items-center gap-3">
            <Globe size={16} className="text-muted" />
            <Segmented
              label="Idioma"
              options={['pt-PT', 'es-ES'] as const}
              value={p.language}
              onChange={(v) => {
                update({ language: v });
                toast({ message: v === 'es-ES' ? 'Navegación en español (vista previa)' : 'Idioma: português', tone: 'info' });
              }}
              format={(v) => (v === 'pt-PT' ? 'Português' : 'Español (beta)')}
            />
          </div>
        </Section>

        <Section title="Notificações">
          <Toggle checked={p.notifications.priceDrops} onChange={(v) => update({ notifications: { ...p.notifications, priceDrops: v } })} label="Descidas de preço nas peças guardadas" description={isPlus ? undefined : 'Disponível com VESTA+'} />
          <Toggle checked={p.notifications.savedSearches} onChange={(v) => update({ notifications: { ...p.notifications, savedSearches: v } })} label="Novidades nas pesquisas guardadas" description={isPlus ? undefined : 'Disponível com VESTA+'} />
          <Toggle checked={p.notifications.newsletter} onChange={(v) => update({ notifications: { ...p.notifications, newsletter: v } })} label="Newsletter editorial mensal" />
          <p className="text-xs text-muted">Protótipo: as preferências ficam guardadas, mas não são enviadas notificações.</p>
        </Section>

        <Section title="Privacidade">
          <Toggle checked={p.privacy.personalisedRecs} onChange={(v) => update({ privacy: { ...p.privacy, personalisedRecs: v } })} label="Recomendações personalizadas" description="Usa os teus guardados e preferências, só neste dispositivo." />
          <Toggle checked={p.privacy.shareAnalytics} onChange={(v) => update({ privacy: { ...p.privacy, shareAnalytics: v } })} label="Partilhar estatísticas anónimas com lojas" description="Ex.: “12 pessoas guardaram esta peça”. Nunca o teu nome ou email." />
        </Section>

        <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
          <Button variant="secondary" icon={<RotateCcw size={15} />} onClick={() => setResetOpen(true)}>
            Repor dados de demonstração
          </Button>
          <Button
            variant="ghost"
            icon={<LogOut size={15} />}
            onClick={() => {
              dispatch({ type: 'signOut' });
              toast({ message: 'Sessão terminada', tone: 'info' });
            }}
          >
            Terminar sessão
          </Button>
          <ButtonLink to="/sobre" variant="ghost" icon={<Info size={15} />}>
            Sobre o protótipo
          </ButtonLink>
        </div>
      </Page>

      <Sheet
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Repor demonstração?"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              Cancelar
            </Button>
            <Button
              block
              onClick={() => {
                dispatch({ type: 'reset' });
                setResetOpen(false);
                toast({ message: 'Dados de demonstração repostos', tone: 'success' });
              }}
            >
              Repor
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-soft">Os guardados, guarda-roupa, compras, looks e preferências voltam ao estado inicial da demonstração. Esta ação não pode ser desfeita.</p>
      </Sheet>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl">{title}</h2>
      {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      <div className="mt-4 space-y-3 rounded-card border border-line bg-paper p-4 md:p-5">{children}</div>
    </section>
  );
}

function SizeRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] text-ink-soft">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <Chip key={o} className="min-w-11 justify-center !px-2.5" active={value === o} onClick={() => onChange(o)}>
            {o}
          </Chip>
        ))}
      </div>
    </div>
  );
}
