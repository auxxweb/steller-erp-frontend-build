import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import ComboPricingPanel from './ComboPricingPanel.jsx';
import ComboAvailabilityPanel from './ComboAvailabilityPanel.jsx';
import {
  COMBO_STATUS_OPTIONS,
  COMBO_PRICING_RULE_OPTIONS,
  COMBO_PRICING_RULE,
  COMMON_INVENTORY_VALUE,
  COMMON_INVENTORY_BRANCH_CODE,
} from '../../utils/comboConstants.js';

function ComboForm({
  values,
  products,
  showBranchField,
  branches,
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
  const setPricing = (field, val) =>
    onChange({
      ...values,
      pricing: { ...values.pricing, [field]: val },
    });

  const updateItem = (index, field, val) => {
    const items = values.items.map((item, i) =>
      i === index ? { ...item, [field]: val } : item,
    );
    onChange({ ...values, items });
  };

  const addItem = () => {
    onChange({
      ...values,
      items: [...values.items, { product: '', quantity: 1, key: `item-${Date.now()}` }],
    });
  };

  const removeItem = (index) => {
    onChange({ ...values, items: values.items.filter((_, i) => i !== index) });
  };

  const selectedRule = COMBO_PRICING_RULE_OPTIONS.find((r) => r.value === values.pricingRule);
  const showDiscount =
    values.pricingRule === COMBO_PRICING_RULE.SUM_WITH_DISCOUNT ||
    values.pricingRule === COMBO_PRICING_RULE.SUM_PRODUCTS;
  const showFixedRates = values.pricingRule === COMBO_PRICING_RULE.FIXED_BUNDLE;

  return (
    <form onSubmit={onSubmit} className="space-y-stellar-6">
      <Card>
        <Card.Header>
          <Card.Title>Combo details</Card.Title>
        </Card.Header>
        <Card.Content className="grid gap-stellar-4 sm:grid-cols-2">
          {showBranchField && (
            <div className="form-group sm:col-span-2">
              <label className="form-label">Combo scope</label>
              <select
                className="input"
                value={values.branch}
                onChange={(e) => setField('branch', e.target.value)}
                required
              >
                <option value="">Select scope</option>
                <option value={COMMON_INVENTORY_VALUE}>Shared catalog (all branches)</option>
                {branches
                  .filter((b) => b.code !== COMMON_INVENTORY_BRANCH_CODE)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
              </select>
              {values.branch === COMMON_INVENTORY_VALUE && (
                <p className="mt-stellar-1 text-xs text-stellar-text-muted">
                  This combo is available when booking rentals at any branch.
                </p>
              )}
            </div>
          )}
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
          <Card.Title>Products in combo</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-stellar-3">
          {values.items.map((item, index) => (
            <div
              key={item.key || index}
              className="grid gap-stellar-3 rounded-stellar-lg border border-stellar-border p-stellar-3 sm:grid-cols-12"
            >
              <div className="form-group sm:col-span-7">
                <label className="form-label">Product</label>
                <select
                  className="input"
                  value={item.product}
                  onChange={(e) => updateItem(index, 'product', e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group sm:col-span-3">
                <label className="form-label">Qty</label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value) || 1)}
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
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addItem}>
            Add product
          </Button>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Pricing rules</Card.Title>
          <Card.Description>{selectedRule?.description}</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-stellar-4">
          <div className="space-y-stellar-2">
            {COMBO_PRICING_RULE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer gap-stellar-3 rounded-stellar-lg border p-stellar-3 ${
                  values.pricingRule === opt.value
                    ? 'border-stellar-accent bg-stellar-accent/5'
                    : 'border-stellar-border'
                }`}
              >
                <input
                  type="radio"
                  name="pricingRule"
                  value={opt.value}
                  checked={values.pricingRule === opt.value}
                  onChange={() => setField('pricingRule', opt.value)}
                  className="mt-0.5"
                />
                <span>
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className="mt-stellar-1 block text-xs text-stellar-text-muted">
                    {opt.description}
                  </span>
                </span>
              </label>
            ))}
          </div>

          {showDiscount && (
            <div className="grid gap-stellar-4 sm:grid-cols-2">
              <Input
                label="Discount %"
                type="number"
                min="0"
                max="100"
                value={values.pricing.discountPercent}
                onChange={(e) => setPricing('discountPercent', e.target.value)}
              />
              <Input
                label="Flat discount (₹)"
                type="number"
                min="0"
                value={values.pricing.discountAmount}
                onChange={(e) => setPricing('discountAmount', e.target.value)}
              />
            </div>
          )}

          {showFixedRates && (
            <div className="grid gap-stellar-4 sm:grid-cols-2">
              <Input
                label="Daily bundle rate (₹)"
                type="number"
                min="0"
                value={values.pricing.dailyRate}
                onChange={(e) => setPricing('dailyRate', e.target.value)}
              />
              <Input
                label="Weekly rate (₹)"
                type="number"
                min="0"
                value={values.pricing.weeklyRate}
                onChange={(e) => setPricing('weeklyRate', e.target.value)}
              />
              <Input
                label="Monthly rate (₹)"
                type="number"
                min="0"
                value={values.pricing.monthlyRate}
                onChange={(e) => setPricing('monthlyRate', e.target.value)}
              />
            </div>
          )}

          <Input
            label="Deposit (₹)"
            type="number"
            min="0"
            value={values.pricing.depositAmount}
            onChange={(e) => setPricing('depositAmount', e.target.value)}
          />
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
