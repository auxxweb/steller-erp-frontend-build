import {
  CUSTOMER_STATUS_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
  RISK_LEVEL_OPTIONS,
} from '../../utils/customerConstants.js';
import SearchableSelect from '../ui/SearchableSelect.jsx';
import { withEmptyOption } from '../../utils/selectOptions.js';

function CustomerFilters({
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  riskFilter,
  onRiskChange,
}) {
  return (
    <div className="grid gap-stellar-3 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
      <div className="form-group">
        <label htmlFor="customer-status" className="form-label">
          Status
        </label>
        <select
          id="customer-status"
          className="input"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All statuses</option>
          {CUSTOMER_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <SearchableSelect
        id="customer-type"
        label="Type"
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value)}
        options={withEmptyOption(
          CUSTOMER_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
          'All types',
        )}
      />
      <SearchableSelect
        id="customer-risk"
        label="Risk"
        value={riskFilter}
        onChange={(e) => onRiskChange(e.target.value)}
        options={withEmptyOption(
          RISK_LEVEL_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
          'All risk levels',
        )}
      />
    </div>
  );
}

export default CustomerFilters;
