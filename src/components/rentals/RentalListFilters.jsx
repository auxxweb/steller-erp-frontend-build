import ListFiltersBar from '../ui/ListFiltersBar.jsx';
import { RENTAL_STATUS_OPTIONS } from '../../utils/rentalConstants.js';

function RentalListFilters({
  idPrefix = 'rental-list',
  search,
  onSearchChange,
  onSearchSubmit,
  period,
  onPeriodChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  statusFilter,
  onStatusChange,
  statusOptions = RENTAL_STATUS_OPTIONS,
  allStatusLabel = 'All statuses',
  searchPlaceholder = 'Search booking #, customer, phone, product SKU, serial…',
}) {
  return (
    <ListFiltersBar
      idPrefix={idPrefix}
      search={search}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      searchPlaceholder={searchPlaceholder}
      period={period}
      onPeriodChange={onPeriodChange}
      dateFrom={dateFrom}
      dateTo={dateTo}
      onDateFromChange={onDateFromChange}
      onDateToChange={onDateToChange}
      showSubmit={false}
    >
      <div className="form-group min-w-0">
        <label htmlFor={`${idPrefix}-status`} className="form-label">
          Status
        </label>
        <select
          id={`${idPrefix}-status`}
          className="input input-select w-full"
          value={statusFilter}
          onChange={(e) => onStatusChange?.(e.target.value)}
        >
          <option value="">{allStatusLabel}</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </ListFiltersBar>
  );
}

export default RentalListFilters;
