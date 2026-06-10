import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import { MultiImageUpload } from '../upload/index.js';
import {
  COMMON_INVENTORY_BRANCH_CODE,
  COMMON_INVENTORY_VALUE,
  PRODUCT_STATUS_OPTIONS,
} from '../../utils/productConstants.js';
import SerialUnitGroupsField from './SerialUnitGroupsField.jsx';

function SelectField({ label, id, error, value, onChange, children }) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <select
        id={id}
        className={`input ${error ? 'input-error' : ''}`}
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

function ProductForm({
  values,
  errors,
  categories = [],
  branches = [],
  showBranchField = false,
  imageAssets = [],
  onChange,
  onImagesChange,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  productId,
  branchId,
}) {
  const setField = (field, val) => onChange({ ...values, [field]: val });
  const setPricingGroup = (group, field, val) =>
    onChange({
      ...values,
      pricing: {
        ...values.pricing,
        [group]: { ...(values.pricing?.[group] || {}), [field]: val },
      },
    });

  const handleImagesChange = (assets) => {
    onImagesChange?.(assets);
    const urls = assets.map((a) => (typeof a === 'string' ? a : a.url)).filter(Boolean);
    setField('images', urls);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-stellar-6" noValidate>
      <Card>
        <Card.Header>
          <Card.Title>Product information</Card.Title>
        </Card.Header>
        <Card.Content className="grid gap-stellar-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            error={errors.name}
            wrapperClassName="sm:col-span-2"
            required
          />
          <Input
            label="Brand"
            value={values.brand}
            onChange={(e) => setField('brand', e.target.value)}
          />
          <Input
            label="Model"
            value={values.model}
            onChange={(e) => setField('model', e.target.value)}
          />
          <Input
            label="SKU"
            hint="Leave blank to auto-generate"
            value={values.sku}
            onChange={(e) => setField('sku', e.target.value.toUpperCase())}
          />
          <SelectField
            label="Category"
            id="category"
            error={errors.category}
            value={values.category}
            onChange={(e) => setField('category', e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Status"
            id="status"
            value={values.status}
            onChange={(e) => setField('status', e.target.value)}
          >
            {PRODUCT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
          {showBranchField && (
            <div className="form-group">
              <SelectField
                label="Inventory"
                id="branch"
                value={values.branch}
                onChange={(e) => setField('branch', e.target.value)}
                error={errors.branch}
              >
                <option value={COMMON_INVENTORY_VALUE}>Shared catalog (all branches)</option>
                {branches
                  .filter((b) => b.code !== COMMON_INVENTORY_BRANCH_CODE)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
              </SelectField>
              {values.branch === COMMON_INVENTORY_VALUE && (
                <p className="mt-stellar-1 text-xs text-stellar-text-muted">
                  All products and serials are available to every branch and employee. This field
                  is the default storage location label only — it does not restrict who can rent
                  the item.
                </p>
              )}
            </div>
          )}
          <div className="form-group sm:col-span-2">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              className="textarea"
              rows={4}
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Pricing (INR)</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-stellar-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stellar-text-muted">
              Individual price (per unit)
            </p>
            <div className="mt-stellar-3 grid gap-stellar-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['dailyRate', 'Daily'],
                ['weeklyRate', 'Weekly'],
                ['monthlyRate', 'Monthly'],
              ].map(([key, label]) => (
                <Input
                  key={`ind.${key}`}
                  label={label}
                  type="number"
                  min="0"
                  step="1"
                  value={values.pricing?.individual?.[key] ?? ''}
                  onChange={(e) => setPricingGroup('individual', key, e.target.value)}
                  error={errors[`pricing.individual.${key}`]}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stellar-text-muted">
              Combo price (bundle / package)
            </p>
            <div className="mt-stellar-3 grid gap-stellar-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['dailyRate', 'Daily'],
                ['weeklyRate', 'Weekly'],
                ['monthlyRate', 'Monthly'],
              ].map(([key, label]) => (
                <Input
                  key={`combo.${key}`}
                  label={label}
                  type="number"
                  min="0"
                  step="1"
                  value={values.pricing?.combo?.[key] ?? ''}
                  onChange={(e) => setPricingGroup('combo', key, e.target.value)}
                  error={errors[`pricing.combo.${key}`]}
                />
              ))}
            </div>
          </div>

          {/* Deposit and sale price are intentionally omitted */}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Advance payment</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-stellar-4">
          <label className="flex items-center gap-stellar-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(values.advancePayment?.required)}
              onChange={(e) =>
                setField('advancePayment', {
                  required: e.target.checked,
                  percentage: e.target.checked ? values.advancePayment?.percentage ?? '' : '',
                })
              }
            />
            Requires advance payment
          </label>
          {values.advancePayment?.required && (
            <Input
              label="Advance percentage (%)"
              type="number"
              min="0"
              max="100"
              step="1"
              value={values.advancePayment?.percentage ?? ''}
              onChange={(e) =>
                setField('advancePayment', {
                  required: true,
                  percentage: e.target.value,
                })
              }
              error={errors['advancePayment.percentage']}
              required
            />
          )}
        </Card.Content>
      </Card>

      {!productId && (
        <SerialUnitGroupsField
          value={values.serialUnits}
          onChange={(val) => setField('serialUnits', val)}
          errors={errors.serialUnits}
          disabled={isSubmitting}
        />
      )}

      <Card>
        <Card.Header>
          <Card.Title>Images</Card.Title>
        </Card.Header>
        <Card.Content>
          <MultiImageUpload
            type="product"
            meta={{ branchId: branchId || values.branch, productId }}
            value={imageAssets.length ? imageAssets : values.images?.map((url) => ({ url }))}
            onChange={handleImagesChange}
          />
        </Card.Content>
      </Card>

      <div className="flex flex-wrap gap-stellar-3">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export default ProductForm;
