import { formatPrice, cx } from '@/lib/format';

export function Price({ value, compareAt, className, size = 'md' }: { value: number; compareAt?: number; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={cx('inline-flex items-baseline gap-1.5 tabular', className)}>
      <span className={cx('font-semibold text-ink', size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-[13px]' : 'text-[15px]')}>
        {formatPrice(value)}
      </span>
      {compareAt && compareAt > value && (
        <span className={cx('text-muted line-through', size === 'lg' ? 'text-base' : 'text-xs')}>{formatPrice(compareAt)}</span>
      )}
    </span>
  );
}
