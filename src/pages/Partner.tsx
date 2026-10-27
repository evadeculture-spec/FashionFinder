import { useMemo, useState } from 'react';
import { CheckCircle2, CircleDashed, FileSpreadsheet, PlugZap, RefreshCw, TrendingUp, Upload } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { STORES, storeById } from '@/data/stores';
import type { DisplayStatus } from '@/data/types';
import { STATUS_META, SOURCE_LABEL, productsAtStore } from '@/services/inventory';
import { Page, PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { SimulatedNote } from '@/components/ui/misc';
import { SmartImage } from '@/components/ui/SmartImage';
import { StockBadge } from '@/components/ui/StockBadge';
import { useToast } from '@/state/Toast';
import { colourById } from '@/data/taxonomy';
import { cx, formatPrice, timeAgo } from '@/lib/format';

/* Retailer demo portal. All figures are deterministic DEMONSTRATION data. */

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967295;
  };
}

const WEEKS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];

const PLANS = [
  { id: 'essencial', name: 'Essencial', price: 29, features: ['Até 200 produtos', 'Stock por ficheiro CSV', 'Estatísticas básicas'] },
  { id: 'pro', name: 'Pro', price: 79, features: ['Produtos ilimitados', 'Ligação ao POS (API)', 'Campanhas locais', 'Estatísticas avançadas'] },
];

export default function Partner() {
  const toast = useToast();
  const [storeId, setStoreId] = useState('st-chiado');
  const store = storeById[storeId];
  const [overrides, setOverrides] = useState<Record<string, { status: DisplayStatus; at: string }>>({});
  const items = useMemo(() => productsAtStore(storeId, PRODUCTS), [storeId]);
  const rnd = useMemo(() => seeded(storeId), [storeId]);
  const series = useMemo(() => WEEKS.map(() => Math.round(60 + rnd() * 140)), [rnd]);
  const kpis = useMemo(() => {
    const r = seeded(storeId + 'k');
    return [
      { label: 'Visualizações de produto', value: Math.round(3200 + r() * 5000), delta: Math.round(4 + r() * 18) },
      { label: 'Cliques “ver loja”', value: Math.round(380 + r() * 600), delta: Math.round(2 + r() * 15) },
      { label: 'Pedidos de direções', value: Math.round(120 + r() * 260), delta: Math.round(1 + r() * 12) },
      { label: 'Peças guardadas', value: Math.round(210 + r() * 420), delta: Math.round(3 + r() * 20) },
    ];
  }, [storeId]);
  const max = Math.max(...series);
  const [hover, setHover] = useState<number | null>(null);
  const plan = store.feed === 'api-demo' ? 'pro' : 'essencial';

  const feed = {
    'api-demo': { icon: PlugZap, label: 'Ligação ao POS (demonstração)', state: 'Ligado', ok: true },
    csv: { icon: FileSpreadsheet, label: 'Ficheiro CSV diário', state: 'Último envio recebido', ok: true },
    manual: { icon: Upload, label: 'Atualização manual', state: 'Sem ligação automática', ok: false },
  }[store.feed];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Portal de parceiros" />
      <Page className="pt-4 lg:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">VESTA para lojas · demonstração</p>
            <h1 className="mt-1 font-display text-[32px] md:text-[44px]">Portal de parceiros</h1>
            <p className="mt-1 max-w-xl text-[14px] text-muted">
              Como uma loja física mostraria o seu stock a quem está perto — e mediria visitas, cliques e interesse.
            </p>
          </div>
          <div>
            <label htmlFor="pp-store" className="mb-1 block text-xs text-muted">Loja</label>
            <select id="pp-store" className="field !w-auto min-w-64" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
              {STORES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <SimulatedNote className="mt-5">Dados de demonstração: lojas, métricas e campanhas são fictícios e gerados de forma determinística.</SimulatedNote>

        {/* KPIs */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Indicadores dos últimos 30 dias">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-card border border-line bg-paper p-4">
              <p className="text-[12.5px] text-muted">{k.label}</p>
              <p className="mt-1 font-display text-3xl tabular">{k.value.toLocaleString('pt-PT')}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-soft">
                <TrendingUp size={12} aria-hidden /> +{k.delta}% vs. 30 dias anteriores
              </p>
            </div>
          ))}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Weekly store clicks — single series bar chart */}
          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="text-[15px] font-semibold">Cliques “ver loja” por semana</h2>
            <p className="text-xs text-muted">Últimas 8 semanas</p>
            <div className="relative mt-5 h-48" role="img" aria-label={`Cliques por semana: ${series.join(', ')}`}>
              {[0, 0.5, 1].map((f) => (
                <div key={f} className="absolute inset-x-0 border-t border-line" style={{ bottom: `${f * 100}%` }}>
                  <span className="absolute -top-2 -left-0 bg-paper pr-1 text-[10px] text-muted tabular">{Math.round(max * f)}</span>
                </div>
              ))}
              <div className="absolute inset-0 left-8 flex items-end gap-[2px]">
                {series.map((v, i) => (
                  <div key={i} className="relative flex h-full flex-1 items-end justify-center" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}>
                    <div className={cx('w-full max-w-7 rounded-t-[4px] transition-colors', hover === i ? 'bg-ink' : 'bg-ink/70')} style={{ height: `${(v / max) * 100}%` }} />
                    {hover === i && (
                      <div className="absolute -top-8 rounded bg-ink px-2 py-1 text-[11px] whitespace-nowrap text-ivory shadow-lift">
                        {WEEKS[i]} · {v} cliques
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-1 ml-8 flex gap-[2px]">
              {WEEKS.map((w) => (
                <span key={w} className="flex-1 text-center text-[10.5px] text-muted">{w}</span>
              ))}
            </div>
            <details className="mt-3 text-xs text-muted">
              <summary className="cursor-pointer">Ver tabela</summary>
              <table className="mt-2 w-full">
                <tbody>
                  {WEEKS.map((w, i) => (
                    <tr key={w}><td className="py-0.5">{w}</td><td className="text-right tabular">{series[i]}</td></tr>
                  ))}
                </tbody>
              </table>
            </details>
          </section>

          {/* Feed + plan */}
          <section className="space-y-4">
            <div className="rounded-card border border-line bg-paper p-5">
              <h2 className="text-[15px] font-semibold">Ligação de produtos e stock</h2>
              <div className="mt-3 flex items-center gap-3">
                <span className={cx('grid size-10 place-items-center rounded-full', feed.ok ? 'bg-success-soft text-success' : 'bg-line text-muted')}>
                  <feed.icon size={18} />
                </span>
                <div className="text-[13.5px]">
                  <p className="font-medium">{feed.label}</p>
                  <p className="flex items-center gap-1 text-xs text-muted">
                    {feed.ok ? <CheckCircle2 size={12} className="text-success" /> : <CircleDashed size={12} />} {feed.state}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">Fonte: {SOURCE_LABEL[items[0]?.availability.source ?? 'store_manual']}. Nenhuma integração real está ligada.</p>
            </div>
            <div className="rounded-card border border-line bg-paper p-5">
              <h2 className="text-[15px] font-semibold">Plano da loja</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {PLANS.map((p) => (
                  <div key={p.id} className={cx('rounded-md border p-3', plan === p.id ? 'border-ink' : 'border-line')}>
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted tabular">{p.price} €/mês</p>
                    <ul className="mt-2 space-y-0.5 text-[11.5px] text-ink-soft">
                      {p.features.map((f) => <li key={f}>· {f}</li>)}
                    </ul>
                    {plan === p.id && <p className="mt-2 text-[11px] font-semibold text-success">Plano atual</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Campaigns */}
        <section className="mt-6 rounded-card border border-line bg-paper p-5">
          <h2 className="text-[15px] font-semibold">Campanhas locais</h2>
          <div className="no-scrollbar mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-[13px]">
              <thead className="text-left text-xs text-muted">
                <tr><th className="py-2 font-medium">Campanha</th><th className="font-medium">Raio</th><th className="text-right font-medium">Impressões</th><th className="text-right font-medium">Cliques</th><th className="text-right font-medium">Visitas reportadas</th></tr>
              </thead>
              <tbody>
                {['Novidades de outono', 'Malhas portuguesas', 'Fim de semana na Baixa'].map((c, i) => {
                  const r = seeded(storeId + c);
                  const imp = Math.round(4000 + r() * 9000);
                  const clicks = Math.round(imp * (0.02 + r() * 0.03));
                  return (
                    <tr key={c} className="border-t border-line">
                      <td className="py-2.5">{c}</td>
                      <td>{[5, 10, 2][i]} km</td>
                      <td className="text-right tabular">{imp.toLocaleString('pt-PT')}</td>
                      <td className="text-right tabular">{clicks}</td>
                      <td className="text-right tabular">{Math.round(clicks * (0.1 + r() * 0.15))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">“Visitas reportadas” seriam medidas por códigos de loja ou check-in voluntário — nunca por localização contínua.</p>
        </section>

        {/* Catalogue */}
        <section className="mt-6 rounded-card border border-line bg-paper p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[15px] font-semibold">Catálogo e disponibilidade · {items.length} produtos</h2>
            <Button
              size="sm"
              variant="secondary"
              icon={<RefreshCw size={14} />}
              onClick={() => toast({ message: 'Sincronização simulada concluída', tone: 'info' })}
            >
              Sincronizar
            </Button>
          </div>
          <div className="no-scrollbar mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead className="text-left text-xs text-muted">
                <tr><th className="py-2 font-medium">Produto</th><th className="font-medium">Preço</th><th className="font-medium">Estado</th><th className="font-medium">Atualizado</th><th className="text-right font-medium">Guardados</th><th className="text-right font-medium">Ação</th></tr>
              </thead>
              <tbody>
                {items.map(({ product: p, availability: a }) => {
                  const o = overrides[p.id];
                  const r = seeded(p.id + storeId);
                  return (
                    <tr key={p.id} className="border-t border-line">
                      <td className="py-2">
                        <span className="flex items-center gap-2.5">
                          <SmartImage src={p.images[0]} alt="" category={p.category} tint={colourById[p.colours[0]].hex} className="size-9 shrink-0 rounded" />
                          <span className="line-clamp-1">{p.name}</span>
                        </span>
                      </td>
                      <td className="tabular">{formatPrice(p.price)}</td>
                      <td><StockBadge status={o?.status ?? a.status} short /></td>
                      <td className="text-muted">{timeAgo(o?.at ?? a.lastUpdatedAt)}</td>
                      <td className="text-right tabular">{Math.round(r() * 60)}</td>
                      <td className="text-right">
                        <button
                          className="text-xs font-medium underline-offset-4 hover:underline"
                          onClick={() => {
                            setOverrides((x) => ({ ...x, [p.id]: { status: 'available', at: new Date().toISOString() } }));
                            toast({ message: `Stock de “${p.name}” confirmado (apenas nesta demonstração)`, tone: 'success' });
                          }}
                        >
                          Confirmar stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">Estados: {(['available', 'low', 'unconfirmed', 'out'] as DisplayStatus[]).map((s) => STATUS_META[s].label).join(' · ')}. Registos com mais de 72 h passam a “por confirmar”.</p>
        </section>
      </Page>
    </div>
  );
}
