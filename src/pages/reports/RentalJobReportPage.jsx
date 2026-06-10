import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import ReportsNav from '../../components/reports/ReportsNav.jsx';
import { RentalJobSummaryCards } from '../../components/reports/ReportSummaryCards.jsx';
import RentalStatusBadge from '../../components/rentals/RentalStatusBadge.jsx';
import useListFilters from '../../hooks/useListFilters.js';
import useReportBasePath from '../../hooks/useReportBasePath.js';
import useRentalBasePath from '../../hooks/useRentalBasePath.js';
import useAuth from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';
import { fetchBranches } from '../../services/branchService.js';
import { exportRentalJobReport, fetchRentalJobReport } from '../../services/reportService.js';
import { RENTAL_STATUS, RENTAL_STATUS_META, RENTAL_TYPE_OPTIONS } from '../../utils/rentalConstants.js';

const RENTAL_STATUS_OPTIONS = Object.values(RENTAL_STATUS).map((value) => ({
  value,
  label: RENTAL_STATUS_META[value]?.label || value,
}));
import { formatCurrency, formatDate } from '../../utils/format.js';
import { downloadCsv } from '../../utils/reportExport.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function RentalJobReportPage() {
  const reportBase = useReportBasePath();
  const rentalBase = useRentalBasePath();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;

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

  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [rentals, setRentals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchRentalJobReport({
        page,
        limit: 25,
        status: statusFilter || undefined,
        rentalType: typeFilter || undefined,
        branch: branchFilter || undefined,
        ...dateParams,
      });
      setRentals(data.data.rentals || []);
      setSummary(data.data.summary);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load rental job report'));
      setRentals([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [page, dateParams, statusFilter, typeFilter, branchFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [dateParams, statusFilter, typeFilter, branchFilter]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchBranches({ limit: 100 })
      .then(({ data }) => setBranches(data.data.branches || []))
      .catch(() => setBranches([]));
  }, [isSuperAdmin]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await exportRentalJobReport({
        status: statusFilter || undefined,
        rentalType: typeFilter || undefined,
        branch: branchFilter || undefined,
        ...dateParams,
      });
      const rows = data.data.rows || [];
      downloadCsv('rental-jobs.csv', [
        'rentalNumber',
        'customer',
        'phone',
        'branch',
        'status',
        'rentalType',
        'scheduledStart',
        'scheduledEnd',
        'returnedAt',
        'total',
        'deposit',
        'paid',
        'balance',
        'createdAt',
      ], rows);
      toast.success(`Exported ${rows.length} rows`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Export failed'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div className="flex flex-wrap items-end justify-between gap-stellar-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Rental job report</h1>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            Bookings created in the selected period with job totals and collection status.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting…' : 'Export CSV'}
        </Button>
      </div>

      <ReportsNav />

      <RentalJobSummaryCards summary={summary} loading={loading && !summary} />

      <Card className="!p-stellar-4 space-y-stellar-4">
        <ListFiltersBar
          idPrefix="rental-report"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rental #, customer name or phone…"
          period={period}
          onPeriodChange={setPeriod}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          showSubmit={false}
        >
          <div className="form-group">
            <label htmlFor="rj-status" className="form-label">
              Status
            </label>
            <select
              id="rj-status"
              className="input w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {RENTAL_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="rj-type" className="form-label">
              Type
            </label>
            <select
              id="rj-type"
              className="input w-full"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All types</option>
              {RENTAL_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {isSuperAdmin && (
            <div className="form-group">
              <label htmlFor="rj-branch" className="form-label">
                Branch
              </label>
              <select
                id="rj-branch"
                className="input w-full"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <option value="">All branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </ListFiltersBar>
      </Card>

      <Card className="overflow-hidden !p-0">
        {loading ? (
          <p className="p-stellar-5 text-sm text-stellar-text-muted">Loading…</p>
        ) : rentals.length === 0 ? (
          <p className="p-stellar-5 text-sm text-stellar-text-muted">No rental jobs match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stellar-border bg-stellar-surface-muted/50 text-left text-xs uppercase tracking-wide text-stellar-text-muted">
                  <th className="px-stellar-4 py-stellar-3">Job #</th>
                  <th className="px-stellar-4 py-stellar-3">Customer</th>
                  {isSuperAdmin && <th className="px-stellar-4 py-stellar-3">Branch</th>}
                  <th className="px-stellar-4 py-stellar-3">Status</th>
                  <th className="px-stellar-4 py-stellar-3">Schedule</th>
                  <th className="px-stellar-4 py-stellar-3">Total</th>
                  <th className="px-stellar-4 py-stellar-3">Paid</th>
                  <th className="px-stellar-4 py-stellar-3">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stellar-border">
                {rentals.map((r) => (
                  <tr key={r.id} className="hover:bg-stellar-surface-muted/30">
                    <td className="px-stellar-4 py-stellar-3 font-mono">
                      <Link
                        to={`${rentalBase}/${r.id}`}
                        className="font-medium text-stellar-accent hover:underline"
                      >
                        {r.rentalNumber}
                      </Link>
                    </td>
                    <td className="px-stellar-4 py-stellar-3">
                      <div>{r.customer?.name || '—'}</div>
                      <div className="text-xs text-stellar-text-muted">{r.customer?.phone}</div>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-stellar-4 py-stellar-3">{r.branch?.name || '—'}</td>
                    )}
                    <td className="px-stellar-4 py-stellar-3">
                      <RentalStatusBadge status={r.status} />
                    </td>
                    <td className="px-stellar-4 py-stellar-3 text-xs">
                      {formatDate(r.scheduledStartAt)} – {formatDate(r.scheduledEndAt)}
                    </td>
                    <td className="px-stellar-4 py-stellar-3 tabular-nums">
                      {formatCurrency(r.amounts?.total)}
                    </td>
                    <td className="px-stellar-4 py-stellar-3 tabular-nums">
                      {formatCurrency(r.amounts?.amountPaid)}
                    </td>
                    <td className="px-stellar-4 py-stellar-3 tabular-nums">
                      {formatCurrency(r.amounts?.balanceDue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <PaginationBar
          page={page}
          pages={pagination.pages}
          total={pagination.total}
          onPageChange={setPage}
        />
      </Card>

      <p className="text-center text-xs text-stellar-text-muted">
        <Link to={reportBase} className="text-stellar-accent hover:underline">
          ← Back to reports
        </Link>
      </p>
    </div>
  );
}

export default RentalJobReportPage;
