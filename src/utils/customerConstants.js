export const CUSTOMER_TYPE = {
  INDIVIDUAL: 'individual',
  BUSINESS: 'business',
};

export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
};

export const RISK_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const ID_PROOF_TYPE = {
  AADHAAR: 'aadhaar',
  PAN: 'pan',
  PASSPORT: 'passport',
  DRIVING_LICENSE: 'driving_license',
  VOTER_ID: 'voter_id',
  OTHER: 'other',
};

export const RENTAL_STATUS = {
  DRAFT: 'draft',
  RESERVED: 'reserved',
  ACTIVE: 'active',
  OVERDUE: 'overdue',
  RETURNED: 'returned',
  CANCELLED: 'cancelled',
  CLOSED: 'closed',
};

export const CUSTOMER_TYPE_OPTIONS = [
  { value: CUSTOMER_TYPE.INDIVIDUAL, label: 'Individual' },
  { value: CUSTOMER_TYPE.BUSINESS, label: 'Business' },
];

export const CUSTOMER_STATUS_OPTIONS = [
  { value: CUSTOMER_STATUS.ACTIVE, label: 'Active' },
  { value: CUSTOMER_STATUS.INACTIVE, label: 'Inactive' },
  { value: CUSTOMER_STATUS.BLOCKED, label: 'Blocked' },
];

export const RISK_LEVEL_OPTIONS = [
  { value: RISK_LEVEL.LOW, label: 'Low risk' },
  { value: RISK_LEVEL.MEDIUM, label: 'Medium risk' },
  { value: RISK_LEVEL.HIGH, label: 'High risk' },
];

export const ID_PROOF_TYPE_OPTIONS = [
  { value: ID_PROOF_TYPE.AADHAAR, label: 'Aadhaar' },
  { value: ID_PROOF_TYPE.PAN, label: 'PAN' },
  { value: ID_PROOF_TYPE.PASSPORT, label: 'Passport' },
  { value: ID_PROOF_TYPE.DRIVING_LICENSE, label: 'Driving license' },
  { value: ID_PROOF_TYPE.VOTER_ID, label: 'Voter ID' },
  { value: ID_PROOF_TYPE.OTHER, label: 'Other' },
];

export const RENTAL_STATUS_OPTIONS = [
  { value: RENTAL_STATUS.ACTIVE, label: 'Active' },
  { value: RENTAL_STATUS.OVERDUE, label: 'Overdue' },
  { value: RENTAL_STATUS.RESERVED, label: 'Reserved' },
  { value: RENTAL_STATUS.RETURNED, label: 'Returned' },
  { value: RENTAL_STATUS.CLOSED, label: 'Closed' },
  { value: RENTAL_STATUS.CANCELLED, label: 'Cancelled' },
];

export const EMPTY_ADDRESS = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

export const EMPTY_CUSTOMER_FORM = {
  customerType: CUSTOMER_TYPE.INDIVIDUAL,
  name: '',
  phone: '',
  alternatePhone: '',
  email: '',
  branch: '',
  company: '',
  gstin: '',
  creditLimit: '',
  notes: '',
  address: { ...EMPTY_ADDRESS },
  idProofType: ID_PROOF_TYPE.AADHAAR,
  idProofNumber: '',
};

export const RISK_LEVEL_META = {
  [RISK_LEVEL.LOW]: {
    label: 'Low',
    barClass: 'bg-emerald-500',
    ringClass: 'text-emerald-500',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  },
  [RISK_LEVEL.MEDIUM]: {
    label: 'Medium',
    barClass: 'bg-amber-500',
    ringClass: 'text-amber-500',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  },
  [RISK_LEVEL.HIGH]: {
    label: 'High',
    barClass: 'bg-red-500',
    ringClass: 'text-red-500',
    badgeClass: 'bg-red-500/15 text-red-700 dark:text-red-400',
  },
};
