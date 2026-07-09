import { useCallback, useMemo, useState } from 'react';
import { buildDatePeriodParams } from '../utils/listQueryParams.js';

/**
 * Shared search + date period state for list pages.
 * Text search is applied only when `submitSearch()` is called (search icon / Enter).
 */
export function useListFilters({ initialSearch = '' } = {}) {
  const [search, setSearch] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);
  const [period, setPeriod] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const submitSearch = useCallback(() => {
    setAppliedSearch(search.trim());
  }, [search]);

  const dateParams = useMemo(
    () => buildDatePeriodParams({ search: appliedSearch, period, dateFrom, dateTo }),
    [appliedSearch, period, dateFrom, dateTo],
  );

  return {
    search,
    setSearch,
    appliedSearch,
    submitSearch,
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
