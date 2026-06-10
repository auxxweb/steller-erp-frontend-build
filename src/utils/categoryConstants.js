export const CATEGORY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const CATEGORY_STATUS_LABELS = {
  [CATEGORY_STATUS.ACTIVE]: 'Active',
  [CATEGORY_STATUS.INACTIVE]: 'Inactive',
};

export const CATEGORY_STATUS_OPTIONS = Object.entries(CATEGORY_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const EMPTY_CATEGORY_FORM = {
  name: '',
  slug: '',
  description: '',
  image: '',
  status: CATEGORY_STATUS.ACTIVE,
  branch: '',
};
