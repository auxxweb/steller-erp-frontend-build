import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import QrScanModal from '../qr/QrScanModal.jsx';
import Button from '../ui/Button.jsx';
import { verifyQr } from '../../services/qrService.js';
import { fetchProductUnits } from '../../services/productService.js';
import { UNIT_STATUS_LABELS } from '../../utils/productConstants.js';
import {
  buildPickupChecklistSlots,
  getRentalItemId,
} from '../../utils/rentalItemHelpers.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function assignmentsToRows(assignments, slots) {
  return Object.entries(assignments)
    .filter(([, unitId]) => Boolean(unitId))
    .map(([slotKey, productUnitId]) => {
      const slot = slots.find((s) => s.slotKey === slotKey);
      return {
        rentalItemId: slot?.rentalItemId || slotKey.split('--')[0],
        productUnitId,
      };
    });
}

function RentalQrChecklist({ items = [], onScannedChange, onAssignmentsChange }) {
  const [scanOpen, setScanOpen] = useState(false);
  const [scannedIds, setScannedIds] = useState(() => new Set());
  const [assignments, setAssignments] = useState({});
  const [unitsByProduct, setUnitsByProduct] = useState({});
  const [lastScan, setLastScan] = useState(null);
  const [scanTargetSlotKey, setScanTargetSlotKey] = useState(null);

  const onScannedChangeRef = useRef(onScannedChange);
  const onAssignmentsChangeRef = useRef(onAssignmentsChange);
  onScannedChangeRef.current = onScannedChange;
  onAssignmentsChangeRef.current = onAssignmentsChange;

  const slots = useMemo(() => buildPickupChecklistSlots(items), [items]);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const pendingSlots = useMemo(() => slots.filter((s) => s.kind === 'pending'), [slots]);
  const preassignedSlots = useMemo(() => slots.filter((s) => s.kind === 'preassigned'), [slots]);

  const slotsPerItemQty = useMemo(() => {
    const counts = new Map();
    pendingSlots.forEach((slot) => {
      counts.set(slot.rentalItemId, (counts.get(slot.rentalItemId) || 0) + 1);
    });
    return counts;
  }, [pendingSlots]);

  const itemIdsKey = useMemo(
    () => items.map((i) => getRentalItemId(i)).filter(Boolean).join(','),
    [items],
  );

  const pendingProductIdsKey = useMemo(
    () =>
      [
        ...new Set(
          pendingSlots
            .map((s) => s.item.product?.id || s.item.product?._id || s.item.product)
            .filter(Boolean)
            .map((id) => id.toString()),
        ),
      ].join(','),
    [pendingSlots],
  );

  useEffect(() => {
    if (!pendingProductIdsKey) return undefined;
    let cancelled = false;
    const productIds = pendingProductIdsKey.split(',').filter(Boolean);

    productIds.forEach((productId) => {
      fetchProductUnits(productId, { limit: 100 })
        .then(({ data }) => {
          if (cancelled) return;
          setUnitsByProduct((prev) => {
            if (prev[productId]) return prev;
            return { ...prev, [productId]: data.data.units || [] };
          });
        })
        .catch(() => {
          if (cancelled) return;
          setUnitsByProduct((prev) => {
            if (prev[productId]) return prev;
            return { ...prev, [productId]: [] };
          });
        });
    });

    return () => {
      cancelled = true;
    };
  }, [pendingProductIdsKey]);

  useEffect(() => {
    setAssignments({});
    setScannedIds(new Set());
    setScanOpen(false);
    setScanTargetSlotKey(null);
  }, [itemIdsKey]);

  useEffect(() => {
    onAssignmentsChangeRef.current?.(
      assignmentsToRows(assignments, slotsRef.current),
    );
  }, [assignments]);

  const markScanned = useCallback((unitId) => {
    if (!unitId) return;
    setScannedIds((prev) => {
      const next = new Set(prev);
      next.add(unitId.toString());
      return next;
    });
  }, []);

  const setSlotAssignment = useCallback((slotKey, unitId) => {
    setAssignments((prev) => {
      const next = { ...prev };
      if (unitId) next[slotKey] = unitId;
      else delete next[slotKey];
      return next;
    });
    if (unitId) markScanned(unitId);
  }, [markScanned]);

  const openScan = useCallback((slotKey = null) => {
    setScanTargetSlotKey(slotKey);
    setScanOpen(true);
  }, []);

  const closeScan = useCallback(() => {
    setScanOpen(false);
    setScanTargetSlotKey(null);
  }, []);

  const finishScan = useCallback(
    (serialNumber) => {
      if (serialNumber) setLastScan(serialNumber);
      closeScan();
    },
    [closeScan],
  );

  const applyUnitToSlot = useCallback(
    (slot, unit) => {
      setSlotAssignment(slot.slotKey, unit.id);
      finishScan(unit.serialNumber);
    },
    [finishScan, setSlotAssignment],
  );

  const handleScan = useCallback(
    async (value, targetSlot = null) => {
      try {
        const { data } = await verifyQr(value.trim());
        const unit = data.data?.unit;
        if (!unit?.id) {
          toast.error('Invalid QR code');
          return;
        }

        if (targetSlot) {
          const productId = targetSlot.item.product?.id || targetSlot.item.product;
          const unitProductId = unit.product?.id || unit.product;
          if (productId?.toString() !== unitProductId?.toString()) {
            toast.error('This QR does not match this line item');
            return;
          }
          applyUnitToSlot(targetSlot, unit);
          return;
        }

        const matchPreassigned = preassignedSlots.find(
          (s) => s.unitId === unit.id.toString(),
        );
        if (matchPreassigned) {
          markScanned(unit.id);
          finishScan(unit.serialNumber);
          return;
        }

        const matchPending = pendingSlots.find((slot) => {
          const productId = slot.item.product?.id || slot.item.product;
          const unitProductId = unit.product?.id || unit.product;
          const productMatch = productId?.toString() === unitProductId?.toString();
          if (!productMatch) return false;
          const assignedElsewhere = Object.entries(assignments).some(
            ([key, id]) => key !== slot.slotKey && id?.toString() === unit.id.toString(),
          );
          return !assignedElsewhere && !assignments[slot.slotKey];
        });

        if (matchPending) {
          applyUnitToSlot(matchPending, unit);
          return;
        }

        toast.error('This unit is not on this booking');
      } catch (err) {
        const msg = getApiErrorMessage(err, 'Scan failed');
        if (/unauthorized|session expired|sign in/i.test(msg)) {
          toast.error('Session expired — please sign in again and retry pickup.');
        } else {
          toast.error(msg);
        }
      }
    },
    [applyUnitToSlot, assignments, finishScan, markScanned, pendingSlots, preassignedSlots],
  );

  const allPendingAssigned =
    pendingSlots.length === 0 ||
    pendingSlots.every((slot) => Boolean(assignments[slot.slotKey]));

  const allPreassignedScanned =
    preassignedSlots.length === 0 ||
    preassignedSlots.every((slot) => scannedIds.has(slot.unitId));

  const allReady = allPendingAssigned && allPreassignedScanned;

  useEffect(() => {
    onScannedChangeRef.current?.(scannedIds, allReady);
  }, [scannedIds, allReady]);

  const scanTargetSlot =
    pendingSlots.find((s) => s.slotKey === scanTargetSlotKey) ||
    preassignedSlots.find((s) => s.slotKey === scanTargetSlotKey) ||
    null;

  const scanModalTitle = scanTargetSlot?.item?.product?.name
    ? `Scan — ${scanTargetSlot.item.product.name}`
    : 'Scan unit QR';

  const assignedCount = Object.keys(assignments).filter((k) => assignments[k]).length;

  return (
    <div className="space-y-stellar-4">
      {(pendingSlots.length > 0 || preassignedSlots.length > 0) && (
        <Button type="button" variant="secondary" size="sm" onClick={() => openScan(null)}>
          Scan QR
        </Button>
      )}

      {lastScan && (
        <p className="text-sm text-emerald-600">Last scanned: {lastScan}</p>
      )}

      {scanOpen && (
        <QrScanModal
          open
          title={scanModalTitle}
          hint="Align the unit QR code in the frame."
          onClose={closeScan}
          onScan={(value) => handleScan(value, scanTargetSlot)}
        />
      )}

      {pendingSlots.length > 0 && (
        <div className="space-y-stellar-2">
          <p className="text-xs font-medium uppercase tracking-wide text-stellar-text-muted">
            Assign serials at pickup
          </p>
          <ul className="divide-y divide-stellar-border rounded-stellar-lg border border-stellar-border">
            {pendingSlots.map((slot) => {
              const { item } = slot;
              const productId = item.product?.id || item.product?._id || item.product;
              const productIdStr = productId?.toString?.() || '';
              const units = (unitsByProduct[productIdStr] || []).filter((u) => {
                const unitProductId = u.product?.id || u.product?._id || u.product;
                return !unitProductId || unitProductId.toString() === productIdStr;
              });
              const selected = assignments[slot.slotKey] || '';
              const lineQty = slotsPerItemQty.get(slot.rentalItemId) || 1;
              const qtyLabel =
                lineQty > 1 ? ` (${slot.slotIndex + 1} of ${lineQty})` : '';

              return (
                <li key={slot.slotKey} className="space-y-stellar-2 p-stellar-3">
                  <div>
                    <p className="text-sm font-medium text-stellar-text">
                      {item.product?.name || 'Product'}
                      {qtyLabel}
                    </p>
                    <p className="text-xs text-stellar-text-muted">Serial not assigned yet</p>
                  </div>
                  <select
                    className="input font-mono text-sm"
                    value={selected}
                    onChange={(e) => setSlotAssignment(slot.slotKey, e.target.value)}
                  >
                    <option value="">Select serial</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id} disabled={u.status !== 'available'}>
                        {u.serialNumber} — {UNIT_STATUS_LABELS[u.status] || u.status}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openScan(slot.slotKey)}
                  >
                    Scan QR for this item
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {preassignedSlots.length > 0 && (
        <ul className="divide-y divide-stellar-border rounded-stellar-lg border border-stellar-border">
          {preassignedSlots.map((slot) => {
            const done = scannedIds.has(slot.unitId);
            return (
              <li
                key={slot.slotKey}
                className="flex items-center justify-between gap-stellar-3 p-stellar-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stellar-text">
                    {slot.item.product?.name || 'Product'}
                  </p>
                  <p className="text-xs text-stellar-text-muted">
                    {slot.serialLabel || slot.unitId}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    done
                      ? 'bg-emerald-500/15 text-emerald-700'
                      : 'bg-amber-500/15 text-amber-700'
                  }`}
                >
                  {done ? 'Scanned' : 'Pending scan'}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {slots.length === 0 && (
        <p className="text-sm text-stellar-text-muted">No line items on this booking.</p>
      )}

      {slots.length > 0 && (
        <p className="text-xs text-stellar-text-muted">
          {pendingSlots.length > 0 &&
            `${assignedCount} / ${pendingSlots.length} serials selected`}
          {preassignedSlots.length > 0 &&
            ` · ${scannedIds.size} / ${preassignedSlots.length} pre-assigned scanned`}
          {allReady && ' — ready to confirm'}
        </p>
      )}
    </div>
  );
}

export default RentalQrChecklist;
