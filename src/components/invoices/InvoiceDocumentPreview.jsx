import { INVOICE_PAYMENT_LABELS } from '../../utils/invoiceConstants.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

function InvoiceDocumentPreview({ invoice }) {
  const biz = invoice.businessSnapshot || {};
  const cust = invoice.customerSnapshot || {};
  const amounts = invoice.amounts || {};
  const payment = invoice.payment || {};

  const paymentLabel =
    payment.type === 'split'
      ? `${INVOICE_PAYMENT_LABELS.split}: ${formatCurrency(payment.cashAmount)} + ${formatCurrency(payment.onlineAmount)}`
      : INVOICE_PAYMENT_LABELS[payment.type] || 'Cash';

  return (
    <div className="rounded-stellar-lg border border-stellar-border bg-white p-stellar-5 text-sm text-gray-900 shadow-sm">
      <div className="flex justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          {biz.logoUrl ? (
            <img src={biz.logoUrl} alt="" className="mb-2 max-h-14 max-w-[140px] object-contain" />
          ) : null}
          <p className="text-lg font-bold">{biz.name || 'Stellar Rentals'}</p>
          <p className="text-xs text-gray-600">{biz.address}</p>
          <p className="text-xs text-gray-600">
            {biz.phone}
            {biz.email ? ` · ${biz.email}` : ''}
          </p>
          {biz.gstin ? <p className="text-xs text-gray-600">GSTIN: {biz.gstin}</p> : null}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">INVOICE</p>
          <p className="font-mono font-semibold">{invoice.invoiceNumber}</p>
          <p className="text-xs text-gray-600">{formatDate(invoice.issueDate)}</p>
          {invoice.isCredit ? (
            <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              Credit
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">Bill to</p>
          <p className="font-semibold">{cust.name}</p>
          <p className="text-xs text-gray-600">{cust.phone}</p>
          <p className="text-xs text-gray-600">{cust.address}</p>
        </div>
        {invoice.rental?.rentalNumber ? (
          <div className="text-right sm:text-left">
            <p className="text-xs font-medium uppercase text-gray-500">Rental</p>
            <p>{invoice.rental.rentalNumber}</p>
          </div>
        ) : null}
      </div>

      <table className="mt-4 w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2">Item</th>
            <th className="py-2 text-center">Qty</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {(invoice.lineItems || []).map((line, i) => (
            <tr key={line._id || i} className="border-b border-gray-100">
              <td className="py-2">{line.description}</td>
              <td className="py-2 text-center">{line.quantity}</td>
              <td className="py-2 text-right">{formatCurrency(line.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-4 ml-auto max-w-xs space-y-1 text-xs">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatCurrency(amounts.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Discount</dt>
          <dd>−{formatCurrency(amounts.discount)}</dd>
        </div>
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
        <div className="flex justify-between font-bold text-stellar-accent">
          <dt>Balance</dt>
          <dd>{formatCurrency(amounts.balanceDue)}</dd>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-2">
          <dt>Payment</dt>
          <dd>{paymentLabel}</dd>
        </div>
      </dl>
    </div>
  );
}

export default InvoiceDocumentPreview;
