/** Build one serial slot per unit needed for a combo bundle. */
export function buildComboUnitSlots(comboItems = []) {
  const slots = [];

  for (const item of comboItems) {
    const productId = item.product?.id || item.product?._id || item.product;
    if (!productId) continue;

    const productName = item.productName || item.product?.name || 'Product';
    const qty = Math.max(1, Number(item.quantity) || 1);

    for (let i = 0; i < qty; i += 1) {
      slots.push({
        slotKey: `${productId}--${i}`,
        product: String(productId),
        productName,
        slotIndex: i,
        lineQty: qty,
        productUnit: '',
      });
    }
  }

  return slots;
}

/** Initialize editable combo composition from a catalog combo. */
export function buildComboCompositionFromCombo(combo) {
  return (combo?.items || []).map((item, idx) => {
    const productId = item.product?.id || item.product?._id || item.product;
    const qty = Math.max(1, Number(item.quantity) || 1);
    return {
      key: `combo-${productId}-${idx}`,
      product: String(productId || ''),
      productName: item.product?.name || 'Product',
      quantity: qty,
      maxQuantity: qty,
      pricing: {
        dailyRate: item.pricing?.dailyRate ?? '',
        weeklyRate: item.pricing?.weeklyRate ?? '',
        monthlyRate: item.pricing?.monthlyRate ?? '',
      },
    };
  }).filter((row) => row.product);
}

export function comboSlotsToPayload(slots = []) {
  return slots
    .filter((s) => s.productUnit)
    .map((s) => ({
      product: s.product,
      productUnit: s.productUnit,
    }));
}
