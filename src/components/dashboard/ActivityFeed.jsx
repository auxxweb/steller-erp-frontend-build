import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/format.js';

const TYPE_META = {
  rental: { label: 'Rental', className: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' },
  invoice: { label: 'Invoice', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  transfer: { label: 'Transfer', className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
};

function ActivityFeed({ items = [], resolveLink }) {
  if (!items.length) {
    return <p className="text-sm text-stellar-text-muted">No recent activity.</p>;
  }

  return (
    <ul className="divide-y divide-stellar-border">
      {items.map((item) => {
        const meta = TYPE_META[item.type] || TYPE_META.rental;
        const to = resolveLink?.(item);
        const inner = (
          <>
            <div className="flex flex-wrap items-center gap-stellar-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${meta.className}`}>
                {meta.label}
              </span>
              <span className="font-mono text-sm font-medium text-stellar-text">{item.title}</span>
            </div>
            <p className="mt-stellar-1 text-xs text-stellar-text-muted">{item.subtitle}</p>
            <p className="mt-stellar-1 text-[10px] text-stellar-text-subtle">{formatDate(item.at)}</p>
          </>
        );

        return (
          <li key={item.id} className="py-stellar-3 first:pt-0 last:pb-0">
            {to ? (
              <Link to={to} className="block rounded-stellar-lg p-stellar-2 -mx-stellar-2 hover:bg-stellar-surface-muted/50">
                {inner}
              </Link>
            ) : (
              <div className="p-stellar-2 -mx-stellar-2">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default ActivityFeed;
