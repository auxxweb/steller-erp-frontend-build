import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import { QUICK_ACTION_ACCENTS } from './charts/chartColors.js';

function QuickActionsGrid({ actions = [] }) {
  if (!actions.length) return null;

  return (
    <div className="grid gap-stellar-3 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action, index) => {
        const accent = QUICK_ACTION_ACCENTS[index % QUICK_ACTION_ACCENTS.length];
        const isPrimary = action.accent;

        return (
          <Link
            key={action.to}
            to={action.to}
            className={cn(
              'group block rounded-stellar-xl border p-stellar-4 transition-stellar hover:shadow-card',
              isPrimary
                ? cn(accent.border, accent.bg, 'ring-1 ring-inset ring-black/5 dark:ring-white/5')
                : cn('border-stellar-border bg-stellar-surface hover:border-stellar-border-strong'),
            )}
          >
            <div className="flex items-start gap-stellar-3">
              <span
                className={cn(
                  'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                  isPrimary ? accent.dot : 'bg-stellar-text-subtle/40 group-hover:bg-stellar-text-muted',
                )}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="font-semibold text-stellar-text">{action.label}</p>
                <p className="mt-stellar-1 text-xs text-stellar-text-muted">{action.description}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default QuickActionsGrid;
