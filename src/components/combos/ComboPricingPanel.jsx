function formatMoney(val) {
  if (val == null || val === '') return '—';
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
        Set products, rates, and dates, then calculate to see pricing.
      </p>
    );
  }

  return (
    <div className="space-y-stellar-4">
      <div className="grid grid-cols-2 gap-stellar-3 sm:grid-cols-3">
        <div className="rounded-stellar-lg border border-stellar-border p-stellar-3">
          <p className="text-xs text-stellar-text-muted">Rate ({pricing.rateType || 'daily'})</p>
          <p className="mt-stellar-1 text-lg font-semibold tabular-nums">
            {formatMoney(pricing.bundleRate ?? pricing.perDay)}
          </p>
        </div>
        <div className="rounded-stellar-lg border border-stellar-accent/30 bg-stellar-accent/5 p-stellar-3">
          <p className="text-xs text-stellar-text-muted">
            Total ({pricing.durationDays ?? 1} day{pricing.durationDays === 1 ? '' : 's'})
          </p>
          <p className="mt-stellar-1 text-lg font-semibold tabular-nums">
            {formatMoney(pricing.bundleSubtotal)}
          </p>
        </div>
        {pricing.tax > 0 && (
          <div className="rounded-stellar-lg border border-stellar-border p-stellar-3">
            <p className="text-xs text-stellar-text-muted">With tax</p>
            <p className="mt-stellar-1 text-lg font-semibold tabular-nums">
              {formatMoney(pricing.total)}
            </p>
          </div>
        )}
      </div>

      {pricing.lines?.length > 0 && (
        <ul className="divide-y divide-stellar-border rounded-stellar-lg border border-stellar-border text-sm">
          {pricing.lines.map((line, index) => (
            <li
              key={`${line.source || 'line'}-${line.productId}-${index}`}
              className="flex flex-col gap-stellar-1 p-stellar-3 sm:flex-row sm:justify-between"
            >
              <span>
                {line.productName || line.productId}
                <span className="text-stellar-text-muted"> × {line.quantity}</span>
                {line.source === 'extra' ? (
                  <span className="ml-stellar-1 text-[10px] uppercase text-stellar-text-muted">
                    extra
                  </span>
                ) : null}
              </span>
              <span className="tabular-nums text-stellar-text-muted">
                {formatMoney(line.lineSubtotal)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ComboPricingPanel;
