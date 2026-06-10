/** Build API query params for search + date period filters. */
export function buildDatePeriodParams({ search, period, dateFrom, dateTo }) {
  const params = {};
  const term = search?.trim();
  if (term) params.search = term;
  if (period) {
    params.period = period;
    if (period === 'custom') {
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
    }
  }
  return params;
}
