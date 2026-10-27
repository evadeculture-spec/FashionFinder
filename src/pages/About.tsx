import { Page, PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/ui/Button';

const SIMULATED = [
  ['Catálogo, marcas e lojas', 'Fictícios. 37 produtos, 9 marcas e 11 lojas criadas para demonstração.'],
  ['Stock por loja', 'Gerado de forma determinística por produto, loja, tamanho e cor, com data de atualização e fonte. Dados com mais de 72 h aparecem como “por confirmar”.'],
  ['Pesquisa por texto', 'Motor de regras transparente sobre vocabulário pt-PT (categoria, cor, estilo, preço, tamanho). Nenhum modelo de IA é chamado.'],
  ['Pesquisa por imagem', 'Imagens de inspiração com atributos pré-definidos. Nas imagens carregadas, só as cores são analisadas, localmente no navegador.'],
  ['Mapa', 'Ilustrativo, com posições aproximadas. As direções abrem o Google Maps com coordenadas.'],
  ['Conta, VESTA+ e Mystery Box', 'Simulados. Nenhuma palavra-passe, cartão ou pagamento é processado.'],
  ['Portal de parceiros', 'Métricas de demonstração geradas localmente.'],
  ['Persistência', 'Guardados, guarda-roupa, compras, looks e preferências ficam no localStorage deste navegador.'],
];

export default function About() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Sobre o protótipo" />
      <Page className="max-w-3xl pt-4 lg:pt-10">
        <p className="eyebrow">Transparência</p>
        <h1 className="mt-1 font-display text-[32px] md:text-[44px]">O que é simulado neste protótipo</h1>
        <p className="mt-3 text-[15px] text-ink-soft">A VESTA liga inspiração de moda a peças em lojas físicas perto de ti. Esta versão demonstra a experiência completa sem integrações reais.</p>
        <dl className="mt-8 divide-y divide-line rounded-card border border-line bg-paper">
          {SIMULATED.map(([k, v]) => (
            <div key={k} className="grid gap-1 p-4 md:grid-cols-[200px_1fr]">
              <dt className="font-semibold">{k}</dt>
              <dd className="text-[14px] text-ink-soft">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8"><ButtonLink to="/">Voltar a Descobrir</ButtonLink></div>
      </Page>
    </div>
  );
}
