import Card from '../ui/Card.jsx';
import { formatCurrency } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';
import { KPI_CARD_STYLES } from '../dashboard/charts/chartColors.js';

function Stat({ label, value, index = 0 }) {
  const accent = KPI_CARD_STYLES[index % KPI_CARD_STYLES.length];
  return (
    <Card variant="muted" className={cn('!p-stellar-4 border-l-4', accent.border, accent.bg)}>
      <p className="text-xs font-medium uppercase text-stellar-text-subtle">{label}</p>
      <p className={cn('mt-stellar-1 text-xl font-semibold tabular-nums', accent.value)}>{value}</p>
    </Card>
  );
}

export function RentalJobSummaryCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid gap-stellar-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-stellar-xl bg-stellar-surface-muted" />
        ))}
      </div>
    );
  }

  const s = summary || {};
  const items = [
    { label: 'Total jobs', value: s.totalJobs ?? 0 },
    { label: 'Job value', value: formatCurrency(s.totalAmount) },
    { label: 'Collected', value: formatCurrency(s.totalPaid) },
    { label: 'Outstanding', value: formatCurrency(s.totalBalance) },
    { label: 'Deposits', value: formatCurrency(s.totalDeposit) },
  ];

  return (
    <div className="grid gap-stellar-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item, i) => (
        <Stat key={item.label} label={item.label} value={item.value} index={i} />
      ))}
    </div>
  );
}

export function SalesSummaryCards() {
  return null;
}
