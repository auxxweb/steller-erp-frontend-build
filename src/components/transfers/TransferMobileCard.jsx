import { Link } from 'react-router-dom';
import TransferStatusBadge from './TransferStatusBadge.jsx';
import TransferBranchRoute from './TransferBranchRoute.jsx';
import TransferProgressBar from './TransferProgressBar.jsx';
import { useTransferBranchRole } from '../../hooks/useTransferBranchRole.js';

function TransferMobileCard({ transfer, basePath, showProgress = true }) {
  const { role } = useTransferBranchRole(transfer);

  return (
    <Link
      to={`${basePath}/${transfer.id}`}
      className="block rounded-stellar-xl border border-stellar-border bg-stellar-surface p-stellar-4 transition-stellar active:scale-[0.99] hover:border-stellar-accent"
    >
      <div className="flex items-start justify-between gap-stellar-2">
        <div className="min-w-0">
          <p className="font-semibold text-stellar-text">{transfer.transferNumber}</p>
          <p className="mt-stellar-1 text-xs text-stellar-text-muted">
            {new Date(transfer.createdAt).toLocaleString()}
          </p>
        </div>
        <TransferStatusBadge status={transfer.status} />
      </div>

      <div className="mt-stellar-4">
        <TransferBranchRoute transfer={transfer} branchRole={role} compact />
      </div>

      {showProgress && (
        <div className="mt-stellar-4">
          <TransferProgressBar transfer={transfer} />
        </div>
      )}

      <p className="mt-stellar-3 text-xs font-medium text-stellar-accent">View details →</p>
    </Link>
  );
}

export default TransferMobileCard;
