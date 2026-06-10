import Card from '../ui/Card.jsx';
import UnitStatusBadge from './UnitStatusBadge.jsx';
import { UNIT_STATUS_LABELS, PRODUCT_UNIT_STATUS } from '../../utils/productConstants.js';

function AvailabilityStat({ label, value, highlight }) {
  return (
    <div
      className={`rounded-stellar-lg border p-stellar-4 ${
        highlight
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-stellar-border bg-stellar-surface-muted/50'
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-stellar-text-subtle">
        {label}
      </p>
      <p className="mt-stellar-1 text-2xl font-semibold tabular-nums text-stellar-text">
        {value}
      </p>
    </div>
  );
}

function ProductAvailabilityPanel({ availability, loading }) {
  if (loading) {
    return (
      <div className="grid gap-stellar-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-stellar-lg bg-stellar-surface-muted" />
        ))}
      </div>
    );
  }

  if (!availability) return null;

  const { available, rented, reserved, inMaintenance, isAvailable, byStatus, totalUnits } =
    availability;

  return (
    <div className="space-y-stellar-6">
      <div className="grid grid-cols-2 gap-stellar-3 sm:grid-cols-2 lg:grid-cols-4">
        <AvailabilityStat label="Available" value={available ?? 0} highlight={isAvailable} />
        <AvailabilityStat label="Rented" value={rented ?? 0} />
        <AvailabilityStat label="Reserved" value={reserved ?? 0} />
        <AvailabilityStat label="Maintenance" value={inMaintenance ?? 0} />
      </div>

      <Card variant="muted" className="!p-stellar-5">
        <p className="text-sm font-medium text-stellar-text">
          {isAvailable ? 'Ready to rent' : 'Not available for new rentals'}
        </p>
        <p className="mt-stellar-1 text-xs text-stellar-text-muted">
          {available ?? 0} of {totalUnits ?? 0} units available
        </p>
        {byStatus && (
          <ul className="mt-stellar-4 grid gap-stellar-2 sm:grid-cols-2">
            {Object.entries(UNIT_STATUS_LABELS).map(([key, label]) => (
              <li
                key={key}
                className="flex items-center justify-between gap-stellar-2 text-sm"
              >
                <UnitStatusBadge status={key} />
                <span className="tabular-nums text-stellar-text-muted">
                  {byStatus[key] ?? 0}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default ProductAvailabilityPanel;
