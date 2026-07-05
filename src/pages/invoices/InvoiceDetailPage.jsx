import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import NumberInput from '../../components/ui/NumberInput.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';
import InvoiceDocumentPreview from '../../components/invoices/InvoiceDocumentPreview.jsx';
import useInvoiceBasePath from '../../hooks/useInvoiceBasePath.js';
import useAuth from '../../hooks/useAuth.js';
import {
  fetchInvoice,
  updateInvoice,
  finalizeInvoice,
  recordInvoicePayment,
  fetchWhatsAppUrl,
  openInvoicePrint,
  downloadInvoiceHtml,
} from '../../services/invoiceService.js';
import {
  INVOICE_PAYMENT_TYPE,
  INVOICE_PAYMENT_LABELS,
  INVOICE_STATUS_LABELS,
} from '../../utils/invoiceConstants.js';
import { ROLES } from '../../utils/constants.js';
import { mergeInvoiceAmounts, hasInvoiceRecordedPayments } from '../../utils/invoiceCalculations.js';
import {
  canEditInvoiceBillAmount,
  lineItemsSubtotal,
} from '../../utils/invoicePermissions.js';
import { formatCurrency } from '../../utils/format.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function buildUpdatePayload(invoice, { includeBillAmount = false } = {}) {
  const amounts = mergeInvoiceAmounts(invoice);
  return {
    customerSnapshot: invoice.customerSnapshot,
    lineItems: invoice.lineItems,
    amounts: {
      ...(includeBillAmount ? { subtotal: amounts.subtotal } : {}),
      discount: amounts.discount,
      lateFee: amounts.lateFee,
      damageFee: amounts.damageFee,
      advanceAmount: amounts.advanceAmount,
      amountPaid: amounts.amountPaid,
      gstEnabled: amounts.gstEnabled,
      gstRate: amounts.gstRate,
    },
    isCredit: invoice.isCredit,
    notes: invoice.notes,
  };
}

function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = useInvoiceBasePath();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: INVOICE_PAYMENT_TYPE.CASH,
    paidAt: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const canEditClosed =
    user?.role === ROLES.SUPER_ADMIN ||
    user?.role === ROLES.BRANCH_ADMIN ||
    user?.role === ROLES.EMPLOYEE;

  const canEditBillAmountRole = canEditInvoiceBillAmount(user);
  const hasRecordedPayments = hasInvoiceRecordedPayments(invoice);
  const canEditBillAmount = canEditBillAmountRole && !hasRecordedPayments;

  const amounts = useMemo(() => mergeInvoiceAmounts(invoice), [invoice]);
  const calculatedLineSubtotal = useMemo(
    () => lineItemsSubtotal(invoice?.lineItems),
    [invoice?.lineItems],
  );

  const editable = invoice && (!invoice.isLocked || canEditClosed);
  const balanceDue = amounts?.balanceDue ?? 0;
  const canRecordPayment =
    invoice && invoice.status !== 'void' && balanceDue > 0;
  const showBillCard = editable || canRecordPayment;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchInvoice(id);
      const inv = data.data.invoice;
      setInvoice({ ...inv, amounts: mergeInvoiceAmounts(inv) });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Invoice not found'));
      navigate(basePath);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, basePath]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (partial) => {
    setInvoice((prev) => {
      const next = { ...prev, ...partial };
      return { ...next, amounts: mergeInvoiceAmounts(next) };
    });
  };

  const patchCustomer = (field, value) => {
    setInvoice((prev) => {
      const next = {
        ...prev,
        customerSnapshot: { ...prev.customerSnapshot, [field]: value },
      };
      return { ...next, amounts: mergeInvoiceAmounts(next) };
    });
  };

  const patchAmountField = (field, value) => {
    setInvoice((prev) => {
      const nextVal =
        field === 'gstEnabled'
          ? Boolean(value)
          : typeof value === 'number'
            ? value
            : value === ''
              ? 0
              : Number(value);
      const next = {
        ...prev,
        amounts: { ...prev.amounts, [field]: nextVal },
      };
      return { ...next, amounts: mergeInvoiceAmounts(next) };
    });
  };

  const handleSave = async () => {
    if (!editable || !invoice) return;
    setSaving(true);
    try {
      const { data } = await updateInvoice(
        id,
        buildUpdatePayload(invoice, { includeBillAmount: canEditBillAmount }),
      );
      const inv = data.data.invoice;
      setInvoice({ ...inv, amounts: mergeInvoiceAmounts(inv) });
      toast.success('Invoice saved');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCloseJob = async () => {
    const msg = canEditClosed
      ? 'Close this job? The invoice will be marked closed. You can still edit it afterward.'
      : 'Close this job? The invoice will be locked.';
    if (!window.confirm(msg)) {
      return;
    }
    setClosing(true);
    try {
      if (editable) {
        await updateInvoice(
          id,
          buildUpdatePayload(invoice, { includeBillAmount: canEditBillAmount }),
        );
      }
      const { data } = await finalizeInvoice(id);
      const inv = data.data.invoice;
      setInvoice({ ...inv, amounts: mergeInvoiceAmounts(inv) });
      toast.success('Job closed — invoice finalized');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not close job'));
    } finally {
      setClosing(false);
    }
  };

  const handleWhatsApp = async () => {
    try {
      const { data } = await fetchWhatsAppUrl(id);
      window.open(data.data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'WhatsApp share failed'));
    }
  };

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await openInvoicePrint(id);
    } catch (err) {
      toast.error(err?.message || getApiErrorMessage(err, 'Could not open print view'));
    } finally {
      setPrinting(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadInvoiceHtml(id, invoice?.invoiceNumber);
      toast.success('Invoice downloaded');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Download failed'));
    } finally {
      setDownloading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amount = Number(paymentForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid payment amount');
      return;
    }
    setRecordingPayment(true);
    try {
      const { data } = await recordInvoicePayment(id, {
        amount,
        method: paymentForm.method,
        paidAt: paymentForm.paidAt,
        notes: paymentForm.notes.trim() || undefined,
      });
      const inv = data.data.invoice;
      setInvoice({ ...inv, amounts: mergeInvoiceAmounts(inv) });
      setPaymentForm((prev) => ({ ...prev, amount: '', notes: '' }));
      toast.success('Payment recorded');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not record payment'));
    } finally {
      setRecordingPayment(false);
    }
  };

  if (loading || !invoice || !amounts) {
    return <p className="text-sm text-stellar-text-muted">Loading invoice…</p>;
  }

  return (
    <div className="animate-fade-up opacity-0-start mx-auto max-w-3xl space-y-stellar-6">
      <div className="flex flex-wrap items-start justify-between gap-stellar-3">
        <div>
          <Link to={basePath} className="text-sm text-stellar-text-muted hover:underline">
            ← Bills
          </Link>
          <h1 className="mt-stellar-1 font-mono text-2xl font-semibold text-stellar-text">
            {invoice.invoiceNumber}
          </h1>
          <p className="text-sm text-stellar-text-muted">
            {INVOICE_STATUS_LABELS[invoice.status] || invoice.status}
            {invoice.isLocked ? ' · Closed' : ' · Open'}
            {invoice.isLocked && canEditClosed ? ' · Can edit' : ''}
            {invoice.rental?.rentalNumber && <> · {invoice.rental.rentalNumber}</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-stellar-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={printing}
            onClick={handlePrint}
          >
            {printing ? 'Opening…' : 'Print / PDF'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={downloading}
            onClick={handleDownload}
          >
            {downloading ? 'Downloading…' : 'Download'}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={handleWhatsApp}>
            Share WhatsApp
          </Button>
          {editable && !invoice.isLocked && (
            <>
              <Button type="button" variant="secondary" size="sm" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" size="sm" disabled={closing} onClick={handleCloseJob}>
                {closing ? 'Closing…' : 'Close job'}
              </Button>
            </>
          )}
          {editable && invoice.isLocked && canEditClosed && (
            <Button type="button" variant="secondary" size="sm" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          )}
        </div>
      </div>

      <InvoiceDocumentPreview invoice={{ ...invoice, amounts }} />

      {showBillCard && (
        <Card className="!p-stellar-5 space-y-stellar-6">
          {editable && (
            <>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stellar-text-muted">
            Edit bill
          </h2>
          <div className="grid gap-stellar-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="form-label">Customer name</label>
              <input
                className="input"
                value={invoice.customerSnapshot?.name || ''}
                onChange={(e) => patchCustomer('name', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input
                className="input"
                value={invoice.customerSnapshot?.phone || ''}
                onChange={(e) => patchCustomer('phone', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                className="input"
                value={invoice.customerSnapshot?.email || ''}
                onChange={(e) => patchCustomer('email', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Address</label>
              <textarea
                className="input min-h-[72px]"
                value={invoice.customerSnapshot?.address || ''}
                onChange={(e) => patchCustomer('address', e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="form-label">Bill amount (₹)</label>
              {canEditBillAmount ? (
                <>
                  <NumberInput
                    min={0}
                    allowDecimal={false}
                    value={amounts.subtotal ?? 0}
                    onChange={(n) => patchAmountField('subtotal', n)}
                  />
                  <p className="mt-1 text-xs text-stellar-text-muted">
                    Calculated from line items: {formatCurrency(calculatedLineSubtotal)}. Editable
                    until the first payment is recorded — change only if the final bill differs.
                  </p>
                </>
              ) : (
                <>
                  <p className="rounded-stellar-md border border-stellar-border bg-stellar-surface-muted px-stellar-3 py-stellar-2 font-medium tabular-nums">
                    {formatCurrency(amounts.subtotal)}
                  </p>
                  <p className="mt-1 text-xs text-stellar-text-muted">
                    {hasRecordedPayments
                      ? 'Locked — a payment has been recorded'
                      : 'Contact an admin or sales staff to adjust the bill amount'}
                  </p>
                </>
              )}
            </div>

            <div>
              <label className="form-label">Discount (₹)</label>
              <NumberInput
                min={0}
                allowDecimal={false}
                value={amounts.discount ?? 0}
                onChange={(n) => patchAmountField('discount', n)}
              />
            </div>
            {(amounts.lateFee > 0 || editable) && (
              <div>
                <label className="form-label">Late fee (₹)</label>
                <NumberInput
                  min={0}
                  allowDecimal={false}
                  value={amounts.lateFee ?? 0}
                  onChange={(n) => patchAmountField('lateFee', n)}
                />
              </div>
            )}
            {(amounts.damageFee > 0 || editable) && (
              <div>
                <label className="form-label">Damage fee (₹)</label>
                <NumberInput
                  min={0}
                  allowDecimal={false}
                  value={amounts.damageFee ?? 0}
                  onChange={(n) => patchAmountField('damageFee', n)}
                />
              </div>
            )}
            <div>
              <label className="form-label">Advance paid (₹)</label>
              <NumberInput
                min={0}
                allowDecimal={false}
                value={amounts.advanceAmount ?? 0}
                onChange={(n) => patchAmountField('advanceAmount', n)}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-stellar-2 text-sm">
                <input
                  type="checkbox"
                  checked={amounts.gstEnabled !== false}
                  onChange={(e) => patchAmountField('gstEnabled', e.target.checked)}
                />
                Apply GST ({amounts.gstRate ?? 18}%)
              </label>
            </div>
            {amounts.gstEnabled !== false && (
              <div>
                <label className="form-label">GST %</label>
                <NumberInput
                  min={0}
                  max={100}
                  value={amounts.gstRate ?? 18}
                  onChange={(n) => patchAmountField('gstRate', n)}
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-stellar-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(invoice.isCredit)}
                  onChange={(e) => patch({ isCredit: e.target.checked })}
                />
                Credit sale (balance can remain due)
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Notes</label>
              <textarea
                className="input min-h-[64px]"
                value={invoice.notes || ''}
                onChange={(e) => patch({ notes: e.target.value })}
              />
            </div>
          </div>
            </>
          )}

          {canRecordPayment && (
            <div className={editable ? 'border-t border-stellar-border pt-stellar-5' : ''}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stellar-text-muted">
                Record payment
              </h2>
              <p className="mt-stellar-1 text-sm text-stellar-text-muted">
                Balance due:{' '}
                <span className="font-semibold tabular-nums text-stellar-text">
                  {formatCurrency(balanceDue)}
                </span>
              </p>
              <form onSubmit={handleRecordPayment} className="mt-stellar-4 grid gap-stellar-3 sm:grid-cols-2">
                <div>
                  <label className="form-label">Amount (₹)</label>
                  <NumberInput
                    min={1}
                    max={balanceDue}
                    allowDecimal={false}
                    value={paymentForm.amount}
                    onChange={(n) => setPaymentForm((p) => ({ ...p, amount: n ?? '' }))}
                    placeholder={`Max ${formatCurrency(balanceDue)}`}
                  />
                </div>
                <div>
                  <label className="form-label">Payment date</label>
                  <input
                    type="date"
                    className="input"
                    value={paymentForm.paidAt}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, paidAt: e.target.value }))}
                  />
                </div>
                <SearchableSelect
                  label="Paid via"
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, method: e.target.value }))}
                  options={[
                    { value: INVOICE_PAYMENT_TYPE.CASH, label: INVOICE_PAYMENT_LABELS.cash },
                    { value: INVOICE_PAYMENT_TYPE.ONLINE, label: INVOICE_PAYMENT_LABELS.online },
                  ]}
                />
                <div>
                  <label className="form-label">Notes</label>
                  <input
                    className="input"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" size="sm" disabled={recordingPayment}>
                    {recordingPayment ? 'Recording…' : 'Record payment'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default InvoiceDetailPage;
