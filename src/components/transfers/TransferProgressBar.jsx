function TransferProgressBar({ transfer, showLabels = true }) {
  const total = transfer?.progress?.total ?? transfer?.items?.length ?? 0;
  const dispatched = transfer?.progress?.dispatched ?? 0;
  const delivered = transfer?.progress?.delivered ?? 0;

  if (!total) return null;

  const dispatchedPct = Math.round((dispatched / total) * 100);
  const deliveredPct = Math.round((delivered / total) * 100);

  return (
    <div className="space-y-stellar-2">
      <div className="flex h-2 overflow-hidden rounded-full bg-stellar-surface-muted">
        <div
          className="bg-violet-500 transition-all"
          style={{ width: `${dispatchedPct}%` }}
          title={`${dispatched} dispatched`}
        />
        <div
          className="bg-emerald-500 transition-all"
          style={{ width: `${Math.max(0, deliveredPct - dispatchedPct)}%` }}
          title={`${delivered} delivered`}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs text-stellar-text-muted">
          <span>{delivered}/{total} delivered</span>
          <span>{dispatched}/{total} dispatched</span>
        </div>
      )}
    </div>
  );
}

export default TransferProgressBar;
