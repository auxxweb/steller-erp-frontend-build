import { useMemo } from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

const makeKey = () => `u_${Date.now()}_${Math.random().toString(16).slice(2)}`;
const emptyUnit = () => ({ _key: makeKey(), serialNumber: '', imageFiles: [] });

function SerialUnitGroupsField({ value = [], onChange, disabled = false, errors = {} }) {
  const unitsRaw = Array.isArray(value) && value.length ? value : [emptyUnit()];
  const units = unitsRaw.map((u) => (u?._key ? u : { ...u, _key: makeKey() }));

  const serials = useMemo(
    () => units.map((u) => (u.serialNumber || '').trim()).filter(Boolean),
    [units],
  );
  const duplicates = useMemo(() => {
    const seen = new Set();
    const dup = new Set();
    serials.forEach((s) => {
      const key = s.toLowerCase();
      if (seen.has(key)) dup.add(key);
      seen.add(key);
    });
    return dup;
  }, [serials]);

  const setUnit = (idx, patch) => {
    const next = units.map((u, i) => (i === idx ? { ...u, ...patch } : u));
    onChange(next);
  };

  const addUnit = () => onChange([...units, emptyUnit()]);
  const removeUnit = (idx) => {
    const next = units.filter((_, i) => i !== idx);
    onChange(next.length ? next : [emptyUnit()]);
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Serial units</Card.Title>
        <Card.Description>
          Add each physical unit separately. Each unit can have up to 2 images and gets a unique QR
          code after creation.
        </Card.Description>
      </Card.Header>
      <Card.Content className="space-y-stellar-4">
        <div className="space-y-stellar-4">
          {units.map((u, idx) => {
            const serial = (u.serialNumber || '').trim();
            const serialKey = serial.toLowerCase();
            const serialDup = serial && duplicates.has(serialKey);
            const serialError = errors?.[idx]?.serialNumber || (serialDup ? 'Duplicate serial number' : '');
            const fileError = errors?.[idx]?.images;

            return (
              <div
                key={u._key}
                className="rounded-stellar-xl border border-stellar-border bg-stellar-surface p-stellar-4 sm:p-stellar-5"
              >
                <div className="flex flex-col gap-stellar-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stellar-text-muted">
                      Unit {idx + 1}
                    </p>
                    <div className="mt-stellar-3 grid gap-stellar-4 md:grid-cols-2">
                      <Input
                        label="Serial number"
                        wrapperClassName="min-w-0"
                        value={u.serialNumber}
                        onChange={(e) => setUnit(idx, { serialNumber: e.target.value })}
                        error={serialError}
                        disabled={disabled}
                        required
                      />
                      <div className="form-group min-w-0">
                        <label className="form-label">Images (max 2)</label>
                        <input
                          type="file"
                          className="input w-full min-w-0 max-w-full text-sm file:mr-stellar-3 file:rounded-md file:border-0 file:bg-stellar-surface-muted file:px-stellar-3 file:py-stellar-2 file:text-sm"
                          accept="image/*"
                          multiple
                          disabled={disabled}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []).slice(0, 2);
                            setUnit(idx, { imageFiles: files });
                          }}
                        />
                        {fileError && <p className="form-error">{fileError}</p>}
                        {u.imageFiles?.length ? (
                          <p className="mt-stellar-2 text-xs text-stellar-text-muted">
                            {u.imageFiles.length}/2 selected
                          </p>
                        ) : (
                          <p className="mt-stellar-2 text-xs text-stellar-text-muted">
                            Optional. You can also upload later from the Units page.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-stellar-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={addUnit}
                      disabled={disabled}
                    >
                      Add more
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="!text-stellar-danger"
                      onClick={() => removeUnit(idx)}
                      disabled={disabled || units.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card.Content>
    </Card>
  );
}

export default SerialUnitGroupsField;

