export const BRANCH_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CLOSED: 'closed',
};

export const BRANCH_STATUS_LABELS = {
  [BRANCH_STATUS.ACTIVE]: 'Active',
  [BRANCH_STATUS.INACTIVE]: 'Inactive',
  [BRANCH_STATUS.CLOSED]: 'Closed',
};

export const BRANCH_STATUS_OPTIONS = Object.entries(BRANCH_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const EMPTY_ADDRESS = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

export const EMPTY_BRANCH_FORM = {
  name: '',
  code: '',
  email: '',
  phone: '',
  address: { ...EMPTY_ADDRESS },
  manager: '',
  status: BRANCH_STATUS.ACTIVE,
};
