import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/misc';
import { GarmentIllustration } from '@/components/ui/GarmentIllustration';

export default function NotFound() {
  return (
    <>
      <PageHeader />
      <EmptyState
        illustration={<GarmentIllustration category="accessories" className="h-24" />}
        title="Esta página saiu de moda"
        body="Não encontrámos o que procuravas. Volta ao início ou faz uma nova pesquisa."
        action={<div className="flex gap-2"><ButtonLink to="/">Descobrir</ButtonLink><ButtonLink to="/pesquisar" variant="secondary">Pesquisar</ButtonLink></div>}
      />
    </>
  );
}
