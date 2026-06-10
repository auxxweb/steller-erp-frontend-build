import Card from '../ui/Card.jsx';
import { formatCurrency } from '../../utils/format.js';

function Stat({ label, value, accent }) {
  return (
    <Card variant="muted" className="!p-stellar-4">
      <p className="text-xs font-medium uppercase text-stellar-text-subtle">{label}</p>
      <p
        className={`mt-stellar-1 text-xl font-semibold tabular-nums ${
          accent ? 'text-stellar-accent' : ''
        }`}
      >
        {value}
      </p>
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
  return (
    <div className="grid gap-stellar-3 sm:grid-cols-2 lg:grid-cols-5">
      <Stat label="Total jobs" value={s.totalJobs ?? 0} />
      <Stat label="Job value" value={formatCurrency(s.totalAmount)} accent />
      <Stat label="Collected" value={formatCurrency(s.totalPaid)} />
      <Stat label="Outstanding" value={formatCurrency(s.totalBalance)} />
      <Stat label="Deposits" value={formatCurrency(s.totalDeposit)} />
    </div>
  );
}

export function SalesSummaryCards({ summary, loading }) {
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
  return (
    <div className="grid gap-stellar-3 sm:grid-cols-2 lg:grid-cols-5">
      <Stat label="Invoices" value={s.totalInvoices ?? 0} />
      <Stat label="Gross sales" value={formatCurrency(s.totalSales)} accent />
      <Stat label="Tax" value={formatCurrency(s.tax)} />
      <Stat label="Received" value={formatCurrency((s.amountPaid ?? 0) + (s.advanceAmount ?? 0))} />
      <Stat label="Balance due" value={formatCurrency(s.balanceDue)} />
    </div>
  );
}
