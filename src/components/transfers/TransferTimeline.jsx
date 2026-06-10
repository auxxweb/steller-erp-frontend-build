import { TRANSFER_STATUS } from '../../utils/transferConstants.js';
import { cn } from '../../utils/cn.js';

const STEPS = [
  { key: TRANSFER_STATUS.PENDING, label: 'Request', shortLabel: 'Request' },
  { key: TRANSFER_STATUS.APPROVED, label: 'Approved', shortLabel: 'OK' },
  { key: TRANSFER_STATUS.IN_TRANSIT, label: 'In transit', shortLabel: 'Transit' },
  { key: TRANSFER_STATUS.DELIVERED, label: 'Delivered', shortLabel: 'Done' },
];

function stepTimestamp(transfer, key) {
  if (key === TRANSFER_STATUS.PENDING) return transfer.createdAt;
  if (key === TRANSFER_STATUS.APPROVED) return transfer.approvedAt;
  if (key === TRANSFER_STATUS.IN_TRANSIT) return transfer.dispatchedAt;
  if (key === TRANSFER_STATUS.DELIVERED) return transfer.deliveredAt;
  return null;
}

function TransferTimeline({ transfer, variant = 'vertical' }) {
  if (!transfer || transfer.status === TRANSFER_STATUS.CANCELLED) {
    return (
      <p className="text-sm text-stellar-text-muted">This transfer was cancelled.</p>
    );
  }

  const order = STEPS.map((s) => s.key);
  const currentIdx = order.indexOf(transfer.status);

  if (variant === 'horizontal') {
    return (
      <div className="w-full overflow-x-auto pb-stellar-1">
        <ol className="flex min-w-[320px] items-start justify-between gap-stellar-1">
          {STEPS.map((step, idx) => {
            const done = idx <= currentIdx;
            const active = transfer.status === step.key;
            const timestamp = stepTimestamp(transfer, step.key);

            return (
              <li key={step.key} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  {idx > 0 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1',
                        idx <= currentIdx ? 'bg-stellar-accent' : 'bg-stellar-border',
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      done
                        ? 'bg-stellar-accent text-stellar-accent-fg'
                        : 'border border-stellar-border text-stellar-text-muted',
                      active && 'ring-2 ring-stellar-accent/30',
                    )}
                  >
                    {idx + 1}
                  </span>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1',
                        idx < currentIdx ? 'bg-stellar-accent' : 'bg-stellar-border',
                      )}
                    />
                  )}
                </div>
                <p
                  className={cn(
                    'mt-stellar-2 text-[10px] font-medium leading-tight sm:text-xs',
                    done ? 'text-stellar-text' : 'text-stellar-text-muted',
                  )}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </p>
                {timestamp && (
                  <p className="mt-stellar-1 hidden text-[10px] text-stellar-text-muted sm:block">
                    {new Date(timestamp).toLocaleDateString()}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <ol className="space-y-stellar-4">
      {STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = transfer.status === step.key;
        const timestamp = stepTimestamp(transfer, step.key);

        return (
          <li key={step.key} className="flex gap-stellar-3">
            <span
              className={cn(
                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                done
                  ? 'bg-stellar-accent text-stellar-accent-fg'
                  : 'border border-stellar-border text-stellar-text-muted',
                active && 'ring-2 ring-stellar-accent/30',
              )}
            >
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-sm font-medium',
                  done ? 'text-stellar-text' : 'text-stellar-text-muted',
                )}
              >
                {step.label}
              </p>
              {timestamp && (
                <p className="text-xs text-stellar-text-muted">
                  {new Date(timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default TransferTimeline;
