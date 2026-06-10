import { Link } from 'react-router-dom';
import TransferNav from '../../components/transfers/TransferNav.jsx';
import TransferScanPanel from '../../components/transfers/TransferScanPanel.jsx';
import useTransferBasePath from '../../hooks/useTransferBasePath.js';
import { dispatchTransferScan } from '../../services/transferService.js';
import { TRANSFER_STATUS } from '../../utils/transferConstants.js';

function TransferDispatchPage() {
  const basePath = useTransferBasePath();

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <Link to={basePath} className="text-sm text-stellar-text-muted">
          ← Transfers
        </Link>
        <h1 className="mt-stellar-2 text-2xl font-semibold text-stellar-text">Dispatch scanning</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Scan each unit at the source branch to mark it in transit.
        </p>
      </div>

      <TransferNav />

      <TransferScanPanel
        title="Dispatch units"
        description="Select an approved transfer, then scan each unit QR or serial."
        direction="outgoing"
        eligibleStatuses={[TRANSFER_STATUS.APPROVED, TRANSFER_STATUS.IN_TRANSIT]}
        onScan={dispatchTransferScan}
        scanLabel="Dispatch unit"
      />
    </div>
  );
}

export default TransferDispatchPage;
