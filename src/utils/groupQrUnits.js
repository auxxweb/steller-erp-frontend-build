/**
 * Group catalog units by category → product for QR display pages.
 */
export function groupUnitsByCategoryProduct(units) {
  const categoryMap = new Map();

  for (const unit of units) {
    const category = unit.categoryName?.trim() || 'Uncategorized';
    const product = unit.productName || unit.product?.name || 'Unknown product';

    if (!categoryMap.has(category)) categoryMap.set(category, new Map());
    const productMap = categoryMap.get(category);
    if (!productMap.has(product)) productMap.set(product, []);
    productMap.get(product).push(unit);
  }

  return [...categoryMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, productMap]) => ({
      category,
      products: [...productMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([product, items]) => ({
          product,
          items: [...items].sort((a, b) =>
            String(a.serialNumber || '').localeCompare(String(b.serialNumber || '')),
          ),
        })),
    }));
}
