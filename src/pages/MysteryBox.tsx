import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Gem, Glasses, Mail, Package, ShoppingBag, Store as StoreIcon, Truck, X } from 'lucide-react';
import { img } from '@/data/images';
import { STORES, storeById } from '@/data/stores';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { Page, PageHeader } from '@/components/layout/PageHeader';
import { Button, ButtonLink } from '@/components/ui/Button';
import { SimulatedNote } from '@/components/ui/misc';
import { SmartImage } from '@/components/ui/SmartImage';
import { Sheet } from '@/components/ui/Sheet';
import { cx, formatDate } from '@/lib/format';
import { distanceKm } from '@/services/geo';

const CONTENTS = [
  { icon: Gem, title: '1 peça de joalharia', body: 'Ex.: argolas em prata ou um anel sinete.', image: img.earrings },
  { icon: Glasses, title: '1 acessório', body: 'Ex.: lenço de seda, óculos ou gorro de lã.', image: img.scarf },
  { icon: ShoppingBag, title: '1 pequeno artigo de pele', body: 'Ex.: porta-cartões ou cinto.', image: img.belt },
  { icon: Mail, title: 'Carta de estilo', body: 'Três formas de usar cada peça com o que já tens.', image: img.flatlay },
];

export default function MysteryBox() {
  const { state, dispatch, isPlus, origin } = useApp();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [option, setOption] = useState<'delivery' | 'pickup'>('pickup');
  const nearStores = [...STORES].sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b)).slice(0, 3);
  const [storeId, setStoreId] = useState(nearStores[0].id);
  const req = state.mysteryBox;

  const monthsSubscribed = state.subscription.since ? Math.floor((Date.now() - new Date(state.subscription.since).getTime()) / (30 * 86400_000)) : 0;
  const checks = [
    { ok: isPlus, label: 'Subscrição VESTA+ ativa' },
    { ok: monthsSubscribed >= 3, label: '3 meses consecutivos de subscrição', demo: isPlus && monthsSubscribed < 3 },
    { ok: state.profile.colours.length > 0 && state.profile.categories.length > 0, label: 'Perfil de estilo preenchido (cores e categorias)' },
    { ok: true, label: 'Morada em Portugal continental ou levantamento em loja' },
  ];
  const eligible = isPlus && checks[2].ok;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Mystery Box" />
      <Page className="pt-4 lg:pt-10">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="eyebrow">Benefício VESTA+</p>
            <h1 className="mt-1 font-display text-[34px] leading-[1.08] md:text-[52px]">
              Uma caixa curada, <em>escolhida para o teu estilo</em>.
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
              Uma vez por trimestre, a equipa de estilo seleciona acessórios de lojas parceiras a partir das tuas preferências. Não é um sorteio: sabes sempre o que a caixa inclui por categoria, e podes trocar qualquer peça na loja.
            </p>
            <dl className="mt-6 grid grid-cols-3 gap-3">
              <Fact k="Frequência" v="1× por trimestre" />
              <Fact k="Custo" v="Incluída no VESTA+" />
              <Fact k="Portes" v="3,90 € ou grátis em loja" />
            </dl>
          </div>
          <div className="grid grid-cols-[1.3fr_1fr] gap-3">
            <SmartImage src={img.giftBox} alt="Caixa de oferta aberta com papel de seda" label="Mystery Box" className="row-span-2 aspect-[3/4] rounded-card" eager />
            <SmartImage src={img.necklace} alt="Colar dourado" category="jewellery" className="aspect-square rounded-card" />
            <SmartImage src={img.sunglasses} alt="Óculos de sol" category="accessories" className="aspect-square rounded-card" />
          </div>
        </div>

        <section className="mt-16">
          <h2 className="font-display text-[26px]">O que inclui</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONTENTS.map(({ icon: Icon, title, body, image }) => (
              <div key={title} className="overflow-hidden rounded-card border border-line bg-paper">
                <SmartImage src={image} alt="" label={title} className="aspect-[4/3]" />
                <div className="p-4">
                  <Icon size={17} className="text-clay" />
                  <p className="mt-2 font-semibold">{title}</p>
                  <p className="mt-0.5 text-[13px] text-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-md bg-paper px-4 py-3 text-[13px] text-ink-soft">
            <strong>Valor de retalho ilustrativo:</strong> entre 60 € e 90 € por caixa, com base nos preços de catálogo das peças de exemplo. É uma estimativa para demonstração — o valor não é garantido e não representa uma poupança.
          </p>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-card border border-line bg-paper p-5 md:p-6">
            <h2 className="font-display text-xl">Elegibilidade</h2>
            <ul className="mt-4 space-y-3">
              {checks.map((c) => (
                <li key={c.label} className="flex items-start gap-3 text-[14px]">
                  <span className={cx('grid size-6 shrink-0 place-items-center rounded-full', c.ok ? 'bg-success-soft text-success' : 'bg-line text-muted')}>
                    {c.ok ? <Check size={14} /> : <X size={14} />}
                  </span>
                  <span>
                    {c.label}
                    {c.demo && <span className="block text-xs text-muted">Nesta demonstração, esta regra é dispensada para poderes ver o fluxo completo.</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card border border-line bg-paper p-5 md:p-6">
            <h2 className="font-display text-xl">Como receber</h2>
            <ul className="mt-4 space-y-3 text-[14px]">
              <li className="flex gap-3">
                <StoreIcon size={18} className="mt-0.5 shrink-0" />
                <span><strong>Levantamento em loja — grátis.</strong> Escolhe uma loja parceira perto de ti; podes trocar peças no momento.</span>
              </li>
              <li className="flex gap-3">
                <Truck size={18} className="mt-0.5 shrink-0" />
                <span><strong>Entrega em casa — 3,90 €.</strong> 3 a 5 dias úteis em Portugal continental.</span>
              </li>
              <li className="flex gap-3">
                <Package size={18} className="mt-0.5 shrink-0" />
                <span>Podes saltar um trimestre ou recusar a caixa sem custo.</span>
              </li>
            </ul>
          </div>
        </section>

        <div className="mt-10 rounded-card bg-ink p-6 text-ivory md:flex md:items-center md:justify-between md:p-8">
          {req ? (
            <>
              <div>
                <p className="font-display text-2xl">Pedido registado</p>
                <p className="mt-1 text-sm text-ivory/75">
                  {formatDate(req.requestedAt!)} · {req.option === 'pickup' ? `Levantamento em ${storeById[req.storeId!]?.name}` : 'Entrega em casa'} · simulação
                </p>
              </div>
              <Button variant="light" className="mt-4 md:mt-0" onClick={() => { dispatch({ type: 'cancelMysteryBox' }); toast({ message: 'Pedido cancelado', tone: 'info' }); }}>
                Cancelar pedido
              </Button>
            </>
          ) : (
            <>
              <div>
                <p className="font-display text-2xl">{eligible ? 'Estás elegível para a próxima caixa' : isPlus ? 'Completa o teu perfil de estilo' : 'Disponível para membros VESTA+'}</p>
                <p className="mt-1 text-sm text-ivory/75">Próximo envio: início do próximo trimestre.</p>
              </div>
              {eligible ? (
                <Button variant="clay" size="lg" className="mt-4 md:mt-0" onClick={() => setOpen(true)}>
                  Pedir a minha Mystery Box
                </Button>
              ) : isPlus ? (
                <ButtonLink to="/perfil" variant="light" size="lg" className="mt-4 md:mt-0">Completar perfil</ButtonLink>
              ) : (
                <ButtonLink to="/premium" variant="clay" size="lg" className="mt-4 md:mt-0">Conhecer o VESTA+</ButtonLink>
              )}
            </>
          )}
        </div>
        <SimulatedNote className="mt-6">
          Conceito em demonstração. Nenhuma caixa é enviada e nenhum pagamento é efetuado. As peças de exemplo vêm do catálogo fictício.
        </SimulatedNote>
        <p className="mt-4 text-center text-[13px]">
          <Link to="/premium" className="underline underline-offset-4">Voltar ao VESTA+</Link>
        </p>
      </Page>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Pedir Mystery Box"
        footer={
          <Button
            block
            size="lg"
            onClick={() => {
              dispatch({ type: 'requestMysteryBox', option, storeId: option === 'pickup' ? storeId : undefined });
              setOpen(false);
              toast({ message: 'Pedido de Mystery Box registado (simulação)', tone: 'success' });
            }}
          >
            Confirmar pedido — simulação
          </Button>
        }
      >
        <div className="space-y-3">
          {(['pickup', 'delivery'] as const).map((o) => (
            <label key={o} className="flex cursor-pointer items-start gap-3 rounded-card border border-line bg-paper p-4 has-[:checked]:border-ink">
              <input type="radio" name="mb-option" className="mt-1 accent-ink" checked={option === o} onChange={() => setOption(o)} />
              <span>
                <span className="block font-medium">{o === 'pickup' ? 'Levantar em loja · grátis' : 'Entrega em casa · 3,90 €'}</span>
                <span className="block text-xs text-muted">{o === 'pickup' ? 'Podes experimentar e trocar no momento.' : '3 a 5 dias úteis. Portes cobrados à parte.'}</span>
              </span>
            </label>
          ))}
          {option === 'pickup' && (
            <div>
              <label htmlFor="mb-store" className="mb-1.5 block text-[13px] font-medium text-ink-soft">Loja de levantamento</label>
              <select id="mb-store" className="field" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
                {nearStores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {s.neighbourhood}</option>
                ))}
              </select>
            </div>
          )}
          <p className="text-xs text-muted">A caixa está incluída no VESTA+. {option === 'delivery' && 'Apenas os portes (3,90 €) seriam cobrados — nesta simulação, nada é cobrado.'}</p>
        </div>
      </Sheet>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-card border border-line bg-paper p-3">
      <dt className="text-[11px] text-muted">{k}</dt>
      <dd className="mt-0.5 text-[13.5px] font-semibold leading-tight">{v}</dd>
    </div>
  );
}
