import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cx } from '@/lib/format';

type Variant = 'primary' | 'clay' | 'secondary' | 'ghost' | 'light';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-chip transition-[background,color,border,transform,box-shadow] duration-200 active:scale-[0.98] disabled:opacity-45 disabled:active:scale-100 select-none';
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-ivory hover:bg-ink-soft',
  clay: 'bg-clay text-white hover:bg-clay-deep',
  secondary: 'border border-line-strong bg-paper text-ink hover:border-ink',
  ghost: 'text-ink hover:bg-ink/5',
  light: 'bg-ivory text-ink hover:bg-white',
};
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-6 text-[15px]',
};

export const buttonClass = (v: Variant = 'primary', s: Size = 'md', extra?: string) => cx(base, variants[v], sizes[s], extra);

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = 'primary', size = 'md', icon, block, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, cx(block && 'w-full', className))} {...rest}>
      {icon}
      {children}
    </button>
  );
});

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  icon,
  block,
  className,
  children,
  ...rest
}: LinkProps & { variant?: Variant; size?: Size; icon?: ReactNode; block?: boolean }) {
  return (
    <Link className={buttonClass(variant, size, cx(block && 'w-full', className))} {...rest}>
      {icon}
      {children}
    </Link>
  );
}

export function IconButton({
  label,
  children,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx('grid size-10 place-items-center rounded-full transition-colors hover:bg-ink/5 active:scale-95', className)}
      {...rest}
    >
      {children}
    </button>
  );
}
