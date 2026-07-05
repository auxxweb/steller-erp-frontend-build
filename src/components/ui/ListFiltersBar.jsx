import Button from './Button.jsx';
import { DATE_PERIOD_OPTIONS } from '../../utils/listConstants.js';

/**
 * Search + date period filters for list pages.
 * Pass `children` for extra selects (status, branch, etc.).
 */
function ListFiltersBar({
  idPrefix = 'list',
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search…',
  period = '',
  onPeriodChange,
  dateFrom = '',
  dateTo = '',
  onDateFromChange,
  onDateToChange,
  onSubmit,
  submitLabel = 'Apply',
  showSubmit = true,
  showSearch = true,
  showDateFilters = true,
  className = '',
  children,
  extraFilters,
}) {
  const content = (
    <div className={`space-y-stellar-4 ${className}`}>
      <div
        className={`grid gap-stellar-4 ${
          showDateFilters
            ? showSearch
              ? 'sm:grid-cols-2 lg:grid-cols-4'
              : 'sm:grid-cols-2 lg:grid-cols-3'
            : showSearch
              ? 'sm:grid-cols-2 lg:grid-cols-3'
              : 'sm:grid-cols-2'
        }`}
      >
        {showSearch && (
          <div className="form-group sm:col-span-2">
            <label htmlFor={`${idPrefix}-search`} className="form-label">
              Search
            </label>
            <input
              id={`${idPrefix}-search`}
              type="search"
              className="input w-full"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        )}
        {showDateFilters && (
          <div className="form-group">
            <label htmlFor={`${idPrefix}-period`} className="form-label">
              Date
            </label>
            <select
              id={`${idPrefix}-period`}
              className="input w-full"
              value={period}
              onChange={(e) => onPeriodChange?.(e.target.value)}
            >
              {DATE_PERIOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {children}
        {extraFilters}
      </div>
      {showDateFilters && period === 'custom' && (
        <div className="grid gap-stellar-3 sm:grid-cols-2">
          <div className="form-group">
            <label htmlFor={`${idPrefix}-from`} className="form-label">
              From
            </label>
            <input
              id={`${idPrefix}-from`}
              type="date"
              className="input w-full"
              value={dateFrom}
              onChange={(e) => onDateFromChange?.(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor={`${idPrefix}-to`} className="form-label">
              To
            </label>
            <input
              id={`${idPrefix}-to`}
              type="date"
              className="input w-full"
              value={dateTo}
              onChange={(e) => onDateToChange?.(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );

  if (onSubmit) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
        className="space-y-stellar-3"
      >
        {content}
        {showSubmit && (
          <Button type="submit" variant="secondary" className="w-full sm:w-auto">
            {submitLabel}
          </Button>
        )}
      </form>
    );
  }

  return content;
}

export default ListFiltersBar;
