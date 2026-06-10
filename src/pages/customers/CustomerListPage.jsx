import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import CustomerTable from '../../components/customers/CustomerTable.jsx';
import CustomerFilters from '../../components/customers/CustomerFilters.jsx';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import Button from '../../components/ui/Button.jsx';
import useListFilters from '../../hooks/useListFilters.js';
import CustomerStatsCards from '../../components/customers/CustomerStatsCards.jsx';
import DeleteCustomerModal from '../../components/customers/DeleteCustomerModal.jsx';
import useCustomerBasePath, { useCanManageCustomers } from '../../hooks/useCustomerBasePath.js';
import useAuth from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';
import { fetchBranches } from '../../services/branchService.js';
import {
  fetchCustomers,
  fetchCustomerStats,
  deleteCustomer,
} from '../../services/customerService.js';

function CustomerListPage() {
  const basePath = useCustomerBasePath();
  const canManage = useCanManageCustomers();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;

  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [branches, setBranches] = useState([]);
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
  const [typeFilter, setTypeFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const location = useLocation();
    const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchCustomers({
        page,
        limit: 10,
        status: statusFilter || undefined,
        customerType: typeFilter || undefined,
        riskLevel: riskFilter || undefined,
        branch: branchFilter || undefined,
        ...dateParams,
      });
      setCustomers(data.data.customers);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, dateParams, statusFilter, typeFilter, riskFilter, branchFilter]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      try {
        const { data } = await fetchCustomerStats({
          branch: branchFilter || undefined,
        });
        if (!cancelled) setStats(data.data.stats);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branchFilter]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchBranches({ limit: 100 })
      .then(({ data }) => setBranches(data.data.branches))
      .catch(() => setBranches([]));
  }, [isSuperAdmin]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadCustomers();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data } = await deleteCustomer(deleteTarget.id);
      toast.success(data.message);
      setDeleteTarget(null);
      loadCustomers();
      const statsRes = await fetchCustomerStats({ branch: branchFilter || undefined });
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
          <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Customers</h1>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            One customer record per phone and email across the whole project — search before adding duplicates.
          </p>
        </div>
        {canManage && (
          <Link to={`${basePath}/new`} className="btn btn-primary btn-md w-full sm:w-auto">
            Add customer
          </Link>
        )}
      </div>
      <CustomerStatsCards stats={stats} loading={statsLoading} />

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-stellar-border p-stellar-4 sm:p-stellar-5">
          <form
            onSubmit={handleSearch}
            className="space-y-stellar-4"
          >
            <ListFiltersBar
              idPrefix="customer"
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Name, phone, email, company…"
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
            <CustomerFilters
            statusFilter={statusFilter}
            onStatusChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            typeFilter={typeFilter}
            onTypeChange={(v) => {
              setTypeFilter(v);
              setPage(1);
            }}
            riskFilter={riskFilter}
            onRiskChange={(v) => {
              setRiskFilter(v);
              setPage(1);
            }}
            branchFilter={branchFilter}
            onBranchChange={(v) => {
              setBranchFilter(v);
              setPage(1);
            }}
            branches={branches}
            showBranch={isSuperAdmin}
          />
            <Button type="submit" variant="secondary" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
        </div>
                <CustomerTable
          customers={customers}
          loading={loading}
          basePath={basePath}
          canManage={canManage}
          onDelete={canManage ? setDeleteTarget : undefined}
        />
        <PaginationBar pagination={pagination} page={page} onPageChange={setPage} />
      </Card>

      <DeleteCustomerModal
        customer={deleteTarget}
        open={Boolean(deleteTarget)}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default CustomerListPage;
