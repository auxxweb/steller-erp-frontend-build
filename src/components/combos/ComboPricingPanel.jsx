function formatMoney(val) {
  if (val == null) return '—';
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

function ComboPricingPanel({ pricing, loading }) {
  if (loading) {
    return (
      <div className="h-32 animate-pulse rounded-stellar-lg bg-stellar-surface-muted" />
    );
  }

  if (!pricing) {
    return (
      <p className="text-sm text-stellar-text-muted">
        Set products and dates, then calculate to see automatic pricing.
      </p>
    );
  }

  return (
    <div className="space-y-stellar-4">
      <div className="grid grid-cols-2 gap-stellar-3 sm:grid-cols-4">
        <div className="rounded-stellar-lg border border-stellar-border p-stellar-3">
          <p className="text-xs text-stellar-text-muted">Catalog total</p>
          <p className="mt-stellar-1 text-lg font-semibold tabular-nums">
            {formatMoney(pricing.catalogTotal)}
          </p>
        </div>
        <div className="rounded-stellar-lg border border-emerald-500/30 bg-emerald-500/5 p-stellar-3">
          <p className="text-xs text-stellar-text-muted">Discount</p>
          <p className="mt-stellar-1 text-lg font-semibold tabular-nums text-emerald-700">
            −{formatMoney(pricing.discountTotal)}
            {pricing.savingsPercent > 0 && (
              <span className="ml-1 text-xs">({pricing.savingsPercent}%)</span>
            )}
          </p>
        </div>
        <div className="rounded-stellar-lg border border-stellar-accent/30 bg-stellar-accent/5 p-stellar-3">
          <p className="text-xs text-stellar-text-muted">Bundle total</p>
          <p className="mt-stellar-1 text-lg font-semibold tabular-nums">
            {formatMoney(pricing.bundleSubtotal)}
          </p>
        </div>
        <div className="rounded-stellar-lg border border-stellar-border p-stellar-3">
          <p className="text-xs text-stellar-text-muted">Deposit</p>
          <p className="mt-stellar-1 text-lg font-semibold tabular-nums">
            {formatMoney(pricing.deposit)}
          </p>
        </div>
      </div>

      {pricing.lines?.length > 0 && (
        <ul className="divide-y divide-stellar-border rounded-stellar-lg border border-stellar-border text-sm">
          {pricing.lines.map((line) => (
            <li
              key={line.productId}
              className="flex flex-col gap-stellar-1 p-stellar-3 sm:flex-row sm:justify-between"
            >
              <span>
                {line.productName || line.productId}
                <span className="text-stellar-text-muted"> × {line.quantity}</span>
              </span>
              <span className="tabular-nums text-stellar-text-muted">
                {formatMoney(line.catalogSubtotal)}
                {line.lineDiscount > 0 && (
                  <> → {formatMoney(line.lineSubtotal)}</>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ComboPricingPanel;
