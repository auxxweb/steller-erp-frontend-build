import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import { BRANCH_STATUS_OPTIONS } from '../../utils/branchConstants.js';

function SelectField({ label, id, error, children, ...props }) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <select id={id} className={`input ${error ? 'input-error' : ''}`} {...props}>
        {children}
      </select>
          </div>
  );
}

function BranchForm({
  values,
  errors,
  managers = [],
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'Save branch',
}) {
  const setField = (field, value) => onChange({ ...values, [field]: value });

  const setAddress = (field, value) =>
    onChange({
      ...values,
      address: { ...values.address, [field]: value },
    });

  return (
    <form onSubmit={onSubmit} className="space-y-stellar-6" noValidate>
      <Card>
        <Card.Header>
          <Card.Title>Branch details</Card.Title>
          <Card.Description>Name, code, and operational status</Card.Description>
        </Card.Header>
        <Card.Content className="grid gap-stellar-4 sm:grid-cols-2">
          <Input
            label="Branch name"
            name="name"
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            error={errors.name}
            required
            autoComplete="organization"
          />
          <Input
            label="Branch code"
            name="code"
            value={values.code}
            onChange={(e) => setField('code', e.target.value.toUpperCase())}
            error={errors.code}
            hint="Unique identifier, e.g. BLR-01"
            required
          />
          <SelectField
            label="Status"
            id="status"
            name="status"
            value={values.status}
            onChange={(e) => setField('status', e.target.value)}
            error={errors.status}
          >
            {BRANCH_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Manager"
            id="manager"
            name="manager"
            value={values.manager || ''}
            onChange={(e) => setField('manager', e.target.value || '')}
            error={errors.manager}
          >
            <option value="">No manager assigned</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.email})
              </option>
            ))}
          </SelectField>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Contact</Card.Title>
        </Card.Header>
        <Card.Content className="grid gap-stellar-4 sm:grid-cols-2">
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={(e) => setField('phone', e.target.value)}
            error={errors.phone}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            error={errors.email}
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
            name="address.line1"
            value={values.address?.line1 || ''}
            onChange={(e) => setAddress('line1', e.target.value)}
            error={errors['address.line1']}
            wrapperClassName="sm:col-span-2"
            required
          />
          <Input
            label="Address line 2"
            name="address.line2"
            value={values.address?.line2 || ''}
            onChange={(e) => setAddress('line2', e.target.value)}
            wrapperClassName="sm:col-span-2"
          />
          <Input
            label="City"
            name="address.city"
            value={values.address?.city || ''}
            onChange={(e) => setAddress('city', e.target.value)}
          />
          <Input
            label="State"
            name="address.state"
            value={values.address?.state || ''}
            onChange={(e) => setAddress('state', e.target.value)}
          />
          <Input
            label="Postal code"
            name="address.postalCode"
            value={values.address?.postalCode || ''}
            onChange={(e) => setAddress('postalCode', e.target.value)}
          />
          <Input
            label="Country"
            name="address.country"
            value={values.address?.country || 'India'}
            onChange={(e) => setAddress('country', e.target.value)}
          />
        </Card.Content>
      </Card>

      <div className="flex flex-wrap gap-stellar-3">
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
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

export default BranchForm;
