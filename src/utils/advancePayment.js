import { computeDurationDays, resolveUnitRate } from './rentalPricing.js';

function lineSubtotalForProduct({ product, quantity = 1, rateType = 'daily', durationDays = 1 }) {
  const unitRate = resolveUnitRate(product?.pricing?.individual || product?.pricing, rateType);
  const qty = Math.max(1, Number(quantity) || 1);
  const days = Math.max(1, durationDays);
  if (rateType === 'weekly') return unitRate * qty * Math.ceil(days / 7);
  if (rateType === 'monthly') return unitRate * qty * Math.ceil(days / 30);
  return unitRate * qty * days;
}

/**
 * Estimate advance required from selected products (mirrors backend rules).
 */
export function computeAdvanceRequirement({
  products = [],
  lines = [],
  comboItems = [],
  scheduledStartAt,
  scheduledEndAt,
}) {
  const durationDays =
    scheduledStartAt && scheduledEndAt
      ? computeDurationDays(scheduledStartAt, scheduledEndAt)
      : 1;

  const entries = [];

  if (comboItems.length > 0) {
    for (const item of comboItems) {
      const productId = item.product?.id ?? item.product;
      const product = products.find((p) => String(p.id) === String(productId));
      if (!product?.advancePayment?.required) continue;
      const pct = Math.max(0, Math.min(100, Number(product.advancePayment.percentage) || 0));
      if (pct <= 0) continue;
      const qty = item.quantity || 1;
      const comboUnitRate = item.pricing
        ? Number(resolveUnitRate(item.pricing, 'daily')) || 0
        : null;
      const subtotal =
        comboUnitRate != null
          ? comboUnitRate * qty * Math.max(1, durationDays)
          : lineSubtotalForProduct({
              product,
              quantity: qty,
              rateType: 'daily',
              durationDays,
            });
      const amount = Math.round((subtotal * pct) / 100);
      entries.push({ id: product.id, name: product.name, percentage: pct, amount });
    }
  } else {
    for (const line of lines) {
      if (!line.product) continue;
      const product = products.find((p) => String(p.id) === String(line.product));
      if (!product?.advancePayment?.required) continue;
      const pct = Math.max(0, Math.min(100, Number(product.advancePayment.percentage) || 0));
      if (pct <= 0) continue;
      const subtotal = lineSubtotalForProduct({
        product,
        quantity: line.quantity,
        rateType: line.rateType || 'daily',
        durationDays,
      });
      const amount = Math.round((subtotal * pct) / 100);
      entries.push({ id: product.id, name: product.name, percentage: pct, amount });
    }
  }

  const required = entries.reduce((sum, e) => sum + e.amount, 0);
  return {
    required,
    hasRequired: entries.length > 0,
    products: entries,
  };
}
