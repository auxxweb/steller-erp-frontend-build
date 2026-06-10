import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import useInvoiceBasePath from '../../hooks/useInvoiceBasePath.js';
import { fetchInvoices } from '../../services/invoiceService.js';
import ListFiltersBar from '../../components/ui/ListFiltersBar.jsx';
import useListFilters from '../../hooks/useListFilters.js';
import { INVOICE_STATUS_LABELS } from '../../utils/invoiceConstants.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import useAuth from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';

function InvoiceListPage() {
  const basePath = useInvoiceBasePath();
  const { user } = useAuth();
  const isEmployee = user?.role === ROLES.EMPLOYEE;
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        status: statusFilter || undefined,
        ...dateParams,
      };
      const { data } = await fetchInvoices(params);
      setInvoices(data.data.invoices || []);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load invoices'));
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [page, dateParams, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [dateParams, statusFilter]);

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div className="flex flex-wrap items-end justify-between gap-stellar-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">
            {isEmployee ? 'My invoices' : 'Invoices'}
          </h1>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            {isEmployee
              ? 'Invoices you generated after marking returns.'
              : 'Created when rentals are returned. Close job to lock an invoice.'}
          </p>
        </div>
      </div>

      <Card className="!p-stellar-4">
        <ListFiltersBar
          idPrefix="invoice"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Customer name or invoice number"
          period={period}
          onPeriodChange={setPeriod}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          showSubmit={false}
        >
          <div className="form-group">
            <label htmlFor="inv-status" className="form-label">
              Status
            </label>
            <select
              id="inv-status"
              className="input w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              {Object.entries(INVOICE_STATUS_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </ListFiltersBar>
      </Card>

      <Card className="overflow-hidden !p-0">
        {loading ? (
          <p className="p-stellar-5 text-sm text-stellar-text-muted">Loading…</p>
        ) : invoices.length === 0 ? (
          <p className="p-stellar-5 text-sm text-stellar-text-muted">No invoices found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stellar-border bg-stellar-surface-muted/50 text-left text-xs uppercase tracking-wide text-stellar-text-muted">
                  <th className="px-stellar-4 py-stellar-3">Invoice</th>
                  <th className="px-stellar-4 py-stellar-3">Customer</th>
                  <th className="px-stellar-4 py-stellar-3">Date</th>
                  <th className="px-stellar-4 py-stellar-3">Total</th>
                  <th className="px-stellar-4 py-stellar-3">Balance</th>
                  <th className="px-stellar-4 py-stellar-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stellar-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-stellar-surface-muted/30">
                    <td className="px-stellar-4 py-stellar-3 font-mono">
                      <Link
                        to={`${basePath}/${inv.id}`}
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
                    <td className="px-stellar-4 py-stellar-3">{formatDate(inv.issueDate)}</td>
                    <td className="px-stellar-4 py-stellar-3">{formatCurrency(inv.amounts?.total)}</td>
                    <td className="px-stellar-4 py-stellar-3">
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
    </div>
  );
}

export default InvoiceListPage;
