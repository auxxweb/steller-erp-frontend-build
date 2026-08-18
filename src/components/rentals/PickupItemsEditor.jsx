import { useMemo, useState } from 'react';
import Button from '../ui/Button.jsx';
import NumberInput from '../ui/NumberInput.jsx';
import SearchableSelect from '../ui/SearchableSelect.jsx';
import { toSelectOptions, withEmptyOption } from '../../utils/selectOptions.js';
import { RATE_TYPE_OPTIONS } from '../../utils/rentalConstants.js';

function lineKey(item, index) {
  return item.id || item.key || `pickup-line-${index}`;
}

function PickupItemsEditor({ items = [], products = [], onSave, saving = false }) {
  const [draft, setDraft] = useState(() =>
    items.map((item, index) => ({
      key: lineKey(item, index),
      id: item.id,
      product: item.product?.id || item.product || '',
      quantity: item.quantity || 1,
      rateType: item.rateType || 'daily',
    })),
  );

  const productOptions = useMemo(
    () =>
      toSelectOptions(products, {
        getLabel: (p) => `${p.name} (${p.sku})`,
        getKeywords: (p) => `${p.sku} ${p.name}`,
      }),
    [products],
  );

  const updateLine = (index, field, value) => {
    setDraft((prev) =>
      prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)),
    );
  };

  const addLine = () => {
    setDraft((prev) => [
      ...prev,
      {
        key: `pickup-new-${Date.now()}`,
        product: '',
        quantity: 1,
        rateType: 'daily',
      },
    ]);
  };

  const removeLine = (index) => {
    setDraft((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSave = () => {
    const payload = draft
      .filter((line) => line.product)
      .map((line) => ({
        product: line.product,
        quantity: Number(line.quantity) || 1,
        rateType: line.rateType || 'daily',
      }));
    onSave?.(payload);
  };

  return (
    <div className="space-y-stellar-3 rounded-stellar-lg border border-dashed border-stellar-border p-stellar-3">
      <div>
        <p className="text-sm font-medium text-stellar-text">Edit products before pickup</p>
        <p className="text-xs text-stellar-text-muted">
          Add, remove, or swap products on this prebook. Save, then assign serials.
        </p>
      </div>

      {draft.map((line, index) => (
        <div key={line.key} className="grid gap-stellar-2 sm:grid-cols-12">
          <div className="sm:col-span-7">
            <SearchableSelect
              label="Product"
              value={line.product}
              onChange={(e) => updateLine(index, 'product', e.target.value)}
              options={withEmptyOption(productOptions, 'Select product')}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Qty</label>
            <NumberInput
              min={1}
              allowDecimal={false}
              value={line.quantity}
              onChange={(n) => updateLine(index, 'quantity', n)}
            />
          </div>
          <div className="sm:col-span-3">
            <SearchableSelect
              label="Rate"
              value={line.rateType}
              onChange={(e) => updateLine(index, 'rateType', e.target.value)}
              options={RATE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
          </div>
          <div className="flex justify-end sm:col-span-12">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="!text-stellar-danger"
              onClick={() => removeLine(index)}
              disabled={draft.length <= 1}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-stellar-2">
        <Button type="button" variant="secondary" size="sm" onClick={addLine}>
          Add product
        </Button>
        <Button type="button" variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save product changes'}
        </Button>
      </div>
    </div>
  );
}

export default PickupItemsEditor;
