import { Heart } from 'lucide-react';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { cx } from '@/lib/format';

export function FavouriteButton({ productId, className, variant = 'overlay' }: { productId: string; className?: string; variant?: 'overlay' | 'plain' }) {
  const { isFavourite, dispatch } = useApp();
  const toast = useToast();
  const on = isFavourite(productId);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? 'Remover dos guardados' : 'Guardar peça'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch({ type: 'toggleFavourite', id: productId });
        toast(on ? { message: 'Removida dos guardados', tone: 'info' } : { message: 'Guardada nos teus favoritos', tone: 'success', action: { label: 'Ver', to: '/guardados' } });
      }}
      className={cx(
        'grid place-items-center rounded-full transition-transform active:scale-90',
        variant === 'overlay' ? 'size-9 bg-paper/90 shadow-soft backdrop-blur hover:bg-paper' : 'size-11 border border-line-strong bg-paper hover:border-ink',
        className,
      )}
    >
      <Heart size={variant === 'overlay' ? 17 : 19} strokeWidth={1.8} className={cx('transition-colors', on ? 'fill-clay text-clay' : 'text-ink')} />
    </button>
  );
}
