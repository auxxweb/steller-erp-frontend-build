const PERMANENTLY_UNAVAILABLE = new Set(['maintenance', 'retired', 'lost']);

/**
 * A unit can be selected when the API marks it assignable, or when status is
 * available, or when reserved/rented looks stale (no current rental).
 */
export function isUnitAssignable(unit, { allowReserved = false } = {}) {
  if (!unit) return false;
  if (PERMANENTLY_UNAVAILABLE.has(unit.status)) return false;
  if (unit.assignable === true) return true;
  if (unit.assignable === false) return false;
  if (unit.status === 'available') return true;
  if (allowReserved && unit.status === 'reserved') return true;
  if (['reserved', 'rented'].includes(unit.status) && !unit.currentRental) return true;
  return false;
}

export function unitUnavailableReason(unit) {
  if (!unit) return 'Unit not found';
  if (unit.assignable === false) {
    return 'This serial is already rented or prebooked for the selected dates';
  }
  if (PERMANENTLY_UNAVAILABLE.has(unit.status)) {
    return `Unit is ${unit.status}`;
  }
  if (!isUnitAssignable(unit)) {
    return 'This serial is already rented or prebooked for the selected dates';
  }
  return null;
}
