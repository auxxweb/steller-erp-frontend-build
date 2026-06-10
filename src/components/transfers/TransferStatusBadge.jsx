import { TRANSFER_STATUS_META } from '../../utils/transferConstants.js';
import { cn } from '../../utils/cn.js';

function TransferStatusBadge({ status }) {
  const meta = TRANSFER_STATUS_META[status] || TRANSFER_STATUS_META.cancelled;
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}

export default TransferStatusBadge;
