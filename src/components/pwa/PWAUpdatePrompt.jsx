import Button from '../ui/Button.jsx';

function PWAUpdatePrompt({ onUpdate, onDismiss }) {
  return (
    <div
      className="fixed bottom-stellar-4 left-stellar-4 right-stellar-4 z-[100] mx-auto max-w-md animate-fade-up opacity-0-start sm:bottom-stellar-6"
      role="dialog"
      aria-labelledby="pwa-update-title"
      aria-live="polite"
    >
      <div className="card-elevated flex flex-col gap-stellar-4 p-stellar-4 sm:flex-row sm:items-center sm:justify-between sm:p-stellar-5">
        <div>
          <p id="pwa-update-title" className="text-sm font-semibold text-stellar-text">
            Update available
          </p>
          <p className="mt-stellar-1 text-xs text-stellar-text-muted">
            A new version of Stellar ERP is ready.
          </p>
        </div>
        <div className="flex shrink-0 gap-stellar-2">
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Later
          </Button>
          <Button variant="primary" size="sm" onClick={onUpdate}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PWAUpdatePrompt;
