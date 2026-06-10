import { formatDate } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

const STATUS_STYLES = {
  active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  overdue: 'bg-red-500/15 text-red-700 dark:text-red-400',
  reserved: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  returned: 'bg-stellar-surface-muted text-stellar-text-muted',
  closed: 'bg-stellar-surface-muted text-stellar-text-muted',
  cancelled: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  draft: 'bg-stellar-surface-muted text-stellar-text-muted',
};

function RentalStatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        STATUS_STYLES[status] || STATUS_STYLES.draft,
      )}
    >
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

function formatMoney(val) {
  if (val == null) return '—';
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

function RentalHistoryTable({ rentals, loading }) {
  if (loading) {
    return (
      <div className="p-stellar-8 text-center text-sm text-stellar-text-muted">
        Loading rental history…
      </div>
    );
  }

  if (!rentals?.length) {
    return (
      <div className="p-stellar-8 text-center">
        <p className="text-sm font-medium text-stellar-text">No rentals yet</p>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Rental history will appear here once bookings are created.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th>Rental #</th>
              <th>Status</th>
              <th>Scheduled</th>
              <th>Actual</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr key={rental._id}>
                <td className="font-medium">{rental.rentalNumber || '—'}</td>
                <td>
                  <RentalStatusBadge status={rental.status} />
                </td>
                <td className="text-sm text-stellar-text-muted">
                  {formatDate(rental.scheduledStartAt)} – {formatDate(rental.scheduledEndAt)}
                </td>
                <td className="text-sm text-stellar-text-muted">
                  {rental.actualStartAt
                    ? `${formatDate(rental.actualStartAt)} – ${formatDate(rental.actualEndAt)}`
                    : '—'}
                </td>
                <td className="tabular-nums text-sm">
                  {formatMoney(rental.amounts?.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-stellar-border md:hidden">
        {rentals.map((rental) => (
          <li key={rental._id} className="p-stellar-4">
            <div className="flex items-start justify-between gap-stellar-2">
              <p className="font-medium text-stellar-text">{rental.rentalNumber || 'Rental'}</p>
              <RentalStatusBadge status={rental.status} />
            </div>
            <p className="mt-stellar-1 text-xs text-stellar-text-muted">
              {formatDate(rental.scheduledStartAt)} – {formatDate(rental.scheduledEndAt)}
            </p>
            <p className="mt-stellar-1 text-sm tabular-nums text-stellar-text">
              {formatMoney(rental.amounts?.total)}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default RentalHistoryTable;
