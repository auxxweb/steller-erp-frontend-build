import { useMemo, useState } from 'react';
import { buildDatePeriodParams } from '../utils/listQueryParams.js';

/**
 * Shared search + date period state for list pages.
 */
export function useListFilters({ initialSearch = '' } = {}) {
  const [search, setSearch] = useState(initialSearch);
  const [period, setPeriod] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const dateParams = useMemo(
    () => buildDatePeriodParams({ search, period, dateFrom, dateTo }),
    [search, period, dateFrom, dateTo],
  );

  return {
    search,
    setSearch,
    period,
    setPeriod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    dateParams,
  };
}

export default useListFilters;
