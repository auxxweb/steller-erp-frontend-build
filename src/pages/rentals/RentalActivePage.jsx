import Card from '../../components/ui/Card.jsx';
import RentalNav from '../../components/rentals/RentalNav.jsx';
import RentalTable from '../../components/rentals/RentalTable.jsx';
import RentalListFilters from '../../components/rentals/RentalListFilters.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import useRentalBasePath from '../../hooks/useRentalBasePath.js';
import useRentalList from '../../hooks/useRentalList.js';
import {
  ACTIVE_RENTAL_STATUSES,
  RENTAL_STATUS_OPTIONS,
} from '../../utils/rentalConstants.js';

const ACTIVE_STATUS_OPTIONS = RENTAL_STATUS_OPTIONS.filter((opt) =>
  ACTIVE_RENTAL_STATUSES.includes(opt.value),
);

function RentalActivePage() {
  const basePath = useRentalBasePath();

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
    defaultStatuses: ACTIVE_RENTAL_STATUSES,
    sortBy: 'scheduledEndAt',
    sortOrder: 'asc',
    limit: 15,
    dateField: 'scheduledEndAt',
    requireStarted: true,
  });

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Active rentals</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Gear currently out on rent. Prebook bookings awaiting handover are under Prebook pickup.
        </p>
      </div>

      <RentalNav />

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-stellar-border p-stellar-4">
          <RentalListFilters
            idPrefix="rental-active"
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
            statusOptions={ACTIVE_STATUS_OPTIONS}
            allStatusLabel="All out on rent"
          />
        </div>
        <RentalTable rentals={rentals} loading={loading} basePath={basePath} />
        <PaginationBar pagination={pagination} page={page} onPageChange={setPage} />
      </Card>
    </div>
  );
}

export default RentalActivePage;
