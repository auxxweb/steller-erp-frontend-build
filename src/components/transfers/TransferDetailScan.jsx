import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useCallback, useState } from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import QrScanner from '../qr/QrScanner.jsx';
import { TRANSFER_STATUS } from '../../utils/transferConstants.js';

function TransferDetailScan({ transfer, onScan, scanLabel, showLocation = false, onSuccess }) {
  const [manualValue, setManualValue] = useState('');
  const [scanning, setScanning] = useState(false);
  const [paused, setPaused] = useState(false);
      const [location, setLocation] = useState({ aisle: '', shelf: '', bin: '' });

  const runScan = useCallback(
    async (scannedValue) => {
      if (!scannedValue?.trim()) return;
      setScanning(true);
      try {
        const payload = {
          scannedValue: scannedValue.trim(),
          location:
            showLocation && (location.aisle || location.shelf || location.bin)
              ? location
              : undefined,
        };
        const { data } = await onScan(transfer.id, payload);
        toast.success(data.message);
        onSuccess?.(data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Scan failed');
      } finally {
        setScanning(false);
        setTimeout(() => setPaused(false), 2000);
      }
    },
    [transfer.id, onScan, location, showLocation, onSuccess],
  );

  if (
    transfer.status === TRANSFER_STATUS.DELIVERED ||
    transfer.status === TRANSFER_STATUS.CANCELLED ||
    transfer.status === TRANSFER_STATUS.PENDING
  ) {
    return null;
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>QR scanning</Card.Title>
        <Card.Description>Scan units for this transfer ({transfer.transferNumber})</Card.Description>
      </Card.Header>
      <Card.Content className="space-y-stellar-4">
        {showLocation && (
          <div className="grid gap-stellar-2 grid-cols-3">
            <input
              className="input"
              placeholder="Aisle"
              value={location.aisle}
              onChange={(e) => setLocation((l) => ({ ...l, aisle: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Shelf"
              value={location.shelf}
              onChange={(e) => setLocation((l) => ({ ...l, shelf: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Bin"
              value={location.bin}
              onChange={(e) => setLocation((l) => ({ ...l, bin: e.target.value }))}
            />
          </div>
        )}

        

        <div className="overflow-hidden rounded-stellar-lg">
          <QrScanner
            onScan={(v) => {
              setPaused(true);
              runScan(v);
            }}
            paused={paused}
          />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runScan(manualValue);
          }}
          className="flex flex-col gap-stellar-2 sm:flex-row"
        >
          <input
            className="input flex-1"
            placeholder="Serial or QR code"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
          />
          <Button type="submit" disabled={scanning}>
            {scanning ? '…' : scanLabel}
          </Button>
        </form>

              </Card.Content>
    </Card>
  );
}

export default TransferDetailScan;
