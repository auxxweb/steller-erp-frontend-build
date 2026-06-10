import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import useListFilters from '../../hooks/useListFilters.js';
import Card from '../../components/ui/Card.jsx';
import CategoryTable from '../../components/categories/CategoryTable.jsx';
import CategoryStatsCards from '../../components/categories/CategoryStatsCards.jsx';
import DeleteCategoryModal from '../../components/categories/DeleteCategoryModal.jsx';
import { CATEGORY_STATUS_OPTIONS } from '../../utils/categoryConstants.js';
import useCategoryBasePath, { useIsBranchWorkspace } from '../../hooks/useCategoryBasePath.js';
import { fetchBranches } from '../../services/branchService.js';
import {
  fetchCategories,
  fetchCategoryStats,
  deleteCategory,
} from '../../services/categoryService.js';

function CategoryListPage() {
  const basePath = useCategoryBasePath();
  const navigate = useNavigate();
  const location = useLocation();
  const isBranchWorkspace = useIsBranchWorkspace();

  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [branches, setBranches] = useState([]);
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
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchCategories({
        page,
        limit: 10,
        status: statusFilter || undefined,
        branch: branchFilter || undefined,
        ...dateParams,
      });
      setCategories(data.data.categories);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load categories'));
    } finally {
      setLoading(false);
    }
  }, [page, dateParams, statusFilter, branchFilter]);

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.message, location.pathname, navigate]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      try {
        const { data } = await fetchCategoryStats({
          branch: branchFilter || undefined,
        });
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
  }, [branchFilter]);

  useEffect(() => {
    if (isBranchWorkspace) return;
    fetchBranches({ limit: 100 })
      .then(({ data }) => setBranches(data.data.branches))
      .catch(() => setBranches([]));
  }, [isBranchWorkspace]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadCategories();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data } = await deleteCategory(deleteTarget.id);
      toast.success(data.message);
      setDeleteTarget(null);
      loadCategories();
      const statsRes = await fetchCategoryStats({ branch: branchFilter || undefined });
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
            Product categories
          </h1>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            Shared across all branches. Optional location tags are for reference only.
          </p>
        </div>
        <Link to={`${basePath}/new`} className="btn btn-primary btn-md">
          Add category
        </Link>
      </div>

      <CategoryStatsCards stats={stats} loading={statsLoading} />

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-stellar-border p-stellar-4 sm:p-stellar-5">
          <form onSubmit={handleSearchSubmit} className="space-y-stellar-4">
            <ListFiltersBar
              idPrefix="category"
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Name, slug, description…"
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
                <label htmlFor="category-status" className="form-label">
                  Status
                </label>
                <select
                  id="category-status"
                  className="input w-full"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All statuses</option>
                  {CATEGORY_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {!isBranchWorkspace && branches.length > 0 && (
                <div className="form-group">
                  <label htmlFor="category-branch" className="form-label">
                    Location tag
                  </label>
                  <select
                    id="category-branch"
                    className="input w-full"
                    value={branchFilter}
                    onChange={(e) => {
                      setBranchFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">Any location</option>
                    <option value="global">No location tag</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </ListFiltersBar>
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
        </div>

                <CategoryTable
          categories={categories}
          loading={loading}
          basePath={basePath}
          showLocation={!isBranchWorkspace}
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

      <DeleteCategoryModal
        category={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default CategoryListPage;
