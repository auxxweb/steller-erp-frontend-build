import { useCallback, useEffect, useMemo, useState } from 'react';
import QrScanModal from '../qr/QrScanModal.jsx';
import RentalUnitSelector from './RentalUnitSelector.jsx';
import { fetchAllProductUnits } from '../../services/productService.js';
import { verifyQr } from '../../services/qrService.js';
import { buildComboUnitSlots } from '../../utils/comboUnitHelpers.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import { UNIT_STATUS_LABELS, formatUnitSerialLabel } from '../../utils/productConstants.js';

function ComboUnitPicker({ comboItems = [], slots, onChange, isPrebook = false }) {
  const [unitsByProduct, setUnitsByProduct] = useState({});
  const [scanOpen, setScanOpen] = useState(false);
  const [scanTargetKey, setScanTargetKey] = useState(null);

  const defaultSlots = useMemo(() => buildComboUnitSlots(comboItems), [comboItems]);
  const activeSlots = slots?.length ? slots : defaultSlots;

  const productIdsKey = useMemo(
    () => [...new Set(activeSlots.map((s) => s.product).filter(Boolean))].join(','),
    [activeSlots],
  );

  useEffect(() => {
    if (isPrebook || !productIdsKey) return undefined;
    let cancelled = false;
    productIdsKey.split(',').filter(Boolean).forEach((productId) => {
      fetchAllProductUnits(productId)
        .then((units) => {
          if (cancelled) return;
          setUnitsByProduct((prev) => ({
            ...prev,
            [productId]: units,
          }));
        })
        .catch(() => {
          if (cancelled) return;
          setUnitsByProduct((prev) => ({ ...prev, [productId]: [] }));
        });
    });
    return () => {
      cancelled = true;
    };
  }, [isPrebook, productIdsKey]);

  const updateSlot = useCallback(
    (slotKey, productUnit) => {
      onChange(
        activeSlots.map((s) => (s.slotKey === slotKey ? { ...s, productUnit: productUnit || '' } : s)),
      );
    },
    [activeSlots, onChange],
  );

  const disabledUnitIds = useMemo(() => {
    const ids = new Set();
    activeSlots.forEach((s) => {
      if (s.productUnit) ids.add(String(s.productUnit));
    });
    return ids;
  }, [activeSlots]);

  const scanTarget = activeSlots.find((s) => s.slotKey === scanTargetKey) || null;

  const handleScan = async (value) => {
    const target = scanTarget;
    if (!target) {
      toast.error('Select a product slot first');
      return;
    }
    try {
      const { data } = await verifyQr(value.trim());
      const unit = data.data?.unit;
      if (!unit?.id) {
        toast.error('Invalid QR code');
        return;
      }
      const unitProductId = unit.product?.id || unit.product;
      if (unitProductId?.toString() !== target.product.toString()) {
        toast.error('This QR does not match this product');
        return;
      }
      if (unit.status !== 'available') {
        toast.error(`Unit is ${UNIT_STATUS_LABELS[unit.status] || unit.status}`);
        return;
      }
      const taken = activeSlots.some(
        (s) => s.slotKey !== target.slotKey && s.productUnit === unit.id,
      );
      if (taken) {
        toast.error('This serial is already selected for another item');
        return;
      }
      updateSlot(target.slotKey, unit.id);
      setScanOpen(false);
      setScanTargetKey(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Scan failed'));
    }
  };

  if (!comboItems.length) {
    return null;
  }

  if (isPrebook) {
    return (
      <p className="text-sm text-stellar-text-muted">
        Serial numbers for each product in this combo will be assigned at pickup (dropdown or QR
        scan).
      </p>
    );
  }

  return (
    <div className="space-y-stellar-4">
      <p className="text-sm text-stellar-text-muted">
        Assign a serial number for each product in the combo — select from the list or scan the unit
        QR.
      </p>

      <ul className="space-y-stellar-4">
        {activeSlots.map((slot) => {
          const units = unitsByProduct[slot.product] || [];
          const selectedUnit = units.find((u) => String(u.id) === String(slot.productUnit));
          const selectedLabel = formatUnitSerialLabel(selectedUnit);
          const qtyLabel = slot.lineQty > 1 ? ` (${slot.slotIndex + 1} of ${slot.lineQty})` : '';
          const slotDisabled = new Set(disabledUnitIds);
          if (slot.productUnit) slotDisabled.delete(String(slot.productUnit));

          return (
            <li
              key={slot.slotKey}
              className="rounded-stellar-lg border border-stellar-border p-stellar-4"
            >
              <div className="mb-stellar-3 flex items-start justify-between gap-stellar-2">
                <div>
                  <p className="text-sm font-semibold text-stellar-text">
                    {slot.productName}
                    {qtyLabel}
                  </p>
                  <p className="text-xs text-stellar-text-muted">
                    {selectedLabel ? (
                      <span className="font-mono text-stellar-text">{selectedLabel}</span>
                    ) : (
                      'Required for direct rental'
                    )}
                  </p>
                </div>
                {slot.productUnit ? (
                  <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Ready
                  </span>
                ) : null}
              </div>

              <RentalUnitSelector
                units={units}
                selectedId={slot.productUnit || ''}
                disabledUnitIds={slotDisabled}
                onSelect={(unitId) => updateSlot(slot.slotKey, unitId)}
                onScan={() => {
                  setScanTargetKey(slot.slotKey);
                  setScanOpen(true);
                }}
              />
            </li>
          );
        })}
      </ul>

      {scanOpen && (
        <QrScanModal
          open
          title={scanTarget ? `Scan — ${scanTarget.productName}` : 'Scan unit QR'}
          hint="Align the unit QR code in the frame."
          onClose={() => {
            setScanOpen(false);
            setScanTargetKey(null);
          }}
          onScan={handleScan}
        />
      )}
    </div>
  );
}

export default ComboUnitPicker;
