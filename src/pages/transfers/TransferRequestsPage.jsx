import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import TransferNav from '../../components/transfers/TransferNav.jsx';
import TransferListView from '../../components/transfers/TransferListView.jsx';
import { TRANSFER_STATUS_OPTIONS } from '../../utils/transferConstants.js';
import useTransferBasePath, { useCanManageTransfers } from '../../hooks/useTransferBasePath.js';
import { fetchTransfers } from '../../services/transferService.js';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import useListFilters from '../../hooks/useListFilters.js';

function TransferRequestsPage() {
  const basePath = useTransferBasePath();
  const canManage = useCanManageTransfers();

  const [transfers, setTransfers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [direction, setDirection] = useState('');
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchTransfers({
        page,
        limit: 10,
        status: statusFilter || undefined,
        direction: direction || undefined,
        ...dateParams,
      });
      setTransfers(data.data.transfers);
      setPagination(data.data.pagination);
    } catch {
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }, [page, dateParams, statusFilter, direction]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div className="flex flex-col gap-stellar-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stellar-text">Transfer requests</h1>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            All inter-branch transfer requests with route and status.
          </p>
        </div>
        {canManage && (
          <Link to={`${basePath}/new`} className="btn btn-primary btn-md w-full sm:w-auto">
            New request
          </Link>
        )}
      </div>

      <TransferNav />

      <Card>
        <Card.Content>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              load();
            }}
            className="space-y-stellar-4"
          >
            <ListFiltersBar
              idPrefix="transfer-requests"
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search transfer number…"
              period={period}
              onPeriodChange={setPeriod}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              showSubmit={false}
            >
              <div className="form-group">
                <label htmlFor="tr-status" className="form-label">
                  Status
                </label>
                <select
                  id="tr-status"
                  className="input w-full"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All statuses</option>
                  {TRANSFER_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="tr-direction" className="form-label">
                  Direction
                </label>
                <select
                  id="tr-direction"
                  className="input w-full"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                >
                  <option value="">All directions</option>
                  <option value="incoming">Incoming</option>
                  <option value="outgoing">Outgoing</option>
                </select>
              </div>
            </ListFiltersBar>
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
        </Card.Content>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <TransferListView
          transfers={transfers}
          loading={loading}
          basePath={basePath}
          pagination={pagination}
          onPageChange={setPage}
          emptyMessage="No transfer requests yet."
        />
      </Card>
    </div>
  );
}

export default TransferRequestsPage;
