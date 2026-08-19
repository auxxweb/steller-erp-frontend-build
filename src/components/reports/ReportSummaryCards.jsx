import Card from '../ui/Card.jsx';
import { formatCurrency } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';
import { KPI_CARD_STYLES } from '../dashboard/charts/chartColors.js';

function Stat({ label, value, hint, index = 0 }) {
  const accent = KPI_CARD_STYLES[index % KPI_CARD_STYLES.length];
  return (
    <Card variant="muted" className={cn('!p-stellar-4 border-l-4', accent.border, accent.bg)}>
      <p className="text-xs font-medium uppercase text-stellar-text-subtle">{label}</p>
      <p className={cn('mt-stellar-1 text-xl font-semibold tabular-nums', accent.value)}>{value}</p>
      {hint && (
        <p className="mt-stellar-2 text-xs leading-snug text-stellar-text-muted">{hint}</p>
      )}
    </Card>
  );
}

export function RentalJobSummaryCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid gap-stellar-3 sm:grid-cols-2 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-stellar-xl bg-stellar-surface-muted" />
        ))}
      </div>
    );
  }

  const s = summary || {};
  const items = [
    {
      label: 'Total jobs',
      value: s.totalJobs ?? 0,
      hint: 'Rental bookings in the selected date range (or all dates if none is set).',
    },
    {
      label: 'Job value',
      value: formatCurrency(s.totalAmount),
      hint: 'Quoted/billed total of those jobs (paid + still unpaid).',
    },
    {
      label: 'Collected',
      value: formatCurrency(s.totalPaid),
      hint: 'Cash actually received on those jobs (payments + advances).',
    },
    {
      label: 'Outstanding',
      value: formatCurrency(s.totalBalance),
      hint: 'Amount still due on those jobs.',
    },
    {
      label: 'Deposits',
      value: formatCurrency(s.totalDeposit),
      hint: 'Advance/deposit collected. Already included in Collected.',
    },
  ];

  return (
    <div className="grid gap-stellar-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item, i) => (
        <Stat key={item.label} label={item.label} value={item.value} hint={item.hint} index={i} />
      ))}
    </div>
  );
}

export function SalesSummaryCards() {
  return null;
}
