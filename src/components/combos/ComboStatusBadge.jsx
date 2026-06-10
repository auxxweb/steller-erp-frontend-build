import { COMBO_STATUS } from '../../utils/comboConstants.js';
import { cn } from '../../utils/cn.js';

const STYLES = {
  [COMBO_STATUS.ACTIVE]: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  [COMBO_STATUS.INACTIVE]: 'bg-stellar-surface-muted text-stellar-text-muted',
};

function ComboStatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        STYLES[status] || STYLES[COMBO_STATUS.INACTIVE],
      )}
    >
      {status}
    </span>
  );
}

export default ComboStatusBadge;
