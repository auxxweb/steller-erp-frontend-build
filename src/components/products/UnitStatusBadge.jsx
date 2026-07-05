import { cn } from '../../utils/cn.js';
import { PRODUCT_UNIT_STATUS, UNIT_STATUS_LABELS } from '../../utils/productConstants.js';

const styles = {
  [PRODUCT_UNIT_STATUS.AVAILABLE]: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  [PRODUCT_UNIT_STATUS.RESERVED]: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  [PRODUCT_UNIT_STATUS.RENTED]: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
  [PRODUCT_UNIT_STATUS.MAINTENANCE]: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  [PRODUCT_UNIT_STATUS.RETIRED]: 'bg-stellar-surface-muted text-stellar-text-muted',
  [PRODUCT_UNIT_STATUS.LOST]: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

function UnitStatusBadge({ status, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        styles[status] || styles[PRODUCT_UNIT_STATUS.RETIRED],
        className,
      )}
    >
      {UNIT_STATUS_LABELS[status] || status}
    </span>
  );
}

export default UnitStatusBadge;
