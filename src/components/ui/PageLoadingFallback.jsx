function PageLoadingFallback() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-stellar-3 py-stellar-12">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-stellar-border border-t-stellar-accent"
        aria-hidden
      />
      <p className="text-sm text-stellar-text-muted">Loading…</p>
    </div>
  );
}

export default PageLoadingFallback;
