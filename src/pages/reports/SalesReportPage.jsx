import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import ReportsNav from '../../components/reports/ReportsNav.jsx';
import { SalesSummaryCards } from '../../components/reports/ReportSummaryCards.jsx';
import useListFilters from '../../hooks/useListFilters.js';
import useReportBasePath from '../../hooks/useReportBasePath.js';
import useInvoiceBasePath from '../../hooks/useInvoiceBasePath.js';
import useAuth from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';
import { fetchBranches } from '../../services/branchService.js';
import { exportSalesReport, fetchSalesReport } from '../../services/reportService.js';
import { INVOICE_STATUS_LABELS } from '../../utils/invoiceConstants.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { downloadCsv } from '../../utils/reportExport.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function SalesReportPage() {
  const reportBase = useReportBasePath();
  const invoiceBase = useInvoiceBasePath();
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
  const [lockedFilter, setLockedFilter] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchSalesReport({
        page,
        limit: 25,
        status: statusFilter || undefined,
        isLocked: lockedFilter || undefined,
        branch: branchFilter || undefined,
        ...dateParams,
      });
      setInvoices(data.data.invoices || []);
      setSummary(data.data.summary);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load sales report'));
      setInvoices([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [page, dateParams, statusFilter, lockedFilter, branchFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [dateParams, statusFilter, lockedFilter, branchFilter]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchBranches({ limit: 100 })
      .then(({ data }) => setBranches(data.data.branches || []))
      .catch(() => setBranches([]));
  }, [isSuperAdmin]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await exportSalesReport({
        status: statusFilter || undefined,
        isLocked: lockedFilter || undefined,
        branch: branchFilter || undefined,
        ...dateParams,
      });
      const rows = data.data.rows || [];
      downloadCsv('sales-report.csv', [
        'invoiceNumber',
        'customer',
        'branch',
        'issueDate',
        'status',
        'rentalNumber',
        'subtotal',
        'tax',
        'total',
        'advance',
        'paid',
        'balance',
        'isLocked',
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
          <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Sales report</h1>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            Invoices by issue date — revenue, tax, payments and outstanding balance.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting…' : 'Export CSV'}
        </Button>
      </div>

      <ReportsNav />

      <SalesSummaryCards summary={summary} loading={loading && !summary} />

      <Card className="!p-stellar-4 space-y-stellar-4">
        <ListFiltersBar
          idPrefix="sales-report"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Invoice # or customer name…"
          period={period}
          onPeriodChange={setPeriod}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          showSubmit={false}
        >
          <div className="form-group">
            <label htmlFor="sales-status" className="form-label">
              Status
            </label>
            <select
              id="sales-status"
              className="input w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              {Object.entries(INVOICE_STATUS_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="sales-locked" className="form-label">
              Job closed
            </label>
            <select
              id="sales-locked"
              className="input w-full"
              value={lockedFilter}
              onChange={(e) => setLockedFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Closed only</option>
              <option value="false">Open only</option>
            </select>
          </div>
          {isSuperAdmin && (
            <div className="form-group">
              <label htmlFor="sales-branch" className="form-label">
                Branch
              </label>
              <select
                id="sales-branch"
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
        ) : invoices.length === 0 ? (
          <p className="p-stellar-5 text-sm text-stellar-text-muted">No invoices match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stellar-border bg-stellar-surface-muted/50 text-left text-xs uppercase tracking-wide text-stellar-text-muted">
                  <th className="px-stellar-4 py-stellar-3">Invoice</th>
                  <th className="px-stellar-4 py-stellar-3">Customer</th>
                  {isSuperAdmin && <th className="px-stellar-4 py-stellar-3">Branch</th>}
                  <th className="px-stellar-4 py-stellar-3">Date</th>
                  <th className="px-stellar-4 py-stellar-3">Total</th>
                  <th className="px-stellar-4 py-stellar-3">Received</th>
                  <th className="px-stellar-4 py-stellar-3">Balance</th>
                  <th className="px-stellar-4 py-stellar-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stellar-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-stellar-surface-muted/30">
                    <td className="px-stellar-4 py-stellar-3 font-mono">
                      <Link
                        to={`${invoiceBase}/${inv.id}`}
                        className="font-medium text-stellar-accent hover:underline"
                      >
                        {inv.invoiceNumber}
                      </Link>
                      {inv.isLocked && (
                        <span className="ml-2 text-xs text-stellar-text-muted">Closed</span>
                      )}
                    </td>
                    <td className="px-stellar-4 py-stellar-3">
                      {inv.customerSnapshot?.name || inv.customer?.name || '—'}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-stellar-4 py-stellar-3">{inv.branch?.name || '—'}</td>
                    )}
                    <td className="px-stellar-4 py-stellar-3">{formatDate(inv.issueDate)}</td>
                    <td className="px-stellar-4 py-stellar-3 tabular-nums">
                      {formatCurrency(inv.amounts?.total)}
                    </td>
                    <td className="px-stellar-4 py-stellar-3 tabular-nums">
                      {formatCurrency(
                        (inv.amounts?.amountPaid ?? 0) + (inv.amounts?.advanceAmount ?? 0),
                      )}
                    </td>
                    <td className="px-stellar-4 py-stellar-3 tabular-nums">
                      {formatCurrency(inv.amounts?.balanceDue)}
                    </td>
                    <td className="px-stellar-4 py-stellar-3 capitalize">
                      {INVOICE_STATUS_LABELS[inv.status] || inv.status}
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

export default SalesReportPage;
