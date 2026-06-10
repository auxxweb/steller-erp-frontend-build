import Card from '../ui/Card.jsx';

function StatCard({ label, value, sub }) {
  return (
    <Card variant="muted" className="!p-stellar-4 sm:!p-stellar-5">
      <p className="text-xs font-medium uppercase tracking-wider text-stellar-text-subtle">
        {label}
      </p>
      <p className="mt-stellar-1 text-xl font-semibold tabular-nums text-stellar-text sm:text-2xl">
        {value}
      </p>
      {sub && <p className="mt-stellar-1 text-xs text-stellar-text-muted">{sub}</p>}
    </Card>
  );
}

function ProductStatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-stellar-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-stellar-xl bg-stellar-surface-muted" />
        ))}
      </div>
    );
  }

  if (!stats?.products) return null;

  const { products, units } = stats;
  const available = products.availableUnits ?? 0;

  return (
    <div className="grid grid-cols-2 gap-stellar-3 lg:grid-cols-4">
      <StatCard label="Products" value={products.total ?? 0} />
      <StatCard label="Total units" value={products.totalUnits ?? 0} />
      <StatCard label="Available units" value={available} sub="Ready to rent" />
      <StatCard
        label="Rented"
        value={units?.byStatus?.rented ?? 0}
        sub="Across inventory"
      />
    </div>
  );
}

export default ProductStatsCards;
