function StatCard({ label, value }) {
  return (
    <div className="rounded-stellar-lg border border-stellar-border bg-stellar-surface p-stellar-4">
      <p className="text-xs text-stellar-text-muted">{label}</p>
      <p className="mt-stellar-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function ComboStatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid gap-stellar-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-stellar-lg bg-stellar-surface-muted" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-stellar-4 sm:grid-cols-3">
      <StatCard label="Total combos" value={stats.total ?? 0} />
      <StatCard label="Active" value={stats.byStatus?.active ?? 0} />
      <StatCard label="Inactive" value={stats.byStatus?.inactive ?? 0} />
    </div>
  );
}

export default ComboStatsCards;
