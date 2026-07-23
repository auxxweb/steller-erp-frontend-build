import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import SearchableSelect from '../ui/SearchableSelect.jsx';
import ComboPricingPanel from './ComboPricingPanel.jsx';
import ComboAvailabilityPanel from './ComboAvailabilityPanel.jsx';
import { COMBO_STATUS_OPTIONS } from '../../utils/comboConstants.js';
import {
  aggregateComboPricingFromItems,
  productDefaultPricing,
} from '../../utils/comboFormHelpers.js';
import { toSelectOptions, withEmptyOption } from '../../utils/selectOptions.js';

function formatMoney(val) {
  if (val == null || val === '') return '—';
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

const RATE_FIELDS = [
  ['dailyRate', 'Daily'],
  ['weeklyRate', 'Weekly'],
  ['monthlyRate', 'Monthly'],
];

function ComboForm({
  values,
  products,
  pricingPreview,
  availabilityPreview,
  previewLoading,
  onChange,
  onCalculate,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}) {
  const setField = (field, val) => onChange({ ...values, [field]: val });
  const comboTotals = aggregateComboPricingFromItems(values.items);

  const updateItem = (index, patch) => {
    const items = values.items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange({ ...values, items });
  };

  const updateItemPricing = (index, field, val) => {
    const item = values.items[index];
    updateItem(index, {
      pricing: { ...(item.pricing || {}), [field]: val },
    });
  };

  const handleProductChange = (index, productId) => {
    const product = products.find((p) => p.id === productId);
    updateItem(index, {
      product: productId,
      pricing: product ? productDefaultPricing(product) : { dailyRate: '', weeklyRate: '', monthlyRate: '' },
    });
  };

  const addItem = () => {
    onChange({
      ...values,
      items: [
        ...values.items,
        {
          product: '',
          quantity: 1,
          pricing: { dailyRate: '', weeklyRate: '', monthlyRate: '' },
          key: `item-${Date.now()}`,
        },
      ],
    });
  };

  const removeItem = (index) => {
    onChange({ ...values, items: values.items.filter((_, i) => i !== index) });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-stellar-6">
      <Card>
        <Card.Header>
          <Card.Title>Combo details</Card.Title>
        </Card.Header>
        <Card.Content className="grid gap-stellar-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            required
          />
          <Input
            label="Code"
            value={values.code}
            onChange={(e) => setField('code', e.target.value.toUpperCase())}
            required
          />
          <div className="form-group sm:col-span-2">
            <label className="form-label">Description</label>
            <textarea
              className="input min-h-[72px] w-full resize-y"
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="input"
              value={values.status}
              onChange={(e) => setField('status', e.target.value)}
            >
              {COMBO_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Products & pricing</Card.Title>
          <Card.Description>
            Set rental rates for each product (0 is allowed). Leave blank if unused. Combo totals
            are calculated automatically.
          </Card.Description>
        </Card.Header>
        <Card.Content className="space-y-stellar-4">
          {values.items.map((item, index) => (
            <div
              key={item.key || index}
              className="space-y-stellar-3 rounded-stellar-lg border border-stellar-border p-stellar-4"
            >
              <div className="grid gap-stellar-3 sm:grid-cols-12">
                <div className="form-group sm:col-span-7">
                  <SearchableSelect
                    label="Product"
                    value={item.product}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    options={withEmptyOption(
                      toSelectOptions(products, {
                        getLabel: (p) => `${p.name} (${p.sku})`,
                        getKeywords: (p) => `${p.name} ${p.sku}`,
                      }),
                      'Select',
                    )}
                    required
                  />
                </div>
                <div className="form-group sm:col-span-3">
                  <label className="form-label">Qty</label>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: Number(e.target.value) || 1 })}
                  />
                </div>
                <div className="flex items-end sm:col-span-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="!text-stellar-danger w-full"
                    onClick={() => removeItem(index)}
                    disabled={values.items.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div className="grid gap-stellar-3 sm:grid-cols-3">
                {RATE_FIELDS.map(([key, label]) => (
                  <Input
                    key={key}
                    label={`${label} rate`}
                    type="number"
                    min="0"
                    step="1"
                    value={item.pricing?.[key] ?? ''}
                    onChange={(e) => updateItemPricing(index, key, e.target.value)}
                  />
                ))}
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addItem}>
            Add product
          </Button>

          <div className="rounded-stellar-lg border border-stellar-accent/30 bg-stellar-accent/5 p-stellar-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stellar-text-muted">
              Combo total (sum of all products)
            </p>
            <dl className="mt-stellar-3 grid grid-cols-3 gap-stellar-3 text-sm">
              <div>
                <dt className="text-stellar-text-muted">Daily</dt>
                <dd className="mt-stellar-1 font-semibold tabular-nums">{formatMoney(comboTotals.dailyRate)}</dd>
              </div>
              <div>
                <dt className="text-stellar-text-muted">Weekly</dt>
                <dd className="mt-stellar-1 font-semibold tabular-nums">{formatMoney(comboTotals.weeklyRate)}</dd>
              </div>
              <div>
                <dt className="text-stellar-text-muted">Monthly</dt>
                <dd className="mt-stellar-1 font-semibold tabular-nums">{formatMoney(comboTotals.monthlyRate)}</dd>
              </div>
            </dl>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Preview</Card.Title>
          <Card.Description>Automatic price & inventory for sample rental window</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-stellar-4">
          <div className="grid gap-stellar-4 sm:grid-cols-2">
            <div className="form-group">
              <label className="form-label">Preview from</label>
              <input
                type="datetime-local"
                className="input"
                value={values.previewStartAt || ''}
                onChange={(e) => setField('previewStartAt', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Preview until</label>
              <input
                type="datetime-local"
                className="input"
                value={values.previewEndAt || ''}
                onChange={(e) => setField('previewEndAt', e.target.value)}
              />
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={onCalculate} disabled={previewLoading}>
            {previewLoading ? 'Calculating…' : 'Calculate price & availability'}
          </Button>
          <ComboPricingPanel pricing={pricingPreview} loading={previewLoading} />
          <ComboAvailabilityPanel availability={availabilityPreview} loading={previewLoading} />
        </Card.Content>
      </Card>

      <div className="flex flex-col-reverse gap-stellar-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default ComboForm;
