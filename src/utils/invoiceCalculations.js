/** Mirror backend invoice math for live totals on the edit form. */
export function recalculateInvoiceAmounts({
  lineItems = [],
  discount = 0,
  lateFee = 0,
  damageFee = 0,
  gstEnabled = true,
  gstRate = 18,
  advanceAmount = 0,
  amountPaid = 0,
}) {
  const subtotal = lineItems.reduce(
    (sum, line) => sum + (Number(line.lineTotal) || Number(line.unitPrice) * Number(line.quantity) || 0),
    0,
  );
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
  return recalculateInvoiceAmounts({
    lineItems: invoice.lineItems || [],
    discount: invoice.amounts?.discount,
    lateFee: invoice.amounts?.lateFee,
    damageFee: invoice.amounts?.damageFee,
    gstEnabled: invoice.amounts?.gstEnabled,
    gstRate: invoice.amounts?.gstRate,
    advanceAmount: invoice.amounts?.advanceAmount,
    amountPaid: invoice.amounts?.amountPaid,
  });
}
