import { Link } from 'react-router-dom';
import TransferNav from '../../components/transfers/TransferNav.jsx';
import TransferScanPanel from '../../components/transfers/TransferScanPanel.jsx';
import useTransferBasePath from '../../hooks/useTransferBasePath.js';
import { deliveryTransferScan } from '../../services/transferService.js';
import { TRANSFER_STATUS } from '../../utils/transferConstants.js';

function TransferDeliveryPage() {
  const basePath = useTransferBasePath();

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <Link to={basePath} className="text-sm text-stellar-text-muted">
          ← Transfers
        </Link>
        <h1 className="mt-stellar-2 text-2xl font-semibold text-stellar-text">Delivery scanning</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Scan units at the destination to complete the transfer and update inventory location.
        </p>
      </div>

      <TransferNav />

      <TransferScanPanel
        title="Receive units"
        description="Select an in-transit transfer and scan each dispatched unit."
        direction="incoming"
        eligibleStatuses={[TRANSFER_STATUS.IN_TRANSIT]}
        onScan={deliveryTransferScan}
        scanLabel="Confirm delivery"
      />
    </div>
  );
}

export default TransferDeliveryPage;
