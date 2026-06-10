import { useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import NumberInput from '../ui/NumberInput.jsx';
import QrScanner from '../qr/QrScanner.jsx';
import { fetchProductUnits } from '../../services/productService.js';
import { verifyQr } from '../../services/qrService.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import { RATE_TYPE_OPTIONS } from '../../utils/rentalConstants.js';
import { UNIT_STATUS_LABELS } from '../../utils/productConstants.js';

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
  isPrebook = false,
  crossBranch = false,
}) {
  const [unitsByProduct, setUnitsByProduct] = useState({});
  const [loadingProduct, setLoadingProduct] = useState(null);
  const [scanLineIndex, setScanLineIndex] = useState(null);

  const loadUnits = async (productId) => {
    if (!productId || unitsByProduct[productId]) return;
    setLoadingProduct(productId);
    try {
      const { data } = await fetchProductUnits(productId, { limit: 100 });
      setUnitsByProduct((prev) => ({
        ...prev,
        [productId]: data.data.units || [],
      }));
    } catch {
      setUnitsByProduct((prev) => ({ ...prev, [productId]: [] }));
    } finally {
      setLoadingProduct(null);
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

  const handleQrScan = async (index, value) => {
    const line = lines[index];
    if (!line?.product) {
      toast.error('Select a product before scanning');
      return;
    }
    try {
      const { data } = await verifyQr(value.trim());
      const unit = data.data?.unit;
      if (!unit?.id) {
        toast.error('Invalid QR code');
        return;
      }
      const productId = unit.product?.id || unit.product;
      if (productId?.toString() !== line.product.toString()) {
        toast.error('This QR does not match the selected product');
        return;
      }
      if (unit.status !== 'available') {
        toast.error(`Unit is ${UNIT_STATUS_LABELS[unit.status] || unit.status}`);
        return;
      }
      updateLine(index, 'productUnit', unit.id);
      setScanLineIndex(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Scan failed'));
    }
  };

  return (
    <div className="space-y-stellar-4">
      <p className="text-sm text-stellar-text-muted">
        Choose a category, then a product.{' '}
        {isPrebook
          ? 'Prebook reserves from the company-wide pool — assign serials at pickup.'
          : 'Direct rental requires a serial (dropdown or scan the unit QR).'}
        {crossBranch && (
          <> Branch labels show where each unit is stored, not who can rent it.</>
        )}
      </p>

      {lines.map((line, index) => {
        const categoryProducts = productsForCategory(line.category);
        const product = products.find((p) => String(p.id) === String(line.product));
        const units = unitsByProduct[line.product] || [];
        const showSerialPick = !isPrebook && line.product && Number(line.quantity) === 1;

        return (
          <div
            key={line.key || index}
            className="space-y-stellar-3 rounded-stellar-lg border border-stellar-border p-stellar-3"
          >
            <div className="grid gap-stellar-3 sm:grid-cols-12">
              <div className="form-group sm:col-span-4">
                <label className="form-label">Category</label>
                <select
                  className="input"
                  value={line.category || ''}
                  onChange={(e) => updateLine(index, 'category', e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => {
                    const cid = String(c.id ?? c._id ?? '');
                    return (
                      <option key={cid} value={cid}>
                        {c.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group sm:col-span-5">
                <label className="form-label">Product</label>
                <select
                  className="input"
                  value={line.product}
                  onChange={(e) => updateLine(index, 'product', e.target.value)}
                  disabled={!line.category}
                  required
                >
                  <option value="">
                    {line.category ? 'Select product' : 'Select category first'}
                  </option>
                  {categoryProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                      {crossBranch && p.branch?.name ? ` · ${p.branch.name}` : ''}
                      {p.totalUnits != null
                        ? ` — ${p.availableUnits ?? 0}/${p.totalUnits} avail.`
                        : ''}
                    </option>
                  ))}
                </select>
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
                <label className="form-label">Rate</label>
                <select
                  className="input"
                  value={line.rateType}
                  onChange={(e) => updateLine(index, 'rateType', e.target.value)}
                >
                  {RATE_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {showSerialPick && (
              <div className="grid gap-stellar-3 border-t border-stellar-border pt-stellar-3 sm:grid-cols-12">
                <div className="form-group sm:col-span-6">
                  <label className="form-label">Serial number</label>
                  <select
                    className="input font-mono text-sm"
                    value={line.productUnit || ''}
                    onChange={(e) => updateLine(index, 'productUnit', e.target.value)}
                    disabled={loadingProduct === line.product}
                    required
                  >
                    <option value="">Select serial</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id} disabled={u.status !== 'available'}>
                        {u.serialNumber}
                        {crossBranch && u.branch?.name ? ` @ ${u.branch.name}` : ''}
                        {' — '}
                        {UNIT_STATUS_LABELS[u.status] || u.status}
                      </option>
                    ))}
                  </select>
                  {line.product && !units.length && loadingProduct !== line.product && (
                    <p className="form-error mt-stellar-1 text-xs">
                      No serial units on {product?.name || 'this product'}. Add units under
                      Products.
                    </p>
                  )}
                </div>

                <div className="flex flex-col justify-end gap-stellar-2 sm:col-span-6">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setScanLineIndex(scanLineIndex === index ? null : index);
                    }}
                  >
                    {scanLineIndex === index ? 'Close scanner' : 'Scan unit QR'}
                  </Button>
                  {line.productUnit && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      Serial selected
                      {units.find((u) => u.id === line.productUnit)?.serialNumber
                        ? `: ${units.find((u) => u.id === line.productUnit).serialNumber}`
                        : ''}
                    </p>
                  )}
                </div>

                {scanLineIndex === index && (
                  <div className="sm:col-span-12">
                    <div className="mx-auto max-w-md">
                      <QrScanner onScan={(v) => handleQrScan(index, v)} />
                    </div>
                  </div>
                )}
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
