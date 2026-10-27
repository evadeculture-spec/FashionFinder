import type { DisplayStatus } from '@/data/types';
import { STATUS_META } from '@/services/inventory';
import { cx, timeAgo } from '@/lib/format';

const tones = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  neutral: 'bg-line text-ink-soft',
  danger: 'bg-danger-soft text-danger',
};
const dots = { success: 'bg-success', warning: 'bg-warning', neutral: 'bg-taupe', danger: 'bg-danger' };

export function StockBadge({
  status,
  short,
  updatedAt,
  className,
}: {
  status: DisplayStatus;
  short?: boolean;
  updatedAt?: string;
  className?: string;
}) {
  const m = STATUS_META[status];
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-chip px-2 py-0.5 text-[11.5px] font-medium leading-5', tones[m.tone], className)}>
      <span className={cx('size-1.5 rounded-full', dots[m.tone])} aria-hidden />
      {short ? m.short : m.label}
      {updatedAt && <span className="font-normal opacity-75">· {timeAgo(updatedAt)}</span>}
    </span>
  );
}
