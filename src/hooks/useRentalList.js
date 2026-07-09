import { useCallback, useMemo, useState } from 'react';
import { fetchRentals } from '../services/rentalService.js';
import useListFilters from './useListFilters.js';
import useFilterPageEffect from './useFilterPageEffect.js';

/**
 * Paginated rental list with on-demand search and date/status filters.
 */
export function useRentalList({
  defaultStatuses = [],
  rentalType,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  limit = 15,
  initialStatus = '',
  dateField = 'createdAt',
} = {}) {
  const [rentals, setRentals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const {
    search,
    setSearch,
    submitSearch,
    period,
    setPeriod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    dateParams,
  } = useListFilters();

  // Join to a string so callers can pass inline arrays without retriggering effects.
  const defaultStatusKey = defaultStatuses.length ? defaultStatuses.join(',') : '';

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        dateParams,
        statusFilter,
        defaultStatusKey,
        rentalType,
        sortBy,
        sortOrder,
        dateField,
      }),
    [dateParams, statusFilter, defaultStatusKey, rentalType, sortBy, sortOrder, dateField],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
        ...dateParams,
      };
      if (statusFilter) {
        params.status = statusFilter;
      } else if (defaultStatusKey) {
        params.status = defaultStatusKey;
      }
      if (rentalType) params.rentalType = rentalType;
      if (dateField) params.dateField = dateField;

      const { data } = await fetchRentals(params);
      setRentals(data.data.rentals || []);
      setPagination(data.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      setRentals([]);
      setPagination({ page: 1, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateParams, defaultStatusKey, rentalType, sortBy, sortOrder, limit, dateField]);

  useFilterPageEffect({ filterKey, page, setPage, load });

  const resetPage = () => setPage(1);

  return {
    rentals,
    pagination,
    page,
    setPage,
    loading,
    search,
    setSearch,
    submitSearch,
    period,
    setPeriod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    statusFilter,
    setStatusFilter,
    resetPage,
    reload: load,
  };
}

export default useRentalList;
