/** Canonical QR scan payload — must match backend buildUnitQrPayload. */
export function buildUnitQrScanPayload(unitId) {
  if (!unitId) return '';
  return `stellar://unit/${unitId}`;
}
