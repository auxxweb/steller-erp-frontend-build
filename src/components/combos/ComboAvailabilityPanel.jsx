function ComboAvailabilityPanel({ availability, loading }) {
  if (loading) {
    return (
      <div className="h-24 animate-pulse rounded-stellar-lg bg-stellar-surface-muted" />
    );
  }

  if (!availability) return null;

  const ok = availability.isAvailable;

  return (
    <div
      className={`rounded-stellar-lg border p-stellar-4 ${
        ok ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-stellar-2">
        <p className={`font-medium ${ok ? 'text-emerald-700' : 'text-red-700'}`}>
          {ok
            ? `${availability.availableComboSets} combo set(s) available`
            : 'Not enough inventory for this combo'}
        </p>
        {availability.bottleneck != null && (
          <span className="text-xs text-stellar-text-muted">
            Bottleneck: {availability.bottleneck} set(s)
          </span>
        )}
      </div>

      {availability.items?.length > 0 && (
        <ul className="mt-stellar-3 space-y-stellar-2">
          {availability.items.map((item) => (
            <li
              key={item.productId}
              className="flex flex-col gap-stellar-1 rounded-stellar-md border border-stellar-border bg-stellar-surface px-stellar-3 py-stellar-2 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-medium">{item.productName || item.productId}</span>
              <span className="text-xs text-stellar-text-muted">
                Need {item.requiredPerCombo}/set · {item.availableCount} free ·{' '}
                {item.combosPossible ?? 0} combos possible
              </span>
              {!item.isAvailable && item.error ? (
                <span className="text-xs text-red-600 sm:basis-full">{item.error}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ComboAvailabilityPanel;
