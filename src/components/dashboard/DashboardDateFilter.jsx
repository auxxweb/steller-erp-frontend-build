import { DATE_PERIOD_OPTIONS } from '../../utils/listConstants.js';

const DASHBOARD_PERIOD_OPTIONS = DATE_PERIOD_OPTIONS.filter((o) => o.value !== '');

function DashboardDateFilter({
  period,
  onPeriodChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}) {
  return (
    <div className="rounded-stellar-xl border border-stellar-border bg-stellar-surface p-stellar-4">
      <div className="grid gap-stellar-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="form-group min-w-0">
          <label htmlFor="dashboard-period" className="form-label">
            Date range
          </label>
          <select
            id="dashboard-period"
            className="input input-select w-full"
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
          >
            {DASHBOARD_PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {period === 'custom' && (
          <>
            <div className="form-group">
              <label htmlFor="dashboard-from" className="form-label">
                From
              </label>
              <input
                id="dashboard-from"
                type="date"
                className="input w-full"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dashboard-to" className="form-label">
                To
              </label>
              <input
                id="dashboard-to"
                type="date"
                className="input w-full"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
              />
            </div>
          </>
        )}
      </div>
      <p className="mt-stellar-2 text-xs text-stellar-text-muted">
        Money figures and jobs created follow this range. “Out on rent now” is always live.
      </p>
    </div>
  );
}

export default DashboardDateFilter;
