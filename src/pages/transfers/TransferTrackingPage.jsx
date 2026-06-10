import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import TransferNav from '../../components/transfers/TransferNav.jsx';
import TransferMobileCard from '../../components/transfers/TransferMobileCard.jsx';
import TransferTimeline from '../../components/transfers/TransferTimeline.jsx';
import TransferBranchRoute from '../../components/transfers/TransferBranchRoute.jsx';
import TransferProgressBar from '../../components/transfers/TransferProgressBar.jsx';
import TransferStatusBadge from '../../components/transfers/TransferStatusBadge.jsx';
import { TRANSFER_STATUS } from '../../utils/transferConstants.js';
import useTransferBasePath from '../../hooks/useTransferBasePath.js';
import { useTransferBranchRole } from '../../hooks/useTransferBranchRole.js';
import { fetchTransfers } from '../../services/transferService.js';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import useListFilters from '../../hooks/useListFilters.js';

const TRACKING_STATUSES = [TRANSFER_STATUS.APPROVED, TRANSFER_STATUS.IN_TRANSIT];

function TransferTrackingPage() {
  const basePath = useTransferBasePath();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
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
      const { data } = await fetchTransfers({ limit: 50, ...dateParams });
      const active = data.data.transfers.filter((t) => TRACKING_STATUSES.includes(t.status));
      setTransfers(active);
      if (active[0] && !expandedId) setExpandedId(active[0].id);
    } catch {
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }, [dateParams, expandedId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const expanded = transfers.find((t) => t.id === expandedId);

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold text-stellar-text">Transfer tracking</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Live progress for approved and in-transit shipments. Tap a transfer to expand.
        </p>
      </div>

      <TransferNav />

      <Card>
        <Card.Content>
          <ListFiltersBar
            idPrefix="transfer-tracking"
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

      {loading && (
        <div className="space-y-stellar-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-stellar-xl bg-stellar-surface-muted" />
          ))}
        </div>
      )}

      {!loading && transfers.length === 0 && (
        <Card>
          <Card.Content className="py-stellar-10 text-center">
            <p className="text-sm font-medium text-stellar-text">Nothing in transit</p>
            <p className="mt-stellar-1 text-sm text-stellar-text-muted">
              Approved transfers appear here until fully delivered.
            </p>
            <Link to={`${basePath}/requests`} className="btn btn-secondary btn-sm mt-stellar-4">
              View all requests
            </Link>
          </Card.Content>
        </Card>
      )}

      {!loading && transfers.length > 0 && (
        <div className="space-y-stellar-4 lg:grid lg:grid-cols-2 lg:gap-stellar-6 lg:space-y-0">
          <div className="space-y-stellar-3">
            {transfers.map((t) => (
              <TrackingListItem
                key={t.id}
                transfer={t}
                active={expandedId === t.id}
                onSelect={() => setExpandedId(t.id)}
              />
            ))}
          </div>

          {expanded && (
            <Card className="lg:sticky lg:top-stellar-4 lg:self-start">
              <Card.Header>
                <div className="flex flex-wrap items-center justify-between gap-stellar-2">
                  <Card.Title>{expanded.transferNumber}</Card.Title>
                  <TransferStatusBadge status={expanded.status} />
                </div>
              </Card.Header>
              <Card.Content className="space-y-stellar-5">
                <TrackingDetailPanel transfer={expanded} basePath={basePath} />
              </Card.Content>
            </Card>
          )}
        </div>
      )}

      {!loading && transfers.length > 0 && expanded && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stellar-border bg-stellar-surface/95 p-stellar-4 backdrop-blur lg:hidden">
          <Link to={`${basePath}/${expanded.id}`} className="btn btn-primary btn-md w-full">
            Open full details
          </Link>
        </div>
      )}
    </div>
  );
}

function TrackingListItem({ transfer, active, onSelect }) {
  const { role } = useTransferBranchRole(transfer);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-stellar-xl border p-stellar-4 text-left transition-stellar ${
        active
          ? 'border-stellar-accent bg-stellar-accent/5 ring-1 ring-stellar-accent/20'
          : 'border-stellar-border bg-stellar-surface hover:border-stellar-accent/50'
      }`}
    >
      <div className="flex items-center justify-between gap-stellar-2">
        <span className="font-semibold text-stellar-text">{transfer.transferNumber}</span>
        <TransferStatusBadge status={transfer.status} />
      </div>
      <div className="mt-stellar-3">
        <TransferBranchRoute transfer={transfer} branchRole={role} compact />
      </div>
      <div className="mt-stellar-3">
        <TransferProgressBar transfer={transfer} />
      </div>
    </button>
  );
}

function TrackingDetailPanel({ transfer, basePath }) {
  const { role, isSource, isDestination, isSuperAdmin } = useTransferBranchRole(transfer);

  return (
    <>
      <TransferBranchRoute transfer={transfer} branchRole={role} />
      <TransferProgressBar transfer={transfer} />
      <div>
        <p className="mb-stellar-3 text-xs font-semibold uppercase text-stellar-text-subtle">
          Timeline
        </p>
        <TransferTimeline transfer={transfer} variant="horizontal" />
      </div>
      <div className="flex flex-col gap-stellar-2 sm:flex-row">
        {(isSource || isSuperAdmin) && transfer.status === TRANSFER_STATUS.APPROVED && (
          <Link to={`${basePath}/dispatch`} className="btn btn-primary btn-md flex-1">
            Dispatch scan
          </Link>
        )}
        {(isDestination || isSuperAdmin) && transfer.status === TRANSFER_STATUS.IN_TRANSIT && (
          <Link to={`${basePath}/delivery`} className="btn btn-primary btn-md flex-1">
            Delivery scan
          </Link>
        )}
        <Link to={`${basePath}/${transfer.id}`} className="btn btn-secondary btn-md flex-1">
          Full details
        </Link>
      </div>
    </>
  );
}

export default TransferTrackingPage;
