import { formatUnitSerialLabel } from './productConstants.js';

/** Stable line-item id from API JSON. */
export function getRentalItemId(item) {
  if (!item) return '';
  return String(item.id || item._id || '');
}

/** Whether a rental line already has a serial unit bound. */
export function itemHasAssignedUnit(item) {
  const pu = item?.productUnit;
  if (pu == null || pu === '') return false;
  if (typeof pu === 'object') return Boolean(pu.id || pu._id);
  return true;
}

export function unitIdFromProductUnit(productUnit) {
  if (!productUnit) return '';
  if (typeof productUnit === 'object') {
    return String(productUnit.id || productUnit._id || '');
  }
  return String(productUnit);
}

/** One checklist row per serial needed at pickup (splits qty > 1). */
export function buildPickupChecklistSlots(items = []) {
  const slots = [];

  for (const item of items) {
    const rentalItemId = getRentalItemId(item);
    if (!rentalItemId) continue;

    if (itemHasAssignedUnit(item)) {
      slots.push({
        slotKey: `${rentalItemId}--assigned`,
        rentalItemId,
        item,
        kind: 'preassigned',
        unitId: unitIdFromProductUnit(item.productUnit),
        serialLabel: formatUnitSerialLabel(item.productUnit),
      });
      continue;
    }

    const qty = Math.max(1, Number(item.quantity) || 1);
    for (let i = 0; i < qty; i += 1) {
      slots.push({
        slotKey: `${rentalItemId}--${i}`,
        rentalItemId,
        item,
        kind: 'pending',
        slotIndex: i,
      });
    }
  }

  return slots;
}
