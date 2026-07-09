import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import RentalNav from '../../components/rentals/RentalNav.jsx';
import RentalTable from '../../components/rentals/RentalTable.jsx';
import RentalListFilters from '../../components/rentals/RentalListFilters.jsx';
import useRentalBasePath, { useCanWriteRentals } from '../../hooks/useRentalBasePath.js';
import useRentalList from '../../hooks/useRentalList.js';
import { fetchRentalStats } from '../../services/rentalService.js';
import { ACTIVE_RENTAL_STATUSES } from '../../utils/rentalConstants.js';

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
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const {
    rentals,
    pagination,
    page,
    setPage,
    loading,
    search,
    setSearch,
    submitSearch,
    period,
    setPeriod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    statusFilter,
    setStatusFilter,
    resetPage,
  } = useRentalList({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 15,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      try {
        const { data } = await fetchRentalStats();
        if (!cancelled) setStats(data.data.stats);
      } finally {
        if (!cancelled) setStatsLoading(false);
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
          <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Rentals</h1>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            Bookings, calendar, pickup and return workflows for your branch.
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
            {statsLoading ? '—' : activeCount}
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
        <div className="border-b border-stellar-border p-stellar-4 space-y-stellar-4">
          <h2 className="text-sm font-semibold text-stellar-text">All bookings</h2>
          <RentalListFilters
            idPrefix="rental-hub"
            search={search}
            onSearchChange={setSearch}
            onSearchSubmit={() => {
              submitSearch();
              resetPage();
            }}
            period={period}
            onPeriodChange={(v) => {
              setPeriod(v);
              resetPage();
            }}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            statusFilter={statusFilter}
            onStatusChange={(v) => {
              setStatusFilter(v);
              resetPage();
            }}
            allStatusLabel="All statuses"
          />
        </div>
        <RentalTable rentals={rentals} loading={loading} basePath={basePath} />
        <PaginationBar pagination={pagination} page={page} onPageChange={setPage} />
      </Card>
    </div>
  );
}

export default RentalHubPage;
