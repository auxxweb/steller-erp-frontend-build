import {
  CUSTOMER_STATUS_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
  RISK_LEVEL_OPTIONS,
} from '../../utils/customerConstants.js';

function CustomerFilters({
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  riskFilter,
  onRiskChange,
  branchFilter,
  onBranchChange,
  branches = [],
  showBranch,
}) {
  return (
    <div className="grid gap-stellar-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
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
      <div className="form-group">
        <label htmlFor="customer-type" className="form-label">
          Type
        </label>
        <select
          id="customer-type"
          className="input"
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          <option value="">All types</option>
          {CUSTOMER_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="customer-risk" className="form-label">
          Risk
        </label>
        <select
          id="customer-risk"
          className="input"
          value={riskFilter}
          onChange={(e) => onRiskChange(e.target.value)}
        >
          <option value="">All risk levels</option>
          {RISK_LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {showBranch && (
        <div className="form-group">
          <label htmlFor="customer-branch" className="form-label">
            Branch
          </label>
          <select
            id="customer-branch"
            className="input"
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

export default CustomerFilters;
