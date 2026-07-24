import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import ProductTable from '../../components/products/ProductTable.jsx';
import ProductFilters from '../../components/products/ProductFilters.jsx';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import Button from '../../components/ui/Button.jsx';
import useListFilters from '../../hooks/useListFilters.js';
import useFilterPageEffect from '../../hooks/useFilterPageEffect.js';
import ProductStatsCards from '../../components/products/ProductStatsCards.jsx';
import DeleteProductModal from '../../components/products/DeleteProductModal.jsx';
import { fetchAllCategories } from '../../services/categoryService.js';
import useProductBasePath, { useCanManageProducts } from '../../hooks/useProductBasePath.js';
import {
  fetchProducts,
  fetchInventoryStats,
  deleteProduct,
} from '../../services/productService.js';

function ProductListPage() {
  const basePath = useProductBasePath();
  const canManage = useCanManageProducts();

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
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
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const location = useLocation();
    const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchProducts({
        page,
        limit: 10,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        ...dateParams,
      });
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, dateParams, statusFilter, categoryFilter]);

  const filterKey = useMemo(
    () => JSON.stringify({ dateParams, statusFilter, categoryFilter }),
    [dateParams, statusFilter, categoryFilter],
  );

  useFilterPageEffect({ filterKey, page, setPage, load: loadProducts });

  useEffect(() => {
    fetchAllCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      try {
        const { data } = await fetchInventoryStats({});
        if (!cancelled) setStats(data.data.stats);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applySearch = () => {
    submitSearch();
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applySearch();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data } = await deleteProduct(deleteTarget.id);
      toast.success(data.message);
      setDeleteTarget(null);
      loadProducts();
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
          <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Products</h1>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            Equipment catalog, pricing, and inventory overview.
          </p>
        </div>
        {canManage && (
          <Link to={`${basePath}/new`} className="btn btn-primary btn-md w-full sm:w-auto">
            Add product
          </Link>
        )}
      </div>
      <ProductStatsCards stats={stats} loading={statsLoading} />

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-stellar-border p-stellar-4 sm:p-stellar-5">
          <form onSubmit={handleSearch} className="space-y-stellar-4">
            <ListFiltersBar
              idPrefix="product"
              search={search}
              onSearchChange={setSearch}
              onSearchSubmit={applySearch}
              searchPlaceholder="Name, SKU, brand, model…"
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
            />
            <ProductFilters
            statusFilter={statusFilter}
            onStatusChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            categoryFilter={categoryFilter}
            onCategoryChange={(v) => {
              setCategoryFilter(v);
              setPage(1);
            }}
            categories={categories}
          />
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
        </div>
                <ProductTable
          products={products}
          loading={loading}
          basePath={basePath}
          canManage={canManage}
          onDelete={canManage ? setDeleteTarget : undefined}
        />
        <PaginationBar pagination={pagination} page={page} onPageChange={setPage} />
      </Card>

      <DeleteProductModal
        product={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default ProductListPage;
