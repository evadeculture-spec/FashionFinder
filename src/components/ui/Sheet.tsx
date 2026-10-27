import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cx } from '@/lib/format';

/* Bottom sheet on mobile, centred dialog from md up. Esc and backdrop close;
   focus moves into the dialog and returns to the trigger on close. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('button,a,input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => panel.current?.focus());
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6">
      <div className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'relative flex max-h-[92dvh] w-full animate-sheet-up flex-col rounded-t-sheet bg-ivory shadow-lift outline-none md:animate-fade-up md:rounded-sheet',
          wide ? 'md:max-w-2xl' : 'md:max-w-lg',
        )}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line-strong md:hidden" aria-hidden />
        <header className="flex items-center justify-between px-5 pt-3 pb-2 md:px-6 md:pt-5">
          <h2 className="font-display text-xl">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="grid size-9 place-items-center rounded-full hover:bg-ink/5">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 pb-5 md:px-6">{children}</div>
        {footer && <footer className="safe-bottom border-t border-line bg-ivory px-5 py-3 md:rounded-b-sheet md:px-6">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
