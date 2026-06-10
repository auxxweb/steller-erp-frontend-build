import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import RentalNav from '../../components/rentals/RentalNav.jsx';
import RentalTable from '../../components/rentals/RentalTable.jsx';
import useRentalBasePath, { useCanWriteRentals } from '../../hooks/useRentalBasePath.js';
import { fetchRentalStats, fetchRentals } from '../../services/rentalService.js';
import { ACTIVE_RENTAL_STATUSES } from '../../utils/rentalConstants.js';
import useAuth from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';

function QuickLink({ to, title, description, accent }) {
  return (
    <Link
      to={to}
      className={`block rounded-stellar-xl border p-stellar-5 transition-stellar hover:border-stellar-accent ${
        accent ? 'border-stellar-accent/30 bg-stellar-accent/5' : 'border-stellar-border bg-stellar-surface'
      }`}
    >
      <h3 className="font-semibold text-stellar-text">{title}</h3>
      <p className="mt-stellar-1 text-sm text-stellar-text-muted">{description}</p>
    </Link>
  );
}

function RentalHubPage() {
  const basePath = useRentalBasePath();
  const canWrite = useCanWriteRentals();
  const { user } = useAuth();
  const isEmployee = user?.role === ROLES.EMPLOYEE;
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [statsRes, listRes] = await Promise.all([
          fetchRentalStats(),
          fetchRentals({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        ]);
        if (!cancelled) {
          setStats(statsRes.data.data.stats);
          setRecent(listRes.data.data.rentals);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCount = ACTIVE_RENTAL_STATUSES.reduce(
    (sum, s) => sum + (stats?.byStatus?.[s] || 0),
    0,
  );

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div className="flex flex-col gap-stellar-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">
            {isEmployee ? 'My jobs' : 'Rentals'}
          </h1>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            {isEmployee
              ? 'Jobs you created or marked pickup/return on.'
              : 'Bookings, calendar, pickup and return workflows.'}
          </p>
        </div>
        {canWrite && (
          <Link to={`${basePath}/new`} className="btn btn-primary btn-md w-full sm:w-auto">
            New booking
          </Link>
        )}
      </div>

      <RentalNav />

      <div className="grid grid-cols-2 gap-stellar-3 lg:grid-cols-4">
        <Card variant="muted" className="!p-stellar-4">
          <p className="text-xs font-medium uppercase text-stellar-text-subtle">Active</p>
          <p className="mt-stellar-1 text-2xl font-semibold tabular-nums">
            {loading ? '—' : activeCount}
          </p>
        </Card>
        <Card variant="muted" className="!p-stellar-4">
          <p className="text-xs font-medium uppercase text-stellar-text-subtle">Reserved</p>
          <p className="mt-stellar-1 text-2xl font-semibold tabular-nums">
            {stats?.byStatus?.reserved ?? '—'}
          </p>
        </Card>
        <Card variant="muted" className="!p-stellar-4">
          <p className="text-xs font-medium uppercase text-stellar-text-subtle">Overdue</p>
          <p className="mt-stellar-1 text-2xl font-semibold tabular-nums text-red-600">
            {stats?.byStatus?.overdue ?? '—'}
          </p>
        </Card>
        <Card variant="muted" className="!p-stellar-4">
          <p className="text-xs font-medium uppercase text-stellar-text-subtle">Total</p>
          <p className="mt-stellar-1 text-2xl font-semibold tabular-nums">{stats?.total ?? '—'}</p>
        </Card>
      </div>

      <div className="grid gap-stellar-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          to={`${basePath}/calendar`}
          title="Booking calendar"
          description="Month view of all reservations"
        />
        <QuickLink
          to={`${basePath}/active`}
          title="Active rentals"
          description="Out on rent right now"
        />
        <QuickLink
          to={`${basePath}/pickup`}
          title="Prebook pickup"
          description="Assign serials and hand over prebooked gear"
          accent
        />
        <QuickLink
          to={`${basePath}/return`}
          title="Return"
          description="Check in returned gear"
          accent
        />
        {canWrite && (
          <QuickLink
            to={`${basePath}/new`}
            title="Create booking"
            description="New reservation with availability check"
          />
        )}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-stellar-border p-stellar-4">
          <h2 className="text-sm font-semibold text-stellar-text">Recent bookings</h2>
        </div>
        <RentalTable rentals={recent} loading={loading} basePath={basePath} compact />
      </Card>
    </div>
  );
}

export default RentalHubPage;
