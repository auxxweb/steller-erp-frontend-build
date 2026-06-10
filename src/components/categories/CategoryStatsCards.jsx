import Card from '../ui/Card.jsx';
import { CATEGORY_STATUS_LABELS } from '../../utils/categoryConstants.js';

function StatCard({ label, value }) {
  return (
    <Card variant="muted" className="!p-stellar-5">
      <p className="text-xs font-medium uppercase tracking-wider text-stellar-text-subtle">
        {label}
      </p>
      <p className="mt-stellar-1 text-2xl font-semibold tabular-nums text-stellar-text">
        {value}
      </p>
    </Card>
  );
}

function CategoryStatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid gap-stellar-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-stellar-xl bg-stellar-surface-muted"
          />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-stellar-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Total categories" value={stats.total ?? 0} />
      {Object.entries(CATEGORY_STATUS_LABELS).map(([key, label]) => (
        <StatCard key={key} label={label} value={stats.byStatus?.[key] ?? 0} />
      ))}
    </div>
  );
}

export default CategoryStatsCards;
