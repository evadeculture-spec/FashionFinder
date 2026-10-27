import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FlaskConical } from 'lucide-react';
import { cx } from '@/lib/format';

export function SectionHeader({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  action?: { label: string; to: string };
  className?: string;
}) {
  return (
    <div className={cx('mb-4 flex items-end justify-between gap-4', className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h2 className="font-display text-[22px] leading-tight md:text-[28px]">{title}</h2>
      </div>
      {action && (
        <Link to={action.to} className="group inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-ink-soft hover:text-ink">
          {action.label}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** Honest disclosure for simulated data and features. */
export function SimulatedNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx('flex items-start gap-2 rounded-md border border-dashed border-taupe/70 bg-paper/60 px-3 py-2 text-[12px] leading-relaxed text-muted', className)}>
      <FlaskConical size={14} className="mt-0.5 shrink-0 text-taupe" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function EmptyState({
  illustration,
  title,
  body,
  action,
}: {
  illustration?: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-12 text-center">
      {illustration && <div className="mb-5 text-ink/70">{illustration}</div>}
      <h3 className="font-display text-xl">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Rail({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 md:-mx-8 md:scroll-px-8 md:px-8 lg:mx-0 lg:px-0', className)}>
      {children}
    </div>
  );
}

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink-soft">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span>
        <span className="block text-[15px]">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="block h-6 w-10 rounded-full bg-line-strong transition-colors peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-clay" />
        <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  format = (v) => String(v),
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  format?: (v: T) => string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-chip border border-line-strong bg-paper p-1">
      {options.map((o) => (
        <button
          key={String(o)}
          type="button"
          role="radio"
          aria-checked={o === value}
          onClick={() => onChange(o)}
          className={cx(
            'h-8 flex-1 rounded-chip px-2 text-[13px] font-medium tabular transition-colors',
            o === value ? 'bg-ink text-ivory' : 'text-ink-soft hover:text-ink',
          )}
        >
          {format(o)}
        </button>
      ))}
    </div>
  );
}
