import { PRODUCT_STATUS_OPTIONS } from '../../utils/productConstants.js';
import SearchableSelect from '../ui/SearchableSelect.jsx';
import { toSelectOptions, withEmptyOption } from '../../utils/selectOptions.js';

function ProductFilters({
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  categories = [],
}) {
  return (
    <div className="flex flex-col gap-stellar-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="form-group w-full min-w-0 sm:min-w-[12rem] sm:flex-1 sm:max-w-xs">
        <label htmlFor="product-status" className="form-label">
          Status
        </label>
        <select
          id="product-status"
          className="input input-select w-full"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All</option>
          {PRODUCT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {categories.length > 0 && (
        <div className="form-group w-full sm:w-52">
          <SearchableSelect
            id="product-category"
            label="Category"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            options={withEmptyOption(
              toSelectOptions(categories, { getLabel: (c) => c.name }),
              'All categories',
            )}
          />
        </div>
      )}
    </div>
  );
}

export default ProductFilters;
