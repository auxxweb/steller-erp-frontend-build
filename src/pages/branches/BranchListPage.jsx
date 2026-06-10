import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import BranchTable from '../../components/branches/BranchTable.jsx';
import BranchStatsCards from '../../components/branches/BranchStatsCards.jsx';
import DeleteBranchModal from '../../components/branches/DeleteBranchModal.jsx';
import { BRANCH_STATUS_OPTIONS } from '../../utils/branchConstants.js';
import {
  fetchBranches,
  fetchBranchStats,
  deleteBranch,
} from '../../services/branchService.js';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import useListFilters from '../../hooks/useListFilters.js';

function BranchListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
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
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadBranches = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchBranches({
        page,
        limit: 10,
        status: statusFilter || undefined,
        ...dateParams,
      });
      setBranches(data.data.branches);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load branches'));
    } finally {
      setLoading(false);
    }
  }, [page, dateParams, statusFilter]);

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.message, location.pathname, navigate]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      try {
        const { data } = await fetchBranchStats();
        if (!cancelled) setStats(data.data.stats);
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadBranches();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data } = await deleteBranch(deleteTarget.id);
      toast.success(data.message);
      setDeleteTarget(null);
      loadBranches();
      const statsRes = await fetchBranchStats();
      setStats(statsRes.data.data.stats);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Delete failed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div className="flex flex-col gap-stellar-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">
            Branches
          </h1>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            Manage rental locations, contacts, and status.
          </p>
        </div>
        <Link to="/admin/branches/new" className="btn btn-primary btn-md">
          Add branch
        </Link>
      </div>

      <BranchStatsCards stats={stats} loading={statsLoading} />

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-stellar-border p-stellar-4 sm:p-stellar-5">
          <form onSubmit={handleSearchSubmit} className="space-y-stellar-4">
            <ListFiltersBar
              idPrefix="branch"
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Name, code, phone, email…"
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
                <label htmlFor="branch-status" className="form-label">
                  Status
                </label>
                <select
                  id="branch-status"
                  className="input w-full"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All statuses</option>
                  {BRANCH_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </ListFiltersBar>
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
        </div>

                <BranchTable
          branches={branches}
          loading={loading}
          onDelete={setDeleteTarget}
        />

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-stellar-border p-stellar-4">
            <p className="text-sm text-stellar-text-muted">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex gap-stellar-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <DeleteBranchModal
        branch={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default BranchListPage;
