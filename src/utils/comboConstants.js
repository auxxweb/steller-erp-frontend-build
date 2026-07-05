export const COMBO_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const COMBO_STATUS_OPTIONS = [
  { value: COMBO_STATUS.ACTIVE, label: 'Active' },
  { value: COMBO_STATUS.INACTIVE, label: 'Inactive' },
];

export const EMPTY_COMBO_FORM = {
  name: '',
  code: '',
  description: '',
  status: COMBO_STATUS.ACTIVE,
  items: [],
};
