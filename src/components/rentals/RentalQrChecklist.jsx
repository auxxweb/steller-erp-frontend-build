import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import QrScanModal from '../qr/QrScanModal.jsx';
import Button from '../ui/Button.jsx';
import RentalUnitSelector from './RentalUnitSelector.jsx';
import { verifyQr } from '../../services/qrService.js';
import { fetchProductUnits } from '../../services/productService.js';
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

  const disabledUnitIds = useMemo(() => {
    const ids = new Set();
    Object.values(assignments).forEach((id) => {
      if (id) ids.add(id.toString());
    });
    return ids;
  }, [assignments]);

  return (
    <div className="space-y-stellar-4">
      {(pendingSlots.length > 0 || preassignedSlots.length > 0) && (
        <Button type="button" variant="secondary" size="sm" onClick={() => openScan(null)}>
          Scan next unit
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
        <div className="space-y-stellar-4">
          <p className="text-xs font-medium uppercase tracking-wide text-stellar-text-muted">
            Assign serials at pickup
          </p>
          <ul className="space-y-stellar-4">
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
              const slotDisabledIds = new Set(disabledUnitIds);
              if (selected) slotDisabledIds.delete(selected.toString());

              return (
                <li
                  key={slot.slotKey}
                  className="rounded-stellar-xl border border-stellar-border bg-stellar-surface p-stellar-4"
                >
                  <div className="mb-stellar-3 flex items-start justify-between gap-stellar-2">
                    <div>
                      <p className="text-sm font-semibold text-stellar-text">
                        {item.product?.name || 'Product'}
                        {qtyLabel}
                      </p>
                      {item.combo?.name ? (
                        <p className="text-[10px] uppercase tracking-wide text-stellar-text-muted">
                          Combo · {item.combo.name}
                        </p>
                      ) : null}
                      <p className="text-xs text-stellar-text-muted">
                        {selected ? 'Serial selected' : 'Select serial or scan QR'}
                      </p>
                    </div>
                    {selected && (
                      <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Ready
                      </span>
                    )}
                  </div>
                  <RentalUnitSelector
                    units={units}
                    selectedId={selected}
                    disabledUnitIds={slotDisabledIds}
                    onSelect={(unitId) => setSlotAssignment(slot.slotKey, unitId || null)}
                    onScan={() => openScan(slot.slotKey)}
                    label=""
                  />
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
                className="flex flex-col gap-stellar-3 p-stellar-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stellar-text">
                    {slot.item.product?.name || 'Product'}
                  </p>
                  {slot.item.combo?.name ? (
                    <p className="text-[10px] uppercase tracking-wide text-stellar-text-muted">
                      Combo · {slot.item.combo.name}
                    </p>
                  ) : null}
                  <p className="font-mono text-xs text-stellar-text-muted">
                    {slot.serialLabel || slot.unitId}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-stellar-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      done
                        ? 'bg-emerald-500/15 text-emerald-700'
                        : 'bg-amber-500/15 text-amber-700'
                    }`}
                  >
                    {done ? 'Scanned' : 'Awaiting scan'}
                  </span>
                  {!done && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => openScan(slot.slotKey)}
                    >
                      Scan
                    </Button>
                  )}
                </div>
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
