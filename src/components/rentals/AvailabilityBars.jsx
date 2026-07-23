function AvailabilityBars({ products = [], productNames = {}, loading }) {
  if (loading) {
    return (
      <div className="space-y-stellar-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-stellar-lg bg-stellar-surface-muted" />
        ))}
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <ul className="space-y-stellar-3">
      {products.map((row) => {
        const total = row.totalUnits || 0;
        const available = row.availableCount ?? 0;
        const allocated = row.allocatedInWindow ?? 0;
        const pct = total > 0 ? Math.round((available / total) * 100) : 0;
        const ok = row.isAvailable;

        return (
          <li
            key={row.productId}
            className={`rounded-stellar-lg border p-stellar-3 ${
              ok ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
            }`}
          >
            <div className="flex items-center justify-between gap-stellar-2 text-sm">
              <span className="font-medium text-stellar-text">
                {productNames[row.productId] || `Product …${row.productId?.slice?.(-6) || ''}`}
              </span>
              <span className={ok ? 'text-emerald-600' : 'text-red-600'}>
                {ok ? 'Available' : 'Not available'}
              </span>
            </div>
            <p className="mt-stellar-1 text-xs text-stellar-text-muted">
              {available} free · {allocated} booked · {total} total · need {row.requested}
            </p>
            {!ok && row.error ? (
              <p className="mt-stellar-1 text-xs text-red-600">{row.error}</p>
            ) : null}
            <div className="mt-stellar-2 h-2 overflow-hidden rounded-full bg-stellar-border">
              <div
                className={`h-full rounded-full transition-all ${
                  ok ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default AvailabilityBars;
