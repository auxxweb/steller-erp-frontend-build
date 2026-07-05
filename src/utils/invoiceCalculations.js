/** Mirror backend invoice math for live totals on the edit form. */
export function recalculateInvoiceAmounts({
  lineItems = [],
  subtotalOverride,
  discount = 0,
  lateFee = 0,
  damageFee = 0,
  gstEnabled = true,
  gstRate = 18,
  advanceAmount = 0,
  amountPaid = 0,
}) {
  const lineSubtotal = lineItems.reduce(
    (sum, line) => sum + (Number(line.lineTotal) || Number(line.unitPrice) * Number(line.quantity) || 0),
    0,
  );
  const subtotal =
    subtotalOverride !== undefined && subtotalOverride !== null
      ? Math.max(0, Number(subtotalOverride) || 0)
      : lineSubtotal;
  const discountNum = Math.max(0, Number(discount) || 0);
  const late = Math.max(0, Number(lateFee) || 0);
  const damage = Math.max(0, Number(damageFee) || 0);
  const taxable = Math.max(0, subtotal - discountNum + late + damage);
  const rate = Math.max(0, Math.min(100, Number(gstRate) || 0));
  const tax = gstEnabled !== false ? Math.round((taxable * rate) / 100) : 0;
  const total = taxable + tax;
  const advance = Math.max(0, Number(advanceAmount) || 0);
  const paid = Math.max(0, Number(amountPaid) || 0);
  const balanceDue = Math.max(0, total - advance - paid);

  return {
    subtotal,
    discount: discountNum,
    lateFee: late,
    damageFee: damage,
    tax,
    total,
    advanceAmount: advance,
    amountPaid: paid,
    balanceDue,
    gstEnabled: gstEnabled !== false,
    gstRate: rate,
  };
}

export function mergeInvoiceAmounts(invoice) {
  if (!invoice) return null;
  const hasRecordedPayments = (invoice.payments || []).length > 0;
  const lineSubtotal = (invoice.lineItems || []).reduce(
    (sum, line) =>
      sum + (Number(line.lineTotal) || Number(line.unitPrice) * Number(line.quantity) || 0),
    0,
  );
  const storedSubtotal = invoice.amounts?.subtotal;
  const useStoredSubtotal =
    !hasRecordedPayments &&
    storedSubtotal !== undefined &&
    storedSubtotal !== null &&
    storedSubtotal !== lineSubtotal;

  const computed = recalculateInvoiceAmounts({
    lineItems: invoice.lineItems || [],
    subtotalOverride: useStoredSubtotal ? storedSubtotal : undefined,
    discount: invoice.amounts?.discount,
    lateFee: invoice.amounts?.lateFee,
    damageFee: invoice.amounts?.damageFee,
    gstEnabled: invoice.amounts?.gstEnabled,
    gstRate: invoice.amounts?.gstRate,
    advanceAmount: invoice.amounts?.advanceAmount,
    amountPaid: invoice.amounts?.amountPaid,
  });

  const serverBalance = Number(invoice.amounts?.balanceDue);
  if (
    Number.isFinite(serverBalance) &&
    serverBalance > 0 &&
    computed.balanceDue <= 0
  ) {
    return { ...computed, balanceDue: serverBalance };
  }

  return computed;
}

export function hasInvoiceRecordedPayments(invoice) {
  return (invoice?.payments || []).length > 0;
}
