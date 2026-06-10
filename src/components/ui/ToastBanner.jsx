function ToastBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="rounded-stellar-lg border border-stellar-border bg-stellar-surface-muted px-stellar-4 py-stellar-3 text-sm text-stellar-text">
      {message}
      {onDismiss && (
        <button
          type="button"
          className="ml-stellar-3 text-stellar-text-muted hover:text-stellar-text"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

export default ToastBanner;
