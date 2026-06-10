export {
  COMMON_INVENTORY_VALUE,
  COMMON_INVENTORY_BRANCH_CODE,
  COMMON_INVENTORY_LABEL,
} from './productConstants.js';

export const COMBO_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const COMBO_PRICING_RULE = {
  SUM_WITH_DISCOUNT: 'sum_with_discount',
  FIXED_BUNDLE: 'fixed_bundle',
  SUM_PRODUCTS: 'sum_products',
};

export const COMBO_STATUS_OPTIONS = [
  { value: COMBO_STATUS.ACTIVE, label: 'Active' },
  { value: COMBO_STATUS.INACTIVE, label: 'Inactive' },
];

export const COMBO_PRICING_RULE_OPTIONS = [
  {
    value: COMBO_PRICING_RULE.SUM_WITH_DISCOUNT,
    label: 'Sum products + discount',
    description: 'Add individual product rates, then apply % or flat discount',
  },
  {
    value: COMBO_PRICING_RULE.FIXED_BUNDLE,
    label: 'Fixed bundle price',
    description: 'Use combo daily/weekly/monthly rate regardless of catalog sum',
  },
  {
    value: COMBO_PRICING_RULE.SUM_PRODUCTS,
    label: 'Sum products (no discount)',
    description: 'Catalog total only',
  },
];

export const EMPTY_COMBO_FORM = {
  name: '',
  code: '',
  branch: '',
  description: '',
  status: COMBO_STATUS.ACTIVE,
  pricingRule: COMBO_PRICING_RULE.SUM_WITH_DISCOUNT,
  pricing: {
    dailyRate: '',
    weeklyRate: '',
    monthlyRate: '',
    depositAmount: '',
    discountPercent: '',
    discountAmount: '',
  },
  items: [{ product: '', quantity: 1, key: 'item-0' }],
};
