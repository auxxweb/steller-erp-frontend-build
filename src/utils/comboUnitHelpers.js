/** Build one serial slot per unit needed for a combo bundle. */
export function buildComboUnitSlots(comboItems = []) {
  const slots = [];

  for (const item of comboItems) {
    const productId = item.product?.id || item.product?._id || item.product;
    if (!productId) continue;

    const productName = item.product?.name || 'Product';
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

export function comboSlotsToPayload(slots = []) {
  return slots
    .filter((s) => s.productUnit)
    .map((s) => ({
      product: s.product,
      productUnit: s.productUnit,
    }));
}
