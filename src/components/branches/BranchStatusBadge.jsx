import { cn } from '../../utils/cn.js';
import { BRANCH_STATUS, BRANCH_STATUS_LABELS } from '../../utils/branchConstants.js';

const statusStyles = {
  [BRANCH_STATUS.ACTIVE]: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  [BRANCH_STATUS.INACTIVE]: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  [BRANCH_STATUS.CLOSED]: 'bg-stellar-surface-muted text-stellar-text-muted',
};

function BranchStatusBadge({ status, className = '' }) {
  const label = BRANCH_STATUS_LABELS[status] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        statusStyles[status] || statusStyles[BRANCH_STATUS.INACTIVE],
        className,
      )}
    >
      {label}
    </span>
  );
}

export default BranchStatusBadge;
