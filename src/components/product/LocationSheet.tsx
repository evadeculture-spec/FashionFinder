import { useState } from 'react';
import { Check, LocateFixed, Loader2 } from 'lucide-react';
import { CITIES, RADII } from '@/data/taxonomy';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { requestDevicePosition } from '@/services/geo';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/misc';
import { cx } from '@/lib/format';

export function LocationSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useDevice = async () => {
    setLocating(true);
    setError(null);
    try {
      const pos = await requestDevicePosition();
      dispatch({ type: 'setLocation', patch: { device: pos } });
      toast({ message: 'A usar a tua localização atual', tone: 'success' });
      onClose();
    } catch {
      setError('Não foi possível obter a localização. Escolhe uma cidade abaixo.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Onde queres comprar?" footer={<Button block onClick={onClose}>Confirmar</Button>}>
      <div className="space-y-6">
        <div>
          <Button variant="secondary" block icon={locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />} onClick={useDevice} disabled={locating}>
            Usar a minha localização
          </Button>
          <p className="mt-2 text-xs text-muted">
            Só pedimos a localização quando tocas neste botão. Fica guardada apenas neste dispositivo.
          </p>
          {error && <p className="mt-2 text-xs text-danger" role="alert">{error}</p>}
          {state.location.device && (
            <button className="mt-2 text-xs font-medium underline underline-offset-4" onClick={() => dispatch({ type: 'setLocation', patch: { device: undefined } })}>
              Deixar de usar a localização do dispositivo
            </button>
          )}
        </div>
        <div>
          <p className="eyebrow mb-2">Cidade</p>
          <ul className="divide-y divide-line rounded-card border border-line bg-paper">
            {CITIES.map((c) => {
              const active = !state.location.device && state.location.city === c.id;
              return (
                <li key={c.id}>
                  <button
                    className={cx('flex w-full items-center justify-between px-4 py-3 text-left text-[15px]', active && 'font-semibold')}
                    onClick={() => dispatch({ type: 'setLocation', patch: { city: c.id, device: undefined } })}
                  >
                    {c.name}
                    {active && <Check size={16} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-2">Raio de pesquisa</p>
          <Segmented label="Raio de pesquisa" options={RADII} value={state.location.radiusKm as (typeof RADII)[number]} onChange={(r) => dispatch({ type: 'setLocation', patch: { radiusKm: r } })} format={(v) => `${v} km`} />
        </div>
      </div>
    </Sheet>
  );
}
