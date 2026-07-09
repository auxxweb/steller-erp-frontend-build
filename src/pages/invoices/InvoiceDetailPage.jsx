import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  INVOICE_PAYMENT_OPTIONS,
  INVOICE_STATUS_LABELS,
} from '../../utils/invoiceConstants.js';
import { toDatetimeLocalValue, fromDatetimeLocalValue } from '../../utils/rentalConstants.js';
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

function defaultPaymentForm(balanceDue = 0) {
  return {
    amount: balanceDue > 0 ? balanceDue : '',
    cashAmount: '',
    onlineAmount: '',
    method: INVOICE_PAYMENT_TYPE.CASH,
    paidAt: toDatetimeLocalValue(new Date()),
    notes: '',
  };
}

function applyGstPolicyToInvoice(inv, policy) {
  const next = { ...inv, amounts: mergeInvoiceAmounts(inv) };
  if (policy?.pricesIncludeGst) {
    next.amounts = {
      ...next.amounts,
      gstEnabled: false,
      gstRate: policy.gstPercentage ?? next.amounts?.gstRate,
    };
  }
  return next;
}

function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = useInvoiceBasePath();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [gstPolicy, setGstPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState(() => defaultPaymentForm());

  const canEditBillAmountRole = canEditInvoiceBillAmount(user);
  const hasRecordedPayments = hasInvoiceRecordedPayments(invoice);
  const canEditBillAmount = canEditBillAmountRole && !hasRecordedPayments;

  const amounts = useMemo(() => {
    const merged = mergeInvoiceAmounts(invoice);
    if (gstPolicy?.pricesIncludeGst && merged) {
      return { ...merged, gstEnabled: false, gstRate: gstPolicy.gstPercentage ?? merged.gstRate };
    }
    return merged;
  }, [invoice, gstPolicy]);
  const showGstControls = Boolean(gstPolicy && !gstPolicy.pricesIncludeGst);
  const calculatedLineSubtotal = useMemo(
    () => lineItemsSubtotal(invoice?.lineItems),
    [invoice?.lineItems],
  );
  const billAmount = amounts?.subtotal ?? 0;
  const hasBillAmount = billAmount > 0;

  const editable = invoice && !invoice.isLocked;
  const balanceDue = amounts?.balanceDue ?? 0;
  const showRecordPayment = Boolean(invoice && invoice.status !== 'void');
  const canSubmitPayment = balanceDue > 0;
  const canCloseJob = Boolean(editable && hasBillAmount && balanceDue <= 0);
  const isSplitPayment = paymentForm.method === INVOICE_PAYMENT_TYPE.SPLIT;

  const resetPaymentForm = useCallback((due = 0) => {
    setPaymentForm(defaultPaymentForm(due));
  }, []);

  const paymentFormInitRef = useRef(null);
  useEffect(() => {
    if (loading || !invoice) return;
    if (paymentFormInitRef.current === invoice.id) return;
    paymentFormInitRef.current = invoice.id;
    setPaymentForm(defaultPaymentForm(balanceDue));
  }, [loading, invoice, balanceDue]);

  const saveInvoiceBeforePayment = async () => {
    if (!editable || !invoice || invoice.isLocked) return invoice;
    const { data } = await updateInvoice(
      id,
      buildUpdatePayload(invoice, { includeBillAmount: canEditBillAmount }),
    );
    const policy = data.data.gstPolicy || gstPolicy;
    setGstPolicy(policy);
    const next = applyGstPolicyToInvoice(data.data.invoice, policy);
    setInvoice(next);
    return next;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchInvoice(id);
      const policy = data.data.gstPolicy || null;
      setGstPolicy(policy);
      setInvoice(applyGstPolicyToInvoice(data.data.invoice, policy));
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

  useEffect(() => {
    paymentFormInitRef.current = null;
  }, [id]);

  useEffect(() => {
    if (loading || !invoice || isSplitPayment || balanceDue <= 0) return;
    setPaymentForm((prev) => ({
      ...prev,
      amount: balanceDue,
    }));
  }, [
    balanceDue,
    loading,
    invoice,
    isSplitPayment,
    amounts?.discount,
    amounts?.lateFee,
    amounts?.damageFee,
    amounts?.advanceAmount,
    amounts?.gstEnabled,
    amounts?.gstRate,
  ]);

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
      const policy = data.data.gstPolicy || gstPolicy;
      setGstPolicy(policy);
      setInvoice(applyGstPolicyToInvoice(data.data.invoice, policy));
      toast.success('Invoice saved');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCloseJob = async () => {
    if (!hasBillAmount) {
      toast.error('Enter the bill amount before closing this job');
      return;
    }
    if (balanceDue > 0) {
      toast.error(
        `Record the due amount (${formatCurrency(balanceDue)}) before closing this job`,
      );
      return;
    }
    if (!window.confirm('Close this job? The invoice will be locked and cannot be edited afterward.')) {
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
      const policy = data.data.gstPolicy || gstPolicy;
      setGstPolicy(policy);
      setInvoice(applyGstPolicyToInvoice(data.data.invoice, policy));
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
    e?.preventDefault?.();
    setRecordingPayment(true);
    try {
      const saved = await saveInvoiceBeforePayment();
      const due = saved?.amounts?.balanceDue ?? balanceDue;
      if (due <= 0) {
        toast.error('No balance due on this bill after saving');
        return;
      }

      const paidAt =
        fromDatetimeLocalValue(paymentForm.paidAt) || new Date().toISOString();
      const notes = paymentForm.notes.trim() || undefined;

      if (isSplitPayment) {
        const cash = Math.max(0, Number(paymentForm.cashAmount) || 0);
        const online = Math.max(0, Number(paymentForm.onlineAmount) || 0);
        const total = cash + online;
        if (total <= 0) {
          toast.error('Enter cash and/or online amounts');
          return;
        }
        if (total > due + 0.01) {
          toast.error(`Payment exceeds balance due (${formatCurrency(due)})`);
          return;
        }
        let lastInvoice;
        let policy = gstPolicy;
        if (cash > 0) {
          const { data } = await recordInvoicePayment(id, {
            amount: cash,
            method: INVOICE_PAYMENT_TYPE.CASH,
            paidAt,
            notes,
          });
          lastInvoice = data.data.invoice;
          policy = data.data.gstPolicy || policy;
        }
        if (online > 0) {
          const { data } = await recordInvoicePayment(id, {
            amount: online,
            method: INVOICE_PAYMENT_TYPE.ONLINE,
            paidAt,
            notes,
          });
          lastInvoice = data.data.invoice;
          policy = data.data.gstPolicy || policy;
        }
        if (!lastInvoice) return null;
        setGstPolicy(policy);
        const inv = applyGstPolicyToInvoice(lastInvoice, policy);
        setInvoice(inv);
        const nextDue = mergeInvoiceAmounts(inv)?.balanceDue ?? 0;
        resetPaymentForm(nextDue);
        toast.success('Payment recorded');
        return inv;
      }

      const amount = Number(paymentForm.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error('Enter a valid payment amount');
        return;
      }
      if (amount > due + 0.01) {
        toast.error(`Payment exceeds balance due (${formatCurrency(due)})`);
        return;
      }
      const { data } = await recordInvoicePayment(id, {
        amount,
        method: paymentForm.method,
        paidAt,
        notes,
      });
      const policy = data.data.gstPolicy || gstPolicy;
      setGstPolicy(policy);
      const inv = applyGstPolicyToInvoice(data.data.invoice, policy);
      setInvoice(inv);
      const nextDue = mergeInvoiceAmounts(inv)?.balanceDue ?? 0;
      resetPaymentForm(nextDue);
      toast.success('Payment recorded');
      return inv;
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not record payment'));
      return null;
    } finally {
      setRecordingPayment(false);
    }
  };

  if (loading || !invoice || !amounts) {
    return <p className="text-sm text-stellar-text-muted">Loading invoice…</p>;
  }

  return (
    <div className="animate-fade-up opacity-0-start mx-auto max-w-3xl space-y-stellar-6">
      <div className="flex flex-col gap-stellar-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link to={basePath} className="text-sm text-stellar-text-muted hover:underline">
            ← Bills
          </Link>
          <h1 className="mt-stellar-1 font-mono text-xl font-semibold text-stellar-text sm:text-2xl">
            {invoice.invoiceNumber}
          </h1>
          <p className="break-words text-sm text-stellar-text-muted">
            {INVOICE_STATUS_LABELS[invoice.status] || invoice.status}
            {invoice.isLocked ? ' · Closed' : ' · Open'}
            {invoice.rental?.rentalNumber && <> · {invoice.rental.rentalNumber}</>}
          </p>
        </div>
        <div className="flex w-full flex-col gap-stellar-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            disabled={printing}
            onClick={handlePrint}
          >
            {printing ? 'Opening…' : 'Print / PDF'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            disabled={downloading}
            onClick={handleDownload}
          >
            {downloading ? 'Downloading…' : 'Download'}
          </Button>
          <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto" onClick={handleWhatsApp}>
            Share WhatsApp
          </Button>
          {canCloseJob && (
            <>
              <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" size="sm" className="w-full sm:w-auto" disabled={closing} onClick={handleCloseJob}>
                {closing ? 'Closing…' : 'Close job'}
              </Button>
            </>
          )}
          {editable && !hasBillAmount && (
            <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          )}
        </div>
      </div>

      <InvoiceDocumentPreview invoice={{ ...invoice, amounts }} gstPolicy={gstPolicy} />

      {(editable || (showRecordPayment && balanceDue > 0)) && (
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
                    value={billAmount}
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
              {showGstControls ? (
                <label className="flex items-center gap-stellar-2 text-sm">
                  <input
                    type="checkbox"
                    checked={amounts.gstEnabled !== false}
                    onChange={(e) => patchAmountField('gstEnabled', e.target.checked)}
                  />
                  Apply GST ({amounts.gstRate ?? gstPolicy?.gstPercentage ?? 18}%)
                </label>
              ) : (
                <p className="text-sm text-stellar-text-muted">
                  Rental prices are GST-inclusive. No additional GST is applied on this invoice.
                </p>
              )}
            </div>
            {showGstControls && amounts.gstEnabled !== false && (
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

          {showRecordPayment && (
            <div className={editable ? 'border-t border-stellar-border pt-stellar-5' : ''}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stellar-text-muted">
                Record payment
              </h2>
              <p className="mt-stellar-1 text-sm text-stellar-text-muted">
                Balance due:{' '}
                <span className="font-semibold tabular-nums text-stellar-text">
                  {formatCurrency(balanceDue)}
                </span>
                {editable && !invoice.isLocked && (
                  <span className="mt-1 block text-xs">
                    Bill changes are saved automatically when you record a payment.
                  </span>
                )}
              </p>
              {canSubmitPayment ? (
                <form onSubmit={handleRecordPayment} className="mt-stellar-4 grid gap-stellar-3 sm:grid-cols-2">
                  {!isSplitPayment ? (
                    <div>
                      <label className="form-label">Amount (₹)</label>
                      <NumberInput
                        min={0}
                        max={balanceDue}
                        allowDecimal={false}
                        value={paymentForm.amount ?? 0}
                        onChange={(n) =>
                          setPaymentForm((p) => ({ ...p, amount: n ?? '' }))
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="form-label">Cash (₹)</label>
                        <NumberInput
                          min={0}
                          max={balanceDue}
                          allowDecimal={false}
                          value={
                            paymentForm.cashAmount === '' || paymentForm.cashAmount === 0
                              ? 0
                              : paymentForm.cashAmount
                          }
                          onChange={(n) =>
                            setPaymentForm((p) => ({ ...p, cashAmount: n ?? '' }))
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="form-label">Online (₹)</label>
                        <NumberInput
                          min={0}
                          max={balanceDue}
                          allowDecimal={false}
                          value={
                            paymentForm.onlineAmount === '' || paymentForm.onlineAmount === 0
                              ? 0
                              : paymentForm.onlineAmount
                          }
                          onChange={(n) =>
                            setPaymentForm((p) => ({ ...p, onlineAmount: n ?? '' }))
                          }
                          placeholder="0"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="form-label">Payment date & time</label>
                    <input
                      type="datetime-local"
                      className="input"
                      value={paymentForm.paidAt}
                      onChange={(e) =>
                        setPaymentForm((p) => ({ ...p, paidAt: e.target.value }))
                      }
                    />
                  </div>
                  <SearchableSelect
                    label="Paid via"
                    value={paymentForm.method}
                    onChange={(e) =>
                      setPaymentForm((p) => ({
                        ...p,
                        method: e.target.value,
                        cashAmount: '',
                        onlineAmount: '',
                        amount:
                          e.target.value === INVOICE_PAYMENT_TYPE.SPLIT
                            ? ''
                            : balanceDue,
                      }))
                    }
                    options={INVOICE_PAYMENT_OPTIONS}
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
                    <Button type="submit" size="sm" disabled={recordingPayment || closing}>
                      {recordingPayment ? 'Recording…' : 'Record payment'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="mt-stellar-4 space-y-stellar-2">
                  <p className="text-sm text-stellar-text-muted">
                    {!hasBillAmount
                      ? 'Enter the bill amount above before recording payment or closing this job.'
                      : balanceDue > 0
                        ? `Balance due: ${formatCurrency(balanceDue)}. Record payment to settle before closing.`
                        : 'No balance due on this bill.'}
                    {hasBillAmount && (amounts?.advanceAmount ?? 0) > 0 && balanceDue <= 0 && (
                      <> Advance paid: {formatCurrency(amounts.advanceAmount)}.</>
                    )}
                  </p>
                  {!invoice.isLocked && canCloseJob && (
                    <Button type="button" size="sm" disabled={closing} onClick={handleCloseJob}>
                      {closing ? 'Closing…' : 'Close job'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default InvoiceDetailPage;
