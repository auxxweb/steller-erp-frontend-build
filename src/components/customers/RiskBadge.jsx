import { RISK_LEVEL_META } from '../../utils/customerConstants.js';
import { cn } from '../../utils/cn.js';

function RiskBadge({ level, className }) {
  const meta = RISK_LEVEL_META[level] || RISK_LEVEL_META.medium;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        meta.badgeClass,
        className,
      )}
    >
      {meta.label} risk
    </span>
  );
}

export default RiskBadge;
