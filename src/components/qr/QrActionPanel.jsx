import Button from '../ui/Button.jsx';
import { QR_ACTION_ICONS } from '../../utils/qrConstants.js';

function QrActionPanel({ allowedActions = [], onAction, loading, actionLoading }) {
  if (!allowedActions.length) return null;

  return (
    <div className="grid gap-stellar-3 sm:grid-cols-2">
      {allowedActions.map((item) => (
        <button
          key={item.action}
          type="button"
          disabled={!item.enabled || loading || actionLoading}
          onClick={() => onAction(item.action)}
          className="flex flex-col items-start rounded-stellar-xl border border-stellar-border bg-stellar-surface p-stellar-4 text-left transition-stellar enabled:hover:border-stellar-accent enabled:hover:shadow-stellar disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-2xl" aria-hidden>
            {QR_ACTION_ICONS[item.action] || '•'}
          </span>
          <span className="mt-stellar-2 text-sm font-semibold text-stellar-text">
            {item.label}
          </span>
          {!item.enabled && item.reason && (
            <span className="mt-stellar-1 text-xs text-stellar-text-muted">{item.reason}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default QrActionPanel;
