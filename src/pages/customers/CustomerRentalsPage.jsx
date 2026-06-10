import { useCallback, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import CustomerDetailShell from '../../components/customers/CustomerDetailShell.jsx';
import RentalHistoryTable from '../../components/customers/RentalHistoryTable.jsx';
import { fetchCustomerRentals } from '../../services/customerService.js';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import useListFilters from '../../hooks/useListFilters.js';
import { RENTAL_STATUS_OPTIONS } from '../../utils/customerConstants.js';

function CustomerRentalsPage() {
  const { id } = useParams();
  const location = useLocation();
  const [rentals, setRentals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
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
  const [loading, setLoading] = useState(true);

  const loadRentals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchCustomerRentals(id, {
        page,
        limit: 10,
        status: statusFilter || undefined,
        ...dateParams,
      });
      setRentals(data.data.rentals);
      setPagination(data.data.pagination);
    } catch {
      setRentals([]);
    } finally {
      setLoading(false);
    }
  }, [id, page, statusFilter, dateParams]);

  useEffect(() => {
    loadRentals();
  }, [loadRentals]);

  return (
    <CustomerDetailShell customerId={id} toast={location.state?.message}>
      {() => (
        <Card className="!p-0 overflow-hidden">
          <div className="border-b border-stellar-border p-stellar-4 sm:p-stellar-5">
            <ListFiltersBar
              idPrefix="customer-rentals"
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Rental number…"
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
                <label htmlFor="rental-status-filter" className="form-label">
                  Status
                </label>
                <select
                  id="rental-status-filter"
                  className="input w-full"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All statuses</option>
                  {RENTAL_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </ListFiltersBar>
          </div>
          <RentalHistoryTable rentals={rentals} loading={loading} />
          <PaginationBar pagination={pagination} page={page} onPageChange={setPage} />
        </Card>
      )}
    </CustomerDetailShell>
  );
}

export default CustomerRentalsPage;
