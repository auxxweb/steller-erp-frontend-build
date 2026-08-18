import { useCallback, useEffect, useMemo, useState } from 'react';
import QrScanModal from '../qr/QrScanModal.jsx';
import Button from '../ui/Button.jsx';
import {
  getRentalItemId,
  itemHasAssignedUnit,
  unitIdFromProductUnit,
} from '../../utils/rentalItemHelpers.js';
import { formatUnitSerialLabel } from '../../utils/productConstants.js';
import { verifyQr } from '../../services/qrService.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function serialForItem(item) {
  if (itemHasAssignedUnit(item)) {
    return formatUnitSerialLabel(item.productUnit) || unitIdFromProductUnit(item.productUnit);
  }
  return null;
}

function RentalReturnChecklist({
  items = [],
  onVerificationChange,
  startAt = null,
  endAt = null,
  excludeRentalId = null,
}) {
  const [scannedIds, setScannedIds] = useState(() => new Set());
  const [scanTargetId, setScanTargetId] = useState(null);
  const [lastScan, setLastScan] = useState(null);

  const rows = useMemo(
    () =>
      items.map((item) => {
        const unitId = unitIdFromProductUnit(item.productUnit);
        return {
          item,
          itemId: getRentalItemId(item),
          unitId,
          serialLabel: serialForItem(item),
          productName: item.product?.name || 'Product',
          quantity: item.quantity || 1,
        };
      }),
    [items],
  );

  const itemKey = rows.map((r) => r.itemId).join(',');

  useEffect(() => {
    setScannedIds(new Set());
    setLastScan(null);
    setScanTargetId(null);
  }, [itemKey]);

  const scanTarget = rows.find((row) => row.itemId === scanTargetId) || null;

  const scannedCount = rows.filter(
    (row) => row.unitId && scannedIds.has(String(row.unitId)),
  ).length;
  const scannableCount = rows.filter((row) => row.unitId).length;
  const allScanned = scannableCount > 0 && scannedCount === scannableCount;

  useEffect(() => {
    onVerificationChange?.({
      allScanned,
      scannedCount,
      total: rows.length,
      scannableCount,
    });
  }, [allScanned, scannedCount, rows.length, scannableCount, onVerificationChange]);

  const handleScan = useCallback(
    async (value) => {
      try {
        const { data } = await verifyQr(value.trim(), { startAt, endAt, excludeRentalId });
        const unit = data.data?.unit;
        if (!unit?.id) {
          toast.error('Invalid QR code');
          return;
        }
        const match = rows.find((row) => row.unitId && String(row.unitId) === String(unit.id));
        if (!match) {
          toast.error('This serial is not on this rental');
          return;
        }
        if (scanTarget && match.itemId !== scanTarget.itemId) {
          toast.error(`Scan the QR for ${scanTarget.productName}`);
          return;
        }
        setScannedIds((prev) => {
          const next = new Set(prev);
          next.add(String(unit.id));
          return next;
        });
        setLastScan(formatUnitSerialLabel(unit) || match.serialLabel);
        setScanTargetId(null);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Scan failed'));
      }
    },
    [endAt, excludeRentalId, rows, scanTarget, startAt],
  );

  if (!rows.length) {
    return <p className="text-sm text-stellar-text-muted">No items on this rental.</p>;
  }

  return (
    <div className="space-y-stellar-3">
      <p className="text-xs font-medium uppercase tracking-wide text-stellar-text-muted">
        Out on rent
      </p>

      {lastScan && (
        <p className="text-sm text-emerald-600">Last scanned: {lastScan}</p>
      )}

      {scanTarget && (
        <QrScanModal
          open
          title={`Scan — ${scanTarget.productName}`}
          hint={
            scanTarget.serialLabel
              ? `Scan the QR for serial ${scanTarget.serialLabel}. Optional — you can still return without scanning.`
              : 'Align the unit QR. Scanning is optional.'
          }
          onClose={() => setScanTargetId(null)}
          onScan={handleScan}
        />
      )}

      <ul className="divide-y divide-stellar-border rounded-stellar-lg border border-stellar-border">
        {rows.map((row) => {
          const scanned = row.unitId && scannedIds.has(String(row.unitId));
          return (
            <li key={row.itemId} className="flex flex-col gap-stellar-3 p-stellar-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stellar-text">{row.productName}</p>
                <p className="mt-stellar-1 font-mono text-sm text-stellar-text">
                  {row.serialLabel || 'No serial assigned'}
                </p>
                {row.quantity > 1 && !row.serialLabel && (
                  <p className="text-xs text-stellar-text-muted">Qty {row.quantity}</p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-stellar-2">
                <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400">
                  Already rented
                </span>
                {scanned ? (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Scanned
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setScanTargetId(row.itemId)}
                  >
                    Scan
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-stellar-text-muted">
        {scannableCount
          ? `${scannedCount} / ${scannableCount} serials scanned. You can return without scanning — a manual verification note will be required.`
          : 'Return these items. A manual verification note will be required.'}
      </p>
    </div>
  );
}

export default RentalReturnChecklist;
