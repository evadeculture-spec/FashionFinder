import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, Check, Gift, Infinity as InfinityIcon, Minus, Sparkles, TrendingDown, Wand2 } from 'lucide-react';
import { PLANS } from '@/data/outfits';
import { img } from '@/data/images';
import type { BillingCycle } from '@/data/types';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { Page, PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Segmented, SimulatedNote } from '@/components/ui/misc';
import { Sheet } from '@/components/ui/Sheet';
import { SmartImage } from '@/components/ui/SmartImage';
import { cx, formatDate, formatPrice } from '@/lib/format';

const BENEFITS = [
  { icon: Wand2, title: 'Recomendações avançadas', body: 'Sugestões que aprendem com o teu guarda-roupa e com o que guardas.' },
  { icon: Bell, title: 'Alertas de pesquisa', body: 'Avisamos quando uma loja perto de ti reporta uma peça que procuraste.' },
  { icon: TrendingDown, title: 'Descidas de preço', body: 'Notificação quando uma peça guardada baixa de preço numa loja.' },
  { icon: InfinityIcon, title: 'Guarda-roupa ilimitado', body: 'Peças e looks sem limites, com organização avançada.' },
  { icon: Sparkles, title: 'Inspiração exclusiva', body: 'Edições mensais da equipa de estilo e acesso antecipado a funcionalidades.' },
  { icon: Gift, title: 'Mystery Box', body: 'Uma seleção curada de acessórios, sujeita a elegibilidade.' },
];

export default function Premium() {
  const { state, dispatch, isPlus } = useApp();
  const toast = useToast();
  const [cycle, setCycle] = useState<BillingCycle>('annual');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [done, setDone] = useState(false);
  const plus = PLANS.find((p) => p.id === 'plus')!;
  const free = PLANS.find((p) => p.id === 'free')!;
  const monthlyEq = cycle === 'annual' ? plus.annual / 12 : plus.monthly;
  const saving = Math.round((1 - plus.annual / (plus.monthly * 12)) * 100);

  return (
    <div className="animate-fade-in">
      <PageHeader title="VESTA+" />
      <section className="relative overflow-hidden bg-ink text-ivory">
        <SmartImage src={img.shopping} alt="" className="absolute inset-0 !bg-ink opacity-35" />
        <Page className="relative py-14 md:py-20">
          <p className="eyebrow !text-clay-soft">VESTA+</p>
          <h1 className="mt-2 max-w-2xl font-display text-[36px] leading-[1.08] md:text-[56px]">
            As peças certas, <em>a vir ter contigo</em>.
          </h1>
          <p className="mt-4 max-w-lg text-[15px] text-ivory/80">Alertas, recomendações avançadas e uma Mystery Box curada — por {formatPrice(plus.monthly)}/mês. Cancela quando quiseres.</p>
          {isPlus && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-chip bg-ivory/10 px-4 py-2 text-sm">
              <Check size={15} /> VESTA+ ativo desde {formatDate(state.subscription.since!)} · {state.subscription.cycle === 'annual' ? 'anual' : 'mensal'}
            </p>
          )}
        </Page>
      </section>

      <Page className="mt-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-card border border-line bg-paper p-5">
              <span className="grid size-10 place-items-center rounded-full bg-clay-soft text-clay-deep">
                <Icon size={18} />
              </span>
              <h3 className="mt-3 font-display text-lg">{title}</h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>

        <section className="mt-14" aria-labelledby="plans-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="plans-title" className="font-display text-[28px]">Compara os planos</h2>
            <div className="w-64">
              <Segmented label="Periodicidade" options={['monthly', 'annual'] as const} value={cycle} onChange={setCycle} format={(v) => (v === 'monthly' ? 'Mensal' : `Anual · −${saving}%`)} />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <PlanCard name={free.name} price="Grátis" sub="Para sempre" blurb={free.blurb} current={!isPlus} />
            <PlanCard
              name={plus.name}
              price={`${formatPrice(cycle === 'annual' ? plus.annual : plus.monthly)}`}
              sub={cycle === 'annual' ? `por ano · equivale a ${formatPrice(Math.round(monthlyEq * 100) / 100)}/mês` : 'por mês'}
              blurb={plus.blurb}
              current={isPlus}
              highlight
              action={
                isPlus ? (
                  <Button variant="secondary" block onClick={() => setCancelOpen(true)}>
                    Gerir subscrição
                  </Button>
                ) : (
                  <Button variant="clay" block size="lg" onClick={() => setConfirmOpen(true)}>
                    Experimentar VESTA+
                  </Button>
                )
              }
            />
          </div>

          <div className="no-scrollbar mt-6 overflow-x-auto rounded-card border border-line bg-paper">
            <table className="w-full min-w-[480px] text-[13.5px]">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="p-4 font-medium text-muted">Funcionalidade</th>
                  <th className="w-32 p-4 font-semibold">{free.name}</th>
                  <th className="w-36 p-4 font-semibold text-clay-deep">{plus.name}</th>
                </tr>
              </thead>
              <tbody>
                {free.features.map((f, i) => (
                  <tr key={f.label} className="border-b border-line last:border-0">
                    <td className="p-4">{f.label}</td>
                    <td className="p-4"><Cell v={f.included} /></td>
                    <td className="p-4"><Cell v={plus.features[i].included} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Link to="/premium/mystery-box" className="group mt-12 grid overflow-hidden rounded-card border border-line bg-paper md:grid-cols-[1fr_1.2fr]">
          <SmartImage src={img.giftBox} alt="Caixa de oferta com acessórios" label="Mystery Box" className="aspect-[16/10] md:aspect-auto md:h-full" />
          <div className="p-6 md:p-10">
            <p className="eyebrow">Benefício VESTA+</p>
            <h2 className="mt-1 font-display text-[28px] leading-tight">A Mystery Box</h2>
            <p className="mt-2 text-[14.5px] text-muted">Uma seleção curada de acessórios de lojas parceiras, escolhida a partir do teu estilo. Vê o que inclui, quem é elegível e como recebê-la.</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
              Explorar a Mystery Box <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        <div className="mt-10 grid gap-6 text-[13.5px] text-ink-soft md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-ink">Cancelamento</h3>
            <p className="mt-1">Cancela a qualquer momento no Perfil. Manténs o acesso até ao fim do período pago; não há reembolsos parciais do período em curso.</p>
          </div>
          <div>
            <h3 className="font-semibold text-ink">Renovação</h3>
            <p className="mt-1">A subscrição renova automaticamente. Avisamos 7 dias antes de cada renovação anual.</p>
          </div>
          <div>
            <h3 className="font-semibold text-ink">Pagamento</h3>
            <p className="mt-1">Neste protótipo não existe pagamento real: nenhum cartão é pedido nem guardado.</p>
          </div>
        </div>
        <SimulatedNote className="mt-8">Subscrição simulada para demonstração. Preços indicativos com IVA incluído.</SimulatedNote>
      </Page>

      <Sheet
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setDone(false);
        }}
        title={done ? 'VESTA+ ativado' : 'Confirmar subscrição'}
        footer={
          done ? (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => { setConfirmOpen(false); setDone(false); }}>Fechar</Button>
              <Link to="/premium/mystery-box" className="inline-flex h-11 items-center justify-center rounded-chip bg-ink text-sm font-medium text-ivory">Ver Mystery Box</Link>
            </div>
          ) : (
            <Button
              block
              size="lg"
              variant="clay"
              onClick={() => {
                dispatch({ type: 'subscribe', cycle });
                setDone(true);
                toast({ message: 'VESTA+ ativado (simulação)', tone: 'success' });
              }}
            >
              Ativar VESTA+ — simulação
            </Button>
          )
        }
      >
        {done ? (
          <div className="py-4 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-success">
              <Check size={26} />
            </span>
            <p className="mt-4 font-display text-2xl">Está tudo pronto.</p>
            <p className="mt-1 text-sm text-muted">Os alertas e o guarda-roupa ilimitado já estão ativos. Nenhum valor foi cobrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-card border border-line bg-paper p-4">
              <div className="flex justify-between">
                <span>VESTA+ {cycle === 'annual' ? 'anual' : 'mensal'}</span>
                <span className="font-semibold tabular">{formatPrice(cycle === 'annual' ? plus.annual : plus.monthly)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">Renova {cycle === 'annual' ? 'a cada 12 meses' : 'todos os meses'}. Cancela quando quiseres.</p>
            </div>
            <Segmented label="Periodicidade" options={['monthly', 'annual'] as const} value={cycle} onChange={setCycle} format={(v) => (v === 'monthly' ? `Mensal · ${formatPrice(plus.monthly)}` : `Anual · ${formatPrice(plus.annual)}`)} />
            <SimulatedNote>Simulação: não há fornecedor de pagamentos ligado. Ao confirmar, o plano é ativado apenas neste dispositivo e nada é cobrado.</SimulatedNote>
          </div>
        )}
      </Sheet>

      <Sheet
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Gerir subscrição"
        footer={
          <Button
            block
            variant="secondary"
            onClick={() => {
              dispatch({ type: 'cancelSubscription' });
              setCancelOpen(false);
              toast({ message: 'Subscrição cancelada (simulação)', tone: 'info' });
            }}
          >
            Cancelar VESTA+
          </Button>
        }
      >
        <p className="text-sm text-ink-soft">
          Plano {state.subscription.cycle === 'annual' ? 'anual' : 'mensal'} ativo desde {state.subscription.since ? formatDate(state.subscription.since) : '—'}. Numa versão real manterias o acesso até ao fim do período pago. Nesta demonstração, o plano volta a gratuito de imediato.
        </p>
      </Sheet>
    </div>
  );
}

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <Check size={16} className="text-success" aria-label="Incluído" />;
  if (v === false) return <Minus size={16} className="text-taupe" aria-label="Não incluído" />;
  return <span className="text-[13px]">{v}</span>;
}

function PlanCard({ name, price, sub, blurb, current, highlight, action }: { name: string; price: string; sub: string; blurb: string; current?: boolean; highlight?: boolean; action?: React.ReactNode }) {
  return (
    <div className={cx('flex flex-col rounded-card border p-6', highlight ? 'border-ink bg-paper shadow-lift' : 'border-line bg-paper/60')}>
      <div className="flex items-center justify-between">
        <h3 className={cx('font-display text-2xl', highlight && 'text-clay-deep')}>{name}</h3>
        {current && <span className="rounded-chip bg-ink px-2.5 py-0.5 text-[11px] font-semibold text-ivory">Plano atual</span>}
      </div>
      <p className="mt-4">
        <span className="font-display text-4xl tabular">{price}</span>
      </p>
      <p className="text-[13px] text-muted">{sub}</p>
      <p className="mt-3 flex-1 text-[14px] text-ink-soft">{blurb}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
