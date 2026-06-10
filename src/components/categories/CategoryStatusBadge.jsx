import { cn } from '../../utils/cn.js';
import { CATEGORY_STATUS, CATEGORY_STATUS_LABELS } from '../../utils/categoryConstants.js';

const statusStyles = {
  [CATEGORY_STATUS.ACTIVE]: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  [CATEGORY_STATUS.INACTIVE]: 'bg-stellar-surface-muted text-stellar-text-muted',
};

function CategoryStatusBadge({ status, className = '' }) {
  const label = CATEGORY_STATUS_LABELS[status] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        statusStyles[status] || statusStyles[CATEGORY_STATUS.INACTIVE],
        className,
      )}
    >
      {label}
    </span>
  );
}

export default CategoryStatusBadge;
