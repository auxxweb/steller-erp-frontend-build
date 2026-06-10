import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import QrScanner from '../qr/QrScanner.jsx';
import { fetchTransfers } from '../../services/transferService.js';

function TransferScanPanel({
  title,
  description,
  eligibleStatuses = [],
  direction,
  onScan,
  scanLabel = 'Scan unit',
  initialTransferId,
}) {
  const routerLocation = useLocation();
  const presetId = initialTransferId || routerLocation.state?.transferId;

  const [transfers, setTransfers] = useState([]);
  const [transferId, setTransferId] = useState(presetId || '');
  const [manualValue, setManualValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
      const [paused, setPaused] = useState(false);
  const [storageLocation, setStorageLocation] = useState({ aisle: '', shelf: '', bin: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = { limit: 50, direction };
        const { data } = await fetchTransfers(params);
        let list = data.data.transfers;
        if (eligibleStatuses.length) {
          list = list.filter((t) => eligibleStatuses.includes(t.status));
        }
        if (!cancelled) {
          setTransfers(list);
          if (presetId && list.some((t) => t.id === presetId)) {
            setTransferId(presetId);
          } else if (!transferId && list[0]) {
            setTransferId(list[0].id);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [direction, eligibleStatuses]);

  const runScan = useCallback(
    async (scannedValue) => {
      if (!transferId || !scannedValue?.trim()) return;
      setScanning(true);
      try {
        const payload = {
          scannedValue: scannedValue.trim(),
          location:
            storageLocation.aisle || storageLocation.shelf || storageLocation.bin
              ? storageLocation
              : undefined,
        };
        const { data } = await onScan(transferId, payload);
        toast.success(data.message);
        const refreshed = await fetchTransfers({ limit: 50, direction });
        let list = refreshed.data.data.transfers;
        if (eligibleStatuses.length) {
          list = list.filter((t) => eligibleStatuses.includes(t.status));
        }
        setTransfers(list);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Scan failed');
      } finally {
        setScanning(false);
        setTimeout(() => setPaused(false), 2000);
      }
    },
    [transferId, onScan, storageLocation],
  );

  const handleQrScan = (value) => {
    setPaused(true);
    runScan(value);
  };

  return (
    <div className="space-y-stellar-6">
      <Card>
        <Card.Header>
          <Card.Title>{title}</Card.Title>
          <Card.Description>{description}</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-stellar-4">
          <div className="form-group">
            <label className="form-label">Active transfer</label>
            <select
              className="input"
              value={transferId}
              onChange={(e) => setTransferId(e.target.value)}
              disabled={loading}
            >
              {transfers.length === 0 && <option value="">No eligible transfers</option>}
              {transfers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.transferNumber} — {t.fromBranch?.name} → {t.toBranch?.name} (
                  {t.progress?.dispatched ?? 0}/{t.progress?.total} dispatched)
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-stellar-3 sm:grid-cols-3">
            <input
              className="input"
              placeholder="Aisle"
              value={storageLocation.aisle}
              onChange={(e) => setStorageLocation((l) => ({ ...l, aisle: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Shelf"
              value={storageLocation.shelf}
              onChange={(e) => setStorageLocation((l) => ({ ...l, shelf: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Bin"
              value={storageLocation.bin}
              onChange={(e) => setStorageLocation((l) => ({ ...l, bin: e.target.value }))}
            />
          </div>
        </Card.Content>
      </Card>

      

      <Card>
        <Card.Content className="space-y-stellar-4">
          <QrScanner onScan={handleQrScan} paused={paused} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runScan(manualValue);
            }}
            className="flex flex-col gap-stellar-3 sm:flex-row"
          >
            <input
              className="input flex-1"
              placeholder="Serial or QR payload"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
            />
            <Button type="submit" disabled={scanning || !transferId}>
              {scanning ? 'Processing…' : scanLabel}
            </Button>
          </form>
                  </Card.Content>
      </Card>
    </div>
  );
}

export default TransferScanPanel;
