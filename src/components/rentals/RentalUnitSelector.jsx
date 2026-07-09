import Button from '../ui/Button.jsx';
import SearchableSelect from '../ui/SearchableSelect.jsx';
import { UNIT_STATUS_LABELS, formatUnitSerialLabel, unitSerialKeywords } from '../../utils/productConstants.js';
import { toSelectOptions, withEmptyOption } from '../../utils/selectOptions.js';

function RentalUnitSelector({
  units = [],
  selectedId = '',
  disabledUnitIds = new Set(),
  onSelect,
  onScan,
  label = 'Serial number',
}) {
  if (units.length === 0) {
    return (
      <p className="text-xs text-amber-700">No serial units found for this product.</p>
    );
  }

  const options = withEmptyOption(
    toSelectOptions(units, {
      getLabel: (u) =>
        `${formatUnitSerialLabel(u)} — ${UNIT_STATUS_LABELS[u.status] || u.status}`,
      getKeywords: unitSerialKeywords,
    }).map((opt) => {
      const unit = units.find((u) => String(u.id) === opt.value);
      const taken =
        unit &&
        unit.id?.toString() !== selectedId?.toString() &&
        disabledUnitIds.has(unit.id?.toString());
      return {
        ...opt,
        disabled: unit?.status !== 'available' || taken,
      };
    }),
    'Select serial',
  );

  return (
    <div className="space-y-stellar-2">
      <SearchableSelect
        label={label || undefined}
        value={selectedId || ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="font-mono text-sm"
        options={options}
      />
      {onScan ? (
        <Button type="button" variant="secondary" size="sm" onClick={onScan}>
          Scan QR
        </Button>
      ) : null}
    </div>
  );
}

export default RentalUnitSelector;
