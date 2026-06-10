import Card from '../ui/Card.jsx';
import { BRANCH_STATUS_LABELS } from '../../utils/branchConstants.js';

function StatCard({ label, value, sublabel }) {
  return (
    <Card variant="muted" className="!p-stellar-5">
      <p className="text-xs font-medium uppercase tracking-wider text-stellar-text-subtle">
        {label}
      </p>
      <p className="mt-stellar-1 text-2xl font-semibold tabular-nums text-stellar-text">
        {value}
      </p>
      {sublabel && (
        <p className="mt-stellar-1 text-xs text-stellar-text-muted">{sublabel}</p>
      )}
    </Card>
  );
}

function BranchStatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid gap-stellar-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-stellar-xl bg-stellar-surface-muted"
          />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const { total, byStatus } = stats;

  return (
    <div className="grid gap-stellar-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total branches" value={total ?? 0} />
      {Object.entries(BRANCH_STATUS_LABELS).map(([key, label]) => (
        <StatCard
          key={key}
          label={label}
          value={byStatus?.[key] ?? 0}
        />
      ))}
    </div>
  );
}

export default BranchStatsCards;
