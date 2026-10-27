import { useState } from 'react';
import { OUTFITS } from '@/data/outfits';
import { useApp } from '@/state/AppState';
import { Page, PageHeader } from '@/components/layout/PageHeader';
import { OutfitCard } from '@/components/product/OutfitCard';
import { Chip } from '@/components/ui/Chip';
import { SectionHeader } from '@/components/ui/misc';

export default function Looks() {
  const { state } = useApp();
  const occasions = ['Todos', ...new Set(OUTFITS.map((o) => o.occasion))];
  const [occ, setOcc] = useState('Todos');
  const list = OUTFITS.filter((o) => occ === 'Todos' || o.occasion === occ);
  return (
    <div className="animate-fade-in">
      <PageHeader title="Looks" />
      <Page className="pt-4 lg:pt-10">
        <p className="eyebrow">Inspiração editorial</p>
        <h1 className="mt-1 max-w-2xl font-display text-[32px] leading-tight md:text-[46px]">Looks completos, com peças de lojas perto de ti.</h1>
        <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {occasions.map((o) => (
            <Chip key={o} active={occ === o} onClick={() => setOcc(o)}>
              {o}
            </Chip>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((o) => (
            <OutfitCard key={o.id} outfit={o} />
          ))}
        </div>
        {state.savedOutfits.length > 0 && (
          <div className="mt-16">
            <SectionHeader eyebrow="Os teus looks" title="Criados por ti" action={{ label: 'Ver guardados', to: '/guardados?tab=looks' }} />
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {state.savedOutfits.slice(0, 4).map((o) => (
                <OutfitCard key={o.id} outfit={o} />
              ))}
            </div>
          </div>
        )}
      </Page>
    </div>
  );
}
