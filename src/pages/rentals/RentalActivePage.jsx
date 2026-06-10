import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import RentalNav from '../../components/rentals/RentalNav.jsx';
import RentalTable from '../../components/rentals/RentalTable.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import useRentalBasePath from '../../hooks/useRentalBasePath.js';
import { fetchRentals } from '../../services/rentalService.js';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import useListFilters from '../../hooks/useListFilters.js';
import { ACTIVE_RENTAL_STATUSES } from '../../utils/rentalConstants.js';

function RentalActivePage() {
  const basePath = useRentalBasePath();
  const [rentals, setRentals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const {
    search,
    setSearch,
    period,
    setPeriod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    dateParams,
  } = useListFilters();
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        sortBy: 'scheduledEndAt',
        sortOrder: 'asc',
      };
      if (statusFilter) {
        params.status = statusFilter;
      } else {
        params.status = ACTIVE_RENTAL_STATUSES.join(',');
      }
      Object.assign(params, dateParams);
      const { data } = await fetchRentals(params);
      setRentals(data.data.rentals);
      setPagination(data.data.pagination);
    } catch {
      setRentals([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateParams]);

  useEffect(() => {
    load();
  }, [load]);

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
          <ListFiltersBar
            idPrefix="rental-active"
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Rental number or notes…"
            period={period}
            onPeriodChange={(v) => {
              setPeriod(v);
              setPage(1);
            }}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            showSubmit={false}
          >
            <div className="form-group">
              <label htmlFor="active-status" className="form-label">
                Status
              </label>
              <select
                id="active-status"
                className="input w-full"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All active</option>
                {ACTIVE_RENTAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </ListFiltersBar>
        </div>
        <RentalTable rentals={rentals} loading={loading} basePath={basePath} />
        <PaginationBar pagination={pagination} page={page} onPageChange={setPage} />
      </Card>
    </div>
  );
}

export default RentalActivePage;
