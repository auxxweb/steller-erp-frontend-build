import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import ComboTable from '../../components/combos/ComboTable.jsx';
import ComboStatsCards from '../../components/combos/ComboStatsCards.jsx';
import {
  COMBO_STATUS_OPTIONS,
} from '../../utils/comboConstants.js';
import useComboBasePath, { useCanManageCombos } from '../../hooks/useComboBasePath.js';
import { fetchCombos, fetchComboStats, deleteCombo } from '../../services/comboService.js';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import useListFilters from '../../hooks/useListFilters.js';

function ComboListPage() {
  const basePath = useComboBasePath();
  const canManage = useCanManageCombos();

  const [combos, setCombos] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const {
    search,
    setSearch,
    period,
    setPeriod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    dateParams,
  } = useListFilters();
  const [statusFilter, setStatusFilter] = useState('');
  const location = useLocation();
    const loadCombos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchCombos({
        page,
        limit: 10,
        status: statusFilter || undefined,
        ...dateParams,
      });
      setCombos(data.data.combos);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load combos');
    } finally {
      setLoading(false);
    }
  }, [page, dateParams, statusFilter]);

  useEffect(() => {
    loadCombos();
  }, [loadCombos]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      try {
        const { data } = await fetchComboStats({});
        if (!cancelled) setStats(data.data.stats);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadCombos();
  };

  const handleDelete = async (combo) => {
    if (!window.confirm(`Delete combo "${combo.name}"?`)) return;
    try {
      const { data } = await deleteCombo(combo.id);
      toast.success(data.message);
      loadCombos();
      const statsRes = await fetchComboStats({});
      setStats(statsRes.data.data.stats);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Delete failed'));
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div className="flex flex-col gap-stellar-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stellar-text">Combos</h1>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            Bundle products with custom pricing.
          </p>
        </div>
        {canManage && (
          <Link to={`${basePath}/new`}>
            <Button>New combo</Button>
          </Link>
        )}
      </div>

      

      <ComboStatsCards stats={stats} loading={statsLoading} />

      <Card>
        <Card.Content>
          <form onSubmit={handleSearch} className="space-y-stellar-4">
            <ListFiltersBar
              idPrefix="combo"
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search name or code…"
              period={period}
              onPeriodChange={(v) => {
                setPeriod(v);
                setPage(1);
              }}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              showSubmit={false}
            >
              <div className="form-group">
                <label htmlFor="combo-status" className="form-label">
                  Status
                </label>
                <select
                  id="combo-status"
                  className="input w-full"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All statuses</option>
                  {COMBO_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </ListFiltersBar>
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
        </Card.Content>
      </Card>

            <Card>
        <ComboTable
          combos={combos}
          loading={loading}
          basePath={basePath}
          canManage={canManage}
          onDelete={canManage ? handleDelete : undefined}
        />
        <PaginationBar pagination={pagination} page={page} onPageChange={setPage} />
      </Card>
    </div>
  );
}

export default ComboListPage;
