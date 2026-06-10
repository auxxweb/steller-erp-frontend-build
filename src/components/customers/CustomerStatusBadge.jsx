import { CUSTOMER_STATUS } from '../../utils/customerConstants.js';
import { cn } from '../../utils/cn.js';

const STATUS_STYLES = {
  [CUSTOMER_STATUS.ACTIVE]: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  [CUSTOMER_STATUS.INACTIVE]: 'bg-stellar-surface-muted text-stellar-text-muted',
  [CUSTOMER_STATUS.BLOCKED]: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

function CustomerStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES[CUSTOMER_STATUS.INACTIVE];
  const label = status?.replace(/_/g, ' ') || 'unknown';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        style,
      )}
    >
      {label}
    </span>
  );
}

export default CustomerStatusBadge;
