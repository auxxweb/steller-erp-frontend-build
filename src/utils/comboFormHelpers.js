import {
  EMPTY_COMBO_FORM,
  COMMON_INVENTORY_VALUE,
  COMMON_INVENTORY_BRANCH_CODE,
} from './comboConstants.js';
import { defaultBookingWindow, fromDatetimeLocalValue } from './rentalConstants.js';

export function comboToForm(combo) {
  const defaults = defaultBookingWindow();
  const branchCode = combo.branch?.code;
  const branchId = combo.branch?.id || combo.branch || '';
  return {
    name: combo.name || '',
    code: combo.code || '',
    branch:
      combo.isShared || branchCode === COMMON_INVENTORY_BRANCH_CODE
        ? COMMON_INVENTORY_VALUE
        : branchId,
    description: combo.description || '',
    status: combo.status,
    pricingRule: combo.pricingRule,
    pricing: {
      dailyRate: combo.pricing?.dailyRate ?? '',
      weeklyRate: combo.pricing?.weeklyRate ?? '',
      monthlyRate: combo.pricing?.monthlyRate ?? '',
      depositAmount: combo.pricing?.depositAmount ?? '',
      discountPercent: combo.pricing?.discountPercent ?? '',
      discountAmount: combo.pricing?.discountAmount ?? '',
    },
    items: (combo.items || []).map((item, idx) => ({
      product: item.product?.id || item.product,
      quantity: item.quantity ?? 1,
      key: `item-${idx}`,
    })),
    previewStartAt: defaults.scheduledStartAt,
    previewEndAt: defaults.scheduledEndAt,
  };
}

export function formToPayload(values, isSuperAdmin) {
  const pricing = {};
  ['dailyRate', 'weeklyRate', 'monthlyRate', 'depositAmount', 'discountPercent', 'discountAmount'].forEach(
    (field) => {
      const val = values.pricing[field];
      if (val !== '' && val != null) pricing[field] = Number(val);
    },
  );

  const payload = {
    name: values.name.trim(),
    code: values.code.trim(),
    description: values.description?.trim() || undefined,
    status: values.status,
    pricingRule: values.pricingRule,
    pricing,
    items: values.items
      .filter((i) => i.product)
      .map((i) => ({
        product: i.product,
        quantity: Number(i.quantity) || 1,
      })),
  };

  if (isSuperAdmin && values.branch) {
    payload.branch = values.branch;
  }
  return payload;
}

export function previewPayloadFromForm(values, isSuperAdmin) {
  const payload = formToPayload(values, isSuperAdmin);
  if (values.previewStartAt) {
    payload.scheduledStartAt = fromDatetimeLocalValue(values.previewStartAt);
  }
  if (values.previewEndAt) {
    payload.scheduledEndAt = fromDatetimeLocalValue(values.previewEndAt);
  }
  payload.rateType = 'daily';
  return payload;
}

export function initialComboForm() {
  const defaults = defaultBookingWindow();
  return {
    ...EMPTY_COMBO_FORM,
    previewStartAt: defaults.scheduledStartAt,
    previewEndAt: defaults.scheduledEndAt,
  };
}
