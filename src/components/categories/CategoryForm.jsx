import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import CategoryImageUpload from '../upload/CategoryImageUpload.jsx';
import { CATEGORY_STATUS_OPTIONS } from '../../utils/categoryConstants.js';

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

function CategoryForm({
  values,
  errors,
  slugPreview,
  onChange,
  onSlugManualEdit,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'Save category',
}) {
  const setField = (field, value) => onChange({ ...values, [field]: value });

  return (
    <form onSubmit={onSubmit} className="space-y-stellar-6" noValidate>
      <Card>
        <Card.Header>
          <Card.Title>Category details</Card.Title>
          <Card.Description>
            Shared across all branches.
          </Card.Description>
        </Card.Header>
        <Card.Content className="grid gap-stellar-4 sm:grid-cols-2">
          <Input
            label="Name"
            name="name"
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            error={errors.name}
            required
          />
          <Input
            label="Slug"
            name="slug"
            value={values.slug}
            onChange={(e) => {
              onSlugManualEdit?.();
              setField('slug', e.target.value.toLowerCase());
            }}
            error={errors.slug}
            hint={slugPreview ? `Preview: ${slugPreview}` : 'Auto-generated from name if empty'}
          />
          <SelectField
            label="Status"
            id="status"
            name="status"
            value={values.status}
            onChange={(e) => setField('status', e.target.value)}
            error={errors.status}
          >
            {CATEGORY_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectField>
          <div className="form-group sm:col-span-2">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className={`textarea ${errors.description ? 'input-error' : ''}`}
              rows={4}
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
              maxLength={500}
            />
            {errors.description && (
              <p className="form-error" role="alert">
                {errors.description}
              </p>
            )}
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Image</Card.Title>
          <Card.Description>Upload to Cloudinary or paste a URL</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-stellar-4">
          <CategoryImageUpload
            value={values.image}
            onChange={(url) => setField('image', url)}
            meta={{
              branchId: values.branch || undefined,
              categoryId: values.id,
            }}
          />
          <Input
            label="Or image URL"
            name="image"
            type="url"
            value={values.image}
            onChange={(e) => setField('image', e.target.value)}
            error={errors.image}
            placeholder="https://res.cloudinary.com/…"
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

export default CategoryForm;
