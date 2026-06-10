import { cn } from '../../utils/cn.js';

function BranchPill({ branch, highlight, label }) {
  if (!branch) return null;
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col rounded-stellar-lg border px-stellar-3 py-stellar-2',
        highlight
          ? 'border-stellar-accent/40 bg-stellar-accent/5'
          : 'border-stellar-border bg-stellar-surface',
      )}
    >
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-stellar-text-subtle">
          {label}
        </span>
      )}
      <span className="truncate text-sm font-medium text-stellar-text">{branch.name}</span>
      {branch.code && (
        <span className="text-xs text-stellar-text-muted">{branch.code}</span>
      )}
    </div>
  );
}

/**
 * Visual from → to branch route with optional "your branch" highlight.
 */
function TransferBranchRoute({ transfer, branchRole, compact }) {
  const from = transfer?.fromBranch;
  const to = transfer?.toBranch;

  if (compact) {
    return (
      <p className="text-sm text-stellar-text-muted">
        <span className={branchRole === 'source' ? 'font-medium text-stellar-accent' : ''}>
          {from?.code || from?.name}
        </span>
        <span className="mx-1">→</span>
        <span className={branchRole === 'destination' ? 'font-medium text-stellar-accent' : ''}>
          {to?.code || to?.name}
        </span>
      </p>
    );
  }

  return (
    <div className="flex items-stretch gap-stellar-2">
      <BranchPill
        branch={from}
        highlight={branchRole === 'source'}
        label={branchRole === 'source' ? 'Your branch · From' : 'From'}
      />
      <div className="flex shrink-0 items-center px-stellar-1 text-stellar-text-muted" aria-hidden>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
      <BranchPill
        branch={to}
        highlight={branchRole === 'destination'}
        label={branchRole === 'destination' ? 'Your branch · To' : 'To'}
      />
    </div>
  );
}

export default TransferBranchRoute;
