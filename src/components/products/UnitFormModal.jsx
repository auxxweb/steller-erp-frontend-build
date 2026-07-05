import { useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import Input from '../ui/Input.jsx';
import SearchableSelect from '../ui/SearchableSelect.jsx';
import { MultiImageUpload } from '../upload/index.js';
import {
  EMPTY_UNIT_FORM,
  CONDITION_OPTIONS,
  UNIT_STATUS_OPTIONS,
} from '../../utils/productConstants.js';
import { validateUnitForm, hasValidationErrors } from '../../utils/productValidation.js';

function unitImagesToAssets(images) {
  return (images || []).map((img) => ({
    url: img.url,
    publicId: img.publicId,
    thumbnailUrl: img.thumbnailUrl,
    mimeType: img.mimeType,
    createdAt: img.uploadedAt,
  }));
}

function assetsToUnitImages(assets) {
  return (assets || []).slice(0, 2).map((a) => ({
    url: a.url,
    publicId: a.publicId,
    thumbnailUrl: a.thumbnailUrl,
    mimeType: a.mimeType,
    uploadedAt: a.createdAt,
  }));
}

function SelectField({ label, id, value, onChange, children }) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <select id={id} className="input" value={value} onChange={onChange}>
        {children}
      </select>
    </div>
  );
}

function UnitFormModal({ open, unit, productId, onSubmit, onClose, loading }) {
  const [values, setValues] = useState(EMPTY_UNIT_FORM);
  const [imageAssets, setImageAssets] = useState([]);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(unit);

  useEffect(() => {
    if (!open) return;
    if (unit) {
      setValues({
        serialNumber: unit.serialNumber || '',
        condition: unit.condition || EMPTY_UNIT_FORM.condition,
        status: unit.status || EMPTY_UNIT_FORM.status,
        notes: unit.notes || '',
      });
      setImageAssets(unitImagesToAssets(unit.images));
    } else {
      setValues(EMPTY_UNIT_FORM);
      setImageAssets([]);
    }
    setErrors({});
  }, [open, unit]);

  if (!open) return null;

  const setField = (field, val) => setValues((v) => ({ ...v, [field]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateUnitForm(values);
    setErrors(validationErrors);
    if (hasValidationErrors(validationErrors)) return;
    onSubmit({
      ...values,
      ...(isEdit ? { images: assetsToUnitImages(imageAssets) } : {}),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-stellar-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <Card variant="elevated" className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto !p-stellar-6">
        <h2 className="text-lg font-semibold text-stellar-text">
          {isEdit ? 'Edit unit' : 'Add serial unit'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-stellar-4 space-y-stellar-4">
          <Input
            label="Serial number"
            value={values.serialNumber}
            onChange={(e) => setField('serialNumber', e.target.value)}
            error={errors.serialNumber}
            required
            disabled={isEdit}
          />
          <div className="grid gap-stellar-4 sm:grid-cols-2">
            <SearchableSelect
              label="Condition"
              id="condition"
              value={values.condition}
              onChange={(e) => setField('condition', e.target.value)}
              options={CONDITION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            {isEdit && (
              <SelectField
                label="Status"
                id="status"
                value={values.status}
                onChange={(e) => setField('status', e.target.value)}
              >
                {UNIT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectField>
            )}
          </div>
          <Input
            label="Notes"
            value={values.notes}
            onChange={(e) => setField('notes', e.target.value)}
          />
          {isEdit && productId && (
            <div className="border-t border-stellar-border pt-stellar-4">
              <p className="mb-stellar-3 text-xs font-medium text-stellar-text-muted">
                Unit photos (up to 2) — tied to this serial for maintenance and rental tracking.
              </p>
              <MultiImageUpload
                type="unit"
                maxFiles={2}
                meta={{
                  branchId: unit.branch?.id || unit.branch,
                  unitId: unit.id,
                  productId,
                }}
                value={imageAssets}
                onChange={setImageAssets}
                label="Upload unit images"
              />
            </div>
          )}
          <div className="flex justify-end gap-stellar-3 pt-stellar-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              {isEdit ? 'Save' : 'Create & generate QR'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default UnitFormModal;
