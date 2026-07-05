import { EMPTY_COMBO_FORM } from './comboConstants.js';
import { defaultBookingWindow, fromDatetimeLocalValue } from './rentalConstants.js';

const RATE_FIELDS = ['dailyRate', 'weeklyRate', 'monthlyRate'];

export function normalizeItemPricing(pricing = {}) {
  const out = {};
  RATE_FIELDS.forEach((field) => {
    const val = pricing[field];
    if (val !== '' && val != null) out[field] = Number(val);
  });
  return out;
}

/** Sum item rates × quantity into combo-level totals. */
export function aggregateComboPricingFromItems(items = []) {
  const totals = { dailyRate: 0, weeklyRate: 0, monthlyRate: 0 };
  for (const entry of items) {
    const qty = Math.max(1, Number(entry.quantity) || 1);
    const p = entry.pricing || {};
    RATE_FIELDS.forEach((key) => {
      const val = Number(p[key]);
      if (!Number.isNaN(val) && val > 0) totals[key] += val * qty;
    });
  }
  return totals;
}

export function productDefaultPricing(product) {
  const p = product?.pricing?.individual || product?.pricing || {};
  return {
    dailyRate: p.dailyRate ?? '',
    weeklyRate: p.weeklyRate ?? '',
    monthlyRate: p.monthlyRate ?? '',
  };
}

export function comboToForm(combo) {
  const defaults = defaultBookingWindow();
  return {
    name: combo.name || '',
    code: combo.code || '',
    description: combo.description || '',
    status: combo.status,
    items: (combo.items || []).map((item, idx) => ({
      product: item.product?.id || item.product,
      quantity: item.quantity ?? 1,
      pricing: {
        dailyRate: item.pricing?.dailyRate ?? '',
        weeklyRate: item.pricing?.weeklyRate ?? '',
        monthlyRate: item.pricing?.monthlyRate ?? '',
      },
      key: `item-${idx}`,
    })),
    previewStartAt: defaults.scheduledStartAt,
    previewEndAt: defaults.scheduledEndAt,
  };
}

export function inferComboRateTypeFromItems(items = []) {
  const totals = aggregateComboPricingFromItems(items);
  return inferComboRateType(totals);
}

export function inferComboRateType(pricing = {}) {
  if (pricing.dailyRate != null && pricing.dailyRate !== '' && Number(pricing.dailyRate) > 0) {
    return 'daily';
  }
  if (pricing.weeklyRate != null && pricing.weeklyRate !== '' && Number(pricing.weeklyRate) > 0) {
    return 'weekly';
  }
  if (pricing.monthlyRate != null && pricing.monthlyRate !== '' && Number(pricing.monthlyRate) > 0) {
    return 'monthly';
  }
  return 'daily';
}

export function formToPayload(values) {
  const items = values.items
    .filter((i) => i.product)
    .map((i) => ({
      product: i.product,
      quantity: Number(i.quantity) || 1,
      pricing: normalizeItemPricing(i.pricing),
    }));

  if (!items.length) {
    throw new Error('At least one product is required');
  }

  const hasRates = items.every((item) =>
    RATE_FIELDS.some((key) => Number(item.pricing?.[key]) > 0),
  );
  if (!hasRates) {
    throw new Error('Each product needs at least one rental rate (daily, weekly, or monthly)');
  }

  const pricing = aggregateComboPricingFromItems(items);

  return {
    name: values.name.trim(),
    code: values.code.trim(),
    description: values.description?.trim() || undefined,
    status: values.status,
    pricing,
    items,
  };
}

export function previewPayloadFromForm(values) {
  const payload = formToPayload(values);
  if (values.previewStartAt) {
    payload.scheduledStartAt = fromDatetimeLocalValue(values.previewStartAt);
  }
  if (values.previewEndAt) {
    payload.scheduledEndAt = fromDatetimeLocalValue(values.previewEndAt);
  }
  payload.rateType = inferComboRateTypeFromItems(values.items);
  return payload;
}

export const initialComboForm = () => ({
  ...EMPTY_COMBO_FORM,
  items: [
    {
      product: '',
      quantity: 1,
      pricing: { dailyRate: '', weeklyRate: '', monthlyRate: '' },
      key: 'item-0',
    },
  ],
});
