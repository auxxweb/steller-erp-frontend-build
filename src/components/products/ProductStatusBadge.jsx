import { cn } from '../../utils/cn.js';
import { PRODUCT_STATUS, PRODUCT_STATUS_LABELS } from '../../utils/productConstants.js';

const styles = {
  [PRODUCT_STATUS.ACTIVE]: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  [PRODUCT_STATUS.INACTIVE]: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  [PRODUCT_STATUS.DISCONTINUED]: 'bg-stellar-surface-muted text-stellar-text-muted',
};

function ProductStatusBadge({ status, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles[status] || styles[PRODUCT_STATUS.INACTIVE],
        className,
      )}
    >
      {PRODUCT_STATUS_LABELS[status] || status}
    </span>
  );
}

export default ProductStatusBadge;
