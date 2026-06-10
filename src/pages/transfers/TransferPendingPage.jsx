import { useCallback, useEffect, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import TransferNav from '../../components/transfers/TransferNav.jsx';
import TransferListView from '../../components/transfers/TransferListView.jsx';
import TransferMobileCard from '../../components/transfers/TransferMobileCard.jsx';
import { TRANSFER_STATUS } from '../../utils/transferConstants.js';
import useTransferBasePath from '../../hooks/useTransferBasePath.js';
import { fetchTransfers } from '../../services/transferService.js';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import useListFilters from '../../hooks/useListFilters.js';

const TABS = [
  { id: 'all', label: 'All pending' },
  { id: 'incoming', label: 'Awaiting your approval' },
  { id: 'outgoing', label: 'Your requests' },
];

function TransferPendingPage() {
  const basePath = useTransferBasePath();
  const [tab, setTab] = useState('all');
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const params = {
        limit: 50,
        status: TRANSFER_STATUS.PENDING,
        direction: tab === 'all' ? undefined : tab,
        ...dateParams,
      };
      const { data } = await fetchTransfers(params);
      setTransfers(data.data.transfers);
    } catch {
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }, [tab, dateParams]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold text-stellar-text">Pending transfers</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Requests waiting for destination branch approval.
        </p>
      </div>

      <TransferNav />

      <Card>
        <Card.Content>
          <ListFiltersBar
            idPrefix="transfer-pending"
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
          />
        </Card.Content>
      </Card>

      <div className="flex gap-stellar-2 overflow-x-auto pb-stellar-1 scrollbar-stellar">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-stellar ${
              tab === t.id
                ? 'bg-stellar-accent text-stellar-accent-fg'
                : 'bg-stellar-surface-muted text-stellar-text-muted hover:text-stellar-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-stellar-text-muted">Loading…</p>
      ) : transfers.length === 0 ? (
        <Card>
          <Card.Content className="py-stellar-10 text-center text-sm text-stellar-text-muted">
            No pending transfers in this view.
          </Card.Content>
        </Card>
      ) : (
        <div className="space-y-stellar-3">
          {transfers.map((t) => (
            <TransferMobileCard
              key={t.id}
              transfer={t}
              basePath={basePath}
              showProgress={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TransferPendingPage;
