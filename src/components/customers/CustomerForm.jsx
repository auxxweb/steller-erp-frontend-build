import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import { CUSTOMER_TYPE, CUSTOMER_TYPE_OPTIONS } from '../../utils/customerConstants.js';

function SelectField({ label, id, error, value, onChange, children, required }) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-stellar-danger"> *</span>}
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

function CustomerForm({
  values,
  errors = {},
  branches = [],
  showBranchField = false,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}) {
  const isBusiness = values.customerType === CUSTOMER_TYPE.BUSINESS;
  const setField = (field, val) => onChange({ ...values, [field]: val });
  const setAddress = (field, val) =>
    onChange({
      ...values,
      address: { ...values.address, [field]: val },
    });

  return (
    <form onSubmit={onSubmit} className="space-y-stellar-6" noValidate>
      <Card>
        <Card.Header>
          <Card.Title>Customer type</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-wrap gap-stellar-3">
            {CUSTOMER_TYPE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-stellar-2 text-sm">
                <input
                  type="radio"
                  name="customerType"
                  checked={values.customerType === opt.value}
                  onChange={() => setField('customerType', opt.value)}
                  className="h-4 w-4 accent-stellar-accent"
                />
                <span className="text-sm font-medium text-stellar-text">{opt.label}</span>
              </label>
            ))}
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Contact details</Card.Title>
        </Card.Header>
        <Card.Content className="grid gap-stellar-4 sm:grid-cols-2">
          {showBranchField && (
            <SelectField
              label="Branch"
              id="branch"
              error={errors.branch}
              value={values.branch}
              onChange={(e) => setField('branch', e.target.value)}
              required
            >
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </SelectField>
          )}
          <Input
            label={isBusiness ? 'Contact name' : 'Full name'}
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            error={errors.name}
            wrapperClassName={showBranchField ? '' : 'sm:col-span-2'}
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={values.phone}
            onChange={(e) => setField('phone', e.target.value)}
            error={errors.phone}
            hint="Shared across all branches — each phone can only belong to one customer."
            required
          />
          <Input
            label="Alternate phone"
            type="tel"
            value={values.alternatePhone}
            onChange={(e) => setField('alternatePhone', e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            error={errors.email}
            hint="Optional, but must be unique project-wide if provided."
            wrapperClassName="sm:col-span-2"
          />
          {isBusiness && (
            <>
              <Input
                label="Company"
                value={values.company}
                onChange={(e) => setField('company', e.target.value)}
                error={errors.company}
                required
              />
              <Input
                label="GSTIN"
                value={values.gstin}
                onChange={(e) => setField('gstin', e.target.value.toUpperCase())}
                error={errors.gstin}
                hint="15 characters"
              />
            </>
          )}
          <Input
            label="Credit limit (₹)"
            type="number"
            min="0"
            value={values.creditLimit}
            onChange={(e) => setField('creditLimit', e.target.value)}
            error={errors.creditLimit}
          />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Address</Card.Title>
        </Card.Header>
        <Card.Content className="grid gap-stellar-4 sm:grid-cols-2">
          <Input
            label="Address line 1"
            value={values.address?.line1}
            onChange={(e) => setAddress('line1', e.target.value)}
            wrapperClassName="sm:col-span-2"
          />
          <Input
            label="Address line 2"
            value={values.address?.line2}
            onChange={(e) => setAddress('line2', e.target.value)}
            wrapperClassName="sm:col-span-2"
          />
          <Input
            label="City"
            value={values.address?.city}
            onChange={(e) => setAddress('city', e.target.value)}
          />
          <Input
            label="State"
            value={values.address?.state}
            onChange={(e) => setAddress('state', e.target.value)}
          />
          <Input
            label="PIN code"
            value={values.address?.pincode}
            onChange={(e) => setAddress('pincode', e.target.value)}
          />
          <Input
            label="Country"
            value={values.address?.country}
            onChange={(e) => setAddress('country', e.target.value)}
          />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>ID proof (optional)</Card.Title>
          <Card.Description>Add details now; upload documents from the customer profile.</Card.Description>
        </Card.Header>
        <Card.Content className="grid gap-stellar-4 sm:grid-cols-2">
          <SelectField
            label="ID type"
            id="idProofType"
            value={values.idProofType}
            onChange={(e) => setField('idProofType', e.target.value)}
          >
            <option value="">—</option>
            {[
              { value: 'aadhaar', label: 'Aadhaar' },
              { value: 'pan', label: 'PAN' },
              { value: 'passport', label: 'Passport' },
              { value: 'driving_license', label: 'Driving license' },
              { value: 'voter_id', label: 'Voter ID' },
              { value: 'other', label: 'Other' },
            ].map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
          <Input
            label="ID number"
            value={values.idProofNumber}
            onChange={(e) => setField('idProofNumber', e.target.value)}
          />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Notes</Card.Title>
        </Card.Header>
        <Card.Content>
          <textarea
            className="input min-h-[100px] w-full resize-y"
            value={values.notes}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="Internal notes about this customer…"
          />
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

export default CustomerForm;
