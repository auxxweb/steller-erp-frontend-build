import { useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import NumberInput from '../ui/NumberInput.jsx';
import SearchableSelect from '../ui/SearchableSelect.jsx';
import QrScanModal from '../qr/QrScanModal.jsx';
import { fetchProduct, fetchAllProductUnits } from '../../services/productService.js';
import { verifyQr } from '../../services/qrService.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import { RATE_TYPE_OPTIONS } from '../../utils/rentalConstants.js';
import { UNIT_STATUS_LABELS, formatUnitSerialLabel, unitSerialKeywords } from '../../utils/productConstants.js';
import { formatBranchDisplay } from '../../utils/branchHelpers.js';
import { toSelectOptions, withEmptyOption } from '../../utils/selectOptions.js';

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

/** Category ref from API: populated object, raw ObjectId string, or legacy slug string */
function categoryIdFromRef(cat) {
  if (cat == null) return null;
  if (typeof cat === 'object') {
    const raw = cat.id ?? cat._id;
    return raw != null ? String(raw) : null;
  }
  const s = String(cat).trim();
  return OBJECT_ID_RE.test(s) ? s : null;
}

function categorySlugFromRef(cat) {
  if (cat == null) return null;
  if (typeof cat === 'object' && typeof cat.slug === 'string') {
    return cat.slug.trim().toLowerCase();
  }
  const s = String(cat).trim();
  if (!s || OBJECT_ID_RE.test(s)) return null;
  return s.toLowerCase();
}

function branchIdFromRef(branch) {
  if (branch == null) return null;
  if (typeof branch === 'object') {
    const raw = branch.id ?? branch._id;
    return raw != null ? String(raw) : null;
  }
  return String(branch);
}

function productBelongsToCategory(product, selectedCategoryId, categories) {
  if (!selectedCategoryId || !product) return false;
  const selectedId = String(selectedCategoryId);
  const selectedRow = categories.find((c) => String(c.id ?? c._id) === selectedId);
  const prodCat = product.category;

  const prodCatId = categoryIdFromRef(prodCat);
  if (prodCatId && prodCatId === selectedId) return true;

  const prodSlug = categorySlugFromRef(prodCat);
  const rowSlug =
    selectedRow?.slug != null ? String(selectedRow.slug).trim().toLowerCase() : null;
  if (prodSlug && rowSlug && prodSlug === rowSlug) {
    return true;
  }

  return false;
}

function RentalProductPicker({
  categories = [],
  products = [],
  lines,
  onChange,
  onProductDiscovered,
  isPrebook = false,
  crossBranch = false,
}) {
  const [unitsByProduct, setUnitsByProduct] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(() => new Set());
  const [quickScanLineIndex, setQuickScanLineIndex] = useState(null);

  const loadUnits = async (productId, { force = false } = {}) => {
    const key = String(productId || '');
    if (!key || (!force && unitsByProduct[key])) return;

    setLoadingProducts((prev) => new Set(prev).add(key));
    try {
      const units = await fetchAllProductUnits(key);
      setUnitsByProduct((prev) => ({
        ...prev,
        [key]: units,
      }));
    } catch {
      setUnitsByProduct((prev) => ({ ...prev, [key]: [] }));
    } finally {
      setLoadingProducts((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  useEffect(() => {
    if (isPrebook) return;
    const ids = [...new Set(lines.map((l) => l.product).filter(Boolean))];
    ids.forEach((id) => loadUnits(id));
  }, [isPrebook, lines.map((l) => l.product).join(',')]);

  const productsForCategory = (categoryId) => {
    if (!categoryId) return [];
    return products.filter((p) => productBelongsToCategory(p, categoryId, categories));
  };

  const addLine = () => {
    onChange([
      ...lines,
      {
        category: '',
        product: '',
        quantity: 1,
        rateType: 'daily',
        productUnit: '',
        key: `line-${Date.now()}`,
      },
    ]);
  };

  const updateLine = (index, field, value) => {
    const next = lines.map((line, i) => {
      if (i !== index) return line;
      const updated = { ...line, [field]: value };

      if (field === 'category') {
        updated.product = '';
        updated.productUnit = '';
      }
      if (field === 'product') {
        updated.productUnit = '';
        if (value && !isPrebook) loadUnits(value);
        if (value) {
          const product = products.find((p) => String(p.id) === String(value));
          const catId = categoryIdFromRef(product?.category);
          if (catId && !updated.category) {
            updated.category = catId;
          }
        }
      }
      if (field === 'quantity' && Number(value) > 1) {
        updated.productUnit = '';
      }
      return updated;
    });
    onChange(next);
  };

  const removeLine = (index) => {
    onChange(lines.filter((_, i) => i !== index));
  };

  const applyScannedUnitToLine = (index, unit, product) => {
    const productId = String(product.id);
    const catId = categoryIdFromRef(product.category);
    if (!catId) {
      toast.error('Could not resolve category for this product');
      return false;
    }
    if (unit.status !== 'available') {
      toast.error(`Unit is ${UNIT_STATUS_LABELS[unit.status] || unit.status}`);
      return false;
    }
    if (
      lines.some(
        (l, i) => i !== index && l.productUnit && String(l.productUnit) === String(unit.id),
      )
    ) {
      toast.error('This unit is already on the booking');
      return false;
    }

    const line = lines[index];
    const updatedLine = {
      ...line,
      category: catId,
      product: productId,
      quantity: 1,
      rateType: line.rateType || 'daily',
      productUnit: unit.id,
    };

    setUnitsByProduct((prev) => {
      const existing = prev[productId] || [];
      const hasUnit = existing.some((u) => String(u.id) === String(unit.id));
      return {
        ...prev,
        [productId]: hasUnit ? existing : [...existing, unit],
      };
    });
    loadUnits(productId, { force: true });
    onChange(lines.map((l, i) => (i === index ? updatedLine : l)));
    toast.success(`${product.name} · ${formatUnitSerialLabel(unit)} added`);
    return true;
  };

  const resolveProductForScan = async (productId) => {
    const cached = products.find((p) => String(p.id) === productId);
    if (cached) return cached;

    const { data } = await fetchProduct(productId);
    const product = data.data?.product;
    if (!product) return null;
    if (product.status && product.status !== 'active') {
      throw new Error('Product is inactive and cannot be added to a rental.');
    }
    onProductDiscovered?.(product);
    return product;
  };

  const handleQuickScanForLine = async (index, value) => {
    if (index == null || index < 0) return;
    try {
      const { data } = await verifyQr(value.trim());
      const unit = data.data?.unit;
      if (!unit?.id) {
        toast.error('Invalid QR code');
        return;
      }

      const productId = String(unit.product?.id || unit.product || '');
      if (!productId) {
        toast.error('Scanned unit is not linked to a product.');
        return;
      }

      let product;
      try {
        product = await resolveProductForScan(productId);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Product not found in catalog.'));
        return;
      }

      if (!product) {
        toast.error('Product not found in catalog.');
        return;
      }

      if (applyScannedUnitToLine(index, unit, product)) {
        setQuickScanLineIndex(null);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Scan failed'));
    }
  };

  return (
    <div className="space-y-stellar-4">
      <p className="text-sm text-stellar-text-muted">
        {isPrebook ? (
          <>
            Choose a category, then a product. Prebook reserves from the company-wide pool — assign
            serials at pickup.
          </>
        ) : (
          <>
            Use quick scan on each product line, or fill category and product manually. Direct
            rental requires a serial.
          </>
        )}
        {crossBranch && (
          <> Branch labels show where each unit is stored, not who can rent it.</>
        )}
      </p>

      <QrScanModal
        open={quickScanLineIndex !== null}
        title={
          quickScanLineIndex != null
            ? `Quick scan — product ${quickScanLineIndex + 1}`
            : 'Quick scan'
        }
        hint="Point the camera at a unit QR code. This line will be filled automatically."
        onClose={() => setQuickScanLineIndex(null)}
        onScan={(value) => handleQuickScanForLine(quickScanLineIndex, value)}
      />

      {lines.map((line, index) => {
        const categoryProducts = productsForCategory(line.category);
        const product = products.find((p) => String(p.id) === String(line.product));
        const productKey = line.product ? String(line.product) : '';
        const units = unitsByProduct[productKey] || [];
        const isLoadingUnits = productKey ? loadingProducts.has(productKey) : false;
        const showSerialPick = !isPrebook && line.product && Number(line.quantity) === 1;

        return (
          <div
            key={line.key || index}
            className="space-y-stellar-3 rounded-stellar-lg border border-stellar-border p-stellar-3"
          >
            {!isPrebook && (
              <div className="flex flex-col gap-stellar-2 rounded-stellar-md border border-dashed border-stellar-accent/40 bg-stellar-accent/5 p-stellar-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-stellar-text">Quick scan</p>
                  <p className="mt-stellar-0.5 text-xs text-stellar-text-muted">
                    Scan a unit QR to auto-fill category, product, quantity, rate, and serial.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setQuickScanLineIndex(index)}
                >
                  Scan to add product
                </Button>
              </div>
            )}

            <div className="grid gap-stellar-3 sm:grid-cols-12">
              <div className="form-group sm:col-span-4">
                <SearchableSelect
                  label="Category"
                  value={line.category || ''}
                  onChange={(e) => updateLine(index, 'category', e.target.value)}
                  options={withEmptyOption(
                    toSelectOptions(categories, {
                      valueKey: 'id',
                      getLabel: (c) => c.name,
                    }),
                    'Select category',
                  )}
                  required
                />
              </div>

              <div className="form-group sm:col-span-5">
                <SearchableSelect
                  label="Product"
                  value={line.product}
                  onChange={(e) => updateLine(index, 'product', e.target.value)}
                  disabled={!line.category}
                  options={withEmptyOption(
                    toSelectOptions(categoryProducts, {
                      getLabel: (p) => {
                        let text = `${p.name} (${p.sku})`;
                        if (crossBranch && p.branch) text += ` · ${formatBranchDisplay(p.branch)}`;
                        if (p.totalUnits != null) {
                          text += ` — ${p.availableUnits ?? 0}/${p.totalUnits} avail.`;
                        }
                        return text;
                      },
                      getKeywords: (p) => `${p.sku} ${p.name}`,
                    }),
                    line.category ? 'Select product' : 'Select category first',
                  )}
                  required
                />
                {line.category && categoryProducts.length === 0 && (
                  <p className="form-error mt-stellar-1 text-xs">No products in this category.</p>
                )}
              </div>

              <div className="form-group sm:col-span-1">
                <label className="form-label">Qty</label>
                <NumberInput
                  min={1}
                  allowDecimal={false}
                  value={line.quantity}
                  onChange={(n) => updateLine(index, 'quantity', n)}
                />
              </div>

              <div className="form-group sm:col-span-2">
                <SearchableSelect
                  label="Rate"
                  value={line.rateType}
                  onChange={(e) => updateLine(index, 'rateType', e.target.value)}
                  options={RATE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
              </div>
            </div>

            {showSerialPick && (
              <div className="grid gap-stellar-3 border-t border-stellar-border pt-stellar-3 sm:grid-cols-12">
                <div className="form-group sm:col-span-12">
                  <SearchableSelect
                    label="Serial number"
                    value={line.productUnit || ''}
                    onChange={(e) => updateLine(index, 'productUnit', e.target.value)}
                    disabled={isLoadingUnits}
                    className="font-mono text-sm"
                    options={withEmptyOption(
                      units.map((u) => ({
                        value: u.id,
                        label: `${formatUnitSerialLabel(u)}${crossBranch && u.branch ? ` @ ${formatBranchDisplay(u.branch)}` : ''} — ${UNIT_STATUS_LABELS[u.status] || u.status}`,
                        keywords: unitSerialKeywords(u),
                        disabled: u.status !== 'available',
                      })),
                      'Select serial',
                    )}
                    required
                  />
                  {line.product && isLoadingUnits && (
                    <p className="mt-stellar-1 text-xs text-stellar-text-muted">Loading serials…</p>
                  )}
                  {line.product && !units.length && !isLoadingUnits && (
                    <p className="form-error mt-stellar-1 text-xs">
                      No serial units on {product?.name || 'this product'}. Add units under
                      Products.
                    </p>
                  )}
                  {line.productUnit && (() => {
                    const selectedUnit = units.find((u) => u.id === line.productUnit);
                    const label = formatUnitSerialLabel(selectedUnit);
                    return label ? (
                      <p className="mt-stellar-1 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                        Serial selected: {label}
                      </p>
                    ) : (
                      <p className="mt-stellar-1 text-xs text-emerald-600 dark:text-emerald-400">
                        Serial selected
                      </p>
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="!text-stellar-danger"
                onClick={() => removeLine(index)}
                disabled={lines.length <= 1}
              >
                Remove line
              </Button>
            </div>
          </div>
        );
      })}

      <Button type="button" variant="secondary" size="sm" onClick={addLine}>
        Add product
      </Button>
    </div>
  );
}

export default RentalProductPicker;
