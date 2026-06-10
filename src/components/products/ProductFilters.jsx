import { PRODUCT_STATUS_OPTIONS } from '../../utils/productConstants.js';

function ProductFilters({
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  branchFilter,
  onBranchChange,
  categories = [],
  branches = [],
  showBranch = false,
}) {
  return (
    <div className="flex flex-col gap-stellar-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="form-group w-full sm:w-40">
        <label htmlFor="product-status" className="form-label">
          Status
        </label>
        <select
          id="product-status"
          className="input w-full"
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
        <div className="form-group w-full sm:w-44">
          <label htmlFor="product-category" className="form-label">
            Category
          </label>
          <select
            id="product-category"
            className="input w-full"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {showBranch && branches.length > 0 && (
        <div className="form-group w-full sm:w-44">
          <label htmlFor="product-branch" className="form-label">
            Branch
          </label>
          <select
            id="product-branch"
            className="input w-full"
            value={branchFilter}
            onChange={(e) => onBranchChange(e.target.value)}
          >
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default ProductFilters;
