import Card from '../ui/Card.jsx';
import { CUSTOMER_STATUS } from '../../utils/customerConstants.js';

function StatCard({ label, value, sub, accent }) {
  return (
    <Card variant="muted" className="!p-stellar-4 sm:!p-stellar-5">
      <p className="text-xs font-medium uppercase tracking-wider text-stellar-text-subtle">
        {label}
      </p>
      <p
        className={`mt-stellar-1 text-xl font-semibold tabular-nums sm:text-2xl ${
          accent ? accent : 'text-stellar-text'
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-stellar-1 text-xs text-stellar-text-muted">{sub}</p>}
    </Card>
  );
}

function CustomerStatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-stellar-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-stellar-xl bg-stellar-surface-muted" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const blocked = stats.byStatus?.[CUSTOMER_STATUS.BLOCKED] ?? 0;
  const active = stats.byStatus?.[CUSTOMER_STATUS.ACTIVE] ?? 0;
  const highRisk = stats.byRiskLevel?.high ?? 0;
  const business = stats.byType?.business ?? 0;

  return (
    <div className="grid grid-cols-2 gap-stellar-3 lg:grid-cols-4">
      <StatCard label="Total customers" value={stats.total ?? 0} />
      <StatCard label="Active" value={active} sub="Ready to rent" />
      <StatCard
        label="Blocked"
        value={blocked}
        accent={blocked > 0 ? 'text-red-600' : undefined}
      />
      <StatCard
        label="High risk"
        value={highRisk}
        sub={`${business} business`}
        accent={highRisk > 0 ? 'text-amber-600' : undefined}
      />
    </div>
  );
}

export default CustomerStatsCards;
