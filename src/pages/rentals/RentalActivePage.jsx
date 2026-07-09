import Card from '../../components/ui/Card.jsx';
import RentalNav from '../../components/rentals/RentalNav.jsx';
import RentalTable from '../../components/rentals/RentalTable.jsx';
import RentalListFilters from '../../components/rentals/RentalListFilters.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import useRentalBasePath from '../../hooks/useRentalBasePath.js';
import useRentalList from '../../hooks/useRentalList.js';
import { ACTIVE_RENTAL_STATUSES } from '../../utils/rentalConstants.js';

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
  });

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Active rentals</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Reserved, out on rent, and overdue bookings.
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
            allStatusLabel="All active"
          />
        </div>
        <RentalTable rentals={rentals} loading={loading} basePath={basePath} />
        <PaginationBar pagination={pagination} page={page} onPageChange={setPage} />
      </Card>
    </div>
  );
}

export default RentalActivePage;
