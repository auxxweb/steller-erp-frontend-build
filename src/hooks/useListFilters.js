import { useEffect, useMemo, useState } from 'react';
import { buildDatePeriodParams } from '../utils/listQueryParams.js';

/**
 * Shared search + date period state for list pages.
 * Search is debounced before it enters `dateParams` to avoid API storms on keystroke.
 */
export function useListFilters({ initialSearch = '', searchDebounceMs = 350 } = {}) {
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [period, setPeriod] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), searchDebounceMs);
    return () => window.clearTimeout(timer);
  }, [search, searchDebounceMs]);

  const dateParams = useMemo(
    () => buildDatePeriodParams({ search: debouncedSearch, period, dateFrom, dateTo }),
    [debouncedSearch, period, dateFrom, dateTo],
  );

  return {
    search,
    setSearch,
    debouncedSearch,
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
