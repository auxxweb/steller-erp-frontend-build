import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import TransferNav from '../../components/transfers/TransferNav.jsx';
import TransferMobileCard from '../../components/transfers/TransferMobileCard.jsx';
import useTransferBasePath, { useCanManageTransfers } from '../../hooks/useTransferBasePath.js';
import { fetchTransferStats, fetchTransfers } from '../../services/transferService.js';
import { TRANSFER_STATUS } from '../../utils/transferConstants.js';

function QuickLink({ to, title, description, accent, badge }) {
  return (
    <Link
      to={to}
      className={`relative block rounded-stellar-xl border p-stellar-5 transition-stellar hover:border-stellar-accent ${
        accent ? 'border-stellar-accent/30 bg-stellar-accent/5' : 'border-stellar-border bg-stellar-surface'
      }`}
    >
      {badge != null && badge > 0 && (
        <span className="absolute right-stellar-4 top-stellar-4 flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
          {badge}
        </span>
      )}
      <h3 className="font-semibold text-stellar-text">{title}</h3>
      <p className="mt-stellar-1 text-sm text-stellar-text-muted">{description}</p>
    </Link>
  );
}

function TransferHubPage() {
  const basePath = useTransferBasePath();
  const canManage = useCanManageTransfers();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [statsRes, listRes] = await Promise.all([
          fetchTransferStats(),
          fetchTransfers({ limit: 5 }),
        ]);
        if (!cancelled) {
          setStats(statsRes.data.data.stats);
          setRecent(listRes.data.data.transfers);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const inFlight =
    (stats?.byStatus?.[TRANSFER_STATUS.APPROVED] || 0) +
    (stats?.byStatus?.[TRANSFER_STATUS.IN_TRANSIT] || 0);
  const pendingCount = stats?.byStatus?.[TRANSFER_STATUS.PENDING] || 0;

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div className="flex flex-col gap-stellar-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Transfers</h1>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            Manage inter-branch moves, approvals, and QR scanning.
          </p>
        </div>
        {canManage && (
          <Link to={`${basePath}/new`} className="btn btn-primary btn-md w-full sm:w-auto">
            New request
          </Link>
        )}
      </div>

      <TransferNav />

      <div className="grid grid-cols-2 gap-stellar-3 lg:grid-cols-4">
        <Link to={`${basePath}/pending`} className="block">
          <Card variant="muted" className="!p-stellar-4 transition-stellar hover:border-stellar-accent">
            <p className="text-xs font-medium uppercase text-stellar-text-subtle">Pending</p>
            <p className="mt-stellar-1 text-2xl font-semibold tabular-nums text-amber-600">
              {stats?.byStatus?.pending ?? '—'}
            </p>
          </Card>
        </Link>
        <Link to={`${basePath}/tracking`} className="block">
          <Card variant="muted" className="!p-stellar-4 transition-stellar hover:border-stellar-accent">
            <p className="text-xs font-medium uppercase text-stellar-text-subtle">In flight</p>
            <p className="mt-stellar-1 text-2xl font-semibold tabular-nums">{loading ? '—' : inFlight}</p>
          </Card>
        </Link>
        <Card variant="muted" className="!p-stellar-4">
          <p className="text-xs font-medium uppercase text-stellar-text-subtle">Delivered</p>
          <p className="mt-stellar-1 text-2xl font-semibold tabular-nums text-emerald-600">
            {stats?.byStatus?.delivered ?? '—'}
          </p>
        </Card>
        <Card variant="muted" className="!p-stellar-4">
          <p className="text-xs font-medium uppercase text-stellar-text-subtle">Total</p>
          <p className="mt-stellar-1 text-2xl font-semibold tabular-nums">{stats?.total ?? '—'}</p>
        </Card>
      </div>

      <div className="grid gap-stellar-4 sm:grid-cols-2">
        <QuickLink
          to={`${basePath}/requests`}
          title="Transfer requests"
          description="Browse and filter all requests"
        />
        <QuickLink
          to={`${basePath}/pending`}
          title="Pending transfers"
          description="Awaiting approval at destination"
          badge={pendingCount}
          accent
        />
        <QuickLink
          to={`${basePath}/tracking`}
          title="Transfer tracking"
          description="Live progress for shipments in motion"
          accent
        />
        <QuickLink
          to={`${basePath}/dispatch`}
          title="Dispatch scanning"
          description="QR scan units out at source"
        />
        <QuickLink
          to={`${basePath}/delivery`}
          title="Delivery scanning"
          description="Receive units at destination"
        />
      </div>

      <div>
        <div className="mb-stellar-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stellar-text">Recent</h2>
          <Link to={`${basePath}/requests`} className="text-xs font-medium text-stellar-accent">
            View all
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-stellar-text-muted">Loading…</p>
        ) : (
          <div className="space-y-stellar-3">
            {recent.map((t) => (
              <TransferMobileCard key={t.id} transfer={t} basePath={basePath} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransferHubPage;
