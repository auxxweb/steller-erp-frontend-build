import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import TransferNav from '../../components/transfers/TransferNav.jsx';
import TransferTable from '../../components/transfers/TransferTable.jsx';
import { TRANSFER_STATUS_OPTIONS } from '../../utils/transferConstants.js';
import useTransferBasePath from '../../hooks/useTransferBasePath.js';
import { fetchTransfers } from '../../services/transferService.js';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import useListFilters from '../../hooks/useListFilters.js';

function TransferListPage({ direction, title = 'All transfers' }) {
  const basePath = useTransferBasePath();
  const [transfers, setTransfers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
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

  const loadTransfers = useCallback(async () => {
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load transfers');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateParams, direction]);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadTransfers();
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold text-stellar-text">{title}</h1>
      </div>

      <TransferNav />

      <Card>
        <Card.Content>
          <form onSubmit={handleSearch} className="space-y-stellar-4">
            <ListFiltersBar
              idPrefix="transfer"
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Transfer number…"
              period={period}
              onPeriodChange={setPeriod}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              showSubmit={false}
            >
              <div className="form-group">
                <label htmlFor="transfer-status" className="form-label">
                  Status
                </label>
                <select
                  id="transfer-status"
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
            </ListFiltersBar>
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
        </Card.Content>
      </Card>

            <Card>
        <TransferTable transfers={transfers} loading={loading} basePath={basePath} />
        <PaginationBar
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}

export function TransferIncomingPage() {
  return <TransferListPage direction="incoming" title="Incoming transfers" />;
}

export function TransferOutgoingPage() {
  return <TransferListPage direction="outgoing" title="Outgoing transfers" />;
}

export default TransferListPage;
