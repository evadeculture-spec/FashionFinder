import { BRAND } from '@/config/brand';
import { cx } from '@/lib/format';

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cx('inline-flex items-baseline gap-0.5 font-display text-[22px] font-semibold tracking-[0.18em]', light ? 'text-ivory' : 'text-ink', className)}>
      {BRAND.name}
      <span className="inline-block size-1.5 rounded-full bg-clay" aria-hidden />
    </span>
  );
}
