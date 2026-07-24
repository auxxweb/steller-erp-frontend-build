import { memo } from 'react';
import { Link } from 'react-router-dom';
import RentalStatusBadge from './RentalStatusBadge.jsx';
import { formatDate } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';
import {
  RENTAL_LIFECYCLE_META,
  resolveRentalLifecycleType,
} from '../../utils/rentalConstants.js';

function formatMoney(val) {
  if (val == null) return '—';
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

function RentalLifecycleBadge({ rental }) {
  const type = resolveRentalLifecycleType(rental);
  const meta = RENTAL_LIFECYCLE_META[type] || RENTAL_LIFECYCLE_META.booked;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}

function TypeStatusCell({ rental }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <RentalLifecycleBadge rental={rental} />
      <RentalStatusBadge status={rental.status} />
    </div>
  );
}

function RentalTable({ rentals, loading, basePath, compact = false }) {
  if (loading) {
    return (
      <div className="p-stellar-8 text-center text-sm text-stellar-text-muted">
        Loading bookings…
      </div>
    );
  }

  if (!rentals?.length) {
    return (
      <div className="p-stellar-8 text-center">
        <p className="text-sm font-medium text-stellar-text">No bookings found</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking</th>
              <th>Customer</th>
              <th>Schedule</th>
              {!compact && <th>Total</th>}
              <th>Type</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr key={rental.id}>
                <td>
                  <Link
                    to={`${basePath}/${rental.id}`}
                    className="font-medium text-stellar-text hover:underline"
                  >
                    {rental.rentalNumber}
                  </Link>
                </td>
                <td className="text-sm">
                  {rental.customer?.name || '—'}
                  <p className="text-xs text-stellar-text-muted">{rental.customer?.phone}</p>
                </td>
                <td className="text-sm text-stellar-text-muted">
                  {formatDate(rental.scheduledStartAt)} – {formatDate(rental.scheduledEndAt)}
                </td>
                {!compact && (
                  <td className="tabular-nums text-sm">{formatMoney(rental.amounts?.total)}</td>
                )}
                <td>
                  <RentalLifecycleBadge rental={rental} />
                </td>
                <td>
                  <RentalStatusBadge status={rental.status} />
                </td>
                <td>
                  <div className="flex justify-end gap-stellar-2">
                    <Link to={`${basePath}/${rental.id}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-stellar-border md:hidden">
        {rentals.map((rental) => (
          <li key={rental.id} className="p-stellar-4">
            <div className="flex items-start justify-between gap-stellar-2">
              <div className="min-w-0">
                <Link to={`${basePath}/${rental.id}`} className="font-medium text-stellar-text">
                  {rental.rentalNumber}
                </Link>
                <p className="mt-stellar-1 text-sm text-stellar-text-muted">
                  {rental.customer?.name}
                </p>
                <p className="mt-stellar-1 text-xs text-stellar-text-muted">
                  {formatDate(rental.scheduledStartAt)} – {formatDate(rental.scheduledEndAt)}
                </p>
              </div>
              <TypeStatusCell rental={rental} />
            </div>
            {!compact && (
              <p className="mt-stellar-2 text-sm tabular-nums">{formatMoney(rental.amounts?.total)}</p>
            )}
            <Link
              to={`${basePath}/${rental.id}`}
              className="btn btn-ghost btn-sm mt-stellar-3 w-full"
            >
              Open booking
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default memo(RentalTable);
