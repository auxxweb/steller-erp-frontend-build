import { Link } from 'react-router-dom';
import TransferStatusBadge from './TransferStatusBadge.jsx';
import TransferBranchRoute from './TransferBranchRoute.jsx';
import { useTransferBranchRole } from '../../hooks/useTransferBranchRole.js';

function RouteCell({ transfer }) {
  const { role } = useTransferBranchRole(transfer);
  return <TransferBranchRoute transfer={transfer} branchRole={role} compact />;
}

function TransferTable({ transfers, loading, basePath, compact }) {
  if (loading) {
    return (
      <div className="p-stellar-8 text-center text-sm text-stellar-text-muted">Loading…</div>
    );
  }

  if (!transfers?.length) {
    return (
      <div className="p-stellar-8 text-center text-sm text-stellar-text-muted">
        No transfers found.
      </div>
    );
  }

  return (
    <>
      <div className={`hidden overflow-x-auto ${compact ? '' : 'md:block'}`}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Transfer</th>
              <th>Route</th>
              <th>Units</th>
              <th>Status</th>
              {!compact && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link to={`${basePath}/${t.id}`} className="font-medium hover:underline">
                    {t.transferNumber}
                  </Link>
                  <p className="text-xs text-stellar-text-muted">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="min-w-[140px]">
                  <RouteCell transfer={t} />
                </td>
                <td className="text-sm tabular-nums">
                  {t.progress?.delivered ?? 0}/{t.progress?.total ?? t.items?.length ?? 0}
                </td>
                <td>
                  <TransferStatusBadge status={t.status} />
                </td>
                {!compact && (
                  <td className="text-right">
                    <Link to={`${basePath}/${t.id}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className={`divide-y divide-stellar-border ${compact ? '' : 'md:hidden'}`}>
        {transfers.map((t) => (
          <li key={t.id} className="p-stellar-4">
            <div className="flex justify-between gap-stellar-2">
              <Link to={`${basePath}/${t.id}`} className="font-medium">
                {t.transferNumber}
              </Link>
              <TransferStatusBadge status={t.status} />
            </div>
            <p className="mt-stellar-1 text-xs text-stellar-text-muted">
              {t.fromBranch?.name} → {t.toBranch?.name}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default TransferTable;
