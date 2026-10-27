import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/format';

export function Chip({
  active,
  children,
  icon,
  swatch,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; icon?: ReactNode; swatch?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx(
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-chip border px-3.5 text-[13px] font-medium transition-colors duration-150',
        active ? 'border-ink bg-ink text-ivory' : 'border-line-strong bg-paper text-ink hover:border-ink/60',
        className,
      )}
      {...rest}
    >
      {swatch && (
        <span className="size-3.5 rounded-full border border-black/10" style={{ background: swatch }} aria-hidden />
      )}
      {icon}
      {children}
    </button>
  );
}

/** Read-only token shown for interpreted search intent. */
export function Tag({ children, onRemove, tone = 'default' }: { children: ReactNode; onRemove?: () => void; tone?: 'default' | 'clay' }) {
  return (
    <span
      className={cx(
        'inline-flex h-7 items-center gap-1 rounded-chip pl-2.5 text-xs font-medium',
        onRemove ? 'pr-1' : 'pr-2.5',
        tone === 'clay' ? 'bg-clay-soft text-clay-deep' : 'bg-line text-ink-soft',
      )}
    >
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label="Remover filtro" className="grid size-5 place-items-center rounded-full hover:bg-black/10">
          ×
        </button>
      )}
    </span>
  );
}
