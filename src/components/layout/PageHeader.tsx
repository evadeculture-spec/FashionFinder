import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cx } from '@/lib/format';

/** Sticky mobile header with back navigation. Hidden chrome on desktop. */
export function PageHeader({ title, back = true, actions, transparent }: { title?: string; back?: boolean; actions?: ReactNode; transparent?: boolean }) {
  const nav = useNavigate();
  return (
    <div className={cx('sticky top-0 z-30 lg:hidden', transparent ? 'bg-transparent' : 'border-b border-line/70 bg-ivory/90 backdrop-blur')}>
      <div className="flex h-14 items-center gap-1 px-2">
        {back ? (
          <button
            onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))}
            aria-label="Voltar"
            className={cx('grid size-10 place-items-center rounded-full', transparent ? 'bg-paper/90 shadow-soft' : 'hover:bg-ink/5')}
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <span className="w-2" />
        )}
        {title && <h1 className="flex-1 truncate text-center text-[15px] font-semibold">{title}</h1>}
        {!title && <span className="flex-1" />}
        <div className="flex min-w-10 items-center justify-end gap-1">{actions}</div>
      </div>
    </div>
  );
}

/** Page container with consistent gutters. */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-[1360px] px-4 md:px-8', className)}>{children}</div>;
}

export function DesktopBack() {
  const nav = useNavigate();
  return (
    <button onClick={() => nav(-1)} className="mb-4 hidden items-center gap-1 text-[13px] text-muted hover:text-ink lg:inline-flex">
      <ChevronLeft size={16} /> Voltar
    </button>
  );
}
