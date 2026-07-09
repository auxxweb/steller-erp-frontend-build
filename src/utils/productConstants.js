export const UNIT_LOCATION_LABEL = 'Currently at branch';

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISCONTINUED: 'discontinued',
};

export const PRODUCT_STATUS_LABELS = {
  [PRODUCT_STATUS.ACTIVE]: 'Active',
  [PRODUCT_STATUS.INACTIVE]: 'Inactive',
  [PRODUCT_STATUS.DISCONTINUED]: 'Discontinued',
};

export const PRODUCT_STATUS_OPTIONS = Object.entries(PRODUCT_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const PRODUCT_UNIT_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired',
  LOST: 'lost',
};

export const UNIT_STATUS_LABELS = {
  [PRODUCT_UNIT_STATUS.AVAILABLE]: 'Available',
  [PRODUCT_UNIT_STATUS.RESERVED]: 'Reserved',
  [PRODUCT_UNIT_STATUS.RENTED]: 'Rented',
  [PRODUCT_UNIT_STATUS.MAINTENANCE]: 'Maintenance',
  [PRODUCT_UNIT_STATUS.RETIRED]: 'Retired',
  [PRODUCT_UNIT_STATUS.LOST]: 'Lost',
};

export const UNIT_STATUS_OPTIONS = Object.entries(UNIT_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const PRODUCT_CONDITION = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  DAMAGED: 'damaged',
};

export const CONDITION_LABELS = {
  [PRODUCT_CONDITION.EXCELLENT]: 'Excellent',
  [PRODUCT_CONDITION.GOOD]: 'Good',
  [PRODUCT_CONDITION.FAIR]: 'Fair',
  [PRODUCT_CONDITION.POOR]: 'Poor',
  [PRODUCT_CONDITION.DAMAGED]: 'Damaged',
};

export const CONDITION_OPTIONS = Object.entries(CONDITION_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const EMPTY_PRODUCT_FORM = {
  name: '',
  brand: '',
  model: '',
  sku: '',
  category: '',
  description: '',
  status: PRODUCT_STATUS.ACTIVE,
  images: [],
  pricing: {
    individual: {
      dailyRate: '',
      weeklyRate: '',
      monthlyRate: '',
    },
    depositAmount: '',
    salePrice: '',
  },
  advancePayment: {
    required: false,
    percentage: '',
  },
  /** Serial units when creating product master (each has serial + optional images) */
  serialUnits: [{ serialNumber: '', imageFiles: [] }],
};

export const EMPTY_UNIT_FORM = {
  serialNumber: '',
  uniqueCode: '',
  condition: PRODUCT_CONDITION.GOOD,
  status: PRODUCT_UNIT_STATUS.AVAILABLE,
  location: { notes: '' },
  notes: '',
};

/** Serial with optional unique code, e.g. "SN-001 · UC-123". */
export function formatUnitSerialWithCode(serialNumber, uniqueCode) {
  const serial = String(serialNumber || '').trim();
  const code = String(uniqueCode || '').trim();
  if (!serial) return code;
  if (!code) return serial;
  return `${serial} · ${code}`;
}

export function formatUnitSerialLabel(unit) {
  if (!unit) return '';
  if (typeof unit === 'string') return unit;
  return formatUnitSerialWithCode(unit.serialNumber, unit.uniqueCode);
}

export function unitSerialKeywords(unit) {
  if (!unit || typeof unit === 'string') return unit || '';
  return [unit.serialNumber, unit.uniqueCode].filter(Boolean).join(' ');
}
