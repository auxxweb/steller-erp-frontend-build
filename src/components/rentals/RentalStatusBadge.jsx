import { RENTAL_STATUS_META } from '../../utils/rentalConstants.js';
import { cn } from '../../utils/cn.js';

function RentalStatusBadge({ status, className }) {
  const meta = RENTAL_STATUS_META[status] || RENTAL_STATUS_META.draft;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export default RentalStatusBadge;
