import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import TransferNav from '../../components/transfers/TransferNav.jsx';
import TransferStatusBadge from '../../components/transfers/TransferStatusBadge.jsx';
import TransferTimeline from '../../components/transfers/TransferTimeline.jsx';
import TransferBranchRoute from '../../components/transfers/TransferBranchRoute.jsx';
import TransferProgressBar from '../../components/transfers/TransferProgressBar.jsx';
import TransferManifestList from '../../components/transfers/TransferManifestList.jsx';
import TransferDetailScan from '../../components/transfers/TransferDetailScan.jsx';
import { TRANSFER_STATUS } from '../../utils/transferConstants.js';
import useTransferBasePath, {
  useCanApproveTransfers,
  useCanManageTransfers,
} from '../../hooks/useTransferBasePath.js';
import { useTransferBranchRole } from '../../hooks/useTransferBranchRole.js';
import {
  fetchTransfer,
  approveTransfer,
  cancelTransfer,
  dispatchTransferScan,
  deliveryTransferScan,
} from '../../services/transferService.js';

function TransferDetailPage() {
  const { id } = useParams();
  const basePath = useTransferBasePath();
  const location = useLocation();
  const canManage = useCanManageTransfers();
  const canApprove = useCanApproveTransfers();

  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { role, isSource, isDestination, isSuperAdmin } = useTransferBranchRole(transfer);

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state?.message]);

  const loadTransfer = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const { data } = await fetchTransfer(id);
      setTransfer(data.data.transfer);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Transfer not found'));
      setTransfer(null);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTransfer();
  }, [loadTransfer]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const { data } = await approveTransfer(id);
      setTransfer(data.data.transfer);
      toast.success('Transfer approved');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Approve failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('Cancellation reason (optional):');
    if (reason === null) return;
    setActionLoading(true);
    try {
      const { data } = await cancelTransfer(id, { reason: reason || undefined });
      setTransfer(data.data.transfer);
      toast.success('Transfer cancelled');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Cancel failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleScanSuccess = (data) => {
    if (data?.transfer) setTransfer(data.transfer);
    else loadTransfer();
  };

  const showDispatchScan =
    (isSource || isSuperAdmin) &&
    [TRANSFER_STATUS.APPROVED, TRANSFER_STATUS.IN_TRANSIT].includes(transfer?.status);
  const showDeliveryScan =
    (isDestination || isSuperAdmin) && transfer?.status === TRANSFER_STATUS.IN_TRANSIT;

  const canApproveNow =
    (isSuperAdmin || isDestination) && canApprove && transfer?.status === TRANSFER_STATUS.PENDING;
  const canCancelNow =
    canManage &&
    transfer &&
    [TRANSFER_STATUS.PENDING, TRANSFER_STATUS.APPROVED].includes(transfer.status) &&
    (isSuperAdmin || isSource || isDestination);

  if (loading) {
    return <p className="text-sm text-stellar-text-muted">Loading transfer…</p>;
  }

  if (loadFailed || (!loading && !transfer)) {
    return (
      <div className="space-y-stellar-4">
        <Link to={`${basePath}/requests`} className="text-sm text-stellar-accent">
          ← Transfer requests
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6 pb-28 lg:pb-stellar-6">
      <div>
        <Link to={`${basePath}/tracking`} className="text-sm text-stellar-text-muted">
          ← Tracking
        </Link>
        <div className="mt-stellar-2 flex flex-wrap items-center gap-stellar-3">
          <h1 className="text-2xl font-semibold text-stellar-text">{transfer.transferNumber}</h1>
          <TransferStatusBadge status={transfer.status} />
        </div>
      </div>

      <TransferNav />

      <Card>
        <Card.Content className="space-y-stellar-5">
          <TransferBranchRoute transfer={transfer} branchRole={role} />
          <TransferProgressBar transfer={transfer} />
          <div className="md:hidden">
            <p className="mb-stellar-2 text-xs font-semibold uppercase text-stellar-text-subtle">
              Timeline
            </p>
            <TransferTimeline transfer={transfer} variant="horizontal" />
            {transfer.trackingNotes && (
              <p className="mt-stellar-4 text-sm text-stellar-text-muted whitespace-pre-wrap">
                {transfer.trackingNotes}
              </p>
            )}
          </div>
        </Card.Content>
      </Card>

      <div className="grid gap-stellar-6 lg:grid-cols-2">
        <Card className="hidden md:block">
          <Card.Header>
            <Card.Title>Timeline</Card.Title>
          </Card.Header>
          <Card.Content>
            <TransferTimeline transfer={transfer} variant="vertical" />
            {transfer.trackingNotes && (
              <p className="mt-stellar-4 border-t border-stellar-border pt-stellar-4 text-sm text-stellar-text-muted whitespace-pre-wrap">
                {transfer.trackingNotes}
              </p>
            )}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Unit manifest</Card.Title>
            <Card.Description>
              {transfer.progress?.delivered}/{transfer.progress?.total} units delivered
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <TransferManifestList items={transfer.items} />
          </Card.Content>
        </Card>
      </div>

      {showDispatchScan && (
        <TransferDetailScan
          transfer={transfer}
          onScan={dispatchTransferScan}
          scanLabel="Dispatch unit"
          onSuccess={handleScanSuccess}
        />
      )}

      {showDeliveryScan && (
        <TransferDetailScan
          transfer={transfer}
          onScan={deliveryTransferScan}
          scanLabel="Confirm delivery"
          showLocation
          onSuccess={handleScanSuccess}
        />
      )}

      {(transfer.requestedBy || transfer.approvedBy) && (
        <Card variant="muted">
          <Card.Content className="grid gap-stellar-3 text-sm sm:grid-cols-2">
            {transfer.requestedBy && (
              <p>
                <span className="text-stellar-text-muted">Requested by </span>
                {transfer.requestedBy.name}
              </p>
            )}
            {transfer.approvedBy && (
              <p>
                <span className="text-stellar-text-muted">Approved by </span>
                {transfer.approvedBy.name}
              </p>
            )}
          </Card.Content>
        </Card>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 flex flex-wrap gap-stellar-2 border-t border-stellar-border bg-stellar-surface/95 p-stellar-4 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0">
        {canApproveNow && (
          <Button onClick={handleApprove} disabled={actionLoading} className="flex-1 sm:flex-none">
            Approve
          </Button>
        )}
        {canCancelNow && (
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={actionLoading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
        )}
        {showDispatchScan && (
          <Link
            to={`${basePath}/dispatch`}
            state={{ transferId: transfer.id }}
            className="btn btn-secondary btn-md flex-1 sm:flex-none"
          >
            Full dispatch
          </Link>
        )}
        {showDeliveryScan && (
          <Link
            to={`${basePath}/delivery`}
            state={{ transferId: transfer.id }}
            className="btn btn-secondary btn-md flex-1 sm:flex-none"
          >
            Full delivery
          </Link>
        )}
      </div>
    </div>
  );
}

export default TransferDetailPage;
