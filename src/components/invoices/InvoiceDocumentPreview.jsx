import stellerLogo from '../../assets/steller-logo-full.png';
import { INVOICE_PAYMENT_LABELS } from '../../utils/invoiceConstants.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

function InvoiceDocumentPreview({ invoice }) {
  const biz = invoice.businessSnapshot || {};
  const logoSrc = biz.logoUrl?.trim() || stellerLogo;
  const useDefaultLogo = !biz.logoUrl?.trim();
  const cust = invoice.customerSnapshot || {};
  const amounts = invoice.amounts || {};

  return (
    <div className="rounded-stellar-lg border border-stellar-border bg-stellar-surface p-stellar-5 text-sm shadow-sm">
      <div className="border-b border-stellar-border pb-4">
        <img
          src={logoSrc}
          alt={biz.name || 'Stellar'}
          className={`max-h-20 max-w-[220px] object-contain${useDefaultLogo ? ' steller-logo__img--theme' : ''}`}
        />
      </div>

      <div className="mt-4 flex justify-between gap-4 border-b border-stellar-border pb-4">
        <div>
          <p className="text-lg font-bold text-stellar-text">{biz.name || 'Stellar Rentals'}</p>
          <p className="text-xs text-stellar-text-muted">{biz.address}</p>
          <p className="text-xs text-stellar-text-muted">
            {biz.phone}
            {biz.email ? ` · ${biz.email}` : ''}
          </p>
          {biz.gstin ? <p className="text-xs text-stellar-text-muted">GSTIN: {biz.gstin}</p> : null}
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-stellar-accent">Invoice</p>
          <p className="font-mono text-lg font-semibold text-stellar-text">{invoice.invoiceNumber}</p>
          <p className="text-xs text-stellar-text-muted">{formatDate(invoice.issueDate)}</p>
          {invoice.isLocked ? (
            <span className="mt-1 inline-block rounded-full bg-stellar-surface-muted px-2 py-0.5 text-xs text-stellar-text-muted">
              Closed
            </span>
          ) : null}
          {invoice.isCredit ? (
            <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              Credit
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase text-stellar-text-muted">Bill to</p>
          <p className="font-semibold text-stellar-text">{cust.name}</p>
          <p className="text-xs text-stellar-text-muted">{cust.phone}</p>
          <p className="text-xs text-stellar-text-muted">{cust.address}</p>
        </div>
        {invoice.rental?.rentalNumber ? (
          <div className="text-right sm:text-left">
            <p className="text-xs font-medium uppercase text-stellar-text-muted">Rental</p>
            <p>{invoice.rental.rentalNumber}</p>
          </div>
        ) : null}
      </div>

      <table className="mt-4 w-full text-xs">
        <thead>
          <tr className="border-b border-stellar-border text-left text-stellar-text-muted">
            <th className="py-2">Item</th>
            <th className="py-2 text-center">Qty</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {(invoice.lineItems || []).map((line, i) => (
            <tr key={line._id || i} className="border-b border-stellar-border/60">
              <td className="py-2">{line.description}</td>
              <td className="py-2 text-center">{line.quantity}</td>
              <td className="py-2 text-right">{formatCurrency(line.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-4 ml-auto max-w-xs space-y-1 text-xs">
        <div className="flex justify-between">
          <dt>Bill amount</dt>
          <dd>{formatCurrency(amounts.subtotal)}</dd>
        </div>
        {(amounts.discount ?? 0) > 0 ? (
          <div className="flex justify-between">
            <dt>Discount</dt>
            <dd>−{formatCurrency(amounts.discount)}</dd>
          </div>
        ) : null}
        {(amounts.lateFee ?? 0) > 0 ? (
          <div className="flex justify-between">
            <dt>Late fee</dt>
            <dd>{formatCurrency(amounts.lateFee)}</dd>
          </div>
        ) : null}
        {(amounts.damageFee ?? 0) > 0 ? (
          <div className="flex justify-between">
            <dt>Damage fee</dt>
            <dd>{formatCurrency(amounts.damageFee)}</dd>
          </div>
        ) : null}
        {amounts.gstEnabled !== false ? (
          <div className="flex justify-between">
            <dt>GST ({amounts.gstRate}%)</dt>
            <dd>{formatCurrency(amounts.tax)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between font-bold">
          <dt>Total</dt>
          <dd>{formatCurrency(amounts.total)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Advance</dt>
          <dd>−{formatCurrency(amounts.advanceAmount)}</dd>
        </div>
        {(amounts.amountPaid ?? 0) > 0 ? (
          <div className="flex justify-between">
            <dt>Other payments</dt>
            <dd>−{formatCurrency(amounts.amountPaid)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-stellar-border pt-1 font-bold text-stellar-accent">
          <dt>Balance due</dt>
          <dd>{formatCurrency(amounts.balanceDue)}</dd>
        </div>
      </dl>

      {(invoice.payments || []).length > 0 ? (
        <div className="mt-4 border-t border-stellar-border pt-4">
          <p className="mb-2 text-xs font-medium uppercase text-stellar-text-muted">
            Payment history
          </p>
          <ul className="space-y-1 text-xs">
            {invoice.payments.map((p) => (
              <li key={p.id || `${p.paidAt}-${p.amount}`} className="flex justify-between gap-2">
                <span className="text-stellar-text-muted">
                  {formatDate(p.paidAt)} · {INVOICE_PAYMENT_LABELS[p.method] || p.method}
                </span>
                <span className="font-medium tabular-nums">{formatCurrency(p.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {invoice.notes ? (
        <p className="mt-4 border-t border-stellar-border pt-3 text-xs text-stellar-text-muted">
          <span className="font-medium text-stellar-text">Notes: </span>
          {invoice.notes}
        </p>
      ) : null}
    </div>
  );
}

export default InvoiceDocumentPreview;
