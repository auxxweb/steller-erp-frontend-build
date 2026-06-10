import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import NumberInput from '../../components/ui/NumberInput.jsx';
import useInvoiceBasePath from '../../hooks/useInvoiceBasePath.js';
import {
  fetchInvoice,
  updateInvoice,
  finalizeInvoice,
  fetchWhatsAppUrl,
  openInvoicePrint,
} from '../../services/invoiceService.js';
import {
  INVOICE_PAYMENT_TYPE,
  INVOICE_PAYMENT_LABELS,
  INVOICE_STATUS_LABELS,
} from '../../utils/invoiceConstants.js';
import { mergeInvoiceAmounts } from '../../utils/invoiceCalculations.js';
import { formatCurrency } from '../../utils/format.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function buildUpdatePayload(invoice) {
  const amounts = mergeInvoiceAmounts(invoice);
  return {
    customerSnapshot: invoice.customerSnapshot,
    lineItems: invoice.lineItems,
    amounts: {
      discount: amounts.discount,
      lateFee: amounts.lateFee,
      damageFee: amounts.damageFee,
      advanceAmount: amounts.advanceAmount,
      amountPaid: amounts.amountPaid,
      gstEnabled: amounts.gstEnabled,
      gstRate: amounts.gstRate,
    },
    payment: invoice.payment,
    isCredit: invoice.isCredit,
    notes: invoice.notes,
  };
}

function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = useInvoiceBasePath();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);

  const editable = invoice && !invoice.isLocked;

  const amounts = useMemo(() => mergeInvoiceAmounts(invoice), [invoice]);

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
      const { data } = await updateInvoice(id, buildUpdatePayload(invoice));
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
    if (!window.confirm('Close this job? The invoice will be locked and cannot be edited.')) {
      return;
    }
    setClosing(true);
    try {
      if (editable) {
        await updateInvoice(id, buildUpdatePayload(invoice));
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

  const handlePdf = async () => {
    try {
      await openInvoicePrint(id);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not open print view'));
    }
  };

  if (loading || !invoice || !amounts) {
    return <p className="text-sm text-stellar-text-muted">Loading invoice…</p>;
  }

  const paymentType = invoice.payment?.type || INVOICE_PAYMENT_TYPE.CASH;

  return (
    <div className="animate-fade-up opacity-0-start mx-auto max-w-3xl space-y-stellar-6">
      <div className="flex flex-wrap items-start justify-between gap-stellar-3">
        <div>
          <Link to={basePath} className="text-sm text-stellar-text-muted hover:underline">
            ← Invoices
          </Link>
          <h1 className="mt-stellar-1 font-mono text-2xl font-semibold text-stellar-text">
            {invoice.invoiceNumber}
          </h1>
          <p className="text-sm text-stellar-text-muted">
            {INVOICE_STATUS_LABELS[invoice.status] || invoice.status}
            {invoice.isLocked ? ' · Closed' : ' · Editable'}
            {invoice.rental?.rentalNumber && <> · {invoice.rental.rentalNumber}</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-stellar-2">
          <Button type="button" variant="secondary" size="sm" onClick={handlePdf}>
            Download PDF
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={handleWhatsApp}>
            Share WhatsApp
          </Button>
          {editable && (
            <>
              <Button type="button" variant="secondary" size="sm" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" size="sm" disabled={closing} onClick={handleCloseJob}>
                {closing ? 'Closing…' : 'Close job'}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="!p-stellar-5 space-y-stellar-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stellar-text-muted">
          Customer
        </h2>
        <div className="grid gap-stellar-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="form-label">Name</label>
            <input
              className="input"
              disabled={!editable}
              value={invoice.customerSnapshot?.name || ''}
              onChange={(e) => patchCustomer('name', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input
              className="input"
              disabled={!editable}
              value={invoice.customerSnapshot?.phone || ''}
              onChange={(e) => patchCustomer('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              className="input"
              disabled={!editable}
              value={invoice.customerSnapshot?.email || ''}
              onChange={(e) => patchCustomer('email', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Address</label>
            <textarea
              className="input min-h-[72px]"
              disabled={!editable}
              value={invoice.customerSnapshot?.address || ''}
              onChange={(e) => patchCustomer('address', e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="!p-stellar-5 space-y-stellar-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stellar-text-muted">
          Products
        </h2>
        <ul className="divide-y divide-stellar-border rounded-stellar-lg border border-stellar-border">
          {(invoice.lineItems || []).map((line, idx) => (
            <li key={line._id || idx} className="flex justify-between gap-stellar-3 p-stellar-3 text-sm">
              <div>
                <p className="font-medium text-stellar-text">{line.description}</p>
                <p className="text-stellar-text-muted">
                  Qty {line.quantity} × {formatCurrency(line.unitPrice)}
                </p>
              </div>
              <p className="shrink-0 font-medium tabular-nums">{formatCurrency(line.lineTotal)}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="!p-stellar-5 space-y-stellar-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stellar-text-muted">
          Amounts &amp; payment
        </h2>
        <div className="grid gap-stellar-3 sm:grid-cols-2">
          <div>
            <label className="form-label">Discount (₹)</label>
            <NumberInput
              min={0}
              allowDecimal={false}
              disabled={!editable}
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
                disabled={!editable}
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
                disabled={!editable}
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
              disabled={!editable}
              value={amounts.advanceAmount ?? 0}
              onChange={(n) => patchAmountField('advanceAmount', n)}
            />
          </div>
          <div>
            <label className="form-label">Other payments (₹)</label>
            <NumberInput
              min={0}
              allowDecimal={false}
              disabled={!editable}
              value={amounts.amountPaid ?? 0}
              onChange={(n) => patchAmountField('amountPaid', n)}
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-stellar-2 text-sm">
              <input
                type="checkbox"
                disabled={!editable}
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
                disabled={!editable}
                value={amounts.gstRate ?? 18}
                onChange={(n) => patchAmountField('gstRate', n)}
              />
            </div>
          )}
          <div>
            <label className="form-label">Payment type</label>
            <select
              className="input"
              disabled={!editable}
              value={paymentType}
              onChange={(e) =>
                patch({
                  payment: { ...invoice.payment, type: e.target.value },
                })
              }
            >
              {Object.entries(INVOICE_PAYMENT_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {paymentType === INVOICE_PAYMENT_TYPE.SPLIT && (
            <>
              <div>
                <label className="form-label">Cash (₹)</label>
                <NumberInput
                  min={0}
                  allowDecimal={false}
                  disabled={!editable}
                  value={invoice.payment?.cashAmount ?? 0}
                  onChange={(n) =>
                    patch({
                      payment: { ...invoice.payment, cashAmount: n },
                    })
                  }
                />
              </div>
              <div>
                <label className="form-label">Online (₹)</label>
                <NumberInput
                  min={0}
                  allowDecimal={false}
                  disabled={!editable}
                  value={invoice.payment?.onlineAmount ?? 0}
                  onChange={(n) =>
                    patch({
                      payment: { ...invoice.payment, onlineAmount: n },
                    })
                  }
                />
              </div>
            </>
          )}
          <div className="sm:col-span-2">
            <label className="flex items-center gap-stellar-2 text-sm">
              <input
                type="checkbox"
                disabled={!editable}
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
              disabled={!editable}
              value={invoice.notes || ''}
              onChange={(e) => patch({ notes: e.target.value })}
            />
          </div>
        </div>

        <dl className="space-y-stellar-2 border-t border-stellar-border pt-stellar-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-stellar-text-muted">Subtotal</dt>
            <dd className="font-medium tabular-nums">{formatCurrency(amounts.subtotal)}</dd>
          </div>
          {amounts.discount > 0 && (
            <div className="flex justify-between text-stellar-text-muted">
              <dt>Discount</dt>
              <dd className="tabular-nums">−{formatCurrency(amounts.discount)}</dd>
            </div>
          )}
          {amounts.lateFee > 0 && (
            <div className="flex justify-between">
              <dt className="text-stellar-text-muted">Late fee</dt>
              <dd className="tabular-nums">{formatCurrency(amounts.lateFee)}</dd>
            </div>
          )}
          {amounts.damageFee > 0 && (
            <div className="flex justify-between">
              <dt className="text-stellar-text-muted">Damage fee</dt>
              <dd className="tabular-nums">{formatCurrency(amounts.damageFee)}</dd>
            </div>
          )}
          {amounts.gstEnabled !== false && (
            <div className="flex justify-between">
              <dt className="text-stellar-text-muted">GST</dt>
              <dd className="tabular-nums">{formatCurrency(amounts.tax)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-stellar-border pt-stellar-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatCurrency(amounts.total)}</dd>
          </div>
          <div className="flex justify-between text-stellar-text-muted">
            <dt>Advance</dt>
            <dd className="tabular-nums">−{formatCurrency(amounts.advanceAmount)}</dd>
          </div>
          <div className="flex justify-between text-stellar-text-muted">
            <dt>Other payments</dt>
            <dd className="tabular-nums">−{formatCurrency(amounts.amountPaid)}</dd>
          </div>
          <div className="flex justify-between border-t border-stellar-border pt-stellar-2 text-lg font-semibold text-stellar-accent">
            <dt>Balance due</dt>
            <dd className="tabular-nums">{formatCurrency(amounts.balanceDue)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

export default InvoiceDetailPage;
